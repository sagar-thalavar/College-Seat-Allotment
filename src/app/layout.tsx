import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KEA Next | Modernized Karnataka DCET Engineering Admission Portal",
  description: "Zero-form digital authentication, multi-year cutoff analyzer, and intelligent option entry counseling platform for Karnataka engineering admissions.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-slate-50 antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans">
        {children}
      </body>
    </html>
  );
}
