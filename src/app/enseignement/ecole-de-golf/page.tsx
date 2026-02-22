import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";

export const metadata: Metadata = {
  title: "École de golf",
  robots: {
    index: false,
    follow: true,
  },
};

export default function Page() {
  permanentRedirect("/enseignement");
}
