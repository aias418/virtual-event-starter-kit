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

import { format, utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';
import { DEFAULT_TIMEZONE } from '@lib/constants';

export function toTimeString(timeString: string, timeZone: string) {
  const utcDate = zonedTimeToUtc(timeString, DEFAULT_TIMEZONE);
  const localDate = utcToZonedTime(utcDate, timeZone);
  return format(localDate, 'HH:mm', { timeZone });
}

export function toDateString(timeString: string, timeZone: string) {
  const utcDate = zonedTimeToUtc(timeString, DEFAULT_TIMEZONE);
  const localDate = utcToZonedTime(utcDate, timeZone);
  return format(localDate, 'EEE MMM dd yyyy', { timeZone });
}


export function toLongDateString(timeString: string, timeZone: string) {
  const utcDate = zonedTimeToUtc(timeString, DEFAULT_TIMEZONE);
  const localDate = utcToZonedTime(utcDate, timeZone);
  return format(localDate, 'EEEE MMMM do yyyy', { timeZone });
}

export function toDateTimeString(timeString: string, timeZone: string) {
  const utcDate = zonedTimeToUtc(timeString, DEFAULT_TIMEZONE);
  const localDate = utcToZonedTime(utcDate, timeZone);
  return format(localDate, 'EEE MMM dd yyyy, HH:mm', { timeZone });
}
