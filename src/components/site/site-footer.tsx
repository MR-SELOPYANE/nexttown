import { Link } from "@tanstack/react-router";

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; to?: string; href?: string }[];
}) {
  return (
    <div>
      <h5 className="text-foreground text-sm font-semibold mb-4">{title}</h5>
      <ul className="space-y-3 text-sm text-muted-foreground">
        {links.map((l) => (
          <li key={l.label}>
            {l.to ? (
              <Link to={l.to} className="hover:text-foreground transition-colors">
                {l.label}
              </Link>
            ) : (
              <a href={l.href ?? "#"} className="hover:text-foreground transition-colors">
                {l.label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-background pt-20 pb-10 px-6 border-t border-white/5 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-10 mb-16">
        <div className="col-span-2">
          <Link
            to="/"
            className="text-brand-light font-semibold tracking-tight text-xl mb-5 block"
          >
            HITCH<span className="text-foreground">SA</span>
          </Link>
          <p className="text-muted-foreground text-sm max-w-[38ch] leading-relaxed">
            Building the digital nervous system for South African logistics and
            transport. Headquartered in Sandton, serving the nation.
          </p>
        </div>
        <FooterCol
          title="Marketplace"
          links={[
            { label: "Features", to: "/features" },
            { label: "Pricing", to: "/pricing" },
            { label: "For Drivers", to: "/register" },
            { label: "For Business", to: "/contact" },
          ]}
        />
        <FooterCol
          title="Company"
          links={[
            { label: "About", to: "/about" },
            { label: "Careers", to: "/careers" },
            { label: "Contact", to: "/contact" },
            { label: "FAQ", to: "/faq" },
          ]}
        />
        <FooterCol
          title="Support"
          links={[
            { label: "Help Center", to: "/support" },
            { label: "Contact Us", to: "/contact" },
            { label: "Privacy", href: "#" },
            { label: "POPIA", href: "#" },
            { label: "Terms", href: "#" },
          ]}
        />
      </div>
      <div className="max-w-7xl mx-auto border-t border-white/5 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Hitch SA Mobility (Pty) Ltd. All rights reserved.
        </p>
        <div className="flex gap-5 text-xs text-muted-foreground">
          <a href="#" className="hover:text-foreground">Twitter</a>
          <a href="#" className="hover:text-foreground">LinkedIn</a>
          <a href="#" className="hover:text-foreground">Instagram</a>
        </div>
      </div>
    </footer>
  );
}
