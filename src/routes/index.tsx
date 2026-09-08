import { createFileRoute } from "@tanstack/react-router";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { BeforeAfter } from "@/components/before-after";
import { OrderProvider, useOrder } from "@/components/order-dialog";
import { DELIVERY_AREAS, OLD_PRICE_MT, PRICE_MT } from "@/lib/offer";
import {
  AlertTriangle,
  Bath,
  Brush,
  Clock,
  Droplets,
  Flame,
  Home,
  Sparkles,
  Timer,
  Toilet,
  Truck,
} from "lucide-react";

import produto from "@/assets/produto.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "Decapante de Limpeza para Tijoleiras e Vasos | Entrega em Maputo e Matola",
      },
      {
        name: "description",
        content:
          "Decapante de limpeza para ajudar a remover sujidade pesada de tijoleiras, vasos sanitários e áreas de banho. Apenas 750 MT com entrega grátis em Maputo e Matola.",
      },
      {
        property: "og:title",
        content: "Decapante de Limpeza — 750 MT com entrega grátis em Maputo e Matola",
      },
      {
        property: "og:description",
        content:
          "Ajuda a remover sujidade pesada de tijoleiras, vasos sanitários e áreas de banho. Solicite a entrega em poucos segundos.",
      },
      { property: "og:type", content: "product" },
      { name: "twitter:card", content: "summary_large_image" },

    ],
  }),
  component: () => (
    <OrderProvider>
      <Landing />
    </OrderProvider>
  ),
});

function Cta({ origin, className }: { origin: string; className?: string }) {
  const { open } = useOrder();
  return (
    <Button variant="cta" size="xl" className={className} onClick={() => open(origin)}>
      Solicitar entrega
    </Button>
  );
}

