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
import styles from './footer.module.css';
import { SiteSetting } from '@lib/types';

type Props = {
  siteSetting: SiteSetting;
};

export default function Footer({ siteSetting }: Props) {
  return (
    <footer className={cn(styles.footer)}>
      <div className={styles['footer-legal']}>
        <div className={styles['footer-copyright']}>
          Copyright © {`${new Date().getFullYear()} `} { siteSetting.copyrightText || `${ siteSetting.siteName }.`} All
          rights reserved.
        </div>
        <div className={styles['footer-center-group']}>
          <p className={styles['footer-paragraph']}>
            <a
              href={ siteSetting.githubRepo }
              className={styles['footer-link']}
              target="_blank"
              rel="noopener noreferrer"
            >
              Source Code
            </a>
          </p>
          <div className={styles['footer-separator']} />
          
        </div>
      </div>
    </footer>
  );
}
