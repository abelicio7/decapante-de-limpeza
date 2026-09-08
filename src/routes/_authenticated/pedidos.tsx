import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, BellOff, Loader2, ShieldAlert, Volume2 } from "lucide-react";
import { useEffect, useState } from "react";

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
import {
  getAdminPushStatus,
  subscribeAdminPush,
  triggerOrderAlert,
  triggerStatusChangeAlert,
  unsubscribeAdminPush,
} from "@/lib/push-notifications";

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
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [pushSupported, setPushSupported] = useState(true);

  // Check initial push notification status
  useEffect(() => {
    getAdminPushStatus().then((status) => {
      setPushSupported(status.supported);
      setPushSubscribed(status.subscribed);
    });
  }, []);

  // Supabase Realtime Listener for Instant Order Notifications & Status Updates
  useEffect(() => {
    const channel = supabase
      .channel("orders_realtime_channel")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          const newOrder = payload.new as {
            name: string;
            phone: string;
            address?: string;
            neighborhood?: string | null;
          };

          // Invalidate React Query list to show new order immediately
          queryClient.invalidateQueries({ queryKey: ["orders"] });

          // Trigger Push & Audio alert
          triggerOrderAlert(newOrder);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        (payload) => {
          const updatedOrder = payload.new as {
            name: string;
            status: string;
            phone?: string;
          };

          queryClient.invalidateQueries({ queryKey: ["orders"] });
          triggerStatusChangeAlert(updatedOrder);
        }
      )
      .on("broadcast", { event: "new_order" }, ({ payload }) => {
        queryClient.invalidateQueries({ queryKey: ["orders"] });
        if (payload) triggerOrderAlert(payload);
      })
      .on("broadcast", { event: "status_changed" }, ({ payload }) => {
        queryClient.invalidateQueries({ queryKey: ["orders"] });
        if (payload) triggerStatusChangeAlert(payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const toggleNotifications = async () => {
    setPushLoading(true);
    try {
      if (pushSubscribed) {
        await unsubscribeAdminPush();
        setPushSubscribed(false);
      } else {
        await subscribeAdminPush();
        setPushSubscribed(true);
        // Play test chime on activation
        triggerOrderAlert({
          name: "Notificações Ativadas!",
          phone: "Receberá alertas a cada novo pedido e mudança de estado.",
        });
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao alterar notificações.");
    } finally {
      setPushLoading(false);
    }
  };

  const testNotification = () => {
    triggerStatusChangeAlert({
      name: "Cliente Exemplo",
      status: "em_entrega",
    });
  };

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

  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const changeStatus = async (id: string, status: Status, orderName: string) => {
    setUpdatingId(id);
    const { data, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id)
      .select();
    setUpdatingId(null);

    if (error) {
      console.error("Erro ao atualizar estado no Supabase:", error);
      toast.error(`Não foi possível alterar o estado: ${error.message}`);
      return;
    }

    if (!data || data.length === 0) {
      console.error("Supabase RLS bloqueou a alteração do pedido:", id);
      toast.error("Erro: A sua conta não tem permissão no Supabase para guardar a alteração.");
      return;
    }

    toast.success(`Estado de "${orderName}" atualizado para "${LABELS[status]}"!`);
    queryClient.invalidateQueries({ queryKey: ["orders"] });
    triggerStatusChangeAlert({ name: orderName, status });
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
          <div>
            <h1 className="text-2xl">Pedidos recebidos</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Notificações de pedidos e atualizações de estado em tempo real ativas.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {pushSupported && (
              <>
                <Button
                  variant={pushSubscribed ? "default" : "outline"}
                  size="sm"
                  onClick={toggleNotifications}
                  disabled={pushLoading}
                  className="gap-1.5"
                >
                  {pushLoading ? (
                    <Loader2 className="animate-spin !size-4" />
                  ) : pushSubscribed ? (
                    <Bell className="!size-4 text-accent-foreground" />
                  ) : (
                    <BellOff className="!size-4" />
                  )}
                  {pushSubscribed ? "Notificações Ativas" : "Ativar Notificações"}
                </Button>
                {pushSubscribed && (
                  <Button variant="ghost" size="sm" onClick={testNotification} className="gap-1 text-xs">
                    <Volume2 className="!size-4" /> Testar Alerta
                  </Button>
                )}
              </>
            )}
            <Button variant="outline" size="sm" onClick={signOut}>
              Sair
            </Button>
          </div>
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
                        disabled={updatingId === order.id}
                        onValueChange={(v) => changeStatus(order.id, v as Status, order.name)}
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

