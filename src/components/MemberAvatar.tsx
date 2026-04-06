'use client';

import { memo } from 'react';

const COLORS = [
  'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300',
  'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300',
  'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300',
];

function colorFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) & 0xffff;
  return COLORS[hash % COLORS.length];
}

const SIZES = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-base',
  lg: 'w-20 h-20 text-2xl',
};

interface Props {
  name: string;
  photo?: string | null;
  size?: keyof typeof SIZES;
  onClick?: () => void;
}

export const MemberAvatar = memo(function MemberAvatar({ name, photo, size = 'sm', onClick }: Props) {
  const cls = SIZES[size];
  const clickable = onClick
    ? 'cursor-pointer ring-2 ring-transparent hover:ring-primary-400 transition-all'
    : '';

  if (photo) {
    return (
      <img
        src={photo}
        alt={name}
        onClick={onClick}
        className={`${cls} rounded-full object-cover shrink-0 ${clickable}`}
      />
    );
  }

  const initials = name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('');

  return (
    <div
      onClick={onClick}
      className={`${cls} rounded-full shrink-0 font-semibold flex items-center justify-center select-none ${colorFor(name)} ${clickable}`}
    >
      {initials}
    </div>
  );
});
