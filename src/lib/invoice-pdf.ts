import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { InvoiceState } from "@/hooks/useInvoice";
import { formatMoney, type CurrencyCode } from "@/lib/currency";
import { splitIntoTwoEqualPhases } from "@/lib/payment-phases";
import logoUrl from "@/assets/simon-star-tech-logo.jpg";
import outfitRegularUrl from "@/assets/fonts/Outfit-Regular.ttf?url";
import outfitBoldUrl from "@/assets/fonts/Outfit-Bold.ttf?url";

async function loadImageData(url: string): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function fetchAsBase64(url: string): Promise<string> {
  const res = await fetch(url);
  const buf = await res.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

let fontsRegistered = false;
async function registerOutfit(doc: jsPDF) {
  const [reg, bold] = await Promise.all([
    fetchAsBase64(outfitRegularUrl),
    fetchAsBase64(outfitBoldUrl),
  ]);
  doc.addFileToVFS("Outfit-Regular.ttf", reg);
  doc.addFont("Outfit-Regular.ttf", "Outfit", "normal");
  doc.addFileToVFS("Outfit-Bold.ttf", bold);
  doc.addFont("Outfit-Bold.ttf", "Outfit", "bold");
  fontsRegistered = true;
}

function sanitize(s: string) {
  return (s || "").replace(/[^a-zA-Z0-9-_]+/g, "-").replace(/^-+|-+$/g, "");
}

function buildFilename(invoice: InvoiceState) {
  const agency = sanitize(invoice.from.name) || "Simon-Star-Tech";
  const num = sanitize(invoice.invoiceNumber) || "DRAFT";
  const client = sanitize(invoice.billTo.name || invoice.billTo.company);
  const date = sanitize(invoice.issueDate);
  const parts = [agency, "Invoice", num];
  if (client) parts.push(client);
  if (date) parts.push(date);
  return parts.join("_") + ".pdf";
}

/** Section rules: between “invisible” (~230+) and “too heavy” (~110). Tuned for screen + print. */
const PDF_RULE_SECTION_GRAY = 190;
const PDF_RULE_STRONG_GRAY = 158;
const PDF_RULE_SIGNATURE_GRAY = 182;
const PDF_RULE_WIDTH_PT = 0.55;

function strokeHorizontalRule(doc: jsPDF, x1: number, y: number, x2: number, gray: number, widthPt = PDF_RULE_WIDTH_PT) {
  doc.setLineWidth(widthPt);
  doc.setDrawColor(gray, gray, gray);
  doc.line(x1, y, x2, y);
}

/** One line only: shrink font to fit; never word-wrap. Ellipsis only if still too long at min size. */
function drawPhaseRowSingleLine(
  doc: jsPDF,
  font: string,
  labelX: number,
  amountX: number,
  y: number,
  label: string,
  amountStr: string
) {
  const gap = 10;
  const maxW = Math.max(40, amountX - labelX - gap);
  let display = (label || "").replace(/\s+/g, " ").trim();
  doc.setFont(font, "normal");
  let size = 9;
  const minSize = 6;
  doc.setFontSize(size);
  while (size > minSize && doc.getTextWidth(display) > maxW) {
    size -= 0.5;
    doc.setFontSize(size);
  }
  if (doc.getTextWidth(display) > maxW) {
    const ell = "…";
    let t = display;
    while (t.length > 0 && doc.getTextWidth(t + ell) > maxW) {
      t = t.slice(0, -1).trimEnd();
    }
    display = t.length < display.length ? t + ell : t;
  }
  doc.setTextColor(70);
  doc.text(display, labelX, y);
  doc.text(amountStr, amountX, y, { align: "right" });
}

interface GenerateArgs {
  invoice: InvoiceState;
  totals: { subtotal: number; discount: number; total: number };
  password?: string;
}

export async function generateInvoicePdf({ invoice, totals, password }: GenerateArgs) {
  const docOptions: any = { unit: "pt", format: "a4" };
  if (password && password.trim()) {
    docOptions.encryption = {
      userPassword: password,
      ownerPassword: password,
      userPermissions: ["print", "copy"],
    };
  }
  const doc = new jsPDF(docOptions);
  await registerOutfit(doc);
  const FONT = "Outfit";
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  let y = margin;

  // Logo
  try {
    const logoData = await loadImageData(logoUrl);
    doc.addImage(logoData, "JPEG", margin, y, 55, 55);
  } catch {}

  // Header text
  doc.setFont(FONT, "bold");
  doc.setFontSize(14);
  doc.text(invoice.from.name.toUpperCase(), margin + 65, y + 22);
  doc.setFont(FONT, "normal");
  doc.setFontSize(9);
  doc.setTextColor(110);
  doc.text(invoice.from.tagline, margin + 65, y + 38);

  // INVOICE label
  doc.setFont(FONT, "bold");
  doc.setFontSize(26);
  doc.setTextColor(20);
  doc.text("INVOICE", pageWidth - margin, y + 22, { align: "right" });

  doc.setFont(FONT, "normal");
  doc.setFontSize(9);
  doc.setTextColor(90);
  doc.text(`# ${invoice.invoiceNumber}`, pageWidth - margin, y + 40, { align: "right" });
  doc.text(`Issued: ${invoice.issueDate}`, pageWidth - margin, y + 54, { align: "right" });
  doc.text(`Due: ${invoice.dueDate}`, pageWidth - margin, y + 68, { align: "right" });

  y += 95;
  // Match on-screen: header bottom border (border-foreground/10)
  strokeHorizontalRule(doc, margin, y, pageWidth - margin, PDF_RULE_SECTION_GRAY);
  y += 18;

  // From / Bill to
  const colW = (pageWidth - margin * 2) / 2;
  doc.setFont(FONT, "bold");
  doc.setFontSize(8);
  doc.setTextColor(130);
  doc.text("FROM", margin, y);
  doc.text("BILL TO", margin + colW, y);
  y += 14;

  doc.setFontSize(10);
  doc.setTextColor(20);
  doc.setFont(FONT, "bold");
  doc.text(invoice.from.name, margin, y);
  doc.text(invoice.billTo.name || "—", margin + colW, y);
  y += 14;

  doc.setFont(FONT, "normal");
  doc.setFontSize(9);
  doc.setTextColor(90);
  const fromLines = [invoice.from.email, invoice.from.phone, invoice.from.address].filter(Boolean);
  const billLines = [invoice.billTo.company, invoice.billTo.email, invoice.billTo.phone, invoice.billTo.address].filter(Boolean);
  const maxLines = Math.max(fromLines.length, billLines.length);
  for (let i = 0; i < maxLines; i++) {
    if (fromLines[i]) doc.text(String(fromLines[i]), margin, y);
    if (billLines[i]) doc.text(String(billLines[i]), margin + colW, y);
    y += 12;
  }

  y += 8;
  // Match on-screen: section rule before line items
  strokeHorizontalRule(doc, margin, y, pageWidth - margin, PDF_RULE_SECTION_GRAY);
  y += 14;

  // Items table
  const body = invoice.items.map((it) => [
    it.description || "—",
    String(it.quantity),
    formatMoney(it.unitPrice, invoice.currency as CurrencyCode),
    formatMoney((it.quantity || 0) * (it.unitPrice || 0), invoice.currency as CurrencyCode),
  ]);

  autoTable(doc, {
    startY: y,
    head: [["Description", "Qty", "Unit price", "Amount"]],
    body,
    theme: "plain",
    styles: { font: FONT },
    headStyles: {
      font: FONT,
      fillColor: [20, 20, 20],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: { font: FONT, fontSize: 10, textColor: 40, cellPadding: 8 },
    alternateRowStyles: { fillColor: [248, 248, 245] },
    columnStyles: {
      0: { cellWidth: "auto" },
      1: { halign: "right", cellWidth: 50 },
      2: { halign: "right", cellWidth: 90 },
      3: { halign: "right", cellWidth: 90 },
    },
    margin: { left: margin, right: margin },
  });

  y = (doc as any).lastAutoTable.finalY + 12;
  // Match on-screen: separator after line items block
  strokeHorizontalRule(doc, margin, y, pageWidth - margin, PDF_RULE_SECTION_GRAY);
  y += 18;

  // Totals
  const totalsX = pageWidth - margin - 200;
  doc.setFont(FONT, "normal");
  doc.setFontSize(10);
  doc.setTextColor(90);
  doc.text("Subtotal", totalsX, y);
  doc.text(formatMoney(totals.subtotal, invoice.currency), pageWidth - margin, y, { align: "right" });
  y += 14;
  if (invoice.discountType !== "none" && totals.discount > 0) {
    doc.text(
      `Discount${invoice.discountType === "percent" ? ` (${invoice.discountValue}%)` : ""}`,
      totalsX,
      y
    );
    doc.text(`- ${formatMoney(totals.discount, invoice.currency)}`, pageWidth - margin, y, { align: "right" });
    y += 14;
  }
  // Match on-screen: border above Total (border-foreground/20)
  strokeHorizontalRule(doc, totalsX, y, pageWidth - margin, PDF_RULE_STRONG_GRAY);
  y += 16;
  doc.setFont(FONT, "bold");
  doc.setFontSize(13);
  doc.setTextColor(20);
  doc.text("Total", totalsX, y);
  doc.text(formatMoney(totals.total, invoice.currency), pageWidth - margin, y, { align: "right" });
  y += 22;

  // Payment phases (50/50)
  const phases = splitIntoTwoEqualPhases(totals.total);
  const sectionW = pageWidth - margin - totalsX;
  const barH = 14;
  // Match on-screen: border above payment phases (narrow totals column)
  strokeHorizontalRule(doc, totalsX, y, pageWidth - margin, PDF_RULE_SECTION_GRAY);
  y += 12;

  doc.setFillColor(20, 20, 20);
  doc.rect(totalsX, y - 10, sectionW, barH, "F");
  doc.setFont(FONT, "bold");
  doc.setFontSize(8);
  doc.setTextColor(255);
  doc.text("PAYMENT PHASES", totalsX + 8, y);
  y += 24;

  const labelX = totalsX + 8;
  const amountX = pageWidth - margin;
  const rowStep = 14;

  const p1Label = invoice.paymentPhases?.phase1Label || "Phase 1 — 50%";
  drawPhaseRowSingleLine(
    doc,
    FONT,
    labelX,
    amountX,
    y,
    p1Label,
    formatMoney(phases.phase1, invoice.currency)
  );
  y += rowStep;

  const p2Label = invoice.paymentPhases?.phase2Label || "Phase 2 — 50%";
  drawPhaseRowSingleLine(
    doc,
    FONT,
    labelX,
    amountX,
    y,
    p2Label,
    formatMoney(phases.phase2, invoice.currency)
  );
  y += rowStep + 10;
  // Match on-screen: full-width rule before footer (Payment instructions / Notes)
  strokeHorizontalRule(doc, margin, y, pageWidth - margin, PDF_RULE_SECTION_GRAY);
  y += 20;

  // Footer sections
  doc.setFont(FONT, "bold");
  doc.setFontSize(8);
  doc.setTextColor(130);
  doc.text("PAYMENT INSTRUCTIONS", margin, y);
  doc.text("NOTES & TERMS", margin + colW, y);
  y += 12;

  doc.setFont(FONT, "normal");
  doc.setFontSize(9);
  doc.setTextColor(70);
  const payLines = doc.splitTextToSize(invoice.paymentInstructions, colW - 10);
  const noteLines = doc.splitTextToSize(invoice.notes, colW - 10);
  doc.text(payLines, margin, y);
  doc.text(noteLines, margin + colW, y);
  y += Math.max(payLines.length, noteLines.length) * 11 + 30;

  // Signature
  doc.setFont(FONT, "bold");
  doc.setFontSize(11);
  doc.setTextColor(20);
  doc.text(invoice.signature, pageWidth - margin, y, { align: "right" });
  strokeHorizontalRule(
    doc,
    pageWidth - margin - 150,
    y + 4,
    pageWidth - margin,
    PDF_RULE_SIGNATURE_GRAY,
    PDF_RULE_WIDTH_PT * 0.9
  );
  doc.setFont(FONT, "normal");
  doc.setFontSize(8);
  doc.setTextColor(130);
  doc.text("Authorized signature", pageWidth - margin, y + 16, { align: "right" });

  doc.save(buildFilename(invoice));
}
