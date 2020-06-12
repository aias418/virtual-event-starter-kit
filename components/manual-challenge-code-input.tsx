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
import styles from './manual-challenge-code-input.module.css';
import { toast } from 'react-toastify';
import LoadingDots from './loading-dots';
import useSiteSettingData from '@lib/hooks/use-site-setting';
const ParseFront = require('parse');


type FormState = 'default' | 'loading';

export default function ManualChallengeCodeInput() {
  const [code, setCode] = useState('');
  const [focused, setFocused] = useState(false);
  const [formState, setFormState] = useState<FormState>('default');

  const { parseConfig } = useSiteSettingData();

  useEffect(() => {
    ParseFront.initialize(parseConfig.appId);
    ParseFront.serverURL = parseConfig.serverURL;
  }, [])

  const claimPoints = async () => {
    setFormState('loading');
    const currentUser = getWithExpiry('currentUser');
    if (!currentUser || !currentUser.id) {
      setFormState('default');
      return alert('You need to sign in to claim points through challenge.');
    }
    const result = await ParseFront.Cloud.run('claimPoints', {code, participant: currentUser.name, siteId: parseConfig.siteId});

    // Give user feedback based on cloud code return value
    if (result) {
      if (result.status === 'success') {
        if (result.point > 0)
          toast.dark(`${result.point} Points were added to your totoal!`);
        else
          toast.warning('You already took this challenge and no point was added this time.');
        setCode('')
      }
      if (result.status === 'error') {
        toast.error(result.message);
      }
    }
    setFormState('default');
  }

  return (
    <div className={styles['form-wrapper']}>
      <div className={styles['form-row']}>
        <label
          htmlFor="email-input-field"
          className={cn(styles['input-label'], {
            [styles.focused]: focused
          })}
        >
          <input
            className={styles.input}
            autoComplete="off"
            id="challenge-input-field"
            value={code}
            onChange={e => setCode(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Enter challenge code to claim points"
            aria-label="Challenge code"
            required
          />
        </label>
        <button
          type="submit"
          className={cn(styles.submit, styles.register, styles[formState])}
          disabled={formState === 'loading'}
          onClick={claimPoints}
        >
          {formState === 'loading' ? <LoadingDots size={4} /> : <>Submit</>}
        </button>
      </div>  
    </div>
  );
}
