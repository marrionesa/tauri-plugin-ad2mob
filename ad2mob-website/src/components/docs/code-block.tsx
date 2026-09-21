"use client"

import { useCallback, useState } from "react"
import { Check, Copy } from "lucide-react"
import { LANG_LABEL, TOKEN_CLASS, tokenize, type Lang } from "./highlight"
import { cn } from "@/lib/utils"

export type { Lang } from "./highlight"

interface CodeBlockProps {
  code: string
  lang: Lang
  title?: string
  className?: string
  dense?: boolean
}

function copyFallback(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const textarea = document.createElement("textarea")
      textarea.value = text
      textarea.style.position = "fixed"
      textarea.style.opacity = "0"
      document.body.appendChild(textarea)
      textarea.select()
      const ok = document.execCommand("copy")
      document.body.removeChild(textarea)
      if (ok) resolve()
      else reject(new Error("copy failed"))
    } catch (error) {
      reject(error instanceof Error ? error : new Error("copy failed"))
    }
  })
}

export function CodeBlock({ code, lang, title, className, dense = false }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const tokens = tokenize(code.trim(), lang)

  const onCopy = useCallback(async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(code.trim())
      } else {
        await copyFallback(code.trim())
      }
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // silencioso: el usuario puede copiar manualmente
    }
  }, [code])

  return (
    <figure
      className={cn(
        "group/code overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-sm",
        className,
      )}
    >
      <figcaption className="flex items-center justify-between gap-3 border-b border-zinc-800/80 px-4 py-2.5">
        <span className="flex min-w-0 items-center gap-2.5 font-mono text-xs text-zinc-400">
          <span className="size-2 shrink-0 rounded-full bg-amber-400/80" aria-hidden />
          <span className="truncate">{title ?? LANG_LABEL[lang]}</span>
        </span>
        <button
          type="button"
          onClick={onCopy}
          aria-label={copied ? "Copiado" : "Copiar código"}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md border border-transparent px-2 py-1",
            "text-xs text-zinc-400 transition-colors hover:border-zinc-700 hover:bg-zinc-900 hover:text-zinc-200",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500",
          )}
        >
          {copied ? (
            <Check className="size-3.5 text-emerald-400" aria-hidden />
          ) : (
            <Copy className="size-3.5" aria-hidden />
          )}
          <span className="hidden sm:inline">{copied ? "Copiado" : "Copiar"}</span>
        </button>
      </figcaption>
      <div className={cn("overflow-x-auto", dense ? "p-3" : "p-4")}>
        <pre
          className={cn(
            "font-mono leading-relaxed text-zinc-300",
            dense ? "text-[12px]" : "text-[13px]",
          )}
        >
          <code>
            {tokens.map((token, index) => (
              <span key={index} className={TOKEN_CLASS[token.type]}>
                {token.value}
              </span>
            ))}
          </code>
        </pre>
      </div>
    </figure>
  )
}
