"use client"

import { useEffect, useMemo, useState } from "react"
import { ALL_SECTION_IDS, NAV_GROUPS } from "@/lib/doc-nav"
import { cn } from "@/lib/utils"

function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string>("")

  const key = useMemo(() => ids.join(","), [ids])

  useEffect(() => {
    const elements = key
      .split(",")
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)

    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id)
          }
        }
      },
      { rootMargin: "-15% 0px -75% 0px", threshold: 0 },
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [key])

  return active
}

export function DocSidebar() {
  const active = useActiveSection(ALL_SECTION_IDS)

  return (
    <nav
      aria-label="Índice de la documentación"
      className="sticky top-16 hidden h-fit w-60 shrink-0 self-start lg:block"
    >
      <div className="thin-scroll max-h-[calc(100dvh-4rem)] overflow-y-auto pb-10 pr-6 pt-10">
        <ul className="space-y-7">
          {NAV_GROUPS.map((group) => (
            <li key={group.title}>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">
                {group.title}
              </p>
              <ul className="space-y-0.5 border-l-2 border-border/70">
                {group.items.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      aria-current={active === item.id ? "true" : undefined}
                      className={cn(
                        "-ml-0.5 block border-l-2 py-1 pl-4 text-sm transition-colors",
                        active === item.id
                          ? "border-amber-500 font-medium text-foreground"
                          : "border-transparent text-muted-foreground hover:border-zinc-300 hover:text-foreground dark:hover:border-zinc-600",
                      )}
                    >
                      {item.label}
                    </a>
                    {item.children ? (
                      <ul className="space-y-0.5">
                        {item.children.map((child) => (
                          <li key={child.id}>
                            <a
                              href={`#${child.id}`}
                              aria-current={active === child.id ? "true" : undefined}
                              className={cn(
                                "-ml-0.5 block border-l-2 py-1 pl-7 text-[13px] transition-colors",
                                active === child.id
                                  ? "border-amber-500 font-medium text-foreground"
                                  : "border-transparent text-muted-foreground/80 hover:text-foreground",
                              )}
                            >
                              {child.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
