import React from 'react';
import { ProvenanceType } from '../types';
import { Database, Code2, Sparkles, AlertCircle } from 'lucide-react';

interface ProvenanceBadgeProps {
  type: ProvenanceType;
  customLabel?: string;
  size?: 'sm' | 'md';
}

export const ProvenanceBadge: React.FC<ProvenanceBadgeProps> = ({
  type,
  customLabel,
  size = 'sm',
}) => {
  const config = {
    inventory: {
      label: customLabel || 'Inventory Metadata',
      icon: Database,
      tag: '[Inventory Metadata]',
      badgeStyle: 'text-sky-400 bg-sky-950/60 border-sky-800/80',
      dotColor: 'bg-sky-400',
    },
    code: {
      label: customLabel || 'Code/Artifact Analysis',
      icon: Code2,
      tag: '[Code/Artifact Analysis]',
      badgeStyle: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/80',
      dotColor: 'bg-emerald-400',
    },
    ai: {
      label: customLabel || 'AI Inference',
      icon: Sparkles,
      tag: '[AI Inference]',
      badgeStyle: 'text-indigo-300 bg-indigo-950/60 border-indigo-800/80',
      dotColor: 'bg-indigo-400',
    },
    sme: {
      label: customLabel || 'Unknown / SME Confirmation Needed',
      icon: AlertCircle,
      tag: '[Unknown / SME Confirmation Needed]',
      badgeStyle: 'text-amber-300 bg-amber-950/70 border-amber-800/90 font-medium',
      dotColor: 'bg-amber-400 animate-pulse',
    },
  }[type];

  const Icon = config.icon;

  if (size === 'sm') {
    return (
      <span
        title={`Source Provenance: ${config.label}`}
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono border tracking-tight ${config.badgeStyle}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
        <Icon className="w-3 h-3 opacity-90" />
        <span>{config.tag}</span>
      </span>
    );
  }

  return (
    <span
      title={`Source Provenance: ${config.label}`}
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded text-xs font-mono border tracking-tight ${config.badgeStyle}`}
    >
      <span className={`w-2 h-2 rounded-full ${config.dotColor}`} />
      <Icon className="w-3.5 h-3.5 opacity-90" />
      <span>{config.tag}</span>
    </span>
  );
};
