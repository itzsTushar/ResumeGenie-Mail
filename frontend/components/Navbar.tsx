
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const links = [
  { href: "/", label: "Home" },
  { href: "/account", label: "Account" },
  { href: "/mail-generation", label: "Mail Generation" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    let active = true;

    async function checkAuthentication() {
      setCheckingAuth(true);

      try {
        await api.getAccount();

        if (active) {
          setAuthenticated(true);
        }
      } catch {
        if (active) {
          setAuthenticated(false);
        }
      } finally {
        if (active) {
          setCheckingAuth(false);
        }
      }
    }

    void checkAuthentication();

    return () => {
      active = false;
    };
  }, [pathname]);

  async function handleLogout() {
    setBusy(true);

    try {
      await api.logout();
      setAuthenticated(false);
      setMenuOpen(false);
      router.push("/");
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Logout failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <header className="site-header">
      <div className="nav-container">
        <Link href="/" className="brand">
          <span className="brand-mark">R</span>
          <span>
            ResumeGenie<span className="brand-accent">-Mail</span>
          </span>
        </Link>

        <button
          type="button"
          className="mobile-menu"
          onClick={() => setMenuOpen((previous) => !previous)}
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        <nav className={`nav-links ${menuOpen ? "nav-open" : ""}`}>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`nav-link ${
                pathname === link.href ? "nav-link-active" : ""
              }`}
            >
              {link.label}
            </Link>
          ))}

          {!checkingAuth && (
            <>
              {!authenticated ? (
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="button button-secondary nav-cta"
                >
                  Sign In
                </Link>
              ) : (
                <button
                  type="button"
                  className="button button-quiet"
                  onClick={() => void handleLogout()}
                  disabled={busy}
                >
                  {busy ? "Signing out..." : "Sign Out"}
                </button>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
