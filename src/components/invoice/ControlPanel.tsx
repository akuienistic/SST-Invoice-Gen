import { useState } from "react";
import { Download, Lock, Eye, EyeOff, RotateCcw, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CURRENCIES, type CurrencyCode } from "@/lib/currency";
import type { InvoiceState } from "@/hooks/useInvoice";
import { generateInvoicePdf } from "@/lib/invoice-pdf";
import { toast } from "sonner";

interface Props {
  invoice: InvoiceState;
  totals: { subtotal: number; discount: number; total: number };
  onUpdate: <K extends keyof InvoiceState>(k: K, v: InvoiceState[K]) => void;
  onReset: () => void;
}

export function ControlPanel({ invoice, totals, onUpdate, onReset }: Props) {
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleDownload() {
    try {
      setBusy(true);
      await generateInvoicePdf({ invoice, totals, password: password.trim() || undefined });
      toast.success(password ? "Encrypted PDF downloaded" : "PDF downloaded");
    } catch (e) {
      console.error(e);
      toast.error("Could not generate PDF");
    } finally {
      setBusy(false);
    }
  }

  return (
    <aside className="no-print lg:sticky lg:top-6 lg:h-fit bg-card border border-border rounded-lg p-5 space-y-5 shadow-sm">
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider">Invoice settings</h2>
        <p className="text-xs text-muted-foreground mt-1">Changes save automatically to your browser.</p>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Currency</Label>
        <Select
          value={invoice.currency}
          onValueChange={(v) => onUpdate("currency", v as CurrencyCode)}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {Object.entries(CURRENCIES).map(([code, c]) => (
              <SelectItem key={code} value={code}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Discount</Label>
        <div className="flex gap-2">
          <Select
            value={invoice.discountType}
            onValueChange={(v) => onUpdate("discountType", v as any)}
          >
            <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No discount</SelectItem>
              <SelectItem value="flat">Flat amount</SelectItem>
              <SelectItem value="percent">Percentage</SelectItem>
            </SelectContent>
          </Select>
          {invoice.discountType !== "none" && (
            <Input
              type="number"
              min={0}
              value={invoice.discountValue}
              onChange={(e) => onUpdate("discountValue", Number(e.target.value))}
              className="w-24"
            />
          )}
        </div>
      </div>

      <div className="space-y-2 pt-4 border-t border-border">
        <Label className="text-xs flex items-center gap-1.5">
          <Lock className="h-3 w-3" />
          PDF password <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <div className="relative">
          <Input
            type={showPw ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Leave empty for unencrypted"
            className="pr-9"
          />
          <button
            type="button"
            onClick={() => setShowPw((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Toggle password visibility"
          >
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <p className="text-[11px] text-muted-foreground leading-snug">
          When set, the client must enter this password to open the PDF in any reader.
        </p>
      </div>

      <div className="space-y-2 pt-2">
        <Button onClick={handleDownload} disabled={busy} className="w-full" size="lg">
          <Download className="h-4 w-4 mr-2" />
          {busy ? "Generating…" : "Download PDF"}
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={() => window.print()} size="sm">
            <Printer className="h-4 w-4 mr-1.5" />
            Print
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (confirm("Reset the invoice to a blank template?")) onReset();
            }}
          >
            <RotateCcw className="h-4 w-4 mr-1.5" />
            Reset
          </Button>
        </div>
      </div>
    </aside>
  );
}
