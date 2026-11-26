import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import RoomingForm from "./RoomingForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pre-arrival rooming list",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function RoomingPage() {
  if (process.env.N10_SANDBOX_ENABLED !== "true" || (await headers()).get("host") !== "127.0.0.1:3032") {
    notFound();
  }
  return <RoomingForm />;
}
