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
import { Talk, Participant } from '@lib/types';
import { toast } from 'react-toastify';
import styles from './talk-card.module.css';
import useSiteSettingData from '@lib/hooks/use-site-setting';
import IconCheck from './icons/icon-check';
import { TALK_MODEL_NAME, PARTICIPANT_MODEL_NAME, TALK_WRAP_MODEL_NAME } from '@lib/model-names';
import { isTimeslotAvailable, abracademyConditionCheck } from '@lib/check-participants';
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
  const { timezone: timezoneFilter, userData: currentUser, loading, setLoading, myTalks, talkDispatch, parseConfig } = useSiteSettingData(); // Get timezone filter information set on the header
  const [style, setStyle] = useState({});
  const [iconSrc, setIconSrc] = useState('');

  useEffect(() => {
    const now = Date.now();
    setIsTalkLive(isAfter(now, parseISO(start)) && isBefore(now, parseISO(end)));
    setStartAndEndTime(`${toTimeString(start, timezoneFilter)} – ${toTimeString(end, timezoneFilter)}`);
  }, [timezoneFilter]);
  
  // Calculate the talk action buttons and static visibility
  useEffect(() => {
    const currentParticipant = participants.find((participant: Participant) => participant.email == currentUser?.username);
    const alreadyBooked = !!currentParticipant; 
    // Detect if user is joinable on this talk
    let isJoinable = !alreadyBooked && (!isNaN(max_capacity) && (max_capacity ===0 || max_capacity > participants?.length) && self_assign);
    let plainJoinable = isJoinable;
    isJoinable = isJoinable && isTimeslotAvailable(myTalks, currentTalk);
    const timeslot = isJoinable;
    isJoinable = isJoinable && abracademyConditionCheck(myTalks, currentTalk);
    console.log("is joinable", plainJoinable, timeslot, isJoinable, slug);

    setState({...state, 
      alreadyBooked,
      remainingSeats: max_capacity - participants.length,
      showRemainingSeats: !alreadyBooked && (!isNaN(max_capacity) && (max_capacity !==0 && max_capacity > participants?.length)),
      isJoinable,
      isCancellable: alreadyBooked && self_assign,
      isFullyBooked: !alreadyBooked && (!isNaN(max_capacity) && max_capacity !==0 && max_capacity === participants?.length)
    });
  }, [participants, max_capacity]);

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

  const firstSpeakerLink = `/talks/${slug}`;



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
    // TODO: Change to call cloud function
    // Server Data Update: Get participant parse object instance 
    const participantQuery = new ParseFront.Query(PARTICIPANT_MODEL_NAME);
    participantQuery.equalTo('t__status', 'Published');
    participantQuery.equalTo('Email', currentUser.username);
    const currentParticipant = await participantQuery.first();
    if (!currentParticipant) {
      toast.error('Something wrong with the server. Please contact administrator.');
      setLoading(false);
      return;
    }

    // Server Data Update:  Update both Draft and Published version(Updating draft for Chisel CMS app)
    const talkQuery = new ParseFront.Query(TALK_MODEL_NAME);
    talkQuery.equalTo('slug', slug);
    talkQuery.equalTo('t__status', 'Published');
    const talkParseObject = await talkQuery.first();
    if (!talkParseObject) {
      toast.error('Something wrong with the server. Please contact administrator.');
      setLoading(false);
      return;
    }
    
    talkParseObject.set('participants', [...(talkParseObject.get('participants') || []), currentParticipant])
    await talkParseObject.save();

    await ParseFront.Cloud.run('joinTalk', { slug, participantId: currentUser.id, siteId: parseConfig.siteId });
    /* const talkWrapQuery = new ParseFront.Query(TALK_WRAP_MODEL_NAME);
    talkWrapQuery.equalTo('task', talkParseObject);
    talkWrapQuery.equalTo('t__status', 'Published');
    let talkWrapParseObject = await talkWrapQuery.first();
    if (!talkWrapParseObject) {
      const TalkWrap = ParseFront.Object.extend(TALK_WRAP_MODEL_NAME);
      const talkWrapName=`${title}-${start}-${end}`;
      talkWrapParseObject = new TalkWrap();
      talkWrapParseObject.set('Name', talkWrapName);
      talkWrapParseObject.set('Talk', [talkParseObject]);
      talkWrapParseObject.set('Participants', [currentParticipant]);
      talkWrapParseObject.set('t__status', 'Published');
    } else
      talkWrapParseObject.set('Participants', [...(talkWrapParseObject.get('Participants') || []), currentParticipant])
    await talkWrapParseObject.save();
    */


    // context data manipulation
    talkDispatch({ type: 'add', payload: currentTalk });
    
    // Give user feedback
    toast.success('Successfully joined the talk!');
    setState({...state, isJoinable: false});
    setLoading(false);
    window.location.reload();
  }



  // Cancel(Drop) button click event handler
  // Add to the participants array of the talk class
  const dropTalk = async () => {
    if (!currentUser) { // Double check to make sure.
      toast.error('You should sign in first to join the talk.');
      return;
    }
    if (loading) return;
    setLoading(true);
    // TODO: Change to call cloud function
    // Get participant parse object instance 
    const participantQuery = new ParseFront.Query(PARTICIPANT_MODEL_NAME);
    participantQuery.equalTo('t__status', 'Published');
    participantQuery.equalTo('Email', currentUser.username);
    const currentParticipant = await participantQuery.first();
    if (!currentParticipant) {
      toast.error('Something wrong with the server. Please contact administrator.');
      setLoading(false);
      return;
    }

    // Update both Draft and Published version(Updating draft for Chisel CMS app)
    const talkQuery = new ParseFront.Query(TALK_MODEL_NAME);
    talkQuery.equalTo('slug', slug);
    const talkParseObjects = await talkQuery.find();
    if (!talkParseObjects) {
      toast.error('Something wrong with the server. Please contact administrator.');
      setLoading(false);
      return;
    }
    for (let i = 0; i < talkParseObjects.length; i++) {
      const partcipants = talkParseObjects[i].get('participants')?.filter((participant: any) => participant.id !== currentParticipant.id);
      talkParseObjects[i].set('participants', partcipants || [])
      await talkParseObjects[i].save();
    }

    // context data manipulation
    talkDispatch({ type: 'remove', payload: currentTalk });
    await ParseFront.Cloud.run('dropTalk', { slug, participantId: currentUser.id, siteId: parseConfig.siteId });
    // Giv User Feedback
    toast.success('Successfully dropped from the talk!');
    setState({...state, isCancellable: false});
    window.location.reload();
  };
  return (
    <div key={title} className={cn(styles.talk, {[styles.blurred]: !state.isJoinable && !state.alreadyBooked })}>
      {showTime && <p className={styles.time}>{startAndEndTime || <>&nbsp;</>}</p>}
      <Link href={firstSpeakerLink}>
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
