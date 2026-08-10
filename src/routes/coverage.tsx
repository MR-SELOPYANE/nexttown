import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Activity, MapPinned, Route as RouteIcon, Truck } from "lucide-react";
import { PageShell, PageHeader } from "@/components/site/page-shell";
import { NetworkMap } from "@/components/site/maps";
import { HUBS, CORRIDORS } from "@/lib/sa-places";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/coverage")({
  head: () => ({
    meta: [
      { title: "Network coverage map — HITCH SA" },
      {
        name: "description",
        content:
          "Explore the HITCH SA live network: 10 metro hubs, national freight corridors and cross-border routes across Southern Africa.",
      },
      { property: "og:title", content: "Network coverage map — HITCH SA" },
      {
        property: "og:description",
        content: "Live metro hubs and freight corridors on the HITCH SA mobility network.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CoveragePage,
});

const STATS = [
  { icon: MapPinned, label: "Metro hubs", value: "10" },
  { icon: RouteIcon, label: "National corridors", value: "24" },
  { icon: Truck, label: "Verified operators", value: "3 480" },
  { icon: Activity, label: "Trips today", value: "6 995" },
];

function CoveragePage() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <PageShell>
      <PageHeader
        eyebrow="Network"
        title="Where HITCH SA moves."
        subtitle="Live metro hubs, high-density corridors and cross-border lanes — tap any hub to see its daily volume."
      />

      <section className="px-6 pb-6 max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <div key={s.label} className="glass-card rounded-xl p-4 border border-white/10">
            <s.icon className="size-4 text-brand-light" />
            <div className="text-2xl font-semibold mt-2">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </section>

      <section className="px-6 pb-14 max-w-6xl mx-auto grid lg:grid-cols-[1fr_300px] gap-6">
        <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
          <NetworkMap hubs={HUBS} corridors={CORRIDORS} height={520} onSelectHub={setSelected} />
          <div className="px-5 py-3 text-xs text-muted-foreground border-t border-white/10">
            {selected ? `Selected hub: ${selected}` : "Tap a hub marker for live volume."}
          </div>
        </div>

        <aside className="space-y-3">
          <h2 className="text-xs uppercase tracking-widest text-muted-foreground">
            Priority corridors
          </h2>
          {CORRIDORS.map((c) => (
            <div key={c.name} className="glass-card rounded-xl p-4 border border-white/10">
              <div className="text-sm font-medium">{c.name}</div>
              <div className="text-xs text-brand-light">{c.load}</div>
            </div>
          ))}
          <Button asChild className="w-full bg-brand hover:bg-brand-light text-white">
            <Link to="/freight">Find capacity on a corridor</Link>
          </Button>
        </aside>
      </section>

      <section className="px-6 pb-20 max-w-6xl mx-auto">
        <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
          Hub coverage
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {HUBS.map((h) => (
            <div key={h.name} className="glass-card rounded-xl p-5 border border-white/10">
              <div className="font-medium">{h.name}</div>
              <div className="text-xs text-muted-foreground">{h.province}</div>
              <div className="text-sm text-brand-light mt-2">{h.volume}</div>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
