import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Présentation",
  robots: {
    index: false,
    follow: true,
  },
};

export default function Page() {
  permanentRedirect("/vie-du-club");
}
