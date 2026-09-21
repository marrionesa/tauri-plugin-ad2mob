/**
 * Lightweight, dependency-free syntax highlighter for the docs.
 * Produces typed tokens that `CodeBlock` renders as styled spans.
 */

export type Lang = "ts" | "rust" | "bash" | "json" | "xml" | "toml"

export type TokenType =
  | "keyword"
  | "string"
  | "comment"
  | "number"
  | "type"
  | "function"
  | "property"
  | "punct"
  | "command"
  | "plain"

export interface Token {
  type: TokenType
  value: string
}

interface Rule {
  type: TokenType
  re: RegExp // sticky
}

const TS_KEYWORDS =
  "import|export|from|const|let|var|await|async|function|return|if|else|new|type|interface|extends|implements|true|false|null|undefined|void|boolean|string|number|as|of|for|while|class|enum|this|try|catch|finally|throw|switch|case|break|continue|readonly|default|declare|namespace"

const RUST_KEYWORDS =
  "fn|let|mut|pub|use|struct|impl|enum|match|if|else|await|async|return|self|Self|crate|mod|true|false|as|dyn|move|ref|where|for|in|loop|while|trait|const|unsafe|extern"

const RUST_TYPES =
  "u8|u16|u32|u64|u128|usize|i8|i16|i32|i64|i128|isize|f32|f64|bool|str|String|Vec|Option|Result|Ok|Err|Some|None|Box|Arc|Mutex|RwLock"

function rule(type: TokenType, re: RegExp): Rule {
  return { type, re: new RegExp(re.source, "y") }
}

function tsRules(): Rule[] {
  return [
    rule("comment", /\/\/[^\n]*/),
    rule("comment", /\/\*[\s\S]*?\*\//),
    rule("string", /"(?:[^"\\\n]|\\.)*"/),
    rule("string", /'(?:[^'\\\n]|\\.)*'/),
    rule("string", /`(?:[^`\\]|\\.)*`/),
    rule("keyword", new RegExp(`\\b(?:${TS_KEYWORDS})\\b`)),
    rule("number", /\b(?:0[xX][0-9a-fA-F]+|\d+(?:\.\d+)?)\b/),
    rule("function", /[A-Za-z_$][\w$]*(?=\s*\()/),
    rule("type", /[A-Z][\w$]*/),
    rule("punct", /[{}()[\].,;:=<>+\-*/!?&|]+/),
  ]
}

function rustRules(): Rule[] {
  return [
    rule("comment", /\/\/[^\n]*/),
    rule("comment", /\/\*[\s\S]*?\*\//),
    rule("comment", /#!?\[[^\]\n]*\]/),
    rule("function", /[a-z_]\w*!/),
    rule("type", /'[a-z_]\w*/),
    rule("string", /"(?:[^"\\\n]|\\.)*"/),
    rule("keyword", new RegExp(`\\b(?:${RUST_KEYWORDS})\\b`)),
    rule("type", new RegExp(`\\b(?:${RUST_TYPES})\\b`)),
    rule("type", /[A-Z][\w$]*/),
    rule("number", /\b(?:0[xX][0-9a-fA-F_]+|\d[\d_]*(?:\.\d+)?)\b/),
    rule("function", /[A-Za-z_]\w*(?=\s*\()/),
    rule("punct", /[{}()[\].,;:=<>+\-*/!?&|#]+/),
  ]
}

function bashRules(): Rule[] {
  return [
    rule("comment", /#[^\n]*/),
    rule("string", /"(?:[^"\\\n]|\\.)*"/),
    rule("string", /'(?:[^'\\\n]|\\.)*'/),
    rule("command", /\b(?:npm|pnpm|bun|yarn|cargo|rustup|tauri)\b/),
    rule("keyword", /\b(?:add|install|run|init|android|ios|dev|build)\b/),
    rule("plain", /--?[\w][\w-]*/),
    rule("number", /\b\d+(?:\.\d+)?\b/),
  ]
}

function jsonRules(): Rule[] {
  return [
    rule("property", /"(?:[^"\\]|\\.)*"(?=\s*:)/),
    rule("string", /"(?:[^"\\]|\\.)*"/),
    rule("keyword", /\b(?:true|false|null)\b/),
    rule("number", /-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/),
    rule("punct", /[{}[\],:]/),
  ]
}

function xmlRules(): Rule[] {
  return [
    rule("comment", /<!--[\s\S]*?-->/),
    rule("keyword", /<\/?[A-Za-z][\w:.-]*/),
    rule("keyword", /\/?>/),
    rule("property", /[A-Za-z_][\w:.-]*(?=\s*=)/),
    rule("string", /"(?:[^"\\\n]|\\.)*"/),
  ]
}

function tomlRules(): Rule[] {
  return [
    rule("comment", /#[^\n]*/),
    rule("type", /\[[^\]\n]+\]/),
    rule("property", /[A-Za-z_][\w.-]*(?=\s*=)/),
    rule("string", /"(?:[^"\\\n]|\\.)*"/),
    rule("keyword", /\b(?:true|false)\b/),
    rule("number", /\b\d+(?:\.\d+)?\b/),
    rule("punct", /[=,{}]/),
  ]
}

const RULES: Record<Lang, Rule[]> = {
  ts: tsRules(),
  rust: rustRules(),
  bash: bashRules(),
  json: jsonRules(),
  xml: xmlRules(),
  toml: tomlRules(),
}

export function tokenize(code: string, lang: Lang): Token[] {
  const rules = RULES[lang] ?? RULES.ts
  const tokens: Token[] = []
  let i = 0

  const push = (type: TokenType, value: string) => {
    const last = tokens[tokens.length - 1]
    if (last && last.type === type) {
      last.value += value
    } else {
      tokens.push({ type, value })
    }
  }

  while (i < code.length) {
    let matched = false
    for (const { type, re } of rules) {
      re.lastIndex = i
      const m = re.exec(code)
      if (m && m.index === i && m[0].length > 0) {
        push(type, m[0])
        i += m[0].length
        matched = true
        break
      }
    }
    if (!matched) {
      push("plain", code[i])
      i += 1
    }
  }

  return tokens
}

export const TOKEN_CLASS: Record<TokenType, string> = {
  keyword: "text-zinc-50 font-medium",
  string: "text-emerald-300/90",
  comment: "text-zinc-500 italic",
  number: "text-orange-300",
  type: "text-amber-200/90",
  function: "text-amber-300",
  property: "text-orange-200/80",
  punct: "text-zinc-500",
  command: "text-amber-300 font-medium",
  plain: "text-zinc-300",
}

export const LANG_LABEL: Record<Lang, string> = {
  ts: "TypeScript",
  rust: "Rust",
  bash: "Terminal",
  json: "JSON",
  xml: "XML",
  toml: "TOML",
}
