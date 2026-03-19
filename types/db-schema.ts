/**
 * Phase 5: TypeScript types mirroring the proposed DB schema.
 * Use for type-safe Supabase client and migration. See DB_SCHEMA_PROPOSAL.md.
 */

export interface DbUser {
  id: string;
  external_id?: string | null;
  created_at: string;
}

export interface DbBirthProfile {
  id: string;
  user_id?: string | null;
  name?: string | null;
  calendar_type: string;
  birth_date: string;
  birth_time?: string | null;
  birth_place?: string | null;
  created_at: string;
}

export interface DbReadingRequest {
  id: string;
  profile_id?: string | null;
  period_key: string;
  style_key: string;
  requested_at: string;
}

export interface DbRawChartResult {
  id: string;
  request_id: string;
  payload: Record<string, unknown>;
  created_at: string;
}

export interface DbInterpretedResult {
  id: string;
  request_id: string;
  payload: Record<string, unknown>;
  created_at: string;
}

export interface DbCompatibilityResult {
  id: string;
  profile_id_1?: string | null;
  profile_id_2?: string | null;
  payload: Record<string, unknown>;
  created_at: string;
}

export interface DbStylePreset {
  id: string;
  key: string;
  label: string;
  description?: string | null;
  sort_order: number;
  created_at: string;
}

export interface DbAiPromptTemplate {
  id: string;
  name: string;
  version: string;
  system_prompt: string;
  user_prompt_template: string;
  guardrails?: string | null;
}

export interface DbAiGeneratedOutput {
  id: string;
  request_id: string;
  prompt_version: string;
  style_key: string;
  payload: Record<string, unknown>;
  created_at: string;
}

export interface DbSignInterpretation {
  id: string;
  sign_key: string;
  element: string;
  modality: string;
  personality: string;
  strengths: string[];
  cautions: string[];
  domain_guidance: { love: string; career: string; money: string; health: string };
  created_at: string;
}

export interface DbPeriodTone {
  id: string;
  period_key: string;
  intro: string;
  suffix: string;
}

export interface DbSajuElementMeaning {
  id: string;
  element_key: string;
  label: string;
  dominant_meaning: string;
  deficient_meaning: string;
  balance_note: string;
}

export interface DbSajuDayMasterTendency {
  id: string;
  ilgan: string;
  relationships: string;
  work: string;
  money: string;
  health: string;
}

export interface DbCompatibilityElementPairing {
  id: string;
  pair_key: string;
  score_delta: number;
  attraction: string;
  communication: string;
  caution: string;
}
