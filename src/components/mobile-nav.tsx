"use client";

import { useState } from "react";
import Link from "next/link";
import { List, X } from "@phosphor-icons/react";

type NavLink = { href: string; label: string };

export function MobileNav({
  links,
  userName,
  userImage,
  isSignedIn,
}: {
  links: NavLink[];
  userName?: string | null;
  userImage?: string | null;
  isSignedIn: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="sm:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="size-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        {open ? (
          <X weight="bold" className="size-4" />
        ) : (
          <List weight="bold" className="size-4" />
        )}
      </button>

      {open && (
        <div className="absolute top-12 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-sm text-muted-foreground hover:text-foreground py-2 px-2 rounded-md hover:bg-muted transition-colors"
              >
                {l.label}
              </Link>
            ))}
            <div className="border-t border-border mt-1 pt-2">
              {isSignedIn ? (
                <div className="flex items-center justify-between px-2 py-1">
                  <span className="text-sm text-muted-foreground">
                    {userName}
                  </span>
                  <form action="/api/auth/signout" method="POST">
                    <button
                      type="submit"
                      className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                    >
                      Sign out
                    </button>
                  </form>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="text-sm font-medium py-2 px-2 block"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
