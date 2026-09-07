import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import foto1 from "@/assets/antes-depois-1.jpg.asset.json";
import foto2 from "@/assets/antes-depois-6.jpg.asset.json";
import foto3 from "@/assets/antes-depois-4.jpg.asset.json";
import foto4 from "@/assets/antes-depois-5.jpg.asset.json";
import foto5 from "@/assets/antes-depois-3.jpg.asset.json";
import foto6 from "@/assets/antes-depois-7.jpg.asset.json";
import foto7 from "@/assets/antes-depois-2.jpg.asset.json";

type Shot = { url: string; alt: string; layout: "lado" | "cima" };

const shots: Shot[] = [
  { url: foto1.url, alt: "Chão de mosaico do duche antes e depois da limpeza", layout: "lado" },
  { url: foto2.url, alt: "Interior de vaso sanitário com manchas antes e depois", layout: "lado" },
  { url: foto3.url, alt: "Base do vaso e tijoleira encardida antes e depois", layout: "lado" },
  { url: foto4.url, alt: "Lavatório com manchas antes e depois", layout: "cima" },
  { url: foto5.url, alt: "Área de banho com sujidade pesada antes e depois", layout: "lado" },
  { url: foto6.url, alt: "Duche com juntas escuras antes e depois", layout: "lado" },
  { url: foto7.url, alt: "Cabine de duche antes e depois", layout: "cima" },
];

export function BeforeAfter() {
  return (
    <Carousel opts={{ align: "start", loop: true }} className="w-full">
      <CarouselContent className="-ml-3">
        {shots.map((shot) => (
          <CarouselItem key={shot.url} className="basis-[85%] pl-3 sm:basis-1/2 lg:basis-1/3">
            <figure className="overflow-hidden rounded-3xl bg-card shadow-card">
              <div className="relative">
                <img
                  src={shot.url}
                  alt={shot.alt}
                  loading="lazy"
                  className="aspect-square w-full object-cover"
                />
                {shot.layout === "lado" ? (
                  <>
                    <span className="absolute top-3 left-3 rounded-full bg-deep/90 px-3 py-1 text-[11px] font-bold tracking-widest text-deep-foreground uppercase">
                      Antes
                    </span>
                    <span className="absolute top-3 right-3 rounded-full bg-brand px-3 py-1 text-[11px] font-bold tracking-widest text-brand-foreground uppercase">
                      Depois
                    </span>
                  </>
                ) : (
                  <>
                    <span className="absolute top-3 left-3 rounded-full bg-deep/90 px-3 py-1 text-[11px] font-bold tracking-widest text-deep-foreground uppercase">
                      Antes
                    </span>
                    <span className="absolute bottom-3 left-3 rounded-full bg-brand px-3 py-1 text-[11px] font-bold tracking-widest text-brand-foreground uppercase">
                      Depois
                    </span>
                  </>
                )}
              </div>
            </figure>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="mt-5 flex justify-center gap-3">
        <CarouselPrevious className="static translate-y-0" />
        <CarouselNext className="static translate-y-0" />
      </div>
    </Carousel>
  );
}
