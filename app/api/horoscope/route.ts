// Deprecated: external horoscope API route is no longer used.
// Astrology is now fully powered by local astrology-db via AstrologyCalculator.
export async function POST() {
  return new Response(
    JSON.stringify({ error: "Horoscope API disabled. Use local astrology engine instead." }),
    { status: 410, headers: { "content-type": "application/json" } }
  );
}