function Landing() {
  return (
    <main className="pb-28 md:pb-0">
      {/* HERO */}
      <section className="surface-deep relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 pt-12 pb-14 md:grid-cols-2 md:items-center md:gap-12 md:pt-20 md:pb-24">
          <div className="reveal">
            <span className="badge-flash inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold tracking-wide uppercase">
              <Truck className="!size-4" /> Entrega grátis em {DELIVERY_AREAS}
            </span>
            <h1 className="mt-5 text-4xl md:text-5xl">
              Tijoleiras encardidas e vasos que parecem impossíveis de limpar?
            </h1>
            <p className="mt-4 max-w-lg text-base/relaxed text-deep-foreground/85 md:text-lg/relaxed">
              Conheça o <strong>Decapante de Limpeza</strong> que ajuda a remover aquela sujidade
              pesada que os produtos comuns simplesmente não conseguem resolver.
            </p>
            <p className="mt-5 flex items-center gap-2 font-display text-xl">
              <Flame className="!size-5 text-highlight" /> Apenas {PRICE_MT} MT{" "}
              <span className="text-deep-foreground/60 line-through">{OLD_PRICE_MT} MT</span>
            </p>
            <div className="mt-6">
              <Cta origin="hero" className="w-full cta-pulse sm:w-auto" />
              <p className="mt-3 text-sm text-deep-foreground/75">
                Preencha os seus dados e receba o produto em casa.
              </p>
            </div>
          </div>
          <div className="reveal relative">
            <div className="absolute inset-6 rounded-full bg-brand/25 blur-3xl" aria-hidden />
            <img
              src={produto.url}
              alt="Embalagem de 1 litro do Decapante de Limpeza"
              className="relative mx-auto w-full max-w-sm rounded-[2rem] bg-card p-4 shadow-card"
              width={1240}
              height={1240}
            />
          </div>
        </div>
      </section>

      {/* PROBLEMA */}
      <section className="mx-auto max-w-3xl px-5 py-14 md:py-20">
        <h2 className="text-3xl md:text-4xl">Já tentou de tudo e a sujidade continua lá?</h2>
        <div className="mt-5 space-y-4 text-base/relaxed text-muted-foreground">
          <p>
            Você esfrega, aplica detergente, experimenta outro produto… e mesmo assim aquela sujidade
            pesada continua agarrada à superfície.
          </p>
          <p>
            E o pior é quando alguém aparece em casa e você fica constrangido com o estado do
            banheiro ou das tijoleiras.
          </p>
          <p className="font-semibold text-foreground">O problema pode não ser falta de esforço.</p>
          <p>Pode ser simplesmente estar a usar um produto fraco para uma sujidade pesada.</p>
        </div>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {[
            "Tijoleiras escuras e encardidas",
            "Vasos sanitários com manchas difíceis",
            "Sujidade acumulada de meses",
            "Marcas que parecem não sair",
            "Horas a esfregar sem resultado",
            "Dinheiro gasto em vários produtos",
          ].map((item) => (
            <li
              key={item}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-sm font-medium"
            >
              <AlertTriangle className="!size-5 shrink-0 text-brand" /> {item}
            </li>
          ))}
        </ul>
      </section>

      {/* SOLUÇÃO + BENEFÍCIOS */}
      <section className="surface-soft border-y border-border">
        <div className="mx-auto max-w-5xl px-5 py-14 md:py-20">
          <h2 className="max-w-xl text-3xl md:text-4xl">Foi por isso que criámos esta solução.</h2>
          <div className="mt-5 max-w-2xl space-y-4 text-base/relaxed text-muted-foreground">
            <p>
              O Decapante de Limpeza foi pensado para ajudar a enfrentar sujidades pesadas em áreas
              que precisam de uma limpeza mais profunda.
            </p>
            <p>
              Em vez de ficar horas a esfregar sem resultado, aplique corretamente o produto, deixe
              agir conforme as instruções do rótulo e faça a limpeza da superfície.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {[
              { icon: Sparkles, text: "Ajuda a remover sujidade pesada" },
              { icon: Droplets, text: "Ideal para áreas muito encardidas" },
              { icon: Brush, text: "Facilita a limpeza de tijoleiras e vasos sanitários" },
              { icon: Timer, text: "Economiza tempo e esforço na limpeza" },
            ].map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-start gap-4 rounded-3xl bg-card p-5 shadow-card transition-transform hover:-translate-y-0.5"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                  <Icon className="!size-5" />
                </span>
                <p className="pt-2 font-semibold">{text}</p>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <Cta origin="solucao" className="w-full sm:w-auto" />
          </div>
        </div>
      </section>

      {/* ANTES E DEPOIS */}
      <section className="mx-auto max-w-6xl px-5 py-14 md:py-20">
        <h2 className="text-3xl md:text-4xl">Veja a diferença</h2>
        <p className="mt-2 text-muted-foreground">Resultados reais enviados por clientes.</p>
        <div className="mt-8">
          <BeforeAfter />
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          Cada superfície pode reagir de forma diferente dependendo do tipo e do nível de sujidade.
        </p>
      </section>

      {/* COMO USAR */}
      <section className="surface-deep">
        <div className="mx-auto max-w-5xl px-5 py-14 md:py-20">
          <h2 className="text-3xl md:text-4xl">Como usar</h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Aplique",
                text: "Aplique o produto na área que pretende limpar, seguindo as instruções do rótulo.",
              },
              {
                title: "Deixe agir",
                text: "Permita que o produto atue pelo período indicado nas instruções.",
              },
              {
                title: "Limpe",
                text: "Esfregue/enxague adequadamente e observe a diferença.",
              },
            ].map((step, i) => (
              <li key={step.title} className="rounded-3xl bg-deep-foreground/8 p-6 backdrop-blur">
                <span className="font-display text-4xl text-highlight">{i + 1}</span>
                <h3 className="mt-2 text-xl">{step.title}</h3>
                <p className="mt-2 text-sm/relaxed text-deep-foreground/80">{step.text}</p>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-sm text-deep-foreground/70">
            Antes de utilizar, leia atentamente as instruções e recomendações de segurança presentes
            no rótulo.
          </p>
        </div>
      </section>

      {/* ONDE USAR */}
      <section className="mx-auto max-w-5xl px-5 py-14 md:py-20">
        <h2 className="text-3xl md:text-4xl">Ideal para ajudar na limpeza de:</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Brush, text: "Tijoleiras encardidas" },
            { icon: Toilet, text: "Vasos sanitários" },
            { icon: Bath, text: "Áreas de banho" },
            { icon: Home, text: "Áreas domésticas com sujidade pesada" },
          ].map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="rounded-3xl border border-border bg-card p-5 text-center shadow-card"
            >
              <Icon className="mx-auto !size-7 text-brand" />
              <p className="mt-3 text-sm font-semibold">{text}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 rounded-2xl bg-muted p-4 text-sm text-muted-foreground">
          <strong className="text-foreground">IMPORTANTE:</strong> siga sempre as instruções do
          rótulo e teste numa pequena área quando houver dúvida sobre a compatibilidade da
          superfície.
        </p>
      </section>

      {/* PROVA SOCIAL / OBJEÇÕES */}
      <section className="surface-soft border-y border-border">
        <div className="mx-auto max-w-3xl px-5 py-14 md:py-20">
          <h2 className="text-3xl md:text-4xl">Quem experimentou, viu a diferença.</h2>
          <p className="mt-3 text-muted-foreground">
            As fotos acima foram enviadas por clientes. À medida que recebermos novos comentários,
            eles aparecerão nesta secção.
          </p>

          <h3 className="mt-12 text-2xl">“Mas será que funciona na minha casa?”</h3>
          <p className="mt-3 text-muted-foreground">
            Se o seu problema são manchas, encardidos e sujidade pesada, o Decapante de Limpeza foi
            desenvolvido justamente para ajudar nesse tipo de limpeza. O resultado depende do tipo de
            superfície, da natureza da sujidade e da forma correta de utilização.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { q: "Preciso ir buscar?", a: `Não. Entregamos GRÁTIS em ${DELIVERY_AREAS}.` },
              { q: "Quanto custa?", a: `Apenas ${PRICE_MT} MT.` },
              {
                q: "Como faço o pedido?",
                a: "Clique em “Solicitar Entrega” e preencha nome, telefone e endereço.",
              },
            ].map((item) => (
              <div key={item.q} className="rounded-3xl bg-card p-5 shadow-card">
                <p className="font-display text-lg">{item.q}</p>
                <p className="mt-2 text-sm text-muted-foreground">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OFERTA FINAL */}
      <section className="surface-deep">
        <div className="mx-auto max-w-3xl px-5 py-16 text-center md:py-24">
          <h2 className="text-3xl md:text-4xl">
            Chega de conviver com aquela sujidade que parece impossível de sair.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-deep-foreground/85">
            Dê uma nova aparência às áreas encardidas da sua casa sem continuar a gastar dinheiro em
            vários produtos que não resolvem o problema.
          </p>
          <div className="mt-8 rounded-3xl border border-deep-foreground/15 bg-deep-foreground/8 p-7">
            <p className="font-display text-xl tracking-wide uppercase">Decapante de Limpeza</p>
            <p className="mt-2 font-display text-5xl text-highlight">{PRICE_MT} MT</p>
            <p className="mt-1 text-sm text-deep-foreground/60 line-through">
              Antes {OLD_PRICE_MT} MT
            </p>
            <p className="mt-4 flex items-center justify-center gap-2 font-semibold">
              <Truck className="!size-5 text-highlight" /> Entrega grátis — {DELIVERY_AREAS}
            </p>
            <Cta origin="oferta-final" className="mt-6 w-full" />
            <p className="mt-3 text-xs text-deep-foreground/75">
              Pedido simples • Sem pagamento online • Confirmação por telefone
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-5 py-14 md:py-20">
        <h2 className="text-3xl md:text-4xl">Perguntas frequentes</h2>
        <Accordion type="single" collapsible className="mt-6">
          <AccordionItem value="1">
            <AccordionTrigger>Onde entregam?</AccordionTrigger>
            <AccordionContent>
              Entregamos em {DELIVERY_AREAS}, com entrega grátis. Para outras zonas, deixe o pedido e
              a nossa equipa liga para verificar a possibilidade de entrega.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="2">
            <AccordionTrigger>Como pago?</AccordionTrigger>
            <AccordionContent>
              Não existe pagamento online. A nossa equipa liga para confirmar o pedido e combinar a
              entrega e o pagamento.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="3">
            <AccordionTrigger>Quanto tempo demora a entrega?</AccordionTrigger>
            <AccordionContent>
              Depois de receber o seu pedido, entramos em contacto pelo telefone informado para
              combinar o dia e a hora da entrega.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="4">
            <AccordionTrigger>Cuidados importantes</AccordionTrigger>
            <AccordionContent>
              Utilize o produto de acordo com as instruções do rótulo. Evite contacto com os olhos e
              pele. Mantenha fora do alcance de crianças. Não misture com outros produtos de limpeza.
              Em caso de dúvida, consulte as instruções do fabricante.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <div className="mt-8 flex items-center gap-3 rounded-2xl bg-muted p-4 text-sm text-muted-foreground">
          <Clock className="!size-5 shrink-0 text-accent" />
          Pedidos com entrega em {DELIVERY_AREAS} — deixe os seus dados e ligamos para confirmar.
        </div>
      </section>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-5xl px-5 py-10 text-sm text-muted-foreground">
          <p className="font-display text-base text-foreground">Decapante de Limpeza</p>
          <p className="mt-2 max-w-2xl">
            Cuidados importantes: utilize o produto de acordo com as instruções do rótulo. Evite
            contacto com os olhos e pele. Mantenha fora do alcance de crianças. Não misture com
            outros produtos de limpeza.
          </p>
          <p className="mt-4">Entrega grátis em {DELIVERY_AREAS} • {PRICE_MT} MT</p>
        </div>
      </footer>

      {/* BARRA FIXA MOBILE */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-4 py-3 backdrop-blur md:hidden">
        <div className="flex items-center gap-3">
          <div className="leading-tight">
            <p className="font-display text-xl">{PRICE_MT} MT</p>
            <p className="text-[11px] text-muted-foreground">Entrega grátis</p>
          </div>
          <Cta origin="barra-fixa" className="h-13 flex-1 text-sm" />
        </div>
      </div>
    </main>
  );
}
