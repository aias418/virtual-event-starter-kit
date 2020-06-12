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

type Props = { size?: number | string };

export default function IconZoom({ size = 20 }: Props) {
  return (
    <svg width={size} viewBox="0 0 48 48">
      <circle cx="24" cy="24" r="20" fill="#2196f3"/><path fill="#fff" d="M29,31H14c-1.657,0-3-1.343-3-3V17h15c1.657,0,3,1.343,3,3V31z"/><polygon fill="#fff" points="37,31 31,27 31,21 37,17"/>
    </svg>
  );
}
