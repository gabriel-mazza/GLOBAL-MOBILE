export interface Tema {
  bg: string;
  card: string;
  text: string;
  muted: string;
  primary: string;
  onPrimary: string;
  accent: string;
  onAccent: string;
  border: string;
  ok: string;
  warn: string;
  danger: string;
}


export const temaPadrao: Tema = {
  bg: '#F3F5F7',
  card: '#FFFFFF',
  text: '#10222F',
  muted: '#4A5B68',
  primary: '#0F2A43',
  onPrimary: '#FFFFFF',
  accent: '#FFC20E',
  onAccent: '#10222F',
  border: '#C9D3DB',
  ok: '#1B7F4F',
  warn: '#9A5B00',
  danger: '#B3261E',
};

export const temaContraste: Tema = {
  bg: '#000000',
  card: '#000000',
  text: '#FFFFFF',
  muted: '#E6E6E6',
  primary: '#FFD400',
  onPrimary: '#000000',
  accent: '#FFD400',
  onAccent: '#000000',
  border: '#FFFFFF',
  ok: '#4DFF9A',
  warn: '#FFD400',
  danger: '#FF8A80',
};
