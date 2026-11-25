import type { Metadata } from "next"
import { Marcellus, Noto_Sans } from "next/font/google"
import { AppShell } from "@/components/shell/app-shell"
import "./globals.css"

// Marcellus richiama il lettering dei titoli di ArcheAge Chronicles; Noto Sans è il testo del sito ufficiale.
const title = Marcellus({ weight: "400", subsets: ["latin"], variable: "--font-title" })
const text = Noto_Sans({ subsets: ["latin"], variable: "--font-text" })

export const metadata: Metadata = {
  title: { default: "ArcheAge Burnout", template: "%s · ArcheAge Burnout" },
  description: "Rotte commerciali, catalogo, eventi, character builder e mappa di Auroria della gilda Burnout per ArcheAge Chronicles.",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="it" className={`dark ${title.variable} ${text.variable} h-full`}>
      <body className="min-h-full">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
