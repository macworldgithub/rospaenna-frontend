"use client";

import { useState, type FormEvent } from "react";

export default function PreviewForm() {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = event.currentTarget;
    const values = new FormData(form);
    setBusy(true);
    setResult("");

    try {
      const response = await fetch("/api/staff/brs-preview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Staff-Token": String(values.get("staff_token") ?? "").trim(),
        },
        body: JSON.stringify({
          course_id: Number(values.get("course_id")),
          day: values.get("day"),
          tee_time: values.get("tee_time"),
        }),
      });
      const body = await response.json();
      if (!response.ok) {
        setResult(typeof body.error === "string" ? body.error : "The staff preview failed.");
        return;
      }
      if (body?.payment !== "simulated" || body?.brs_row_checked !== true ||
          body?.booking_saved !== false || typeof body?.add_enabled !== "boolean") {
        setResult("The BRS preview response could not be verified.");
        return;
      }
      setResult(body.add_enabled
        ? "Payment simulated. BRS row checked. Add is enabled. Booking was not saved."
        : "Payment simulated. BRS row checked. Add is unavailable. Booking was not saved.");
    } catch {
      setResult("The staff preview could not be completed.");
    } finally {
      const token = form.elements.namedItem("staff_token");
      if (token instanceof HTMLInputElement) token.value = "";
      setBusy(false);
    }
  }

  const field = "block w-full rounded border border-gray-400 bg-white p-2 text-black";
  return (
    <main className="mx-auto max-w-xl space-y-5 p-6">
      <h1 className="text-2xl font-semibold">Staff BRS preview</h1>
      <p>This checks one live tee time. It does not take a payment or save a booking.</p>
      <form method="post" className="space-y-4" onSubmit={submit}>
        <label className="block">Staff token
          <input className={field} name="staff_token" type="password" autoComplete="off" required />
        </label>
        <label className="block">Course
          <select className={field} name="course_id">
            <option value="1">Old Tom Morris</option>
            <option value="3">Sandy Hills</option>
          </select>
        </label>
        <label className="block">Date
          <input className={field} name="day" type="date" required />
        </label>
        <label className="block">Tee time
          <input className={field} name="tee_time" type="time" required />
        </label>
        <button className="rounded bg-black px-4 py-2 text-white disabled:opacity-50" disabled={busy}>
          {busy ? "Checking BRS…" : "Simulate payment and check BRS"}
        </button>
      </form>
      {result && <p role="status">{result}</p>}
    </main>
  );
}
