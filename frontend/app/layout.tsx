import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "ResumeGenie-Mail | Smarter Job Applications",
  description:
    "Manage your resume and generate personalized job application emails with ResumeGenie-Mail.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
        <footer className="site-footer">
          <div className="page-container footer-inner">
            <span>© {new Date().getFullYear()} ResumeGenie-Mail</span>
            <span>Make every job application count.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
