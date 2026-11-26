"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

type Interval = { start: string; end: string };
type Group = Interval & { id: string; label: string; total_limit: number };
type Slot = Interval & { id: string };
type Occupant = Interval & { id: string; group_id: string; first_name: string; last_name: string };
type Sharing = Interval & { group_id: string; notes: string };
type Recorded = { status: "recorded_in_test"; id: string; recorded_at: string };
type Rooming = { occupants: Occupant[]; sharing_requests: Sharing[] };
type Form = Interval & {
  reference: string; version: number; groups: Group[]; slots: Slot[];
  rooming: Rooming | null; last_submission: Recorded | null;
};

class RoomingError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}

async function request<T>(method = "GET", body?: object): Promise<T> {
  const response = await fetch("/api/pre-arrival/rooming", {
    method, cache: "no-store",
    ...(body ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : {}),
  });
  const data = await response.json();
  if (!response.ok) throw new RoomingError(data.error ?? "The rooming request failed.", response.status);
  return data;
}

const field = "w-full rounded border border-slate-400 bg-white p-2 text-slate-900";
const button = "rounded bg-slate-900 px-4 py-2 font-medium text-white disabled:opacity-60";

export default function RoomingForm() {
  const [invite, setInvite] = useState("");
  const [form, setForm] = useState<Form | null>(null);
  const [occupants, setOccupants] = useState<Occupant[]>([]);
  const [sharing, setSharing] = useState<Sharing[]>([]);
  const [reviewId, setReviewId] = useState("");
  const [result, setResult] = useState<Recorded | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const initialFragment = useRef<string | null>(null);

  function load(data: Form) {
    setForm(data);
    setOccupants(data.rooming?.occupants ?? data.slots.map(({ id, start, end }) => ({
      id, start, end, group_id: "", first_name: "", last_name: "",
    })));
    setSharing(data.rooming?.sharing_requests ?? []);
    setReviewId("");
    setResult(null);
  }

  useEffect(() => {
    let current = true;
    const fragment = initialFragment.current ?? window.location.hash;
    initialFragment.current = fragment;
    if (fragment) {
      window.history.replaceState(window.history.state, "", window.location.pathname);
      const token = new URLSearchParams(fragment.slice(1)).get("invite") ?? "";
      if (/^[A-Za-z0-9_-]{43}$/.test(token)) {
        queueMicrotask(() => { if (current) setInvite(token); });
      }
    } else {
      void request<Form>().then((data) => {
        if (current) load(data);
      }).catch((failure: unknown) => {
        if (current && (!(failure instanceof RoomingError) || failure.status !== 401)) {
          setError("The rooming form could not open. Try again.");
        }
      });
    }
    return () => { current = false; };
  }, []);

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError("");
    try {
      await action();
    } catch (failure) {
      if (failure instanceof RoomingError && failure.status === 401) {
        setForm(null);
        setOccupants([]);
        setSharing([]);
        setReviewId("");
        setResult(null);
        setInvite("");
      }
      setError(failure instanceof RoomingError ? failure.message : "The rooming request failed. Try again.");
    } finally {
      setBusy(false);
    }
  }

  function review(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setReviewId(crypto.randomUUID());
  }

  const groupLabel = (id: string) => form?.groups.find((group) => group.id === id)?.label ?? "";
  return (
    <main className="mx-auto min-h-screen max-w-3xl space-y-5 bg-white px-4 py-8 text-slate-900 sm:px-8">
      <p className="font-medium text-slate-700">Test environment</p>
      <h1 className="text-3xl font-semibold">Pre-arrival rooming list</h1>
      <p>Use sample guest names. Rosapenna assigns physical rooms.</p>
      {error && <p role="alert" className="rounded border border-red-700 p-3 text-red-800">{error}</p>}
      {!form && (invite ? (
        <button className={button} disabled={busy} onClick={() => void run(async () => {
          window.history.replaceState(window.history.state, "", window.location.pathname);
          await request("POST", { invite_token: invite });
          setInvite("");
          load(await request<Form>());
        })}>Continue</button>
      ) : <p>Open your rooming invitation to continue.</p>)}
      {form && <>
        <p>Booking {form.reference}. Stay from {form.start} to {form.end}.</p>
        {form.last_submission && !result &&
          <p>Previous test save at {new Date(form.last_submission.recorded_at).toLocaleString()}.</p>}
        {result ? (
          <section role="status" className="space-y-3 rounded border border-slate-400 p-4">
            <h2 className="text-xl font-semibold">Rooming list saved in the test system</h2>
            <p>Submission {result.id}</p>
            <p>Saved at {new Date(result.recorded_at).toLocaleString()}.</p>
            <button className={button} disabled={busy} onClick={() => void run(async () => load(await request<Form>()))}>
              View saved rooming list
            </button>
          </section>
        ) : reviewId ? (
          <section aria-labelledby="n10-review" className="space-y-4 rounded border border-slate-400 p-4">
            <h2 id="n10-review" className="text-xl font-semibold">Review your rooming list</h2>
            {form.groups.map((group) => (
              <div key={group.id}>
                <h3 className="font-semibold">{group.label}</h3>
                <ul className="list-disc ps-5">
                  {occupants.filter((person) => person.group_id === group.id).map((person) => (
                    <li key={person.id}>{person.first_name} {person.last_name}, {person.start} to {person.end}</li>
                  ))}
                  {sharing.filter((item) => item.group_id === group.id).map((item, index) => (
                    <li key={index}>Request for {item.start} to {item.end}. {item.notes}</li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="flex flex-wrap gap-3">
              <button className={button} disabled={busy} onClick={() => void run(async () => {
                setResult(await request<Recorded>("PUT", {
                  version: form.version, request_id: reviewId, reviewed: true,
                  occupants, sharing_requests: sharing,
                }));
              })}>{busy ? "Saving…" : "Submit rooming list"}</button>
              <button className={button} disabled={busy} onClick={() => setReviewId("")}>Back to edit</button>
              {error && <button className={button} disabled={busy}
                onClick={() => void run(async () => load(await request<Form>()))}>Reload saved details</button>}
            </div>
          </section>
        ) : (
          <form className="space-y-4" onSubmit={review}>
            {occupants.map((person, index) => {
              const change = (value: Partial<Occupant>) => setOccupants((previous) =>
                previous.map((item) => item.id === person.id ? { ...item, ...value } : item));
              return (
                <fieldset key={person.id} className="grid gap-3 rounded border border-slate-400 p-4 sm:grid-cols-2">
                  <legend className="px-1 font-semibold">Guest {index + 1}</legend>
                  <label>First name<input className={field} required maxLength={100} value={person.first_name}
                    onChange={(event) => change({ first_name: event.target.value })} /></label>
                  <label>Last name<input className={field} required maxLength={100} value={person.last_name}
                    onChange={(event) => change({ last_name: event.target.value })} /></label>
                  <label>Booked room group<select className={field} required disabled={form.rooming !== null}
                    value={person.group_id} onChange={(event) => change({ group_id: event.target.value })}>
                    <option value="">Select a room group</option>
                    {form.groups.filter((group) => group.start <= person.start && person.end <= group.end)
                      .map((group) => <option key={group.id} value={group.id}>{group.label} (up to {group.total_limit})</option>)}
                  </select></label>
                  <p className="self-end pb-2">Dates {person.start} to {person.end}</p>
                </fieldset>
              );
            })}
            {form.rooming && <p>Contact reservations staff to change a saved room group.</p>}
            <h2 className="text-xl font-semibold">Optional sharing requests</h2>
            <p>Enter the dates the request applies. The hotel decides if it can meet the request.</p>
            {sharing.map((item, index) => {
              const group = form.groups.find((candidate) => candidate.id === item.group_id)!;
              const change = (value: Partial<Sharing>) => setSharing((previous) =>
                previous.map((request, position) => position === index ? { ...request, ...value } : request));
              return (
                <fieldset className="space-y-2 rounded border border-slate-400 p-4" key={index}>
                  <legend className="px-1 font-semibold">{groupLabel(group.id)} request {index + 1}</legend>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label>First night<input className={field} type="date" min={group.start} max={group.end}
                      required value={item.start} onChange={(event) => change({ start: event.target.value })} /></label>
                    <label>End date (excluded)<input className={field} type="date" min={item.start} max={group.end}
                      required value={item.end} onChange={(event) => change({ end: event.target.value })} /></label>
                  </div>
                  <label>Sharing request<textarea className={field} required maxLength={200}
                    value={item.notes} onChange={(event) => change({ notes: event.target.value })} /></label>
                  <button type="button" className="underline"
                    onClick={() => setSharing((previous) => previous.filter((_, position) => position !== index))}>Remove request</button>
                </fieldset>
              );
            })}
            <div className="flex flex-wrap gap-3">
              {form.groups.map((group) => (
                <button key={group.id} type="button" className="rounded border border-slate-600 px-3 py-2"
                  disabled={sharing.length >= 40}
                  onClick={() => setSharing((previous) => [
                    ...previous, { group_id: group.id, start: group.start, end: group.end, notes: "" },
                  ])}>Add request for {group.label}</button>
              ))}
            </div>
            <button className={button} type="submit">Review rooming list</button>
          </form>
        )}
        <button className="underline" disabled={busy} onClick={() => void run(async () => {
          await request("DELETE");
          setForm(null);
          setOccupants([]);
          setSharing([]);
          setReviewId("");
          setResult(null);
        })}>Sign out</button>
      </>}
    </main>
  );
}
