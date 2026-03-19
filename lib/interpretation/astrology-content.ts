/**
 * Phase 3: Structured astrology interpretation content.
 * All content is data-only; rule logic lives in astrology-interpreter.
 * Structure is DB-ready (array of records keyed by sign).
 */

export type SignKey =
  | "염소자리"
  | "물병자리"
  | "물고기자리"
  | "양자리"
  | "황소자리"
  | "쌍둥이자리"
  | "게자리"
  | "사자자리"
  | "처녀자리"
  | "천칭자리"
  | "전갈자리"
  | "사수자리";

export interface SignInterpretationContent {
  signKey: SignKey;
  element: string;
  modality: string;
  personality: string;
  strengths: string[];
  cautions: string[];
  /** Per-domain guidance: love, career, money, health (template or fixed copy). */
  domainGuidance: {
    love: string;
    career: string;
    money: string;
    health: string;
  };
}

/** Period-specific tone: how to phrase the reading (daily = concrete, yearly = thematic). */
export const PERIOD_TONE: Record<string, { intro: string; suffix: string }> = {
  daily: { intro: "오늘은", suffix: " 흐름을 참고하세요." },
  weekly: { intro: "이번 주는", suffix: " 한 주를 보내는 데 도움이 됩니다." },
  monthly: { intro: "이번 달은", suffix: " 한 달의 방향으로 삼으세요." },
  yearly: { intro: "올해는", suffix: " 한 해의 테마로 두면 좋습니다." },
  lifetime: { intro: "", suffix: " 인생 전반에 걸쳐 참고할 수 있는 성향입니다." },
};

