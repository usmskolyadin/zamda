import type { Metadata } from "next";
import "./globals.css";
import BottomNav from "@/src/widgets/bottom-nav";
import Header from "../widgets/header";
import { AuthProvider } from "../features/context/auth-context";
import Footer from "../widgets/footer";

export const metadata: Metadata = {
  title: "Zamda — Buy & Sell Locally in the USA",
  description: "Zamda is a modern online marketplace for the USA. Buy and sell goods, find jobs, services, vehicles, and real estate in your city. Simple. Fast. Local. Everything will be ZAMDAmazing.",
  icons: {
    icon: "/zamda-white.png",
    shortcut: "/zamda-white.png",
    apple: "/zamda-white.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        
      </head>
      <body
        className={`antialiased  bg-white`}
      >
        <AuthProvider>
        <Header />
        <main className="lg:mt-40 mt-40">
            {children}
        </main>
        <BottomNav />
        <Footer />
        </ AuthProvider>

      </body>
    </html>
  ); 
}
