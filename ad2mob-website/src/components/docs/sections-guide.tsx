import type { LucideIcon } from "lucide-react"
import {
  Activity,
  Braces,
  Layers,
  Monitor,
  ShieldCheck,
  Smartphone,
} from "lucide-react"
import { CodeBlock } from "./code-block"
import { Callout, Code, DataTable, Section, SubSection } from "./primitives"

/* ------------------------------------------------------------------ */
/* Características                                                     */
/* ------------------------------------------------------------------ */

interface Feature {
  icon: LucideIcon
  title: string
  desc: string
}

const FEATURES: Feature[] = [
  {
    icon: Smartphone,
    title: "Banners nativos",
    desc: "AdView / GADBannerView reales colocados sobre el borde del WebView — jamás renderizados en el DOM. Conscientes de safe areas: status bar, navigation bar y home indicator.",
  },
  {
    icon: Layers,
    title: "Intersticiales y rewarded",
    desc: "Máquinas de estado explícitas load → ready → show → closed con consultas is*Ready() y destroy explícito. La recompensa llega del callback real del SDK, nunca sintetizada.",
  },
  {
    icon: ShieldCheck,
    title: "Privacidad primero",
    desc: "Flujo de consentimiento Google UMP y ATT de iOS integrados. Las peticiones de anuncios se rechazan con CONSENT_REQUIRED mientras el estado UMP sea «required».",
  },
  {
    icon: Braces,
    title: "API fuertemente tipada",
    desc: "AdMobError con códigos estables, mapa de eventos tipado y tipos que reflejan uno a uno los modelos de Rust. TypeScript estricto de punta a punta.",
  },
  {
    icon: Activity,
    title: "22 eventos estructurados",
    desc: "Cada callback del SDK se reenvía como evento namespaced admob://* con payload tipado. AdMob.on() elige automáticamente el canal correcto en móvil y escritorio.",
  },
  {
    icon: Monitor,
    title: "Seguro en escritorio",
    desc: "El crate compila para Windows, macOS y Linux; toda operación móvil devuelve un UNSUPPORTED_PLATFORM controlado. Tu build de escritorio no cambia.",
  },
]

export function FeaturesSection() {
  return (
    <Section
      id="caracteristicas"
      eyebrow="Introducción"
      title="Características"
      lead={
        <>
          Un plugin comunitario independiente que une Google Mobile Ads, Google
          UMP y ATT de iOS en una sola superficie coherente para <Code>Tauri v2</Code>.
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => (
          <article
            key={feature.title}
            className="group rounded-xl border bg-card p-5 transition-all hover:border-amber-500/40 hover:shadow-md hover:shadow-amber-500/[0.04]"
          >
            <div className="mb-3 flex size-9 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-600 transition-colors dark:text-amber-400">
              <feature.icon className="size-4.5" aria-hidden />
            </div>
            <h3 className="mb-1.5 text-[15px] font-semibold tracking-tight">{feature.title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{feature.desc}</p>
          </article>
        ))}
      </div>
    </Section>
  )
}

/* ------------------------------------------------------------------ */
/* Instalación                                                         */
/* ------------------------------------------------------------------ */

const RUST_MAIN = `fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_ad2mob::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}`

const RUST_CONFIG = `.plugin(tauri_plugin_ad2mob::init_with_config(serde_json::json!({
    "isTesting": true,
    "initializeOnStartup": true,
})))`

const CAPABILITY = `{
  "permissions": [
    "ad2mob:default"
  ]
}`

const ANDROID_MANIFEST = `<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY" />`

const IOS_PLIST = `<key>GADApplicationIdentifier</key>
<string>ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY</string>
<key>NSUserTrackingUsageDescription</key>
<string>Your data will be used to show you more relevant ads.</string>`

export function InstallationSection() {
  return (
    <Section
      id="instalacion"
      eyebrow="Introducción"
      title="Instalación"
      lead={
        <>
          Cuatro pasos: instalar los paquetes, registrar el plugin en Rust,
          conceder la capability y configurar los <Code>App ID</Code> de cada
          plataforma. Todo lo demás (SDKs nativos, keep-rules de R8, SPM de iOS)
          se resuelve automáticamente.
        </>
      }
    >
      <div className="relative space-y-2">
        <Step1 />
        <Step2 />
        <Step3 />
        <Step4 />
      </div>
    </Section>
  )
}

