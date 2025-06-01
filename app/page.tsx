"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (session) {
      // User is authenticated, redirect to appropriate dashboard
      if (session.user.role === "doctor") {
        router.push("/doctor/dashboard");
      } else if (session.user.role === "patient") {
        router.push("/patient/dashboard");
      }
    } else {
      // User is not authenticated, redirect to role selection
      router.push("/auth/select-role");
    }
  }, [session, status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-lg">Loading...</div>
    </div>
  );
}
