import { NextResponse } from "next/server";

type SajuRequest = {
  birthDate: string; // YYYY-MM-DD
  birthTime?: string; // HH:MM
  city?: string;
  sex?: "M" | "F";
  timeStandard?: "civil" | "true_solar" | "true_solar_absolute";
};

export async function POST(req: Request) {
  const apiKey = process.env.FREEASTRO_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Missing FREEASTRO_API_KEY. Add it in .env.local and your deployment env vars to enable 사주 API.",
      },
      { status: 501 }
    );
  }

  try {
    const body = (await req.json()) as SajuRequest;
    const birthDate = (body.birthDate ?? "").trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
      return NextResponse.json({ error: "Invalid birthDate" }, { status: 400 });
    }
    const [yearStr, monthStr, dayStr] = birthDate.split("-");
    const year = Number(yearStr);
    const month = Number(monthStr);
    const day = Number(dayStr);

    const birthTime = (body.birthTime ?? "").trim();
    let hour = 12;
    let minute = 0;
    if (/^\d{2}:\d{2}$/.test(birthTime)) {
      const [hStr, mStr] = birthTime.split(":");
      hour = Number(hStr);
      minute = Number(mStr);
    }

    const city = (body.city ?? "Seoul").trim() || "Seoul";
    const sex: "M" | "F" = body.sex === "F" ? "F" : "M";
    const time_standard = body.timeStandard ?? "civil";

    const upstreamResp = await fetch("https://astro-api-1qnc.onrender.com/api/v1/chinese/bazi", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        year,
        month,
        day,
        hour,
        minute,
        city,
        sex,
        time_standard,
        include_pinyin: false,
        include_stars: false,
        include_interactions: false,
        include_professional: false,
      }),
      cache: "no-store",
    });

    if (!upstreamResp.ok) {
      const text = await upstreamResp.text();
      return NextResponse.json(
        { error: "Upstream error", status: upstreamResp.status, detail: text.slice(0, 800) },
        { status: 502 }
      );
    }

    const data = await upstreamResp.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}