function Step1() {
  return (
    <div className="relative pb-8 sm:pl-12">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex size-8 items-center justify-center rounded-full border border-amber-500/40 bg-amber-500/10 font-mono text-sm font-semibold text-amber-700 dark:text-amber-400">
          1
        </div>
        <h3 className="text-base font-semibold tracking-tight">Instala los paquetes</h3>
      </div>
      <div className="space-y-4">
        <CodeBlock
          lang="bash"
          title="Terminal"
          code={`npm add tauri-plugin-ad2mob\n# también disponible en: pnpm · bun · yarn\ncargo add tauri-plugin-ad2mob`}
        />
        <Callout variant="tip" title="Peer dependency">
          El paquete de TypeScript depende de <Code>@tauri-apps/api ^2.0.0</Code>,
          que ya tendrás instalado en cualquier proyecto Tauri v2.
        </Callout>
      </div>
    </div>
  )
}

function Step2() {
  return (
    <div id="instalacion-rust" className="relative scroll-mt-24 pb-8 sm:pl-12">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex size-8 items-center justify-center rounded-full border border-amber-500/40 bg-amber-500/10 font-mono text-sm font-semibold text-amber-700 dark:text-amber-400">
          2
        </div>
        <h3 className="text-base font-semibold tracking-tight">Registra el plugin en Rust</h3>
      </div>
      <div className="space-y-4">
        <CodeBlock lang="rust" title="src-tauri/src/lib.rs" code={RUST_MAIN} />
        <p className="text-sm leading-relaxed text-muted-foreground">
          Opcionalmente puedes inicializar en el arranque con configuración
          inline — equivalente a la sección <Code>plugins &gt; admob</Code> de{" "}
          <Code>tauri.conf.json</Code>:
        </p>
        <CodeBlock lang="rust" title="Configuración inline" code={RUST_CONFIG} dense />
      </div>
    </div>
  )
}

function Step3() {
  return (
    <div id="instalacion-capability" className="relative scroll-mt-24 pb-8 sm:pl-12">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex size-8 items-center justify-center rounded-full border border-amber-500/40 bg-amber-500/10 font-mono text-sm font-semibold text-amber-700 dark:text-amber-400">
          3
        </div>
        <h3 className="text-base font-semibold tracking-tight">Concede la capability</h3>
      </div>
      <div className="space-y-4">
        <CodeBlock
          lang="json"
          title="src-tauri/capabilities/default.json"
          code={CAPABILITY}
        />
        <Callout title="¿Por qué un único permiso?">
          <Code>ad2mob:default</Code> habilita todos los comandos, incluidos los
          listeners de eventos que usa <Code>AdMob.on()</Code>. Los anuncios no
          son una superficie sensible: el plugin nunca expone sistema de
          archivos, red ni capacidades del dispositivo al WebView.
        </Callout>
      </div>
    </div>
  )
}