/** All 12 signs: personality, strengths, cautions, per-domain guidance. */
export const SIGN_INTERPRETATION: SignInterpretationContent[] = [
  {
    signKey: "염소자리",
    element: "흙",
    modality: "변동",
    personality: "책임감 있고 끈기 있으며 목표 지향적입니다. 현실적인 판단으로 안정을 추구합니다.",
    strengths: ["끈기", "책임감", "현실적 판단", "장기적 계획"],
    cautions: ["과한 완벽주의", "감정 표현 부족", "융통성 부족"],
    domainGuidance: {
      love: "염소자리는 관계에서 신뢰와 안정을 중시합니다. 서두르지 않고 깊어지는 관계를 선호합니다.",
      career: "목표를 정하면 끝까지 해내는 편입니다. 단계적 성과와 인정이 동기가 됩니다.",
      money: "저축과 계획적 지출에 강합니다. 리스크를 줄이고 안정적 수입을 선호합니다.",
      health: "꾸준한 습관과 규칙적인 생활이 좋습니다. 무리한 일정보다 리듬 유지가 중요합니다.",
    },
  },
  {
    signKey: "물병자리",
    element: "공기",
    modality: "고정",
    personality: "독창적이고 인도주의적이며 미래지향적입니다. 관념과 새로운 아이디어에 끌립니다.",
    strengths: ["독창성", "객관성", "인맥", "혁신적 사고"],
    cautions: ["감정적 거리감", "고집", "현실과의 괴리"],
    domainGuidance: {
      love: "친구 같은 편안함과 지적 교감을 중요시합니다. 틀에 박힌 표현보다 자유로움이 좋습니다.",
      career: "팀워크와 네트워크를 살리는 일에 강합니다. 새로운 방식과 개선에 관심이 많습니다.",
      money: "전통적 방식보다 새로운 투자나 부업에 관심이 갈 수 있습니다. 분산이 유리합니다.",
      health: "정신적 피로를 줄이는 것이 우선입니다. 새로운 취미나 공부가 에너지를 채웁니다.",
    },
  },
  {
    signKey: "물고기자리",
    element: "물",
    modality: "변동",
    personality: "직관적이고 공감 능력이 뛰어나며 감성적입니다. 경계가 유연하고 영감에 의존합니다.",
    strengths: ["공감", "직관", "창의성", "적응력"],
    cautions: ["현실 회피", "경계 부족", "우유부단"],
    domainGuidance: {
      love: "깊은 유대와 감정적 교류를 원합니다. 상대의 감정에 맞춰주다 지칠 수 있으니 경계를 두세요.",
      career: "예술·돌봄·상담 등 감성과 직관을 쓰는 일에 잘 맞습니다. 목표를 작게 나누면 좋습니다.",
      money: "감정에 따라 지출이 늘어날 수 있습니다. 자동 저축으로 흐름을 잡는 것이 좋습니다.",
      health: "스트레스가 몸에 쌓이기 쉽습니다. 수면·휴식·물을 충분히 챙기세요.",
    },
  },
  {
    signKey: "양자리",
    element: "불",
    modality: "활동",
    personality: "용감하고 선구적이며 에너지가 넘칩니다. 도전과 새로운 시작을 좋아합니다.",
    strengths: ["용기", "추진력", "솔직함", "리더십"],
    cautions: ["성급함", "참을성 부족", "경쟁심 과다"],
    domainGuidance: {
      love: "직설적이고 열정적입니다. 먼저 다가가고 표현하는 편이니 상대도 솔직함이 중요합니다.",
      career: "선도하는 역할과 목표 달성에 강합니다. 단기 목표를 여러 개 두면 동기가 유지됩니다.",
      money: "돌발 지출과 도전적 투자에 끌릴 수 있습니다. 일정 비율만 위험 자산으로 두세요.",
      health: "활동량이 많아 피로를 잊기 쉽습니다. 휴식과 수면 시간을 고정하는 것이 좋습니다.",
    },
  },
  {
    signKey: "황소자리",
    element: "흙",
    modality: "고정",
    personality: "안정적이고 인내심이 있으며 감각을 중시합니다. 변화보다 확실한 것을 선호합니다.",
    strengths: ["인내", "감각적 판단", "안정감", "신뢰"],
    cautions: ["고집", "변화 거부", "물질 집착"],
    domainGuidance: {
      love: "오래 알아갈수록 깊어지는 타입입니다. 감각적 만족(맛, 터치, 분위기)이 관계에 도움이 됩니다.",
      career: "꾸준함과 실적이 쌓이는 분야에 강합니다. 급한 결정보다 검토 후 선택이 맞습니다.",
      money: "저축과 불필요한 지출 절제에 강합니다. 안정 자산 비중을 유지하는 편이 좋습니다.",
      health: "몸의 리듬과 휴식이 중요합니다. 목·어깨·소화 쪽을 자주 점검하세요.",
    },
  },
  {
    signKey: "쌍둥이자리",
    element: "공기",
    modality: "변동",
    personality: "호기심 많고 유연하며 소통 능력이 뛰어납니다. 다양성과 정보에 끌립니다.",
    strengths: ["소통", "유연성", "호기심", "적응력"],
    cautions: ["산만함", "깊이 부족", "일관성 부족"],
    domainGuidance: {
      love: "대화와 교류가 관계의 중심입니다. 새로운 경험과 대화 주제가 유대를 돕습니다.",
      career: "연락·협상·교육·미디어 등 말과 글이 중요한 일에 강합니다. 한 가지에만 묶이지 않도록 하세요.",
      money: "정보에 민감하고 다양한 수입원에 관심이 갈 수 있습니다. 핵심 저축만 고정하고 나머지는 유연히.",
      health: "머리와 신경이 피로해지기 쉽습니다. 디지털 휴식과 호흡·산책이 도움이 됩니다.",
    },
  },
  {
    signKey: "게자리",
    element: "물",
    modality: "활동",
    personality: "보호 본능이 강하고 감정이 풍부한 가정형입니다. 안전과 소속감을 중요시합니다.",
    strengths: ["보호심", "공감", "기억력", "돌봄"],
    cautions: ["과보호", "과거 집착", "기분 기복"],
    domainGuidance: {
      love: "안정과 유대감을 최우선으로 합니다. 상대에게 맞춰주다 상처받을 수 있으니 자신도 챙기세요.",
      career: "돌봄·교육·고객 관계 등 신뢰가 쌓이는 일에 강합니다. 환경이 편해야 능률이 올라갑니다.",
      money: "가족·주거에 대한 지출이 많을 수 있습니다. 비상금을 먼저 두고 나서 지출하세요.",
      health: "위·소화·감정이 연결됩니다. 규칙적인 식사와 따뜻한 음식이 좋습니다.",
    },
  },
  {
    signKey: "사자자리",
    element: "불",
    modality: "고정",
    personality: "당당하고 창의적이며 자신감이 넘칩니다. 인정과 표현을 중요시합니다.",
    strengths: ["리더십", "창의성", "관대함", "자신감"],
    cautions: ["과시욕", "비판에 약함", "고집"],
    domainGuidance: {
      love: "애정 표현이 크고 로맨틱합니다. 상대의 인정과 존중이 관계를 오래 유지하게 합니다.",
      career: "무대 위나 의사결정 역할에 강합니다. 성과를 인정받는 구조가 동기가 됩니다.",
      money: "품질과 브랜드에 지출이 늘어날 수 있습니다. 고정 지출을 정해 두고 나머지를 즐기세요.",
      health: "심장·등·체력 관리가 중요합니다. 과로 전에 휴식을 취하는 습관이 좋습니다.",
    },
  },
  {
    signKey: "처녀자리",
    element: "흙",
    modality: "변동",
    personality: "분석적이고 꼼꼼하며 실용적인 완벽주의입니다. 세부와 개선에 관심이 많습니다.",
    strengths: ["분석력", "꼼꼼함", "실용성", "봉사"],
    cautions: ["과한 비판", "걱정", "완벽주의"],
    domainGuidance: {
      love: "말보다 행동과 세심한 배려로 애정을 표현합니다. 상대의 단점을 고치려 하기보다 받아들이는 연습이 좋습니다.",
      career: "정리·분석·품질 관리·헬스케어 등에 강합니다. 완벽을 추구하다 지칠 수 있으니 80% 원칙을 두세요.",
      money: "계획적이고 불필요한 지출을 줄이는 편입니다. 여유 비용을 조금 두면 심리적 부담이 줄어듭니다.",
      health: "신경성 소화 불량이나 불면에 취약할 수 있습니다. 규칙적인 수면과 식사가 기본입니다.",
    },
  },
  {
    signKey: "천칭자리",
    element: "공기",
    modality: "고정",
    personality: "조화와 균형을 추구하며 사교적이고 예술적입니다. 공정과 아름다움을 중시합니다.",
    strengths: ["균형감", "매력", "협상력", "예술성"],
    cautions: ["우유부단", "갈등 회피", "외모 의존"],
    domainGuidance: {
      love: "조화로운 관계와 대화를 원합니다. 결정을 미루다 기회를 놓칠 수 있으니 작은 선택부터 연습하세요.",
      career: "협상·디자인·인사·미디어 등 조율이 필요한 일에 강합니다. 혼자보다 팀이 잘 맞습니다.",
      money: "아름다운 것과 경험에 지출이 많을 수 있습니다. 고정 저축을 먼저 하고 나머지를 쓰세요.",
      health: "스트레스가 신경과 피부에 나타나기 쉽습니다. 환경 정리와 휴식이 회복에 도움이 됩니다.",
    },
  },
  {
    signKey: "전갈자리",
    element: "물",
    modality: "고정",
    personality: "강렬하고 통찰력 있으며 깊은 집중력이 있습니다. 비밀과 변혁을 다룹니다.",
    strengths: ["통찰력", "집중력", "헌신", "회복력"],
    cautions: ["집착", "의심", "극단적 반응"],
    domainGuidance: {
      love: "깊은 유대와 신뢰를 중요시합니다. 상대를 시험하거나 통제하려 하면 관계가 무너질 수 있으니 경계를 두세요.",
      career: "조사·연구·전략·위기 관리 등에 강합니다. 권한과 비밀이 보장되는 환경이 맞습니다.",
      money: "큰 수익과 큰 리스크에 끌릴 수 있습니다. 일정 비율만 투자에 두고 나머지는 안전 자산으로.",
      health: "스트레스가 면역·생식 기관에 영향을 줄 수 있습니다. 휴식과 감정 배출이 중요합니다.",
    },
  },
  {
    signKey: "사수자리",
    element: "불",
    modality: "변동",
    personality: "낙관적이고 탐구심이 많으며 자유를 추구합니다. 의미와 여행·학문에 끌립니다.",
    strengths: ["낙관", "탐구심", "솔직함", "적응력"],
    cautions: ["산만함", "과장", "약속 이행 부족"],
    domainGuidance: {
      love: "함께 성장하고 새로운 경험을 나누는 관계를 원합니다. 구속보다 신뢰와 자유가 중요합니다.",
      career: "교육·여행·출판·국제 등 넓은 시야가 필요한 일에 강합니다. 목표를 크게 잡고 단계를 나누세요.",
      money: "경험과 학습에 지출이 많을 수 있습니다. 고정 비용을 줄이고 여유 자금을 따로 두는 것이 좋습니다.",
      health: "활동이 많아 피로를 무시하기 쉽습니다. 허리·다리·간 관리와 충분한 수면이 필요합니다.",
    },
  },
];

export function getSignContent(signKo: string): SignInterpretationContent | null {
  return SIGN_INTERPRETATION.find((s) => s.signKey === signKo) ?? null;
}
