/**
 * Load locale messages utility
 */

import type { LocaleMessages } from '../../../types';

export async function loadLocaleMessages(
  locale: string,
  loader: () => Promise<LocaleMessages> | LocaleMessages
): Promise<LocaleMessages> {
  const messages = await loader();
  return messages;
}