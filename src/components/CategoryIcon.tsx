import React from 'react';
import Svg, { Path } from 'react-native-svg';

/**
 * Small stroke glyphs still used by the chrome (delete affordance, steppers).
 * Category icons now come from phosphor-react-native via theme/categories.ts.
 */
export function TrashIcon({
  size = 17,
  color,
  strokeWidth = 1.8,
}: {
  size?: number;
  color: string;
  strokeWidth?: number;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 7h14M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2m-9 0l1 13a2 2 0 002 2h6a2 2 0 002-2l1-13"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

export function ChevronIcon({
  dir = 'right',
  size = 12,
  color,
  strokeWidth = 1.6,
}: {
  dir?: 'left' | 'right';
  size?: number;
  color: string;
  strokeWidth?: number;
}) {
  const w = (size * 7) / 12;
  return (
    <Svg width={w} height={size} viewBox="0 0 7 12" fill="none">
      <Path
        d={dir === 'right' ? 'M1 1l5 5-5 5' : 'M6 1L1 6l5 5'}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}
