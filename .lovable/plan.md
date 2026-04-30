## Simon Star Tech — Invoice Generator

A single-page, fully editable invoice with a clean, sleek UI. Every field is inline-editable (click to edit). Export to a password-protected PDF when ready.

### Look & feel

- Font: Outfit (loaded from Google Fonts) across the entire app.
- Palette: black ink on soft off-white paper (#FAFAF7), muted gray borders, a single accent for action buttons. Matches the black star logo.
- Layout: two-column desktop — left is the live invoice "paper" (A4 proportions, generous padding, subtle shadow), right is a slim action panel (currency, discount, password, download). Panel collapses to a top bar on mobile so the invoice stays the hero.
- Lucide icons throughout: `Plus`, `Trash2`, `Download`, `Lock`, `Eye`/`EyeOff`, `Calendar`, `Hash`, `User`, `Building2`, `Mail`, `Phone`.
- Print-friendly: the invoice paper is styled so a browser print produces the same result as the PDF.

### Invoice contents

Header
- Logo (top-left) + "SIMON STAR TECH" wordmark and tagline "A spark of creativity and innovation in tech".
- Big "INVOICE" label top-right with invoice number and issue/due dates (all editable).

From (locked defaults, still editable)
- Simon Star Tech — Creative Development Agency (graphic design & web development)
- symonstartech@gmail.com  ·  +251 988 499 136

Bill to
- Client name, company, email, phone, address — all click-to-edit.

Line items table
- Columns: Description · Qty · Unit price · Amount (auto).
- Add / remove rows with `Plus` / `Trash2` buttons.
- Free-text description supports multi-line (e.g. "Landing page — 5 sections, responsive").

Totals block
- Subtotal (auto).
- Optional discount: toggle between flat amount and percentage.
- Total (auto, large, bold) with currency symbol.

Footer
- Editable notes / terms (default: "Thank you for your business. Payment due within 14 days.").
- Editable payment instructions (bank / mobile money — you fill in once per invoice).
- Editable signature line.

### Controls panel

- Currency selector: ETB, USD, EUR, GBP (symbol + formatting update live).
- Discount toggle + value.
- Password field with show/hide (`Eye`/`EyeOff`) + strength hint.
- "Download PDF" primary button — generates the PDF; if a password is set, the PDF is encrypted so the client must enter it to open.
- "Reset" to clear the form back to a blank template.
- Draft autosave to the browser (localStorage) so a refresh doesn't lose work. No server, no accounts.

### Password-protected PDF — how it works

The PDF is generated in the browser and encrypted with the password you type before it downloads. The client opens the file in any PDF reader (Adobe, Preview, Chrome) and must enter the password to view. Nothing is uploaded anywhere — the file only exists on your machine until you send it.

### Responsive behavior

- ≥1024px: side-by-side paper + control panel.
- 640–1023px: control panel becomes a sticky top toolbar; paper fills width.
- <640px: single column, table rows reflow into stacked cards (Description on top, Qty/Price/Amount in a row below), font sizes scale down, touch targets stay ≥44px.

### Recommendations (answering "what should it contain")

Standard invoice essentials you should not skip: unique invoice number, issue date, due date, clear bill-to, itemized lines with quantity and unit price, subtotal/discount/total, currency, payment instructions, and terms. I've included all of them. Things I deliberately left out per your answers: tax/VAT rows, multi-invoice history, email sending — we can add any of these later if the business grows.

### Technical notes

- Stack: TanStack Start route at `/` rewritten into the editor; state kept in a single `useInvoice` hook with localStorage persistence.
- PDF generation: `pdf-lib` (pure JS, Worker-compatible) — renders the invoice layout to PDF and applies AES-256 password encryption via `writer.encrypt()` equivalent. Logo embedded as a PNG copied into `src/assets/`.
- Fonts in PDF: Outfit embedded as a subset so the PDF matches the on-screen design.
- All client-side; no backend, no Lovable Cloud needed.

### Files to create / change

- `src/assets/simon-star-tech-logo.png` (copied from the upload)
- `src/styles.css` — load Outfit, set `font-family` base, tune color tokens toward the black/off-white paper look
- `src/routes/__root.tsx` — set page title/description to "Simon Star Tech — Invoice"
- `src/routes/index.tsx` — replace placeholder with the invoice editor
- `src/components/invoice/InvoicePaper.tsx` — the visible invoice
- `src/components/invoice/LineItemsTable.tsx`
- `src/components/invoice/ControlPanel.tsx`
- `src/components/invoice/EditableText.tsx` — reusable contentEditable-style field
- `src/hooks/useInvoice.ts` — state + localStorage
- `src/lib/invoice-pdf.ts` — builds and encrypts the PDF with pdf-lib
- `src/lib/currency.ts` — format helpers for ETB/USD/EUR/GBP
- Add dependency: `pdf-lib`
