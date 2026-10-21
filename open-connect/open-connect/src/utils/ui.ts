import { Alert, Platform, Share } from 'react-native';

/**
 * Cross-platform notification helpers.
 * RN Web's Alert.alert / Share.share are no-ops in the browser, which made
 * several controls silently dead — these fall back to native browser APIs.
 */

export function notify(title: string, message?: string): void {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.alert(message ? `${title}\n\n${message}` : title);
    return;
  }
  Alert.alert(title, message);
}

export function confirmAction(title: string, message: string, onConfirm: () => void): void {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: 'No', style: 'cancel' },
    { text: 'Yes', onPress: onConfirm },
  ]);
}

export async function shareContent(options: { title?: string; message?: string; url?: string }): Promise<void> {
  const shareUrl = options.url ?? (Platform.OS === 'web' && typeof window !== 'undefined' ? window.location.href : 'https://openconnect.app');

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const text = `${options.title ? `${options.title} — ` : ''}${options.message ?? ''} ${shareUrl}`.trim();
    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({ title: options.title, text, url: shareUrl });
        return;
      }
    } catch {
      // User dismissed the native share sheet — nothing else to do.
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      notify('Link copied', 'The link was copied to your clipboard.');
    } catch {
      notify('Share', text);
    }
    return;
  }

  try {
    await Share.share({ message: `${options.message ?? ''} ${shareUrl}`.trim() });
  } catch {
    // User closed the share sheet.
  }
}
