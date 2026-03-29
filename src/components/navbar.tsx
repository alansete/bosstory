import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MobileNav } from "./mobile-nav";

export async function Navbar() {
  const session = await auth();

  const links = [
    { href: "/bosses", label: "Bosses" },
    { href: "/characters/all", label: "Players" },
    // { href: "/manga", label: "Manga" },
    ...(session
      ? [
          { href: "/parties", label: "Parties" },
          { href: "/characters", label: "My Characters" },
        ]
      : []),
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto flex h-12 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Mobile hamburger */}
          <MobileNav
            links={links}
            userName={session?.user?.name}
            userImage={session?.user?.image}
            isSignedIn={!!session?.user}
          />

          <Link href="/" className="font-semibold text-sm tracking-tight">
            BossStory
          </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-[13px] text-muted-foreground hover:text-foreground rounded-md px-2.5 py-1 transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Desktop user */}
        <div className="hidden sm:flex items-center">
          {session?.user ? (
            <div className="flex items-center gap-2">
              <Avatar className="size-6">
                <AvatarImage src={session.user.image || ""} />
                <AvatarFallback className="text-[10px]">
                  {session.user.name?.[0]}
                </AvatarFallback>
              </Avatar>
              <span className="text-[13px] text-muted-foreground">
                {session.user.name}
              </span>
              <form
                action={async () => {
                  "use server";
                  await signOut();
                }}
              >
                <button
                  type="submit"
                  className="text-[12px] text-muted-foreground/60 hover:text-muted-foreground ml-2 transition-colors"
                >
                  Sign out
                </button>
              </form>
            </div>
          ) : (
            <Link href="/login">
              <Button size="sm" className="h-7 text-xs active:scale-[0.97] transition-transform">
                Sign in
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile avatar (no menu, just visual) */}
        <div className="sm:hidden">
          {session?.user ? (
            <Avatar className="size-6">
              <AvatarImage src={session.user.image || ""} />
              <AvatarFallback className="text-[10px]">
                {session.user.name?.[0]}
              </AvatarFallback>
            </Avatar>
          ) : (
            <Link href="/login" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
