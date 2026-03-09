import { NextResponse } from "next/server";

type AztroResponse = {
  current_date: string;
  date_range: string;
  description: string;
  compatibility: string;
  mood: string;
  color: string;
  lucky_number: string;
  lucky_time: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { sign?: string; day?: "today" | "tomorrow" | "yesterday" };
    const sign = (body.sign ?? "").toLowerCase().trim();
    const day = body.day ?? "today";

    const allowedSigns = new Set([
      "aries",
      "taurus",
      "gemini",
      "cancer",
      "leo",
      "virgo",
      "libra",
      "scorpio",
      "sagittarius",
      "capricorn",
      "aquarius",
      "pisces",
    ]);

    if (!allowedSigns.has(sign)) {
      return NextResponse.json({ error: "Invalid sign" }, { status: 400 });
    }

    const url = `https://aztro.sameerkumar.website/?sign=${encodeURIComponent(sign)}&day=${encodeURIComponent(day)}`;
    const resp = await fetch(url, { method: "POST", cache: "no-store" });
    if (!resp.ok) {
      return NextResponse.json({ error: "Upstream error" }, { status: 502 });
    }

    const data = (await resp.json()) as AztroResponse;
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}

