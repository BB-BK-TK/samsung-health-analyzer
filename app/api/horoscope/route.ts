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

type ApiNinjasResponse = {
  date?: string;
  zodiac?: string;
  horoscope?: string;
};

async function fetchAztro(sign: string, day: string) {
  const url = `https://aztro.sameerkumar.website/?sign=${encodeURIComponent(sign)}&day=${encodeURIComponent(day)}`;
  const resp = await fetch(url, { method: "POST", cache: "no-store" });
  return resp;
}

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

    // Primary provider: aztro (free/no-key) — can be intermittently unavailable.
    let resp = await fetchAztro(sign, day);
    if (!resp.ok && resp.status >= 500) {
      // one quick retry for transient 5xx
      resp = await fetchAztro(sign, day);
    }

    if (resp.ok) {
      const data = (await resp.json()) as AztroResponse;
      return NextResponse.json({ provider: "aztro", ...data });
    }

    // Fallback provider: API Ninjas (requires key)
    const ninjasKey = process.env.API_NINJAS_KEY;
    if (ninjasKey) {
      const url = `https://api.api-ninjas.com/v1/horoscope?zodiac=${encodeURIComponent(sign)}`;
      const r2 = await fetch(url, {
        method: "GET",
        headers: { "X-Api-Key": ninjasKey },
        cache: "no-store",
      });
      if (r2.ok) {
        const j = (await r2.json()) as ApiNinjasResponse;
        const horoscope = j.horoscope ?? "오늘의 운세를 불러오지 못했어요.";
        const fallback: AztroResponse = {
          current_date: j.date ?? "",
          date_range: "",
          description: horoscope,
          compatibility: "",
          mood: "",
          color: "",
          lucky_number: "",
          lucky_time: "",
        };
        return NextResponse.json({ provider: "api-ninjas", ...fallback });
      }
    }

    const detail = (await resp.text().catch(() => "")).slice(0, 800);
    return NextResponse.json(
      {
        error: "Upstream error",
        upstreamStatus: resp.status,
        detail,
        hint: ninjasKey ? "Fallback provider failed too." : "Set API_NINJAS_KEY to enable fallback provider.",
      },
      { status: 502 }
    );
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}

