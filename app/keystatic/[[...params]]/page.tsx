import type { Metadata } from "next";
import { pageSeo } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ params?: string[] }>;
}): Promise<Metadata> {
  const { params: segments } = await params;
  const suffix = segments?.length ? `/${segments.join("/")}` : "";
  return pageSeo(`/keystatic${suffix}`);
}

export default function Page() {
  return null;
}
