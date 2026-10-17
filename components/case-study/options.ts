/**
 * Shared by the React components and the Keystatic editor schema so the
 * admin and the renderer cannot drift apart.
 */
export const caseStudyComponentNames = ["Figure", "Callout"] as const;

export type CaseStudyComponentName = (typeof caseStudyComponentNames)[number];

export const figureVariants = [
  { label: "Content", value: "content" },
  { label: "Wide", value: "wide" },
  { label: "Full bleed", value: "full" },
] as const;

export type FigureVariant = (typeof figureVariants)[number]["value"];

export function isFigureVariant(value: string): value is FigureVariant {
  return figureVariants.some((variant) => variant.value === value);
}

export const calloutTones = [
  { label: "Note", value: "note" },
  { label: "Warning", value: "warning" },
] as const;

export type CalloutTone = (typeof calloutTones)[number]["value"];

export function isCalloutTone(value: string): value is CalloutTone {
  return calloutTones.some((tone) => tone.value === value);
}
