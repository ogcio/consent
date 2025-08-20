import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ConsentWrapper } from "@/components/ConsentWrapper"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "@ogcio/consent - Next.js Example",
  description:
    "A comprehensive example showcasing the @ogcio/consent package in a Next.js application",
  keywords: ["consent", "gdpr", "privacy", "nextjs", "react", "ogcio"],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en'>
      <body className={inter.className}>
        <ConsentWrapper>{children}</ConsentWrapper>
      </body>
    </html>
  )
}
