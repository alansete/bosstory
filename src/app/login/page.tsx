import { signIn } from "@/lib/auth";
import { DiscordLogo } from "@phosphor-icons/react/dist/ssr";

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100dvh-3rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-xs text-center">
        <h1 className="text-xl font-semibold tracking-tight mb-1.5">
          Sign in
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          Connect your Discord to get started.
        </p>
        <form
          action={async () => {
            "use server";
            await signIn("discord", { redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="w-full inline-flex h-9 items-center justify-center gap-2 rounded-md bg-[#5865F2] text-white text-sm font-medium hover:bg-[#4752C4] active:scale-[0.97] transition-all"
          >
            <DiscordLogo weight="fill" className="size-4" />
            Continue with Discord
          </button>
        </form>
      </div>
    </div>
  );
}
