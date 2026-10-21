// ── PlaybackCoordinator ──────────────────────────────────────────────────────
// Global mutual-exclusion between the three playback channels (song / podcast /
// RJ live). Any channel that is about to start or resume playback calls
// `yieldTo(channel)`, which invokes the registered stop handlers for every
// other channel. This prevents two "now playing" bars / mini-players from
// appearing simultaneously and stops Audio.Sound / progress intervals from
// running in the background when the user switches sections.
//
// Each Provider registers its own stop handler on mount and unregisters on
// unmount, so this module has no React dependencies and can be imported from
// any context without creating provider-ordering constraints.

export type PlaybackChannel = 'song' | 'podcast' | 'rjLive';

type StopHandler = () => void;

const handlers = new Map<PlaybackChannel, StopHandler>();

/**
 * Register a channel's stop handler. Returns an unregister function to be
 * called on provider unmount. Re-registering the same channel replaces the
 * previous handler (useful if the stop logic depends on state).
 */
export function registerPlaybackChannel(
  channel: PlaybackChannel,
  handler: StopHandler,
): () => void {
  handlers.set(channel, handler);
  return () => {
    if (handlers.get(channel) === handler) handlers.delete(channel);
  };
}

/**
 * Tell every other channel to stop. Safe to call from a component's event
 * handler or from inside a provider action. Errors thrown by a handler are
 * caught and logged so one misbehaving channel cannot block the new play.
 */
export function yieldTo(channel: PlaybackChannel): void {
  handlers.forEach((handler, other) => {
    if (other === channel) return;
    try {
      handler();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn(`[PlaybackCoordinator] stop failed for "${other}"`, err);
    }
  });
}
