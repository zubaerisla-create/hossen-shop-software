import React from 'react';
import {
  Monitor,
  Code,
  Smartphone,
  Terminal,
  Cpu,
  Shield,
  HeartHandshake,
  Globe,
  Sparkles,
  HelpCircle
} from 'lucide-react';

const iconMap = {
  Monitor,
  Code,
  Smartphone,
  Terminal,
  Cpu,
  Shield,
  HeartHandshake,
  Globe,
  Sparkles
};

export type IconName = keyof typeof iconMap;

interface ServiceIconProps extends React.ComponentPropsWithoutRef<'svg'> {
  name: string;
  size?: number;
}

export function ServiceIcon({ name, size = 16, className, ...props }: ServiceIconProps) {
  const IconComponent = iconMap[name as IconName] || HelpCircle;
  return <IconComponent className={className} size={size} {...props} />;
}
