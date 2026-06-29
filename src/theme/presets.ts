/**
 * Minimals UI 표준 컬러 프리셋. Settings drawer 의 Presets 섹션에서 선택.
 * 각 프리셋은 primary 컬러의 5단계 + contrastText 를 가진다.
 */

export interface PresetColor {
  lighter: string;
  light: string;
  main: string;
  dark: string;
  darker: string;
  contrastText: string;
}

export interface Preset {
  key: PresetKey;
  label: string;
  color: PresetColor;
}

export const PRESETS = {
  default: {
    lighter: '#C8FAD6',
    light: '#5BE49B',
    main: '#00A76F',
    dark: '#007867',
    darker: '#004B50',
    contrastText: '#FFFFFF',
  },
  cyan: {
    lighter: '#CCF4FE',
    light: '#68CDF9',
    main: '#078DEE',
    dark: '#0351AB',
    darker: '#012972',
    contrastText: '#FFFFFF',
  },
  purple: {
    lighter: '#EBD6FD',
    light: '#B985F4',
    main: '#7635DC',
    dark: '#431A9E',
    darker: '#200A69',
    contrastText: '#FFFFFF',
  },
  blue: {
    lighter: '#D1E9FC',
    light: '#76B0F1',
    main: '#2065D1',
    dark: '#103996',
    darker: '#061B64',
    contrastText: '#FFFFFF',
  },
  orange: {
    lighter: '#FEF4D4',
    light: '#FED680',
    main: '#FDA92D',
    dark: '#B66816',
    darker: '#793908',
    contrastText: '#1C252E',
  },
  red: {
    lighter: '#FFE3D5',
    light: '#FFC1AC',
    main: '#FF3030',
    dark: '#B71833',
    darker: '#7A0930',
    contrastText: '#FFFFFF',
  },
} as const satisfies Record<string, PresetColor>;

export type PresetKey = keyof typeof PRESETS;

export const PRESET_LIST: Preset[] = [
  { key: 'default', label: 'Green', color: PRESETS.default },
  { key: 'cyan',    label: 'Cyan',   color: PRESETS.cyan },
  { key: 'purple',  label: 'Purple', color: PRESETS.purple },
  { key: 'blue',    label: 'Blue',   color: PRESETS.blue },
  { key: 'orange',  label: 'Orange', color: PRESETS.orange },
  { key: 'red',     label: 'Red',    color: PRESETS.red },
];

export function isPresetKey(value: string): value is PresetKey {
  return value in PRESETS;
}
