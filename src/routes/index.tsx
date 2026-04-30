import { createFileRoute } from "@tanstack/react-router";
import { useInvoice } from "@/hooks/useInvoice";
import { InvoicePaper } from "@/components/invoice/InvoicePaper";
import { ControlPanel } from "@/components/invoice/ControlPanel";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/")({
  component: InvoicePage,
  head: () => ({
    meta: [
      { title: "Simon Star Tech — Invoice Generator" },
      {
        name: "description",
        content:
          "Create, customize, and export password-protected invoices for Simon Star Tech — a creative development agency focused on graphic design and web development.",
      },
    ],
  }),
});

function InvoicePage() {
  const {
    invoice,
    update,
    updateFrom,
    updateBillTo,
    addItem,
    updateItem,
    removeItem,
    totals,
    reset,
  } = useInvoice();

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:py-10">
        <header className="no-print mb-6 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-center">SIMON STAR TECH INVOICE GENERATOR</h1>
          <p className="text-muted-foreground mt-1 text-center text-base">
            This invoice generator is a property of Simon Star Tech. No entity is supposed to use it unless authorized to do so.
          </p>
        </header>

        <div className="grid lg:grid-cols-[1fr_320px] gap-6 lg:gap-8 items-start">
          <div className="min-w-0">
            <InvoicePaper
              invoice={invoice}
              totals={totals}
              onUpdate={update}
              onUpdateFrom={updateFrom}
              onUpdateBillTo={updateBillTo}
              onAddItem={addItem}
              onUpdateItem={updateItem}
              onRemoveItem={removeItem}
            />
          </div>
          <ControlPanel invoice={invoice} totals={totals} onUpdate={update} onReset={reset} />
        </div>
      </div>
    </div>
  );
}
