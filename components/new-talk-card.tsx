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
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { parseISO, format, isBefore, isAfter } from 'date-fns';
import { toTimeString } from '@lib/date-time-helper';
import { Talk, Participant, MinimumTalk } from '@lib/types';
import { toast } from 'react-toastify';
import styles from './talk-card.module.css';
import useSiteSettingData from '@lib/hooks/use-site-setting';
import IconCheck from './icons/icon-check';
import { TALK_MODEL_NAME, PARTICIPANT_MODEL_NAME, TALK_WRAP_MODEL_NAME } from '@lib/model-names';
import { isMineTimeslotAvailable, mineAbracademyConditionCheck } from '@lib/check-participants';
const ParseFront = require('parse');

type Props = {
  key: string;
  talk: Talk;
  showTime: boolean;
};

// Talk card in Schedule Page / Stage section
export default function TalkCard({ talk: currentTalk, showTime }: Props) {
  const { title, slug, speakers, start, end, participants, max_capacity, self_assign, categories } = currentTalk;
  const [isTalkLive, setIsTalkLive] = useState(false);
  const [startAndEndTime, setStartAndEndTime] = useState('');
  const [state, setState] = useState({
    alreadyBooked: false,
    remainingSeats: 0,
    showRemainingSeats: true,
    isJoinable: true,
    isCancellable: false,
    isFullyBooked: false
  });
  const { timezone: timezoneFilter, userData: currentUser, loading, setLoading, mineTalks, setMineTalks, parseConfig } = useSiteSettingData(); // Get timezone filter information set on the header
  const [style, setStyle] = useState({});
  const [iconSrc, setIconSrc] = useState('');

  useEffect(() => {

  }, []);



  useEffect(() => {
    const now = Date.now();
    setIsTalkLive(isAfter(now, parseISO(start)) && isBefore(now, parseISO(end)));
    setStartAndEndTime(`${toTimeString(start, timezoneFilter)} – ${toTimeString(end, timezoneFilter)}`);
  }, [timezoneFilter]);
  
  // Calculate the talk action buttons and static visibility
  useEffect(() => {
    const existingTalk = mineTalks.find((talk) => talk.slug === slug);
    const alreadyBooked = !!existingTalk; 
    // Detect if user is joinable on this talk
    let isJoinable = !alreadyBooked && (!isNaN(max_capacity) && (max_capacity ===0 || max_capacity > participants?.length) && self_assign);
    isJoinable = isJoinable && isMineTimeslotAvailable(mineTalks, currentTalk);
    isJoinable = isJoinable && mineAbracademyConditionCheck(mineTalks, currentTalk);
    

    setState({...state, 
      alreadyBooked,
      remainingSeats: max_capacity - participants.length,
      showRemainingSeats: !alreadyBooked && (!isNaN(max_capacity) && (max_capacity !==0 && max_capacity > participants?.length)),
      isJoinable,
      isCancellable: alreadyBooked && self_assign,
      isFullyBooked: !alreadyBooked && (!isNaN(max_capacity) && max_capacity !==0 && participants?.length >= max_capacity)
    });
  }, [participants, max_capacity, mineTalks]);

  // category handling => additional styles
  useEffect(() => {
    if (categories && categories.length > 0) {
      let newCategory: any = {};
      if (categories[0].hasOwnProperty('stroke')) newCategory['borderColor'] = categories[0].stroke;
      if (categories[0].hasOwnProperty('background')) newCategory['backgroundColor'] = categories[0].background;
      setStyle(newCategory);
      if (categories[0].hasOwnProperty('icon')) setIconSrc(`${categories[0].icon}.png`);
    }
  }, [categories]);

  const talkLink = `/talks/${slug}`;



  /* Event handlers */
  // Join button click event handler
  // Add the current user to the participants array of the talk class
  const onJoin = async (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser) { // Double check to make sure.
      toast.error('You should sign in first to join the talk.');
      return;
    }
    if (loading) return;
    setLoading(true);
    try {
      const result = await ParseFront.Cloud.run('joinTalk', { slug, participantId: currentUser.id, siteId: parseConfig.siteId });
      if (result.status === 'error') {
        throw(result.error);
      }
      toast.success('Successfully joined the talk.');
      window.location.reload();
    } catch (error) {
      console.log('on new talk section', error);
      toast.error(error);
      setLoading(false);
    }
  }



  // Cancel(Drop) button click event handler
  // Add to the participants array of the talk class
  const dropTalk = async (e: any) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser) { // Double check to make sure.
      toast.error('You should sign in first to join the talk.');
      return;
    }
    if (loading) return;
    setLoading(true);

    try {
      const result = await ParseFront.Cloud.run('dropTalk', { slug, participantId: currentUser.id, siteId: parseConfig.siteId });
      if (result.status === 'error') {
        throw(result.error);
      }
      toast.success('Successfully dropped from the talk.');
      window.location.reload();
    } catch (error) {
      console.log('on new talk section / dropTalk', error);
      toast.error(error);
      setLoading(false);
    }
  };
  return (
    <div key={title} className={cn(styles.talk, {[styles.blurred]: !state.isJoinable && !state.alreadyBooked })}>
      {showTime && <p className={styles.time}>{startAndEndTime || <>&nbsp;</>}</p>}
      <Link href={talkLink}>
        <a
          className={cn(styles.card, {
            [styles['is-live']]: isTalkLive
          })}
          style={style}
        >
          <div className={styles['card-body']}>
            <h4 title={title} className={styles.title}>
              {title}
            </h4>
            <div className={styles.speaker}>
              <div className={styles['avatar-group']}>
                {speakers.map(s => (
                  <div key={s.name} className={styles['avatar-wrapper']}>
                    <Image
                      loading="lazy"
                      alt={s.name}
                      className={styles.avatar}
                      src={s.image.url}
                      title={s.name}
                      width={24}
                      height={24}
                      unoptimized={true}
                    />
                  </div>
                ))}
              </div>
              <h5 className={styles.name}>
                {speakers.length === 1 ? speakers[0].name : `${speakers.length} speakers`}
              </h5>
            </div>
            <div className={styles.participants}>
              <span className={styles.icon}>
                { iconSrc && 
                  <Image
                    src={iconSrc}
                    width={28}
                    height={28}
                    unoptimized={true}
                  /> }
              </span>
              <span className={styles.action}>
                { state.showRemainingSeats && <span className={styles['remaining-seats']}>{ state.remainingSeats } places left</span> }
                { state.isJoinable && !loading && <span className={styles['join-button']} onClick={onJoin}>Join</span> }
                { state.alreadyBooked && <span className={styles['already-booked']}><IconCheck color='#fff' size={12} /></span> }
                { state.isFullyBooked && <span className={styles['fully-booked']}>Fully Booked</span> }
                { state.isCancellable && !loading && <span className={styles['join-button']} onClick={dropTalk}>Drop</span> }
              </span>
            </div>
          </div>
        </a>
      </Link>
    </div>
  );
}
