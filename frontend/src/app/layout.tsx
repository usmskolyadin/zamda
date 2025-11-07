import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "./ClientLayout";

export const metadata: Metadata = {
  title: "Zamda — Buy & Sell Locally in the USA",
  description: "Zamda is a modern online marketplace for the USA. Buy and sell goods, find jobs, services, vehicles, and real estate in your city. Simple. Fast. Local. Everything will be ZAMDAmazing.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/zamda-white.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-white">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
