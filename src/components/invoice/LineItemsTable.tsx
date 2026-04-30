import { Plus, Trash2 } from "lucide-react";
import { EditableText } from "./EditableText";
import type { LineItem } from "@/hooks/useInvoice";
import { formatMoney, type CurrencyCode } from "@/lib/currency";
import { Button } from "@/components/ui/button";

interface Props {
  items: LineItem[];
  currency: CurrencyCode;
  onUpdate: (id: string, patch: Partial<LineItem>) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
}

export function LineItemsTable({ items, currency, onUpdate, onRemove, onAdd }: Props) {
  return (
    <div className="mt-8">
      {/* Desktop / tablet header */}
      <div className="hidden sm:grid grid-cols-[1fr_80px_120px_120px_40px] gap-3 pb-2 border-b border-foreground/20 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <div>Description</div>
        <div className="text-right">Qty</div>
        <div className="text-right">Unit price</div>
        <div className="text-right">Amount</div>
        <div />
      </div>

      <div className="divide-y divide-foreground/10">
        {items.map((item) => {
          const amount = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
          return (
            <div
              key={item.id}
              className="grid sm:grid-cols-[1fr_80px_120px_120px_40px] grid-cols-2 gap-3 py-3 items-start"
            >
              <div className="col-span-2 sm:col-span-1">
                <EditableText
                  multiline
                  as="div"
                  value={item.description}
                  onChange={(v) => onUpdate(item.id, { description: v })}
                  placeholder="Describe the work / deliverable"
                  className="text-sm"
                />
              </div>
              <div className="sm:text-right">
                <label className="sm:hidden text-xs text-muted-foreground block">Qty</label>
                <input
                  type="number"
                  min={0}
                  value={item.quantity}
                  onChange={(e) => onUpdate(item.id, { quantity: Number(e.target.value) })}
                  className="w-full sm:text-right bg-transparent hover:bg-muted/60 focus:bg-muted/80 outline-none rounded px-1 py-0.5 text-sm"
                />
              </div>
              <div className="sm:text-right">
                <label className="sm:hidden text-xs text-muted-foreground block">Unit price</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={item.unitPrice}
                  onChange={(e) => onUpdate(item.id, { unitPrice: Number(e.target.value) })}
                  className="w-full sm:text-right bg-transparent hover:bg-muted/60 focus:bg-muted/80 outline-none rounded px-1 py-0.5 text-sm"
                />
              </div>
              <div className="sm:text-right text-sm font-medium self-center">
                <label className="sm:hidden text-xs text-muted-foreground block font-normal">Amount</label>
                {formatMoney(amount, currency)}
              </div>
              <div className="col-span-2 sm:col-span-1 flex sm:justify-center sm:items-center">
                <button
                  onClick={() => onRemove(item.id)}
                  className="no-print text-muted-foreground hover:text-destructive transition-colors p-1"
                  aria-label="Remove item"
                  disabled={items.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <Button
        onClick={onAdd}
        variant="ghost"
        size="sm"
        className="no-print mt-3 text-muted-foreground hover:text-foreground"
      >
        <Plus className="h-4 w-4 mr-1" />
        Add line item
      </Button>
    </div>
  );
}
