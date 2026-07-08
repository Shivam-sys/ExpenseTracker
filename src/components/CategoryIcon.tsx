import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

interface Props {
  iconId: string;
  color: string;
  size?: number;
  strokeWidth?: number;
}

/**
 * Glyph icons ported 1:1 from the design SVGs (24×24 viewBox). `custom`
 * categories fall back to a filled dot, matching the handoff.
 */
export function CategoryIcon({
  iconId,
  color,
  size = 18,
  strokeWidth = 1.5,
}: Props) {
  if (iconId === 'custom') {
    const d = Math.round(size * 0.6);
    return (
      <View
        style={{
          width: d,
          height: d,
          borderRadius: d / 2,
          backgroundColor: color,
        }}
      />
    );
  }

  const common = {
    stroke: color,
    strokeWidth,
    fill: 'none' as const,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {iconId === 'coffee' && (
        <>
          <Path
            d="M5.5 9.5h11v7a3.5 3.5 0 01-3.5 3.5h-4a3.5 3.5 0 01-3.5-3.5v-7z"
            {...common}
          />
          <Path d="M16.5 11h1.8a2 2 0 010 4h-1.8" {...common} />
          <Path d="M8.5 4.5c-.6.7-.6 1.3 0 2M11.5 4.5c-.6.7-.6 1.3 0 2" {...common} />
        </>
      )}
      {iconId === 'food' && (
        <>
          <Path
            d="M7 3.5v6.2c0 1-.8 1.8-1.8 1.8v0c-1 0-1.8-.8-1.8-1.8V3.5"
            {...common}
          />
          <Path d="M5.2 11.5V20.5" {...common} />
          <Path
            d="M18.5 3.5c-1.4.5-2.3 2-2.3 4.4 0 2 .8 3.2 2 3.6v9"
            {...common}
          />
        </>
      )}
      {iconId === 'transit' && (
        <>
          <Path
            d="M5 7a2 2 0 012-2h10a2 2 0 012 2v8.5a1 1 0 01-1 1H6a1 1 0 01-1-1V7z"
            {...common}
          />
          <Path d="M5 12h14" {...common} />
          <Path d="M7.5 19.5v-2.3M16.5 19.5v-2.3" {...common} />
        </>
      )}
      {iconId === 'fun' && (
        <>
          <Path
            d="M6 8.5h12a3 3 0 013 3.4l-.5 2.7a2.2 2.2 0 01-4 .9l-1-1.5H8.5l-1 1.5a2.2 2.2 0 01-4 -.9l-.5-2.7A3 3 0 016 8.5z"
            {...common}
          />
          <Path d="M7.3 10.7v2.4M6.1 11.9h2.4" {...common} />
          <Circle cx="16.7" cy="11" r="0.9" fill={color} />
          <Circle cx="15" cy="12.7" r="0.9" fill={color} />
        </>
      )}
      {iconId === 'bills' && (
        <>
          <Path
            d="M6.5 3.5h11v17l-2.2-1.4-2 1.4-2-1.4-2 1.4-2-1.4-.8.5V3.5z"
            {...common}
          />
          <Path d="M9 8h6M9 11.5h6M9 15h3.5" {...common} />
        </>
      )}
      {iconId === 'shopping' && (
        <>
          <Path
            d="M7 8h10l-.9 11a1.5 1.5 0 01-1.5 1.4H9.4A1.5 1.5 0 017.9 19L7 8z"
            {...common}
          />
          <Path d="M9.2 8V6.2a2.8 2.8 0 015.6 0V8" {...common} />
        </>
      )}
    </Svg>
  );
}

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
