import { signIn } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { DiscordLogo } from "@phosphor-icons/react/dist/ssr";

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100dvh-3.5rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tighter mb-2">
            Sign in to Boss<span className="text-emerald-400">Story</span>
          </h1>
          <p className="text-sm text-zinc-500 max-w-[30ch] mx-auto">
            Connect your Discord to organize MapleStory boss parties.
          </p>
        </div>
        <form
          action={async () => {
            "use server";
            await signIn("discord", { redirectTo: "/" });
          }}
        >
          <Button
            type="submit"
            className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white active:scale-[0.98] transition-transform"
          >
            <DiscordLogo weight="bold" className="size-5 mr-2" />
            Sign in with Discord
          </Button>
        </form>
      </div>
    </div>
  );
}
