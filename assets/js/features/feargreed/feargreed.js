import { el } from '../../core/dom.js';
import { clamp } from '../../core/format.js';
import { i18n } from '../../i18n/i18n.js';

function labelFor(v) {
  if (!isFinite(v)) return '—';
  if (v <= 24) return 'Extreme Fear';
  if (v <= 44) return 'Fear';
  if (v <= 55) return 'Neutral';
  if (v <= 75) return 'Greed';
  return 'Extreme Greed';
}

function labelForRu(v) {
  if (!isFinite(v)) return '—';
  if (v <= 24) return 'Сильный страх';
  if (v <= 44) return 'Страх';
  if (v <= 55) return 'Нейтрально';
  if (v <= 75) return 'Жадность';
  return 'Сильная жадность';
}

export function renderFearGreed(container, fg) {
  container.innerHTML = '';
  const v = Number(fg?.value);
  const clamped = clamp(isFinite(v) ? v : 50, 0, 100);

  const isRu = i18n.lang() === 'ru';
  const lbl = isRu ? labelForRu(clamped) : labelFor(clamped);

  const chip = el('div', { class: 'fg-chip' }, [
    el('span', { class: 'fg-chip__label', text: i18n.t('global.fearGreed') }),
    el('span', { class: 'fg-chip__val', text: isFinite(v) ? String(v) : '—' }),
    el('span', { class: 'fg-chip__label', text: lbl })
  ]);

  const bar = el('div', { class: 'fg-bar', 'aria-hidden': 'true' }, [
    el('div', { class: 'fg-bar__fill', style: `width:${clamped}% ; background: ${clamped < 45 ? 'var(--neg)' : clamped > 55 ? 'var(--pos)' : 'var(--warn)'}` })
  ]);

  container.append(chip, bar);
}
