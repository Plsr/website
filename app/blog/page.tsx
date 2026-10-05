import type { Metadata } from "next";
import { NotesFeed } from "./notes-feed";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Blog",
  description: "Short life updates by Chris Jarling.",
};

export default function BlogIndex() {
  return <NotesFeed page={1} />;
}
