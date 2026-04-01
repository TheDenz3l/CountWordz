import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  BirdIcon,
  BookOpenTextIcon,
  ChartBarIcon,
  CheckIcon,
  FileTextIcon,
  NotePencilIcon,
  PencilSimpleIcon,
  TagIcon,
  TextAaIcon,
} from '@phosphor-icons/react/ssr';

const iconMap = {
  check: CheckIcon,
  chart: ChartBarIcon,
  book: BookOpenTextIcon,
  note: NotePencilIcon,
  pencil: PencilSimpleIcon,
  text: TextAaIcon,
  bird: BirdIcon,
  tag: TagIcon,
  file: FileTextIcon,
} as const;

type IconName = keyof typeof iconMap;

export function renderIconHtml(
  name: IconName,
  options: { className?: string; size?: number; weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone' } = {},
) {
  const Component = iconMap[name];
  return renderToStaticMarkup(
    createElement(Component, {
      'aria-hidden': 'true',
      className: options.className,
      size: options.size ?? 18,
      weight: options.weight ?? 'regular',
    }),
  );
}
