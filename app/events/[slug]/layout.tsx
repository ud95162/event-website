import type { Metadata } from "next";
import { eventMetadata } from "../../lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return (await eventMetadata(slug)) ?? {};
}

export default function EventLayout({ children }: { children: React.ReactNode }) {
  return children;
}
