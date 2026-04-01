import {
  ArrowsLeftRightIcon,
  BirdIcon,
  BookOpenTextIcon,
  CameraIcon,
  ChartBarIcon,
  CheckIcon,
  ClockIcon,
  FileTextIcon,
  FloppyDiskIcon,
  HashIcon,
  LightbulbIcon,
  LightningIcon,
  LockIcon,
  NotePencilIcon,
  ParagraphIcon,
  PencilSimpleIcon,
  ShieldCheckIcon,
  SparkleIcon,
  TagIcon,
  TextAaIcon,
  WarningCircleIcon,
  type IconProps,
} from '@phosphor-icons/react';
import type { CSSProperties } from 'react';

const iconMap = {
  check: CheckIcon,
  chart: ChartBarIcon,
  book: BookOpenTextIcon,
  note: NotePencilIcon,
  save: FloppyDiskIcon,
  shield: ShieldCheckIcon,
  sparkle: SparkleIcon,
  pencil: PencilSimpleIcon,
  paragraph: ParagraphIcon,
  text: TextAaIcon,
  camera: CameraIcon,
  bird: BirdIcon,
  tag: TagIcon,
  file: FileTextIcon,
  warning: WarningCircleIcon,
  idea: LightbulbIcon,
  clock: ClockIcon,
  compare: ArrowsLeftRightIcon,
  lightning: LightningIcon,
  lock: LockIcon,
  hash: HashIcon,
} as const;

export type AppIconName = keyof typeof iconMap;

interface AppIconProps extends Omit<IconProps, 'alt'> {
  name: AppIconName;
  label?: string;
  decorative?: boolean;
  style?: CSSProperties;
}

export default function Icon({
  name,
  label,
  decorative = true,
  ...props
}: AppIconProps) {
  const Component = iconMap[name];

  if (!Component) return null;

  return decorative ? (
    <Component aria-hidden="true" {...props} />
  ) : (
    <Component aria-label={label ?? name} {...props} />
  );
}
