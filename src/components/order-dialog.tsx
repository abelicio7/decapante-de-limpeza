import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { CheckCircle2, Loader2, PackageCheck, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { track } from "@/lib/tracking";
import { PRICE_MT } from "@/lib/offer";

type OrderContextValue = { open: (origin: string) => void };

const OrderContext = createContext<OrderContextValue | null>(null);

export function useOrder() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrder deve ser usado dentro de OrderProvider");
  return ctx;
}

type Errors = Partial<Record<"name" | "phone" | "address" | "consent", string>>;

export function OrderProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    neighborhood: "",
    consent: false,
  });

  const open = useCallback((origin: string) => {
    track("CTA_CLICK", { origin });
    setDone(false);
    setIsOpen(true);
  }, []);

  const value = useMemo(() => ({ open }), [open]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const next: Errors = {};
    if (form.name.trim().length < 3) next.name = "Escreva o seu nome completo.";
    const digits = form.phone.replace(/\D/g, "");
    if (digits.length < 9) next.phone = "Escreva um número de telefone válido (9 dígitos).";
    if (form.address.trim().length < 5) next.address = "Indique o local da entrega.";
    if (!form.consent) next.consent = "Precisamos da sua autorização para ligar.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSending(true);
    const { error } = await supabase.from("orders").insert({
      name: form.name.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      neighborhood: form.neighborhood.trim() || null,
    });
    setSending(false);

    if (error) {
      setErrors({ name: "Não conseguimos enviar o pedido. Tente novamente." });
      return;
    }

    track("ORDER_SUBMITTED", { value: PRICE_MT, currency: "MZN" });
    setDone(true);
    setForm({ name: "", phone: "", address: "", neighborhood: "", consent: false });
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-3xl sm:max-w-md">
          {done ? (
            <div className="py-2 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                <CheckCircle2 className="!size-8 text-accent" />
              </div>
              <DialogTitle className="mt-4 font-display text-2xl">Pedido recebido!</DialogTitle>
              <p className="mt-3 text-sm text-muted-foreground">
                Obrigado pelo seu pedido. Recebemos os seus dados e a nossa equipa entrará em
                contacto pelo telefone informado para confirmar a encomenda e combinar a entrega.
              </p>
              <div className="mt-5 space-y-2 rounded-2xl bg-muted p-4 text-left text-sm">
                <p className="flex items-center gap-2 font-semibold">
                  <PackageCheck className="text-accent" /> Valor: {PRICE_MT} MT
                </p>
                <p className="flex items-center gap-2 font-semibold">
                  <Truck className="text-accent" /> Entrega: GRÁTIS em Maputo e Matola
                </p>
              </div>
              <Button className="mt-5 w-full" variant="deep" size="xl" onClick={() => setIsOpen(false)}>
                Fechar
              </Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">Solicite a sua entrega</DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Preencha os seus dados abaixo e entraremos em contacto para confirmar o seu pedido.
                </p>
              </DialogHeader>
              <form className="space-y-4" onSubmit={submit} noValidate>
                <div className="space-y-1.5">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    className="h-12 text-base"
                    placeholder="Digite o seu nome"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                  {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="tel"
                    className="h-12 text-base"
                    placeholder="Ex.: 84 XXX XXXX"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                  {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    className="h-12 text-base"
                    placeholder="Informe o local onde deseja receber"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                  />
                  {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="neighborhood">Bairro/Localização</Label>
                  <Input
                    id="neighborhood"
                    className="h-12 text-base"
                    placeholder="Ex.: Matola, Machava…"
                    value={form.neighborhood}
                    onChange={(e) => setForm({ ...form, neighborhood: e.target.value })}
                  />
                </div>
                <div className="flex items-start gap-3 rounded-2xl bg-muted p-3">
                  <Checkbox
                    id="consent"
                    checked={form.consent}
                    onCheckedChange={(v) => setForm({ ...form, consent: v === true })}
                  />
                  <Label htmlFor="consent" className="text-xs leading-relaxed font-normal">
                    Concordo em ser contactado para confirmação da encomenda.
                  </Label>
                </div>
                {errors.consent && <p className="text-xs text-destructive">{errors.consent}</p>}
                <Button type="submit" variant="cta" size="xl" className="w-full" disabled={sending}>
                  {sending ? <Loader2 className="animate-spin" /> : null}
                  Confirmar pedido
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  {PRICE_MT} MT • Sem pagamento online • Confirmação por telefone
                </p>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </OrderContext.Provider>
  );
}
