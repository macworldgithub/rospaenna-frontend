import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PreviewForm from "./PreviewForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Staff BRS preview",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function StaffBrsPreviewPage() {
  if (process.env.BOOKING_STAFF_BRS_PREVIEW_ENABLED !== "true") notFound();
  return <PreviewForm />;
}
