import type { Metadata } from "next";
import { organizerMetadata } from "../../lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return (await organizerMetadata(slug)) ?? {};
}

export default function OrganizerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