function Step4() {
  return (
    <div className="relative sm:pl-12">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex size-8 items-center justify-center rounded-full border border-amber-500/40 bg-amber-500/10 font-mono text-sm font-semibold text-amber-700 dark:text-amber-400">
          4
        </div>
        <h3 className="text-base font-semibold tracking-tight">
          Configura los App ID por plataforma
        </h3>
      </div>
      <div className="space-y-4">
        <SubSection id="instalacion-android" title="Android">
          <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
            Añade el <Code>meta-data</Code> del App ID dentro de{" "}
            <Code>&lt;application&gt;</Code> en{" "}
            <Code>gen/android/app/src/main/AndroidManifest.xml</Code> (crea el
            proyecto Android con <Code>tauri android init</Code>). El plugin
            valida el App ID en runtime y falla con{" "}
            <Code>INVALID_CONFIGURATION</Code> si falta.
          </p>
          <CodeBlock lang="xml" title="AndroidManifest.xml" code={ANDROID_MANIFEST} />
          <Callout variant="warn" title="Desarrollo">
            Usa el App ID de pruebas de Google{" "}
            <Code>ca-app-pub-3940256099942544~3347511713</Code> mientras
            desarrollas. Los SDK de Google Mobile Ads (24.x) y UMP (3.x) se
            enlazan automáticamente desde el módulo Gradle del plugin.
          </Callout>
        </SubSection>

        <SubSection id="instalacion-ios" title="iOS">
          <Callout variant="warn" title="⚠️ iOS — en desarrollo activo">
            Las instrucciones siguientes describen la integración final y son
            correctas, pero iOS todavía no está disponible: su job de CI
            permanece temporalmente muteado mientras se resuelve un problema
            de empaquetado SwiftPM.
          </Callout>
          <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
            Añade estas claves al <Code>Info.plist</Code> (vía{" "}
            <Code>gen/apple</Code> o Xcode). Los frameworks GoogleMobileAds 13.x
            y UMP 3.x se resuelven con Swift Package Manager desde{" "}
            <Code>ios/Package.swift</Code> al generar el proyecto Xcode.
          </p>
          <CodeBlock lang="xml" title="Info.plist" code={IOS_PLIST} />
          <Callout variant="warn" title="Desarrollo">
            App ID de pruebas de Google para iOS:{" "}
            <Code>ca-app-pub-3940256099942544~1458002511</Code>. Para publicar en
            el App Store recuerda además declarar ATT y los identificadores de
            publicidad en tus respuestas de App Privacy, y añadir los{" "}
            <Code>SKAdNetworkItems</Code> de Google.
          </Callout>
        </SubSection>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Inicio rápido                                                       */
/* ------------------------------------------------------------------ */

const QUICKSTART = `import { AdMob } from "tauri-plugin-ad2mob"

// 1. Detecta soporte e inicializa (idempotente)
if (await AdMob.isSupported()) {
  await AdMob.initialize({ isTesting: true })
}

// 2. Configura tus Ad Unit IDs de producción
await AdMob.configure({
  adUnitIds: {
    banner: "ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY",
    interstitial: "ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY",
    rewarded: "ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY",
  },
})

// 3. Suscríbete a eventos ANTES de operar
await AdMob.on("admob://rewarded-earned", ({ payload }) => {
  console.log("Recompensa:", payload.amount, payload.type)
})

// 4. Muestra un banner nativo
await AdMob.showBanner({ position: "bottom", size: "adaptive" })`

const STARTUP_CONFIG = `{
  "plugins": {
    "admob": {
      "isTesting": true,
      "debug": true,
      "initializeOnStartup": true
    }
  }
}`

export function QuickStartSection() {
  return (
    <Section
      id="inicio-rapido"
      eyebrow="Introducción"
      title="Inicio rápido"
      lead={
        <>
          Con la instalación lista, estos son los primeros cinco minutos de tu
          app con anuncios. Suscríbete a los eventos antes de inicializar y
          gestionar anuncios para no perderte ninguno.
        </>
      }
    >
      <CodeBlock lang="ts" title="main.ts — flujo completo" code={QUICKSTART} />
      <SubSection title="Inicialización desde tauri.conf.json">
        <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
          Si prefieres no llamar a <Code>initialize()</Code> en tu código,
          activa <Code>initializeOnStartup</Code> en la configuración del plugin:
          el SDK se inicializa solo cuando la app arranca, con el mismo{" "}
          <Code>AdMobConfig</Code>.
        </p>
        <CodeBlock
          lang="json"
          title="src-tauri/tauri.conf.json"
          code={STARTUP_CONFIG}
        />
      </SubSection>
      <Callout variant="tip" title="initialize() es idempotente">
        Llamarlo otra vez es un no-op seguro que devuelve el estado actual —
        nunca reejecuta el flujo nativo del SDK. Usa{" "}
        <Code>AdMob.configure()</Code> para cambiar los Ad Unit IDs.
      </Callout>
    </Section>
  )
}

/* ------------------------------------------------------------------ */
/* Consentimiento (UMP)                                                */
/* ------------------------------------------------------------------ */

const CONSENT_SNIPPET = `const { status } = await AdMob.requestConsent()
// status: "unknown" | "required" | "notRequired" | "obtained"

const current = await AdMob.getConsentStatus()`

export function ConsentSection() {
  return (
    <Section
      id="consentimiento"
      eyebrow="Privacidad"
      title="Consentimiento con Google UMP"
      lead={
        <>
          El plugin integra el User Messaging Platform de Google y normaliza su
          estado a cuatro valores predecibles. Mientras el estado sea{" "}
          <Code>required</Code>, toda petición de anuncios se rechaza con{" "}
          <Code>CONSENT_REQUIRED</Code> — los anuncios nunca se piden sin
          consentimiento.
        </>
      }
    >
      <CodeBlock lang="ts" title="Flujo de consentimiento" code={CONSENT_SNIPPET} />
      <DataTable
        headers={["Estado", "Significado", "¿Se pueden pedir anuncios?"]}
        rows={[
          ["unknown", "Aún no se ha consultado el estado UMP.", "No — CONSENT_REQUIRED"],
          ["required", "El usuario debe completar el formulario de consentimiento.", "No — CONSENT_REQUIRED"],
          ["notRequired", "No se requiere consentimiento para esta ubicación/configuración.", "Sí"],
          ["obtained", "El usuario completó el formulario de consentimiento.", "Sí"],
        ]}
      />
      <Callout title="No persistas el consentimiento tú mismo">
        El SDK de UMP lo guarda por dispositivo. Con{" "}
        <Code>automaticallyRequestConsent: true</Code> (por defecto) el flujo ya
        se ejecuta durante <Code>initialize()</Code>; solo llama{" "}
        <Code>requestConsent()</Code> manualmente si lo desactivaste o quieres
        ofrecer un botón de «opciones de privacidad».
      </Callout>
    </Section>
  )
}

/* ------------------------------------------------------------------ */
/* ATT                                                                 */
/* ------------------------------------------------------------------ */

const ATT_SNIPPET = `const status = await AdMob.requestTrackingAuthorization()
// iOS:        "notDetermined" | "restricted" | "denied" | "authorized"
// Android y escritorio: "notAvailable" — seguro de llamar sin condiciones

const known = await AdMob.getTrackingAuthorizationStatus()`

export function AttSection() {
  return (
    <Section
      id="att"
      eyebrow="Privacidad"
      title="App Tracking Transparency (iOS)"
      lead={
        <>
          ATT <strong>nunca</strong> se solicita de forma automática. Pídelo
          desde un gesto del usuario o activa{" "}
          <Code>requestTrackingAuthorization: true</Code> en{" "}
          <Code>initialize()</Code> para mostrar el prompt justo después del
          arranque.
        </>
      }
    >
      <CodeBlock lang="ts" title="App Tracking Transparency" code={ATT_SNIPPET} />
      <Callout variant="warn" title="Requisito de Info.plist">
        El prompt de ATT solo aparece si existe la clave{" "}
        <Code>NSUserTrackingUsageDescription</Code> en el{" "}
        <Code>Info.plist</Code> (ver Instalación → iOS). Además solo se muestra
        una vez por instalación; reinstala o restablece los ajustes de
        privacidad del simulador para verlo de nuevo.
      </Callout>
    </Section>
  )
}

/* ------------------------------------------------------------------ */
/* Banner                                                              */
/* ------------------------------------------------------------------ */

const BANNER_SNIPPET = `await AdMob.showBanner({ position: "bottom", size: "adaptive" })
// showBanner() resuelve cuando el anuncio está cargado y visible

await AdMob.hideBanner()                          // conserva la vista para re-mostrarla
await AdMob.showBanner()                          // re-muestra / refresca
await AdMob.setBannerPosition({ position: "top" })
const visible = await AdMob.isBannerVisible()     // true mientras esté visible
await AdMob.destroyBanner()                       // libera los recursos nativos`

const BANNER_SIZES: [string, string, string][] = [
  ["banner", "320×50", "El clásico rectangular estándar."],
  ["largeBanner", "320×100", "El doble de alto; más visibilidad."],
  ["mediumRectangle", "300×250", "Formato cuadrado con mejor CTR."],
  ["fullBanner", "468×60", "Ancho completo en tablets."],
  ["leaderboard", "728×90", "Para tablets en horizontal."],
  ["adaptive", "Ancho fijo", "Altura adaptativa anclada; el recomendado por Google."],
]

export function BannerSection() {
  return (
    <Section
      id="banner"
      eyebrow="Anuncios"
      title="Banner nativo"
      lead={
        <>
          El banner es una <strong>vista nativa real</strong> (AdView en Android,
          GADBannerView en iOS) adjunta al borde solicitado de la ventana, por
          encima de la barra de navegación o del home indicator. No es un
          elemento del DOM y no puede estilizarse con CSS.
        </>
      }
    >
      <CodeBlock lang="ts" title="Ciclo de vida del banner" code={BANNER_SNIPPET} />

      <SubSection title="Tamaños disponibles">
        <DataTable
          headers={["Size", "Dimensiones", "Descripción"]}
          rows={BANNER_SIZES.map(([size, dims, desc]) => [
            <code key={size} className="font-mono text-[13px] font-medium text-amber-700 dark:text-amber-400">
              {size}
            </code>,
            <span key={`${size}-dims`} className="font-mono text-[13px] text-muted-foreground">
              {dims}
            </span>,
            desc,
          ])}
        />
      </SubSection>

      <SubSection title="Posiciones">
        <p className="text-sm leading-relaxed text-muted-foreground">
          <Code>BannerPosition</Code> acepta <Code>&quot;top&quot;</Code> o{" "}
          <Code>&quot;bottom&quot;</Code> (por defecto). El plugin respeta las
          safe areas de ambas plataformas: status bar, barra de navegación
          (incluida la navegación por gestos) y home indicator.
        </p>
      </SubSection>

      <Callout variant="warn" title="Reserva espacio en tu UI">
        El banner flota sobre el contenido del WebView; este no se redimensiona
        (hacerlo pelearía con la gestión de layout del runtime de Tauri). Añade
        un padding inferior equivalente a la altura del banner en tu app shell
        para que el anuncio nunca tape controles interactivos.
      </Callout>
    </Section>
  )
}

/* ------------------------------------------------------------------ */
/* Intersticial                                                        */
/* ------------------------------------------------------------------ */

const INTERSTITIAL_SNIPPET = `await AdMob.loadInterstitial()   // resuelve cuando el anuncio está cargado

if (await AdMob.isInterstitialReady()) {
  await AdMob.showInterstitial() // resuelve cuando el usuario lo cierra
}

await AdMob.destroyInterstitial() // libera el anuncio cargado, si lo hay`

export function InterstitialSection() {
  return (
    <Section
      id="intersticial"
      eyebrow="Anuncios"
      title="Intersticial"
      lead={
        <>
          Anuncio a pantalla completa con una máquina de estados explícita:
          carga, consulta de disponibilidad, muestra y liberación. Todos los
          métodos son seguros frente a concurrencia — el estado pasa por un{" "}
          <Code>Mutex</Code> y las cargas obsoletas nunca corrompen el estado.
        </>
      }
    >
      <CodeBlock lang="ts" title="Ciclo de vida del intersticial" code={INTERSTITIAL_SNIPPET} />
      <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
        {["loadInterstitial()", "isInterstitialReady()", "showInterstitial()", "admob://interstitial-closed", "recargar"].map(
          (label, index) => (
            <span key={label} className="flex items-center gap-2">
              {index > 0 ? (
                <span aria-hidden className="text-muted-foreground/50">
                  →
                </span>
              ) : null}
              <span
                className={
                  label.startsWith("admob://")
                    ? "rounded-lg border border-amber-500/40 bg-amber-500/10 px-2.5 py-1.5 text-amber-700 dark:text-amber-400"
                    : "rounded-lg border bg-card px-2.5 py-1.5 text-foreground"
                }
              >
                {label}
              </span>
            </span>
          ),
        )}
      </div>
      <Callout variant="warn" title="Los anuncios se consumen">
        Cada <Code>show</Code> consume el anuncio. Recarga después de cada
        evento <Code>*-closed</Code>. Si llamas <Code>show</Code> sin carga
        previa, la promesa rechaza con <Code>AD_NOT_READY</Code>; fallos del SDK
        llegan como <Code>LOAD_FAILED</Code> / <Code>SHOW_FAILED</Code> con el
        detalle en el evento <Code>*-failed</Code>.
      </Callout>
    </Section>
  )
}

/* ------------------------------------------------------------------ */
/* Rewarded                                                            */
/* ------------------------------------------------------------------ */

const REWARDED_SNIPPET = `const unlisten = await AdMob.on("admob://rewarded-earned", ({ payload }) => {
  // payload: { adUnitId?, amount, type } — callback REAL del SDK
  grantReward(payload.amount, payload.type)
})

await AdMob.loadRewarded()
if (await AdMob.isRewardedReady()) {
  await AdMob.showRewarded() // resuelve cuando el usuario lo cierra
}

// cuando ya no lo necesites:
// unlisten()`

export function RewardedSection() {
  return (
    <Section
      id="rewarded"
      eyebrow="Anuncios"
      title="Rewarded"
      lead={
        <>
          Anuncios con recompensa cuya entrega viene del callback real del SDK
          (<Code>OnUserEarnedRewardListener</Code> en Kotlin,{" "}
          <Code>GADRewardedAdDelegate</Code> en Swift). Cerrar el anuncio sin
          completarlo emite <Code>admob://rewarded-closed</Code> — pero jamás una
          recompensa.
        </>
      }
    >
      <CodeBlock lang="ts" title="Recompensas verificables" code={REWARDED_SNIPPET} />
      <Callout variant="warn" title="Nunca otorgues recompensas desde rewarded-closed">
        La recompensa <strong>solo</strong> se emite desde{" "}
        <Code>admob://rewarded-earned</Code>, que proviene del listener nativo
        del SDK mientras el usuario está viendo el anuncio. Confiar en el
        evento de cierre permitiría cobrar premios sin ver el anuncio.
      </Callout>
    </Section>
  )
}
