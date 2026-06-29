import type { Metadata } from "next";
import AuthFlowGate from "@/components/auth/auth-flow-gate";
import "./globals.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export const metadata: Metadata = {
  title: "GatherGram",
  description: "Red social moderna para compartir, conversar y descubrir.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AuthFlowGate />
        {children}
      </body>
    </html>
  );
}
