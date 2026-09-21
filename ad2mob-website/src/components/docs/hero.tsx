import { ArrowRight, BookOpen, Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CodeBlock } from "./code-block"
import { LogoMark } from "./site-header"

const INSTALL_SNIPPET = `npm add tauri-plugin-ad2mob
cargo add tauri-plugin-ad2mob`

function EventChip({
  event,
  payload,
  className,
}: {
  event: string
  payload: string
  className?: string
}) {
  return (
    <div
      className={`absolute z-10 hidden rounded-xl border border-border/80 bg-background/85 px-3.5 py-2.5 shadow-lg shadow-black/[0.06] backdrop-blur-sm md:block ${className ?? ""}`}
    >
      <p className="font-mono text-[11px] font-medium text-amber-600 dark:text-amber-400">
        {event}
      </p>
      <p className="mt-0.5 font-mono text-[10.5px] text-muted-foreground">{payload}</p>
    </div>
  )
}

function PhoneMockup() {
  return (
    <div className="relative mx-auto w-[270px] sm:w-[300px]">
      <div className="rounded-[2.4rem] border border-zinc-300/80 bg-zinc-200/60 p-2 shadow-2xl shadow-zinc-400/25 dark:border-zinc-700/80 dark:bg-zinc-800/60 dark:shadow-black/50">
        <div className="relative h-[540px] overflow-hidden rounded-[2rem] bg-white dark:bg-zinc-950">
          {/* Status bar */}
          <div className="flex items-center justify-between px-6 pt-3.5">
            <span className="text-[10px] font-semibold text-zinc-500">9:41</span>
            <div className="absolute left-1/2 top-2 h-5 w-20 -translate-x-1/2 rounded-full bg-zinc-900 dark:bg-black" />
            <span className="flex items-center gap-1 text-[10px] text-zinc-500" aria-hidden>
              <span className="size-2 rounded-full bg-zinc-400" />
              <span className="size-2 rounded-full bg-zinc-400" />
              <span className="size-2 rounded-full bg-zinc-300" />
            </span>
          </div>

          {/* App bar */}
          <div className="mt-3 flex items-center gap-2.5 border-b border-zinc-100 px-4 pb-3 dark:border-zinc-800/80">
            <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-600">
              <LogoMark className="size-5" />
            </div>
            <div>
              <p className="text-[13px] font-semibold leading-tight text-foreground">Mi App</p>
              <p className="text-[10px] leading-tight text-muted-foreground">
                Tauri v2 · Android / iOS
              </p>
            </div>
          </div>

          {/* Skeleton content */}
          <div className="space-y-3 px-4 pt-4">
            <div className="h-20 rounded-xl bg-zinc-100 dark:bg-zinc-900" />
            <div className="rounded-xl bg-zinc-100 p-3.5 dark:bg-zinc-900">
              <div className="h-2.5 w-3/4 rounded-full bg-zinc-200 dark:bg-zinc-800" />
              <div className="mt-2 h-2.5 w-1/2 rounded-full bg-zinc-200/70 dark:bg-zinc-800/70" />
              <div className="mt-3.5 h-7 w-24 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
            </div>
            <div className="h-20 rounded-xl bg-zinc-100 dark:bg-zinc-900" />
            <div className="h-2.5 w-2/3 rounded-full bg-zinc-100 dark:bg-zinc-900" />
            <div className="h-2.5 w-5/6 rounded-full bg-zinc-100 dark:bg-zinc-900" />
          </div>

          {/* Native banner overlay */}
          <div className="absolute inset-x-0 bottom-0 flex h-14 items-center gap-3 border-t border-zinc-800 bg-zinc-900 px-3.5 dark:bg-zinc-900">
            <span className="rounded bg-amber-400 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-zinc-950">
              Anuncio
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-medium text-zinc-100">
                Banner nativo de AdMob
              </p>
              <p className="truncate font-mono text-[9px] text-zinc-500">
                AdView / GADBannerView · adaptive
              </p>
            </div>
            <span className="rounded-md border border-zinc-700 px-2 py-0.5 font-mono text-[9px] text-zinc-400">
              320×50
            </span>
          </div>
        </div>
      </div>

      <p className="mt-4 text-center font-mono text-[11px] text-muted-foreground">
        Banner nativo sobre el WebView — nunca dentro del DOM
      </p>
    </div>
  )
}

const STATS = [
  { value: "23", label: "métodos" },
  { value: "22", label: "eventos" },
  { value: "9", label: "códigos de error" },
  { value: "2", label: "plataformas" },
]

export function Hero() {
  return (
    <div id="inicio" className="relative overflow-hidden border-b border-border/60">
      {/* Fondo decorativo */}
      <div className="hero-dots pointer-events-none absolute inset-0" aria-hidden />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 right-[-10%] size-[480px] rounded-full bg-amber-400/15 blur-3xl dark:bg-amber-500/10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent"
      />

      <div className="relative mx-auto grid w-full max-w-[1440px] gap-14 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-10 lg:px-8">
        <div className="max-w-2xl">
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-400">
              <span className="size-1.5 rounded-full bg-amber-500" aria-hidden />
              Tauri v2 · Android &amp; iOS
            </span>
            <span className="rounded-full border border-border bg-background px-3 py-1 font-mono text-xs text-muted-foreground">
              v0.1.0
            </span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-[3.4rem] lg:leading-[1.08]">
            Google AdMob para tus apps{" "}
            <span className="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
              Tauri v2
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Banners nativos fuera del WebView, intersticiales, rewarded, flujo de
            consentimiento Google UMP y App Tracking Transparency de iOS — todo
            detrás de una única API de TypeScript fuertemente tipada con errores
            y eventos estructurados.
          </p>

          <div className="mt-7 max-w-md">
            <CodeBlock code={INSTALL_SNIPPET} lang="bash" title="Instalación" dense />
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Button
              asChild
              className="gap-2 bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              <a href="#instalacion">
                Empezar ahora
                <ArrowRight className="size-4" aria-hidden />
              </a>
            </Button>
            <Button asChild variant="outline" className="gap-2">
              <a href="#api">
                <BookOpen className="size-4" aria-hidden />
                Referencia de la API
              </a>
            </Button>
            <Button asChild variant="ghost" size="icon" aria-label="GitHub del proyecto">
              <a href="https://github.com/marrionesa/tauri-plugin-ad2mob" target="_blank" rel="noreferrer noopener">
                <Github className="size-4.5" aria-hidden />
              </a>
            </Button>
          </div>

          <dl className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3">
            {STATS.map((stat) => (
              <div key={stat.label} className="flex items-baseline gap-1.5">
                <dt className="sr-only">{stat.label}</dt>
                <dd className="font-mono text-xl font-semibold text-foreground">{stat.value}</dd>
                <dd className="text-sm text-muted-foreground">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative">
          <EventChip
            event="admob://banner-loaded"
            payload="{ adUnitId: 'ca-app-pub-…' }"
            className="-right-2 top-6 -rotate-2 lg:right-0"
          />
          <EventChip
            event="admob://rewarded-earned"
            payload="{ amount: 1, type: 'coin' }"
            className="-left-4 bottom-24 rotate-2 lg:-left-8"
          />
          <EventChip
            event="admob://consent-changed"
            payload="{ status: 'obtained' }"
            className="-right-3 bottom-56 rotate-1 lg:right-2"
          />
          <PhoneMockup />
        </div>
      </div>
    </div>
  )
}
