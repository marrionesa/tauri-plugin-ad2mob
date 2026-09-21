export interface NavItem {
  id: string
  label: string
  children?: { id: string; label: string }[]
}

export interface NavGroup {
  title: string
  items: NavItem[]
}

export const NAV_GROUPS: NavGroup[] = [
  {
    title: "Introducción",
    items: [
      { id: "caracteristicas", label: "Características" },
      {
        id: "instalacion",
        label: "Instalación",
        children: [
          { id: "instalacion-rust", label: "Registrar el plugin" },
          { id: "instalacion-capability", label: "Capabilities" },
          { id: "instalacion-android", label: "Android" },
          { id: "instalacion-ios", label: "iOS" },
        ],
      },
      { id: "inicio-rapido", label: "Inicio rápido" },
    ],
  },
  {
    title: "Privacidad",
    items: [
      { id: "consentimiento", label: "Consentimiento (UMP)" },
      { id: "att", label: "App Tracking Transparency" },
    ],
  },
  {
    title: "Anuncios",
    items: [
      { id: "banner", label: "Banner nativo" },
      { id: "intersticial", label: "Intersticial" },
      { id: "rewarded", label: "Rewarded" },
    ],
  },
  {
    title: "Referencia",
    items: [
      { id: "api", label: "API pública" },
      { id: "eventos", label: "Eventos" },
      { id: "tipos", label: "Tipos" },
      { id: "errores", label: "Errores" },
    ],
  },
  {
    title: "Producción",
    items: [
      { id: "pruebas", label: "Pruebas y anuncios de test" },
      { id: "escritorio", label: "Comportamiento en escritorio" },
      { id: "faq", label: "Solución de problemas" },
      { id: "limitaciones", label: "Limitaciones conocidas" },
    ],
  },
]

export const HEADER_LINKS: { id: string; label: string }[] = [
  { id: "caracteristicas", label: "Características" },
  { id: "instalacion", label: "Instalación" },
  { id: "banner", label: "Anuncios" },
  { id: "api", label: "API" },
  { id: "eventos", label: "Eventos" },
  { id: "faq", label: "FAQ" },
]

export const ALL_SECTION_IDS = NAV_GROUPS.flatMap((g) =>
  g.items.flatMap((item) => [item.id, ...(item.children?.map((c) => c.id) ?? [])]),
)
