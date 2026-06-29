export const FONT_FAMILY_KEYS = ['Pretendard', 'Inter', 'DM Sans', 'Nunito Sans'] as const;
export type FontFamilyKey = (typeof FONT_FAMILY_KEYS)[number];

export function isFontFamilyKey(value: string | null): value is FontFamilyKey {
  return !!value && (FONT_FAMILY_KEYS as readonly string[]).includes(value);
}
