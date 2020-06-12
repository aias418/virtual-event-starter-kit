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

import { useState } from 'react';
import cn from 'classnames';
import useConfData from '@lib/hooks/use-conf-data';
import useSiteSettingData from '@lib/hooks/use-site-setting';
import { useRouter } from 'next/router';
import FormError from '@lib/form-error';
import { setWithExpiry } from '@lib/local-storage';
import LoadingDots from './loading-dots';
import styleUtils from './utils.module.css';
import styles from './form.module.css';
import useEmailQueryParam from '@lib/hooks/use-email-query-param';
import validator from 'validator';
import { PARTICIPANT_MODEL_NAME } from '@lib/model-names';

const ParseFront = require('parse');


type FormState = 'default' | 'loading' | 'error';

type Props = {
  sharePage?: boolean;
  appId: string;
  serverURL: string;
  siteId: string;
};

export default function Form({ appId, serverURL, sharePage, siteId }: Props) {
  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [errorTryAgain, setErrorTryAgain] = useState(false);
  const [focused, setFocused] = useState(false);
  const [formState, setFormState] = useState<FormState>('default');
  const { setPageState } = useConfData();
  const { setUserData } = useSiteSettingData();
  const router = useRouter();
  useEmailQueryParam('email', setEmail);

  ParseFront.initialize(appId);
  ParseFront.serverURL = serverURL;

  return formState === 'error' ? (
    <div
      className={cn(styles.form, {
        [styles['share-page']]: sharePage
      })}
    >
      <div className={styles['form-row']}>
        <div className={cn(styles['input-label'], styles.error)}>
          <div className={cn(styles.input, styles['input-text'])}>{errorMsg}</div>
          <button
            type="button"
            className={cn(styles.submit, styles.register, styles.error)}
            onClick={() => {
              setFormState('default');
              setErrorTryAgain(true);
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  ) : (
    <form
      className={cn(styles.form, {
        [styles['share-page']]: sharePage,
        [styleUtils.appear]: !errorTryAgain,
        [styleUtils['appear-fifth']]: !errorTryAgain && !sharePage,
        [styleUtils['appear-third']]: !errorTryAgain && sharePage
      })}
      onSubmit={async e => {
        e.preventDefault();
        if (formState === 'default') {
          setFormState('loading');
          
          if (!validator.isEmail(email)) {
            setErrorMsg('Invalid email');
            setFormState('error');
            return;
          }
          
          // check if the entered email is in participant list as it's invite-only for now.
          const participantQuery = new ParseFront.Query(PARTICIPANT_MODEL_NAME);
          participantQuery.equalTo('t__status', 'Published');
          participantQuery.equalTo('Email', email);
          const currentParticipant = await participantQuery.first();

          if (!currentParticipant) {
            setErrorMsg('This event is invite-only.');
            setFormState('error');
            return;
          }
          const ticket = Math.floor(100000 + Math.random() * 900000);
          const params = {
            id: currentParticipant.id,
            ticket,
            name: `${currentParticipant.get("First_Name") || ''} ${currentParticipant.get('Surname') || ''}`,
            username: currentParticipant.get("Email"),
            isAdmin: currentParticipant.get("Admin") || false
          };
          setWithExpiry('currentUser', params, 24 * 60 * 60 * 1000);

          if (sharePage) {
            const queryString = Object.keys(params)
              .map(
                key =>
                  `${encodeURIComponent(key)}=${encodeURIComponent(
                    params[key as keyof typeof params] || ''
                  )}`
              )
              .join('&');
            router.replace(`/?${queryString}`, '/');
          } else {
            setUserData(params);
            setPageState('ticket');
          } 
        } else {
          setFormState('default');
        }
      }}
    >
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
            type="email"
            id="email-input-field"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Enter your email to check the guest list"
            aria-label="Your email address"
            required
          />
        </label>
        <button
          type="submit"
          className={cn(styles.submit, styles.register, styles[formState])}
          disabled={formState === 'loading'}
        >
          {formState === 'loading' ? <LoadingDots size={4} /> : <>Register</>}
        </button>
      </div>
    </form>
  );
}
