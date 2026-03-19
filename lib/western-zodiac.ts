export type WesternZodiacSign =
  | "aries"
  | "taurus"
  | "gemini"
  | "cancer"
  | "leo"
  | "virgo"
  | "libra"
  | "scorpio"
  | "sagittarius"
  | "capricorn"
  | "aquarius"
  | "pisces";

// Month is 1-12, day is 1-31
export function westernZodiacSignForDate(month: number, day: number): WesternZodiacSign {
  // Aries: Mar 21 – Apr 19
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "aries";
  // Taurus: Apr 20 – May 20
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "taurus";
  // Gemini: May 21 – Jun 20
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "gemini";
  // Cancer: Jun 21 – Jul 22
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "cancer";
  // Leo: Jul 23 – Aug 22
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "leo";
  // Virgo: Aug 23 – Sep 22
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "virgo";
  // Libra: Sep 23 – Oct 22
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "libra";
  // Scorpio: Oct 23 – Nov 21
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "scorpio";
  // Sagittarius: Nov 22 – Dec 21
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "sagittarius";
  // Capricorn: Dec 22 – Jan 19
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "capricorn";
  // Aquarius: Jan 20 – Feb 18
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "aquarius";
  // Pisces: Feb 19 – Mar 20
  return "pisces";
}

export function westernZodiacLabelKo(sign: WesternZodiacSign) {
  switch (sign) {
    case "aries":
      return "양자리";
    case "taurus":
      return "황소자리";
    case "gemini":
      return "쌍둥이자리";
    case "cancer":
      return "게자리";
    case "leo":
      return "사자자리";
    case "virgo":
      return "처녀자리";
    case "libra":
      return "천칭자리";
    case "scorpio":
      return "전갈자리";
    case "sagittarius":
      return "사수자리";
    case "capricorn":
      return "염소자리";
    case "aquarius":
      return "물병자리";
    case "pisces":
      return "물고기자리";
  }
}

