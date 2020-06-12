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
import Tilt from 'vanilla-tilt';
import { useRef, useEffect, useState } from 'react';
import useSiteSettingData from '@lib/hooks/use-site-setting';
import { TicketGenerationState } from '@lib/constants';
import isMobileOrTablet, { isSmallerScreen } from '@lib/is-mobile-or-tablet';
import { scrollTo } from '@lib/smooth-scroll';
import styles from './ticket.module.css';
import styleUtils from './utils.module.css';
import TicketForm from './ticket-form';
import TicketVisual from './ticket-visual';
import TicketActions from './ticket-actions';
import TicketCopy from './ticket-copy';
import { DATE, SITE_NAME } from '@lib/constants';
import Form from './form';

type Props = {
  sharePage?: boolean;
  appId: string;
  serverURL: string;
  siteId: string;
  clientId: string;
  redirectURI: string;
};

export default function Ticket({ sharePage, appId, serverURL, siteId, clientId, redirectURI }: Props) {
  const ticketRef = useRef<HTMLDivElement>(null);
  const [ticketGenerationState, setTicketGenerationState] = useState<TicketGenerationState>(
    'default'
  );
  const divRef = useRef<HTMLDivElement>(null);
  const { userData: { username, name, ticketNumber } } = useSiteSettingData();

  useEffect(() => {
    if (ticketRef.current && !window.matchMedia('(pointer: coarse)').matches) {
      Tilt.init(ticketRef.current, {
        glare: true,
        max: 5,
        'max-glare': 0.16,
        'full-page-listening': true
      });
    }
  }, [ticketRef]);

  useEffect(() => {
    if (!sharePage && divRef && divRef.current && isMobileOrTablet()) {
      scrollTo(divRef.current, -30);
    }
  }, [divRef, sharePage]);

  return (
    <>
      <div ref={divRef} className={styles['user-info']}>
        <div className={styles['ticket-text']}>
          <h2 className={cn(styles.hero, styleUtils.appear, styleUtils['appear-first'])}>
            You're in.
          </h2>
          <p className={cn(styles.description, styleUtils.appear, styleUtils['appear-second'])}>
            Grab your pass, start to wonder...
          </p>
        </div>
        <div
          ref={ticketRef}
          className={cn(styles['ticket-visual'], styleUtils.appear, styleUtils['appear-fourth'])}
        >
          <TicketVisual
            username={username}
            name={name}
            ticketNumber={ticketNumber}
            ticketGenerationState={ticketGenerationState}
            size={isSmallerScreen() ? 1: 0.75}
          />
        </div>
        <div className={cn(styleUtils.appear, styleUtils['appear-third'])}>
          {!sharePage ? (
            <TicketForm
              defaultUsername={username}
              setTicketGenerationState={setTicketGenerationState}
              clientId={clientId}
              redirectURI={redirectURI}
            />
          ) : (
              <Form sharePage appId={appId} serverURL={serverURL} siteId={siteId} />
            )}
        </div>
      </div>
      <div className={styles['ticket-visual-wrapper']}>
        <div className={styles['video-container']}>
          <iframe className={styles['video-iframe']} width={350} src="https://www.youtube.com/embed/3Evh8RQ0KqA"></iframe>
        </div>
        <h4 className={styles['next-step-header']}>Next Steps</h4>
        <p className={cn(styles['next-steps'], styleUtils.appear, styleUtils['appear-third'])}>
          1. Visit the <a href="/maze"><b>MAZE</b></a> and just take time to explore
        </p>
        <p className={cn(styles['next-steps'], styleUtils.appear, styleUtils['appear-second'])}>
          2. Click the <a href="/schedule"><b>Schedule</b></a> of events, browse and book your place - before the sessions fill up!
        </p>
        <p className={cn(styles['next-steps'], styleUtils.appear, styleUtils['appear-second'])}>
          3. See the list of amazing <a href="/speakers"><b>Speakers</b></a>, facilitators and entertainers that will help you escape, explore and reflect throughout the event
        </p>
        <p className={cn(styles['next-steps'], styleUtils.appear, styleUtils['appear-second'])}>
          4. Grab your downloads and other goodies from the <a href="/shop"><b>Shop</b></a>
        </p>
      </div>
    </>
  );
}
