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
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Challenge } from '@lib/types';
import { getWithExpiry } from '@lib/local-storage';
import { toast } from 'react-toastify';
import styles from './challenge-section.module.css';
import LoadingDots from './loading-dots';
import useSiteSettingData from '@lib/hooks/use-site-setting';
import { REGISTER_MESSAGE } from '@lib/constants';
const ParseFront = require('parse');

type Props = {
  challenge: Challenge;
};

type FormState = 'default' | 'loading';

export default function ChallengeSection({ challenge: { name, points, type, description, code, typeformURL } }: Props) {
  const [hasSidebar, setHasSidebar] = useState(false);
  const [formState, setFormState] = useState<FormState>('default');

  // Security Check
  const { userData: currentUser, parseConfig } = useSiteSettingData();
  if (process.browser && (!currentUser || !currentUser.id)) {
    toast.error(REGISTER_MESSAGE);
    window.location.href = '/';
  }

  useEffect(() => {
    ParseFront.initialize(parseConfig.appId);
    ParseFront.serverURL = parseConfig.serverURL;
    setHasSidebar(!!typeformURL);
  }, []);

  const claimPoints = async () => {
    setFormState('loading');
    const currentUser = getWithExpiry('currentUser');
    if (!currentUser || !currentUser.id) return alert('You need to sign in to claim points through challenge.');
    const result = await ParseFront.Cloud.run('claimPoints', {code, participant: currentUser.name, siteId: parseConfig.siteId });
    setFormState('default');
    if (result) {
      if (result.status === 'success') {
        if (result.point > 0)
          toast.dark(`${result.point} Points were added to your totoal!`);
        else
          toast.dark('You already took this challenge and no point was added this time.');
      }
      if (result.status === 'error') {
        toast.error(result.message);
      }
    }
  }

  return (
    <div className={styles['main-section']}>
      <div className={styles['challenge-detail']}>
        <Link href="/challenges">
          <a className={cn(styles.backlink, { [styles.sidebar]: hasSidebar })}>
            <svg
              viewBox="0 0 24 24"
              width="24"
              height="24"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              shapeRendering="geometricPrecision"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Back to Challenges
          </a>
        </Link>
        <h1 title={name} className={styles['challenge-name']}>{name}</h1>
        <p className={styles['challenge-description']}>{description}</p>
      </div>
      {
        (typeformURL) && 
        <div className={styles['iframe-section']}>
          <iframe src={typeformURL}
            width="100%"
            style={{minWidth: 640, minHeight: 480, backgroundColor:'#f4f4f4', border: '1px solid #efefef'}}
            sandbox="allow-same-origin allow-scripts allow-popups">
          </iframe>
        </div>
      }
      <div>
        <button className={styles['claim-points']} disabled={formState === 'loading'} onClick={claimPoints}>
          {formState === 'loading' ? <LoadingDots size={4} /> : <>Claim Point</>}
        </button>
      </div>
    </div>
  );
}
