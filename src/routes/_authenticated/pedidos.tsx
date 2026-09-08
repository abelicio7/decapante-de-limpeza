import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/pedidos")({
  head: () => ({
    meta: [
      { title: "Pedidos recebidos | Decapante de Limpeza" },
      { name: "description", content: "Painel interno para acompanhar os pedidos de entrega." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Pedidos recebidos | Decapante de Limpeza" },
      { property: "og:description", content: "Painel interno de gestão de pedidos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OrdersPage,
});

const STATUSES = ["novo", "confirmado", "em_entrega", "entregue", "cancelado"] as const;
type Status = (typeof STATUSES)[number];

const LABELS: Record<Status, string> = {
  novo: "Novo",
  confirmado: "Confirmado",
  em_entrega: "Em entrega",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

function OrdersPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<Status | "todos">("todos");

  const { data, isLoading, error } = useQuery({
    queryKey: ["orders", filter],
    queryFn: async () => {
      let query = supabase.from("orders").select("*").order("created_at", { ascending: false });
      if (filter !== "todos") query = query.eq("status", filter);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const changeStatus = async (id: string, status: Status) => {
    await supabase.from("orders").update({ status }).eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["orders"] });
  };

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <main className="surface-soft min-h-screen px-5 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl">Pedidos recebidos</h1>
          <Button variant="outline" onClick={signOut}>
            Sair
          </Button>
        </div>

        <div className="mt-6 w-56">
          <Select value={filter} onValueChange={(v) => setFilter(v as Status | "todos")}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os estados</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-6 overflow-x-auto rounded-3xl bg-card p-2 shadow-card">
          {isLoading ? (
            <p className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
              <Loader2 className="animate-spin" /> A carregar pedidos…
            </p>
          ) : error ? (
            <p className="flex items-start gap-3 p-6 text-sm text-muted-foreground">
              <ShieldAlert className="!size-5 shrink-0 text-brand" />
              A sua conta ainda não tem permissão de gestão. Peça a um administrador para lhe dar
              acesso.
            </p>
          ) : data && data.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Endereço</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.name}</TableCell>
                    <TableCell>{order.phone}</TableCell>
                    <TableCell className="max-w-52">{order.address}</TableCell>
                    <TableCell>{order.neighborhood ?? "—"}</TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleString("pt-PT")}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={order.status}
                        onValueChange={(v) => changeStatus(order.id, v as Status)}
                      >
                        <SelectTrigger className="w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {LABELS[s]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="p-6 text-sm text-muted-foreground">Ainda não há pedidos com este filtro.</p>
          )}
        </div>
      </div>
    </main>
  );
}
