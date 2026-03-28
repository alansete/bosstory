import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export async function Navbar() {
  const session = await auth();

  return (
    <nav className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                BossStory
              </span>
            </Link>
            <div className="hidden sm:flex items-center gap-6">
              <Link
                href="/bosses"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Bosses
              </Link>
              <Link
                href="/characters/all"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Characters
              </Link>
              {session && (
                <Link
                  href="/characters"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  My Characters
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {session?.user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session.user.image || ""} />
                    <AvatarFallback>
                      {session.user.name?.[0] || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline text-sm">
                    {session.user.name}
                  </span>
                </div>
                <form
                  action={async () => {
                    "use server";
                    await signOut();
                  }}
                >
                  <Button type="submit" variant="ghost" size="sm">
                    Sign Out
                  </Button>
                </form>
              </div>
            ) : (
              <Link href="/login">
                <Button size="sm">Sign in with Discord</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
