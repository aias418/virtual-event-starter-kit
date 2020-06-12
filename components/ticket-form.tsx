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

import { useState, useRef } from 'react';
import cn from 'classnames';
import CheckIcon from '@components/icons/icon-check';
import { TicketGenerationState } from '@lib/constants';
import LoadingDots from './loading-dots';
import formStyles from './form.module.css';
import ticketFormStyles from './ticket-form.module.css';
import IconMural from './icons/icon-mural';

type FormState = 'default' | 'loading' | 'error';

type Props = {
  defaultUsername?: string;
  setTicketGenerationState: React.Dispatch<React.SetStateAction<TicketGenerationState>>;
  clientId: string;
  redirectURI: string;
};

export default function Form({ defaultUsername = '', setTicketGenerationState, clientId, redirectURI }: Props) {
  const [username, setUsername] = useState(defaultUsername);
  const [formState, setFormState] = useState<FormState>('default');
  const formRef = useRef<HTMLFormElement>(null);

  return formState === 'error' ? (
    <div>
      <div className={cn(formStyles['form-row'], ticketFormStyles['form-row'])}>
        <div className={cn(formStyles['input-label'], formStyles.error)}>
          <button
            type="button"
            className={cn(formStyles.submit, formStyles.error)}
            onClick={() => {
              setFormState('default');
              setTicketGenerationState('default');
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  ) : (
      <form
        ref={formRef}
      >
        <div className={cn(formStyles['form-row'], ticketFormStyles['form-row'])}>
          <div
            className={cn(
              formStyles.submit,
              formStyles['generate-with-github'],
              formStyles[formState]
            )}
          >
            <div className={ticketFormStyles.generateWithGithub}>
              <span className={ticketFormStyles.githubIcon}>
                <IconMural color="#fff" size={24} />
              </span>
              {formState === 'loading' ? (
                <LoadingDots size={4} />
              ) : (
                  username || 'Generate with MURAL'
                )}
            </div>
            {username ? (
              <span className={ticketFormStyles.checkIcon}>
                <CheckIcon color="#fff" size={24} />
              </span>
            ) : null}
          </div>
        </div>
      </form>
    );
}
