/**
 * Phase 3: Compatibility interpreter.
 * Given two signs and their element/modality, returns score + summary + attraction, communication, caution patterns.
 */

import type { AstrologyCompatibilityResult } from "@/types/result-schema";
import { getElementPairing, getModalityNote } from "./compatibility-content";

export function interpretCompatibility(
  sign1: string,
  sign2: string,
  sign1Meta: { element: string; modality: string },
  sign2Meta: { element: string; modality: string }
): AstrologyCompatibilityResult {
  const pair = getElementPairing(sign1Meta.element, sign2Meta.element);
  const modalityNote = getModalityNote(sign1Meta.modality, sign2Meta.modality);

  const score = 3 + pair.scoreDelta;
  const strengths: string[] = [];
  const challenges: string[] = [];

  strengths.push(pair.attraction);
  if (modalityNote) strengths.push(modalityNote);
  challenges.push(pair.caution);

  const summary =
    score >= 4
      ? `${sign1}와(과) ${sign2}는 궁합이 좋은 편입니다. ${pair.attraction}`
      : score <= 2
        ? `${sign1}와(과) ${sign2}는 차이가 있어 이해와 노력이 필요합니다. ${pair.communication}`
        : `${sign1}와(과) ${sign2}는 무난한 궁합입니다. ${pair.attraction}`;

  return {
    score: Math.min(5, Math.max(1, Math.round(score))),
    summary,
    strengths: strengths.length ? strengths : ["서로 다른 강점으로 보완할 수 있습니다."],
    challenges: challenges.length ? challenges : ["작은 배려가 관계를 돈독하게 합니다."],
    attractionPattern: pair.attraction,
    communicationPattern: pair.communication,
    cautionAreas: [pair.caution, sign1Meta.modality !== sign2Meta.modality ? "리듬과 우선순위 차이" : ""].filter(Boolean),
  };
}
