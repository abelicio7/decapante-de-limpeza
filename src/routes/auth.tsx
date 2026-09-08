import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Acesso da equipa | Decapante de Limpeza" },
      { name: "description", content: "Área de acesso da equipa para gerir os pedidos recebidos." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Acesso da equipa | Decapante de Limpeza" },
      { property: "og:description", content: "Área reservada à equipa de gestão de pedidos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/pedidos" });
    });
  }, [navigate]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setMessage("Email ou palavra-passe incorretos.");
      return;
    }
    navigate({ to: "/pedidos" });
  };

  return (
    <main className="surface-soft flex min-h-screen items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm rounded-3xl bg-card p-7 shadow-card">
        <h1 className="text-2xl">Acesso da equipa</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Entre para ver e gerir os pedidos recebidos.
        </p>
        <form className="mt-6 space-y-4" onSubmit={submit}>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              className="h-12"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Palavra-passe</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={6}
              className="h-12"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {message && <p className="text-xs text-destructive">{message}</p>}
          <Button type="submit" variant="deep" size="xl" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : null}
            Entrar
          </Button>
        </form>
      </div>
    </main>
  );
}
