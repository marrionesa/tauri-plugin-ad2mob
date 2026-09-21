import { LogoMark } from "./site-header"

const DOC_LINKS = [
  { href: "#instalacion", label: "Instalación" },
  { href: "#inicio-rapido", label: "Inicio rápido" },
  { href: "#api", label: "Referencia de la API" },
  { href: "#eventos", label: "Eventos" },
  { href: "#errores", label: "Errores" },
  { href: "#faq", label: "Solución de problemas" },
]

const RESOURCE_LINKS = [
  { href: "https://crates.io/crates/tauri-plugin-ad2mob", label: "crates.io" },
  { href: "https://www.npmjs.com/package/tauri-plugin-ad2mob", label: "npm" },
  { href: "https://github.com/marrionesa/tauri-plugin-ad2mob", label: "GitHub" },
  {
    href: "https://developers.google.com/admob",
    label: "Documentación de AdMob",
  },
  {
    href: "https://support.google.com/admob/answer/6128543",
    label: "Políticas del programa AdMob",
  },
]

const LEGAL_LINKS = [
  { href: "#escritorio", label: "Compatibilidad con escritorio" },
  { href: "#limitaciones", label: "Limitaciones conocidas" },
  { href: "#pruebas", label: "Pruebas y anuncios de test" },
]

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/60 bg-muted/30">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <LogoMark />
              <span className="font-mono text-sm font-semibold tracking-tight">
                tauri-plugin-ad2mob
              </span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              Google AdMob para apps Tauri v2 en Android e iOS: banners nativos,
              intersticiales, rewarded, consentimiento UMP y ATT — detrás de una
              única API de TypeScript tipada.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-border bg-background px-2.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                MIT OR Apache-2.0
              </span>
              <span className="rounded-full border border-border bg-background px-2.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                Tauri v2
              </span>
            </div>
          </div>

          <nav aria-label="Documentación">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">
              Documentación
            </p>
            <ul className="space-y-2">
              {DOC_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Recursos">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">
              Recursos
            </p>
            <ul className="space-y-2">
              {RESOURCE_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Legal y políticas">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">
              Producción
            </p>
            <ul className="space-y-2">
              {LEGAL_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} tauri-plugin-ad2mob contributors</p>
          <p className="max-w-xl leading-relaxed sm:text-right">
            Proyecto comunitario independiente. No afiliado a, ni avalado por
            Google LLC ni por el Tauri Programme within The Commons Conservancy.
          </p>
        </div>
      </div>
    </footer>
  )
}
