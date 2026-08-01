"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// The dashboard was merged into Analytics — /admin just forwards there.
export default function AdminIndex() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/analytics");
  }, [router]);
  return null;
}
