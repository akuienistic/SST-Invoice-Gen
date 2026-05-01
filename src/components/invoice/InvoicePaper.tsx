import { EditableText } from "./EditableText";
import { LineItemsTable } from "./LineItemsTable";
import type { InvoiceState } from "@/hooks/useInvoice";
import { formatMoney } from "@/lib/currency";
import { splitIntoTwoEqualPhases } from "@/lib/payment-phases";
import logo from "@/assets/simon-star-tech-logo.jpg";
import { Mail, Phone, MapPin, Calendar, Hash } from "lucide-react";

interface Props {
  invoice: InvoiceState;
  totals: { subtotal: number; discount: number; total: number };
  onUpdate: <K extends keyof InvoiceState>(k: K, v: InvoiceState[K]) => void;
  onUpdateFrom: (patch: Partial<InvoiceState["from"]>) => void;
  onUpdateBillTo: (patch: Partial<InvoiceState["billTo"]>) => void;
  onAddItem: () => void;
  onUpdateItem: (id: string, patch: any) => void;
  onRemoveItem: (id: string) => void;
}

export function InvoicePaper({
  invoice,
  totals,
  onUpdate,
  onUpdateFrom,
  onUpdateBillTo,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
}: Props) {
  const phases = splitIntoTwoEqualPhases(totals.total);

  return (
    <div className="invoice-paper mx-auto w-full max-w-[820px] bg-card text-card-foreground shadow-[0_2px_20px_-4px_rgba(0,0,0,0.08)] rounded-sm border border-border">
      <div className="p-6 sm:p-10 md:p-14">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 pb-8 border-b border-foreground/10">
          <div className="flex items-start gap-4">
            <img src={logo} alt="Simon Star Tech" className="h-16 w-16 object-contain" />
            <div>
              <EditableText
                as="div"
                value={invoice.from.name}
                onChange={(v) => onUpdateFrom({ name: v })}
                className="text-xl font-bold tracking-tight"
              />
              <EditableText
                as="div"
                value={invoice.from.tagline}
                onChange={(v) => onUpdateFrom({ tagline: v })}
                className="text-xs text-muted-foreground italic mt-0.5"
              />
            </div>
          </div>

          <div className="text-left sm:text-right">
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight uppercase">Invoice</div>
            <div className="mt-3 space-y-1 text-sm text-left">
              <div className="flex sm:justify-end items-center gap-2 text-muted-foreground">
                <Hash className="h-3.5 w-3.5" />
                <EditableText
                  value={invoice.invoiceNumber}
                  onChange={(v) => onUpdate("invoiceNumber", v)}
                  className="text-foreground font-medium"
                />
              </div>
              <div className="flex sm:justify-end items-center gap-2 text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span className="text-xs">Issued</span>
                <input
                  type="date"
                  value={invoice.issueDate}
                  onChange={(e) => onUpdate("issueDate", e.target.value)}
                  className="bg-transparent text-foreground text-sm outline-none hover:bg-muted/60 rounded px-1"
                />
              </div>
              <div className="flex sm:justify-end items-center gap-2 text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span className="text-xs">Due</span>
                <input
                  type="date"
                  value={invoice.dueDate}
                  onChange={(e) => onUpdate("dueDate", e.target.value)}
                  className="bg-transparent text-foreground text-sm outline-none hover:bg-muted/60 rounded px-1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* From / Bill to */}
        <div className="grid sm:grid-cols-2 gap-8 pt-8">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">From</div>
            <EditableText as="div" value={invoice.from.name} onChange={(v) => onUpdateFrom({ name: v })} className="font-semibold" />
            <div className="mt-1 space-y-0.5 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-3 w-3 shrink-0" />
                <EditableText value={invoice.from.email} onChange={(v) => onUpdateFrom({ email: v })} />
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3 w-3 shrink-0" />
                <EditableText value={invoice.from.phone} onChange={(v) => onUpdateFrom({ phone: v })} />
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-3 w-3 shrink-0" />
                <EditableText value={invoice.from.address} onChange={(v) => onUpdateFrom({ address: v })} placeholder="Address" />
              </div>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Bill to</div>
            <EditableText as="div" value={invoice.billTo.name} onChange={(v) => onUpdateBillTo({ name: v })} placeholder="Client name" className="font-semibold" />
            <EditableText as="div" value={invoice.billTo.company} onChange={(v) => onUpdateBillTo({ company: v })} placeholder="Company" className="text-sm" />
            <div className="mt-1 space-y-0.5 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-3 w-3 shrink-0" />
                <EditableText value={invoice.billTo.email} onChange={(v) => onUpdateBillTo({ email: v })} placeholder="client@email.com" />
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3 w-3 shrink-0" />
                <EditableText value={invoice.billTo.phone} onChange={(v) => onUpdateBillTo({ phone: v })} placeholder="Phone" />
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-3 w-3 shrink-0" />
                <EditableText value={invoice.billTo.address} onChange={(v) => onUpdateBillTo({ address: v })} placeholder="Address" multiline />
              </div>
            </div>
          </div>
        </div>

        {/* Line items */}
        <LineItemsTable
          items={invoice.items}
          currency={invoice.currency}
          onUpdate={onUpdateItem}
          onRemove={onRemoveItem}
          onAdd={onAddItem}
        />

        {/* Totals */}
        <div className="mt-8 flex justify-end">
          <div className="w-full sm:w-80 space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatMoney(totals.subtotal, invoice.currency)}</span>
            </div>
            {invoice.discountType !== "none" && totals.discount > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Discount{invoice.discountType === "percent" ? ` (${invoice.discountValue}%)` : ""}</span>
                <span>− {formatMoney(totals.discount, invoice.currency)}</span>
              </div>
            )}
            <div className="flex justify-between pt-3 border-t border-foreground/20 text-lg font-bold">
              <span>Total</span>
              <span>{formatMoney(totals.total, invoice.currency)}</span>
            </div>

            {/* Payment phases */}
            <div className="pt-4 mt-4 border-t border-foreground/10">
              <div
                className="mb-5 w-full px-3 py-2 text-[11px] font-semibold uppercase tracking-wider rounded-sm"
                style={{ backgroundColor: "#111", color: "#fff" }}
              >
                Payment phases
              </div>
              <div className="space-y-2 pt-1">
                <div className="flex items-start justify-between gap-3">
                  <EditableText
                    as="div"
                    value={invoice.paymentPhases.phase1Label}
                    onChange={(v) =>
                      onUpdate("paymentPhases", { ...invoice.paymentPhases, phase1Label: v })
                    }
                    className="text-muted-foreground leading-snug"
                  />
                  <div className="shrink-0 font-medium">
                    {formatMoney(phases.phase1, invoice.currency)}
                  </div>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <EditableText
                    as="div"
                    value={invoice.paymentPhases.phase2Label}
                    onChange={(v) =>
                      onUpdate("paymentPhases", { ...invoice.paymentPhases, phase2Label: v })
                    }
                    className="text-muted-foreground leading-snug"
                  />
                  <div className="shrink-0 font-medium">
                    {formatMoney(phases.phase2, invoice.currency)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-foreground/10 grid sm:grid-cols-2 gap-8 text-sm">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Payment instructions</div>
            <EditableText
              as="div"
              multiline
              value={invoice.paymentInstructions}
              onChange={(v) => onUpdate("paymentInstructions", v)}
              className="text-muted-foreground leading-relaxed"
            />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Terms and Conditions</div>
            <EditableText
              as="div"
              multiline
              value={invoice.notes}
              onChange={(v) => onUpdate("notes", v)}
              className="text-muted-foreground leading-relaxed"
            />
          </div>
        </div>

        <div className="mt-10 text-right">
          <div className="inline-block">
            <EditableText
              as="div"
              value={invoice.signature}
              onChange={(v) => onUpdate("signature", v)}
              className="font-semibold italic"
            />
            <div className="mt-1 text-xs text-muted-foreground border-t border-foreground/20 pt-1">Authorized signature</div>
          </div>
        </div>
      </div>
    </div>
  );
}
