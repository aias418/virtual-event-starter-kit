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
import { toast } from 'react-toastify';
import { toTimeString, toDateString, toLongDateString, toDateTimeString } from '@lib/date-time-helper';
import { REGISTER_MESSAGE } from '@lib/constants';
import { Participant, Talk } from '@lib/types';
import useSiteSettingData from '@lib/hooks/use-site-setting';
import AddToCalendar from '@culturehq/add-to-calendar';
import IconMan from './icons/icon-man';
import IconCheck from './icons/icon-check';
import IconMural from './icons/icon-mural';
import IconZoom from './icons/icon-zoom';
import IconFullscreen from './icons/icon-fullscreen';
import styles from './talk-section.module.css';
import { TALK_MODEL_NAME, PARTICIPANT_MODEL_NAME } from '@lib/model-names';
import { isTimeslotAvailable, abracademyConditionCheck } from '@lib/check-participants';
import '@culturehq/add-to-calendar/dist/styles.css';
const ParseFront = require('parse');

type Props = {
  talk: Talk;
  showTime: boolean;
};

function requestBodyFullScreen() {
  const elem = document.documentElement;
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  }
}

/* Close fullscreen */
function closeFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  }
}

/* Talk Detail Page main Component */
export default function TalkSection({ 
  talk: currentTalk, 
   }: Props) {
  const { title, description, slug, speakers, start, end, mural_link, zoom_link, mural_embed, mibo_link, max_capacity, self_assign } = currentTalk;
  const [isTalkLive, setIsTalkLive] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [startAndEndTime, setStartAndEndTime] = useState('');
  const [hasSidebar, setHasSidebar] = useState(false);
  const [fullViewport, setFullViewport] = useState(false);
  const [state, setState] = useState({
    alreadyBooked: false,
    remainingSeats: 0,
    showRemainingSeats: true,
    isJoinable: true,
    isCancellable: false,
    isFullyBooked: false
  });
  const { timezone: timezoneFilter, userData: currentUser, loading, setLoading, myTalks, talkDispatch, siteSetting, parseConfig } = useSiteSettingData();
  const [event, setEvent] = useState({
    name: title, 
    startsAt: start, 
    details: `${title} \r\n\n Visit ${siteSetting.siteURL}/talks/${slug}`,
    location: 'Mural Maze',
    endsAt: end
  });
  
  if (process.browser && (!currentUser || !currentUser.id)) {
    toast.error(REGISTER_MESSAGE);
    window.location.href = '/';
  }


  const onFullScreenChange = () => {
    var fullscreenElement = document.fullscreenElement;
    setFullViewport(!!fullscreenElement);
  }

  useEffect(() => {
    document.addEventListener("fullscreenchange", onFullScreenChange, false);
    document.addEventListener("webkitfullscreenchange", onFullScreenChange, false);
    document.addEventListener("mozfullscreenchange", onFullScreenChange, false);

    () => {
      document.removeEventListener("fullscreenchange", onFullScreenChange, false);
      document.removeEventListener("webkitfullscreenchange", onFullScreenChange, false);
      document.removeEventListener("mozfullscreenchange", onFullScreenChange, false);
    }
  }, [])

  // Called once on page load
  useEffect(() => {
    ParseFront.initialize(parseConfig.appId);
    ParseFront.serverURL = parseConfig.serverURL;
    // On page load, load again the current talk data
    const fetchData = async() => {
      setLoading(true);
      const talkQuery = new ParseFront.Query(TALK_MODEL_NAME);
      talkQuery.equalTo('t__status', 'Published');
      talkQuery.equalTo('slug', slug);
      talkQuery.include(['participants']);
      const currentTalk = await talkQuery.first();
      if (currentTalk && currentTalk.get('participants')) {
        const participantsObjects = currentTalk.get('participants').map((p: any) => {
          return {
            id: p.id,
            name: `${p.get('First_Name') || ''} ${p.get('Surname')}`,
            email: p.get('Email'),
            points: p.get('Points') || null,
            ticket: p.get('Ticket') || null
          }
        });
        setParticipants(participantsObjects);
      }
      setLoading(false);
    };
    fetchData();
  }, []);



  // Check Talk is live based on start / end time
  useEffect(() => {
    const now = Date.now();
    setIsTalkLive(isAfter(now, parseISO(start)) && isBefore(now, parseISO(end)));
    setStartAndEndTime(`${toLongDateString(start, timezoneFilter)}, ${toTimeString(start, timezoneFilter)} – ${toTimeString(end, timezoneFilter)}`);
    setHasSidebar(!!(mural_embed || mibo_link));
  }, [timezoneFilter]);


  // Based on the change, detect if the current user is free to partcipate in the talk
  useEffect(() => {
    const currentParticipant = participants.find((participant: Participant) => participant.email == currentUser?.username);
    const alreadyBooked = !!currentParticipant; 
    // Detect if user is joinable on this talk
    let isJoinable = !alreadyBooked && (!isNaN(max_capacity) && (max_capacity ===0 || max_capacity > participants?.length) && self_assign);
    isJoinable = isJoinable && isTimeslotAvailable(myTalks, currentTalk);
    isJoinable = isJoinable && abracademyConditionCheck(myTalks, currentTalk);
    
    setState({...state, 
      alreadyBooked: !!currentParticipant,
      remainingSeats: max_capacity - participants.length,
      showRemainingSeats: !alreadyBooked && (!isNaN(max_capacity) && max_capacity !==0 && max_capacity > participants?.length),
      isJoinable,
      isCancellable: alreadyBooked && self_assign,
      isFullyBooked: !alreadyBooked && (!isNaN(max_capacity) && max_capacity !==0 && max_capacity === participants?.length)
    });
  }, [self_assign, currentUser, JSON.stringify(participants)]);

  // Join button click event handler
  // Add the current user to the participants array of the talk class
  const joinTalk = async () => {
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
      talkParseObjects[i].set('participants', [...(talkParseObjects[i].get('participants') || []), currentParticipant])
      await talkParseObjects[i].save();
    }

    // context data manipulation
    talkDispatch({ type: 'add', payload: currentTalk });
    await ParseFront.Cloud.run('joinTalk', { slug, participantId: currentUser.id, siteId: parseConfig.siteId });

    // update local state and give user feedback
    const currentParticipantObject: Participant = {
      email: currentParticipant.get('Email'),
      points: currentParticipant.get('Points') || null,
      ticket: currentParticipant.get('Ticket') || null,
      rank: currentParticipant.get('rank')
    };
    setParticipants([...participants, currentParticipantObject]);
    setState({...state, isJoinable: false});
    setLoading(false);
  };

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

    // update local state and give user feedback
    setParticipants(participants.filter((participant: any) => participant.email != currentUser.username));
    setState({...state, isCancellable: false});
    setLoading(false);
  };


  // iFrame Full screen button click event handler
  const goFullscreen = () => {
    if (fullViewport === false) requestBodyFullScreen(); else closeFullscreen();
  }

  return (
    <div className={styles['main-section']}>
      <div className={cn(
        styles['speakers-section'],
        { [styles.expanded]: false/* !hasSidebar */ }
      )}>
        <Link href="/schedule">
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
            Back to Schedule
          </a>
        </Link>
        <h1 title={title} className={cn(styles['talk-title'], { [styles.sidebar]: hasSidebar })}>{title}</h1>
        <p className={cn(styles['time-join-lane'], { [styles.sidebar]: hasSidebar })}>
          <span className={styles['time']}>{startAndEndTime || <>&nbsp;</>}</span>
          <span className={styles['join-action']}>
            { state.showRemainingSeats && <span className={styles['remaining-seats']}>{ state.remainingSeats } places left</span> }
            { state.isJoinable && !loading && <span className={styles['join-button']} onClick={joinTalk}>Join</span> }
            { state.alreadyBooked && <span className={styles['already-booked']}><IconCheck color='#fff' size={12} /></span> }
            { state.isCancellable && !loading && <span className={styles['join-button']} onClick={dropTalk}>Leave</span> }
            { state.isFullyBooked && <span className={styles['fully-booked']}>Fully Booked</span> }
          </span>
          <span className={styles['participant-number']}>
            <IconMan />
            <span> {participants ? participants.length : 0} / { (!isNaN(max_capacity) && max_capacity > 0) ? max_capacity : 'Unlimited' }</span>
          </span>
        </p>
        <div>
          <AddToCalendar event={event} />
        </div>



        <div></div>
        {
          zoom_link && 
          <>
            <h3 className={styles['small-heading']}>Access Information</h3>
            <div className={styles['talk-link']}>
              <a
                aria-label="Zoom"
                className={styles.zoomIcon}
                href={zoom_link}
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconZoom size={40} /><span className={styles.label}>Join Zoom</span>
              </a>
            </div>
          </>
        }
        {
          mural_link && 
          <>
            <h3 className={styles['small-heading']}>Resources</h3>
            <div className={styles['talk-link']}>
              <a
                  aria-label="Mural"
                  href={mural_link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                <IconMural size={40} /><span className={styles.label}>Open in MURAL</span>
              </a>      
            </div>
          </>
        }
        <h3 className={styles['small-heading']}>Speakers</h3>
        {
        speakers.map(s => (
          <Link key={s.name} href={`/speakers/${s.slug}`}>
            <div className={cn(styles['speaker-row'], { [styles.sidebar]: hasSidebar })}>
              <div key={s.name} className={styles['avatar-wrapper']}>
                <Image
                  loading="lazy"
                  alt={s.name}
                  className={styles.avatar}
                  src={s.image.url}
                  title={s.name}
                  width={36}
                  height={36}
                  unoptimized={true}
                />
              </div>
              <h5 className={styles['speaker-name']}>{s.name}</h5>
            </div>
          </Link>
        ))}
        {
          description && 
          <div>
            <h3 className={styles['small-heading']}>Description</h3>
            <div dangerouslySetInnerHTML={{__html: description}} />
          </div>
        }
        <div className={styles['participants']}>
          <h3 className={styles['small-heading']}>Participant</h3>
          <ul>
            {participants.map(participant => <li>{participant.name}</li>)}
          </ul>
        </div>
      </div>
      <div className={cn(styles['external-embed-section'], { [styles.full]: fullViewport })}>
        <div className={cn(styles['iframe-wrapper'])}>
          {
            (mural_embed || mibo_link) && 
            <span className={styles['icon-fullscreen']} onClick={goFullscreen}>
              <IconFullscreen />
            </span>
          }
          {
            mural_embed &&
            <iframe src={mural_embed}
              width="100%"
              style={{ minWidth: 640, minHeight: 480, backgroundColor: '#f4f4f4', border: '1px solid #efefef' }}
              sandbox="allow-same-origin allow-scripts allow-modals allow-popups allow-popups-to-escape-sandbox">
            </iframe>
          }
          {
            mibo_link &&
            <iframe src={mibo_link}
            width="100%"
            style={{ minWidth: 640, minHeight: 480, backgroundColor: '#f4f4f4' }}
            allow="microphone;camera"
            sandbox="allow-same-origin allow-scripts allow-popups">
            </iframe>
          }
        </div>
      </div>
    </div>
  );
}