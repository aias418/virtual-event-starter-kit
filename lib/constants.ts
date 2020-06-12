/**
 * Copyright 2020 Vercel Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export const SITE_URL = 'https://renaissance.mural.global';
export const SITE_ORIGIN = process.env.NEXT_PUBLIC_SITE_ORIGIN || new URL(SITE_URL).origin;
export const TWITTER_USER_NAME = 'mural';
export const BRAND_NAME = 'MURAL';
export const SITE_NAME_MULTILINE = ['MURAL', 'Renaissance 2021'];
export const SITE_NAME = 'MURAL Renaissance 2021';
export const META_DESCRIPTION =
  'MURAL Renaissance 2021 event.';
export const SITE_DESCRIPTION =
  'MURAL Renaissance 2021 event.';
export const DATE = 'March, 2021';
export const SHORT_DATE = 'Feb 27 - 9:00am PST';
export const FULL_DATE = 'Feb 27th 9am Pacific Time (GMT-7)';
export const TWEET_TEXT = META_DESCRIPTION;
export const COOKIE = 'user-id';

// Placeholder / example for different Ticket styles. In MURAL Fuel - we may create a new style which will make ticket into a "drivers license" to match the theme
export const TICKET_THEMES = ['TICKET', 'LICENSE'];
export const SELECTED_TICKET_THEME = 'TICKET';

export const MAIN_EMBED_URL = 'https://beta.mural.co/embed/11070c01-e7c3-4b90-a6f2-a8eb6bf7ca82';

// Remove process.env.NEXT_PUBLIC_... below and replace them with
// strings containing your own privacy policy URL and copyright holder name
export const LEGAL_URL = process.env.NEXT_PUBLIC_PRIVACY_POLICY_URL;
export const COPYRIGHT_HOLDER = process.env.NEXT_PUBLIC_COPYRIGHT_HOLDER;

export const CODE_OF_CONDUCT =
  '';
export const REPO = '';
export const SAMPLE_TICKET_NUMBER = 1234;

export const DEFAULT_TIMEZONE = 'America/Los_Angeles';

export type TicketGenerationState = 'default' | 'loading';

export const REGISTER_MESSAGE = 'Please register to explore this page.';
export const SUPERADMIN = 'alfred@gmail.com';
//export const SUPERADMIN = 'steves@mural.co'