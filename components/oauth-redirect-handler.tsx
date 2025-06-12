"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";

export function OAuthRedirectHandler({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    if (status === "loading" || hasRedirected) return;

    // Don't redirect if already on the role selection page
    if (pathname === "/auth/oauth-role-selection") return;

    if (session?.user?.needsRoleSelection && session.user.oauthData) {
      setHasRedirected(true);

      const params = new URLSearchParams({
        email: session.user.oauthData.email,
        name: session.user.oauthData.name,
        image: session.user.oauthData.image,
        provider: session.user.oauthData.provider,
        providerId: session.user.oauthData.providerId,
      });

      router.replace(`/auth/oauth-role-selection?${params.toString()}`);
      return;
    }
  }, [session, status, router, pathname, hasRedirected]);

  // Show loading while checking session
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render children if user needs role selection and not on role selection page
  if (session?.user?.needsRoleSelection && pathname !== "/auth/oauth-role-selection") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}
