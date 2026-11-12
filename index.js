// Host half of the session-tabs bundle; the Client module owns the rendering.
// The Config export surfaces the plugin's settings namespace (Settings →
// Plugins → this bundle's page). `volatile()` fields update in place — the
// toggle does not restart the plugin.
import z from '@deepseek-ai/schemastery';

export const name = 'session-tabs';

export const Config = z.object({
  /** Master switch for the tab strip and its entry points. */
  enabled: z.boolean().default(true).volatile(),
});

export function apply() {}
