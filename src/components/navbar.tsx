import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SignOut, DiscordLogo } from "@phosphor-icons/react/dist/ssr";

export async function Navbar() {
  const session = await auth();

  return (
    <nav className="border-b border-border bg-background/90 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 items-center">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight">
                Boss<span className="text-emerald-400">Story</span>
              </span>
            </Link>
            <div className="hidden sm:flex items-center gap-1">
              {[
                { href: "/bosses", label: "Bosses" },
                { href: "/characters/all", label: "Roster" },
                ...(session
                  ? [
                      { href: "/parties", label: "My Parties" },
                      { href: "/characters", label: "My Characters" },
                    ]
                  : []),
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-zinc-400 hover:text-foreground px-3 py-1.5 rounded-md hover:bg-zinc-800/50 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {session?.user ? (
              <>
                <div className="flex items-center gap-2">
                  <Avatar className="size-7">
                    <AvatarImage src={session.user.image || ""} />
                    <AvatarFallback className="text-xs bg-zinc-800">
                      {session.user.name?.[0] || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline text-sm text-zinc-300">
                    {session.user.name}
                  </span>
                </div>
                <form
                  action={async () => {
                    "use server";
                    await signOut();
                  }}
                >
                  <Button
                    type="submit"
                    variant="ghost"
                    size="sm"
                    className="text-zinc-500 hover:text-zinc-300"
                  >
                    <SignOut weight="bold" className="size-4" />
                  </Button>
                </form>
              </>
            ) : (
              <Link href="/login">
                <Button
                  size="sm"
                  className="active:scale-[0.98] transition-transform"
                >
                  <DiscordLogo weight="bold" className="size-4 mr-1.5" />
                  Sign in
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
