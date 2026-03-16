import { OfficeLayout } from '../types';

const STORAGE_KEY = 'paperclip_office_layouts';

export const PREDEFINED_LAYOUTS = [
  {
    id: 'interconnected_office',
    name: 'Interconnected Office',
    url: '/pixel-assets/assets/interconnected-layout.json',
  },
  {
    id: 'compact_office',
    name: 'Compact Office',
    url: '/pixel-assets/assets/default-layout-1.json',
  },
];

export function getPredefinedLayouts() {
  return PREDEFINED_LAYOUTS;
}

export interface LayoutEntry {
  id: string;
  name: string;
  layout: OfficeLayout;
}

export function getLayouts(): LayoutEntry[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch (e) {
    return [];
  }
}

export function saveLayout(id: string, name: string, layout: OfficeLayout) {
  const layouts = getLayouts();
  const index = layouts.findIndex(l => l.id === id);
  if (index >= 0) {
    layouts[index] = { id, name, layout };
  } else {
    layouts.push({ id, name, layout });
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(layouts));
}

export function deleteLayout(id: string) {
  const layouts = getLayouts().filter(l => l.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(layouts));
}

export function getLayoutById(id: string): LayoutEntry | undefined {
  return getLayouts().find(l => l.id === id);
}

/** Pre-populate CEO Room if it doesn't exist */
export async function ensureCEORoom(defaultLayoutUrl: string) {
  const layouts = getLayouts();
  if (layouts.some(l => l.id === 'ceo_room')) return;

  try {
    const res = await fetch(defaultLayoutUrl);
    const layout = await res.json();
    saveLayout('ceo_room', 'CEO Room', layout);
  } catch (e) {
    console.error('Failed to pre-populate CEO Room:', e);
  }
}

export async function fetchPredefinedLayout(url: string): Promise<OfficeLayout | null> {
  try {
    const res = await fetch(url);
    return await res.json();
  } catch (e) {
    console.error('Failed to fetch predefined layout:', e);
    return null;
  }
}
