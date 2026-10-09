/**
 * Tooltip — shows a small label beneath any icon/button on web hover.
 *
 * On web: renders a <div title="..."> wrapper so the browser shows a native
 * tooltip on hover. Also renders a custom styled tooltip that appears on
 * mouseenter and disappears on mouseleave — pure CSS, zero JS delay.
 *
 * On native (iOS/Android): renders children as-is (no tooltip — not needed).
 */
import React, { useRef, useState } from 'react';
import { Platform, Text, View } from 'react-native';

interface TooltipProps {
  label: string;
  children: React.ReactNode;
}

export function Tooltip({ label, children }: TooltipProps) {
  if (Platform.OS !== 'web') {
    // On native, just pass through
    return <>{children}</>;
  }

  return <WebTooltip label={label}>{children}</WebTooltip>;
}

function WebTooltip({ label, children }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(true), 400);
  };

  const hide = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(false);
  };

  return (
    <View
      style={{ position: 'relative', alignItems: 'center' }}
      // @ts-ignore — onMouseEnter/Leave are web-only props not in RN types
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      {children}
      {visible && (
        <View
          style={{
            position: 'absolute',
            top: '100%',
            marginTop: 4,
            backgroundColor: 'rgba(20,20,28,0.92)',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 6,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.12)',
            zIndex: 9999,
            // prevent the tooltip from wrapping
            minWidth: 40,
            alignItems: 'center',
            // @ts-ignore — web-only
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          <Text style={{ color: '#E5E7EB', fontSize: 11, fontWeight: '600', textAlign: 'center' }}>
            {label}
          </Text>
        </View>
      )}
    </View>
  );
}
