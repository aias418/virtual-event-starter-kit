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

import cn from 'classnames';
import Image from 'next/image';
import styleUtils from './utils.module.css';
import styles from './hero.module.css';
import { SiteSetting } from '@lib/types';

type Props = {
  siteSetting: SiteSetting;
};

export default function Hero({siteSetting}: Props) {
  return (
    <div className={styles.wrapper}>
      <div className={styles['logo-wrapper']}>
        <img
          alt="Mural Maze"
          className={styles.avatar}
          src="/maze-icon.png"
          title="Mural Maze"
          width={105}
          height={105}
          />
      </div>
      <h1 className={cn(styleUtils.appear, styleUtils['appear-third'], styles.hero)}>
        <span>Welcome to</span>
        <span>{siteSetting.siteName}</span>
      </h1>
      <p className={cn(
        styles.description
      )} > Enter the MURAL maze
      </p>
      <h2
        className={cn(
          styleUtils.appear,
          styleUtils['appear-third'],
          styleUtils['show-on-tablet'],
          styles.description
        )}
      >
        {siteSetting.metaDescription}
      </h2>
    </div>
  );
}
