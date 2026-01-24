"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/client";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { Globe, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";

export function Header() {
  const { t, i18n } = useI18n();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const supportedLocales = [
    { code: "en", name: "English" },
    { code: "de", name: "Deutsch" },
    { code: "ar", name: "العربية" },
    { code: "pl", name: "Polski" },
    { code: "bg", name: "Български" },
    { code: "lt", name: "Lietuvių" },
    { code: "sk", name: "Slovenčina" },
    { code: "es", name: "Español" },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setShowLangMenu(false);
  };

  const navItems = [
    { href: "/", label: t("common.home") },
    ...(user
      ? [
          { href: "/dashboard", label: t("common.dashboard") },
          { href: "/allocation", label: t("common.capitalAllocation") },
          ...(user.user_metadata?.is_admin
            ? [{ href: "/admin", label: t("common.admin") }]
            : []),
        ]
      : []),
  ];

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="container-custom px-6 py-5">
        <div className="flex items-center justify-between">
          <Logo href="/" />

          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "nav-link text-sm",
                  pathname === item.href && "text-navy font-semibold"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-charcoal hover:text-red transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline">{supportedLocales.find((l) => l.code === i18n.language)?.name}</span>
              </button>
              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200">
                  {supportedLocales.map((locale) => (
                    <button
                      key={locale.code}
                      onClick={() => changeLanguage(locale.code)}
                      className={cn(
                        "w-full text-left px-4 py-2 text-sm hover:bg-offwhite transition-colors",
                        i18n.language === locale.code && "bg-offwhite font-medium text-red"
                      )}
                    >
                      {locale.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {user ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-charcoal hover:text-red transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">{t("common.logout")}</span>
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-sm font-medium text-charcoal hover:text-red transition-colors"
                >
                  {t("common.login")}
                </Link>
                <Button variant="primary" asChild>
                  <Link href="/auth/signup">{t("common.signup")}</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
