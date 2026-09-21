import type { ReactNode } from "react"
import { Info, Lightbulb, TriangleAlert } from "lucide-react"
import { cn } from "@/lib/utils"

/* ------------------------------------------------------------------ */
/* Section                                                             */
/* ------------------------------------------------------------------ */

interface SectionProps {
  id: string
  eyebrow?: string
  title: string
  lead?: ReactNode
  children: ReactNode
  className?: string
}

export function Section({ id, eyebrow, title, lead, children, className }: SectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cn("py-10 sm:py-14", className)}>
      <div className="mb-6 sm:mb-8">
        {eyebrow ? (
          <p className="mb-2 font-mono text-xs font-medium uppercase tracking-[0.18em] text-amber-600 dark:text-amber-400">
            {eyebrow}
          </p>
        ) : null}
        <h2
          id={`${id}-title`}
          className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
        >
          {title}
        </h2>
        {lead ? (
          <div className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
            {lead}
          </div>
        ) : null}
      </div>
      <div className="space-y-6">{children}</div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* SubSection                                                          */
/* ------------------------------------------------------------------ */

interface SubSectionProps {
  id?: string
  title: string
  children: ReactNode
  className?: string
}

export function SubSection({ id, title, children, className }: SubSectionProps) {
  return (
    <div id={id} className={cn("group/sub scroll-mt-24", className)}>
      <h3 className="mb-3 text-lg font-semibold tracking-tight text-foreground">
        <a
          href={id ? `#${id}` : undefined}
          className={cn(
            "inline-flex items-baseline gap-2 transition-colors",
            id && "hover:text-amber-600 dark:hover:text-amber-400",
          )}
        >
          {title}
          {id ? (
            <span
              aria-hidden
              className="font-mono text-sm text-muted-foreground/0 transition-colors group-hover/sub:text-muted-foreground/70"
            >
              #
            </span>
          ) : null}
        </a>
      </h3>
      {children}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Callout                                                             */
/* ------------------------------------------------------------------ */

type CalloutVariant = "info" | "warn" | "tip"

const CALLOUT_STYLES: Record<
  CalloutVariant,
  { icon: typeof Info; box: string; title: string }
> = {
  info: {
    icon: Info,
    box: "border-zinc-300/70 bg-zinc-500/[0.04] dark:border-zinc-700",
    title: "text-foreground",
  },
  warn: {
    icon: TriangleAlert,
    box: "border-amber-400/70 bg-amber-500/[0.06] dark:border-amber-500/40",
    title: "text-amber-700 dark:text-amber-400",
  },
  tip: {
    icon: Lightbulb,
    box: "border-emerald-400/60 bg-emerald-500/[0.05] dark:border-emerald-500/30",
    title: "text-emerald-700 dark:text-emerald-400",
  },
}

interface CalloutProps {
  variant?: CalloutVariant
  title?: string
  children: ReactNode
}

export function Callout({ variant = "info", title, children }: CalloutProps) {
  const { icon: Icon, box, title: titleClass } = CALLOUT_STYLES[variant]
  return (
    <div className={cn("rounded-lg border-l-2 px-4 py-3.5", box)}>
      <div className="flex gap-3">
        <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
        <div className="min-w-0 space-y-1 text-sm leading-relaxed">
          {title ? <p className={cn("font-semibold", titleClass)}>{title}</p> : null}
          <div className="text-muted-foreground [&_code]:after:content-['']">{children}</div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Inline code                                                         */
/* ------------------------------------------------------------------ */

export function Code({ children }: { children: ReactNode }) {
  return (
    <code className="rounded-md border border-border/70 bg-muted px-1.5 py-0.5 font-mono text-[0.82em] font-medium text-foreground">
      {children}
    </code>
  )
}

/* ------------------------------------------------------------------ */
/* ParamTable                                                          */
/* ------------------------------------------------------------------ */

export interface ParamRow {
  name: string
  type: string
  required?: boolean
  desc: ReactNode
}

export function ParamTable({ rows }: { rows: ParamRow[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full min-w-[480px] text-left text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-2.5 font-medium text-muted-foreground">Parámetro</th>
            <th className="px-4 py-2.5 font-medium text-muted-foreground">Tipo</th>
            <th className="px-4 py-2.5 font-medium text-muted-foreground">Descripción</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((row) => (
            <tr key={row.name} className="align-top">
              <td className="whitespace-nowrap px-4 py-3 font-mono text-[13px] font-medium text-foreground">
                {row.name}
                {row.required ? (
                  <span className="ml-1.5 align-middle font-sans text-[10px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    requerido
                  </span>
                ) : null}
              </td>
              <td className="whitespace-nowrap px-4 py-3 font-mono text-[12px] text-muted-foreground">
                {row.type}
              </td>
              <td className="px-4 py-3 leading-relaxed text-muted-foreground">{row.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* DataTable (genérica)                                                */
/* ------------------------------------------------------------------ */

interface DataTableProps {
  headers: string[]
  rows: ReactNode[][]
  minWidth?: string
}

export function DataTable({ headers, rows, minWidth = "560px" }: DataTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full text-left text-sm" style={{ minWidth }}>
        <thead>
          <tr className="border-b bg-muted/50">
            {headers.map((header) => (
              <th key={header} className="px-4 py-2.5 font-medium text-muted-foreground">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((row, index) => (
            <tr key={index} className="align-top transition-colors hover:bg-muted/30">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-4 py-3 leading-relaxed">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Step                                                                */
/* ------------------------------------------------------------------ */

interface StepProps {
  step: number
  title: string
  children: ReactNode
}

export function Step({ step, title, children }: StepProps) {
  return (
    <div className="relative pl-10 sm:pl-12">
      <div className="absolute left-0 top-0 flex size-8 items-center justify-center rounded-full border border-amber-500/40 bg-amber-500/10 font-mono text-sm font-semibold text-amber-700 dark:text-amber-400">
        {step}
      </div>
      {Number(step) < 4 ? (
        <div
          aria-hidden
          className="absolute left-4 top-9 bottom-0 hidden w-px bg-gradient-to-b from-amber-500/40 to-transparent sm:block"
        />
      ) : null}
      <div className="space-y-4 pb-8">
        <h3 className="pt-1 text-base font-semibold tracking-tight text-foreground">{title}</h3>
        <div className="space-y-4">{children}</div>
      </div>
    </div>
  )
}
