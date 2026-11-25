import { Marcellus, Noto_Sans } from "next/font/google"

const display = Marcellus({ weight: "400", subsets: ["latin"], variable: "--font-display" })
const sans = Noto_Sans({ subsets: ["latin"], variable: "--font-text" })

export default function MockupLayout({ children }: LayoutProps<"/mockup">) {
  return <div className={`${display.variable} ${sans.variable} flex flex-1 flex-col [font-family:var(--font-text)]`}>{children}</div>
}
