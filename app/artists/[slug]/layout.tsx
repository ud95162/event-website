import type { Metadata } from "next";
import { artistMetadata } from "../../lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return (await artistMetadata(slug)) ?? {};
}

export default function ArtistLayout({ children }: { children: React.ReactNode }) {
  return children;
}
