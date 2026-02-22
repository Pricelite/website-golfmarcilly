import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Cours individuels",
  robots: {
    index: false,
    follow: true,
  },
};

export default function Page() {
  permanentRedirect("/enseignement");
}
