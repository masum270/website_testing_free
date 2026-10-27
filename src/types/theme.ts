export type ThemeId = 'emerald' | 'indigo' | 'rose' | 'amber' | 'cyan' | 'dark';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  primary: string;
  bgGradient: string;
}

export const AVAILABLE_THEMES: ThemeConfig[] = [
  { id: 'emerald', name: 'Emerald Green', primary: '#10B981', bgGradient: 'from-emerald-900/20 to-slate-900' },
  { id: 'indigo', name: 'Royal Indigo', primary: '#6366F1', bgGradient: 'from-indigo-900/20 to-slate-900' },
  { id: 'rose', name: 'Rose Red', primary: '#F43F5E', bgGradient: 'from-rose-900/20 to-slate-900' },
  { id: 'amber', name: 'Warm Amber', primary: '#F59E0B', bgGradient: 'from-amber-900/20 to-slate-900' },
  { id: 'cyan', name: 'Ocean Cyan', primary: '#06B6D4', bgGradient: 'from-cyan-900/20 to-slate-900' },
  { id: 'dark', name: 'Midnight Dark', primary: '#64748B', bgGradient: 'from-slate-900 to-black' },
];
