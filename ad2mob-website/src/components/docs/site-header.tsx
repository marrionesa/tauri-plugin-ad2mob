"use client"

import { useState } from "react"
import { Menu, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { HEADER_LINKS } from "@/lib/doc-nav"
import { cn } from "@/lib/utils"

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-7 shrink-0", className)} aria-hidden>
      <defs>
        <linearGradient id="logo-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f59e0b" />
          <stop offset="1" stopColor="#ea580c" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#logo-gradient)" />
      <rect
        x="9.5"
        y="6"
        width="13"
        height="20"
        rx="2.5"
        fill="none"
        stroke="white"
        strokeWidth="1.8"
      />
      <rect x="11.8" y="20" width="8.4" height="3.6" rx="1" fill="white" />
      <rect x="11.8" y="9.5" width="8.4" height="1.6" rx="0.8" fill="white" opacity="0.55" />
      <rect x="11.8" y="13" width="5.4" height="1.6" rx="0.8" fill="white" opacity="0.35" />
    </svg>
  )
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Cambiar tema"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="text-muted-foreground transition-colors hover:text-foreground"
    >
      {/* Ambos iconos se alternan por CSS: sin estado de montaje ni mismatch de hidratación */}
      <Sun className="hidden size-4.5 dark:block" />
      <Moon className="size-4.5 dark:hidden" />
    </Button>
  )
}

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <a
          href="#inicio"
          className="flex min-w-0 items-center gap-2.5 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-500"
        >
          <LogoMark />
          <span className="truncate font-mono text-sm font-semibold tracking-tight text-foreground">
            tauri-plugin-ad2mob
          </span>
          <span className="hidden rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 font-mono text-[11px] font-medium text-amber-700 dark:text-amber-400 sm:inline">
            v0.2.0
          </span>
        </a>

        <nav
          aria-label="Secciones principales"
          className="ml-auto hidden items-center gap-1 md:flex"
        >
          {HEADER_LINKS.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1 md:ml-2">
          <a
            href="https://github.com/marrionesa/tauri-plugin-ad2mob"
            target="_blank"
            rel="noreferrer noopener"
            aria-label="Repositorio en GitHub"
            className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <svg viewBox="0 0 24 24" className="size-4.5" fill="currentColor" aria-hidden>
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.523 2 12 2Z" />
            </svg>
          </a>
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setOpen((value) => !value)}
          >
            <Menu className="size-4.5" />
          </Button>
        </div>
      </div>

      {open ? (
        <nav
          id="mobile-nav"
          aria-label="Navegación móvil"
          className="border-t border-border/60 bg-background/95 px-4 py-3 backdrop-blur md:hidden"
        >
          <ul className="grid grid-cols-2 gap-1">
            {HEADER_LINKS.map((link) => (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  )
}
