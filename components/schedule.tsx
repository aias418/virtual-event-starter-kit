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

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import CategoryFilter from './category-filter';
import { REGISTER_MESSAGE, SUPERADMIN } from '@lib/constants';
import { Stage, Category, Talk } from '@lib/types';
import { toTimeString, toDateString } from '@lib/date-time-helper';
import useSiteSettingData from '@lib/hooks/use-site-setting';
import styles from './schedule.module.css';
import TalkCard from './talk-card';
import { isCurrentUserParticipating } from '@lib/check-participants';

type DateSectionProps = {
  date: string;
  talksWithinDate: any;
}
// Build the Date Row
// Direct child of Stage section,  may contain multi-Time slots
function DateRow({ date, talksWithinDate }: DateSectionProps) {
  return (
    <div className={styles['event-date-row']}>
      <h5 className={styles['event-date']}>{date}</h5>
      <div className={styles.talks}>
        {
          Object.keys(talksWithinDate).map((startTime: string) => (
            <div key={startTime}>
              {
                talksWithinDate[startTime].map((talk: Talk, index: number) => (
                  <TalkCard key={talk.title} talk={talk} showTime={index === 0} />
                ))
              }
            </div>
          ))
        }
      </div>
    </div>
  );
}

type StageSectionProps = {
  stage: Stage;
  talksFilter: string;
}


// Stage section
// Direct child of Schedule component,  may contain multi-Date slots
// Apply all / my talk filter, too
function StageSection({ stage, talksFilter }: StageSectionProps) {
  const { userData: currentUser, timezone: timezoneFilter } = useSiteSettingData();
  // Group talks by the date block
  const talksGroupedByDate = stage.schedule.reduce((allBlocks: any, talk) => {
    const talkDate = toDateString(talk.start, timezoneFilter);

    if (talksFilter === 'my') { // My Filter(talks with the current user in participant list)
      if (isCurrentUserParticipating(talk.participants, currentUser.username || '') === false) return allBlocks;
    }
    allBlocks[talkDate] = [...(allBlocks[talkDate] || []), talk];
    return allBlocks;
  }, {});


  // Group talksGroupedByDate by the time block again
  let talksGroupedByDateTime: any = {};
  Object.keys(talksGroupedByDate).forEach(date => {
    const timeObject = talksGroupedByDate[date].reduce((allBlocks: any, talk: Talk) => {
      const talkTime = toTimeString(talk.start, timezoneFilter);
      allBlocks[talkTime] = [...(allBlocks[talkTime] || []), talk];
      return allBlocks;
    }, {});
    talksGroupedByDateTime = {...talksGroupedByDateTime, [date]: timeObject};
  })

  return (
    <div key={stage.name} className={styles['stage-section']} id={stage.slug}>
      <div className={styles['stage-header']}>
        <h3 className={styles['stage-name']}>{stage.name}</h3>
      </div>
      { stage.description && 
        <div className={styles['stage-description']} dangerouslySetInnerHTML={{__html: stage.description}}>
        </div>
      }
      <div>
        {
          Object.keys(talksGroupedByDateTime || {}).map((startDate: string) => {
            return (
              <DateRow key={startDate} date={startDate} talksWithinDate={talksGroupedByDateTime[startDate]} />
            );
          })
        }
      </div>
    </div>
  );
}

type CrystalBallStageSectionProps = {
  stage: Stage;
  talksFilter: string;
  allCategories: Category[];
}

// Crystal Ball Stage section, specified for Crystal Ball only
// Direct child of Schedule component,  may contain multi-Date slots
// Apply all / my talk filter, too
function CrystallBallStageSection({ stage, talksFilter, allCategories }: CrystalBallStageSectionProps) {
  const { userData: currentUser, timezone: timezoneFilter } = useSiteSettingData();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]); // icon name array

  // At initial stage, set all categories
  useEffect(() => {
    if(allCategories) {
      setSelectedCategories(
        allCategories.map(({ icon }) => icon)
      )
    }
  }, [allCategories]);

  // Group talks by the date block
  const talksGroupedByDate = stage.schedule.reduce((allBlocks: any, talk) => {
    const talkDate = toDateString(talk.start, timezoneFilter);

    if (talksFilter === 'my') { // My Filter(talks with the current user in participant list)
      if (isCurrentUserParticipating(talk.participants, currentUser.username || '') === false) return allBlocks;
    }

    // apply category filter
    if (talk.categories && selectedCategories.includes(talk.categories[0]?.icon)) {
      allBlocks[talkDate] = [...(allBlocks[talkDate] || []), talk];
    }
    return allBlocks;
  }, {});


  // Group talksGroupedByDate by the time block again
  let talksGroupedByDateTime: any = {};
  Object.keys(talksGroupedByDate).forEach(date => {
    const timeObject = talksGroupedByDate[date].reduce((allBlocks: any, talk: Talk) => {
      const talkTime = toTimeString(talk.start, timezoneFilter);
      allBlocks[talkTime] = [...(allBlocks[talkTime] || []), talk];
      return allBlocks;
    }, {});
    talksGroupedByDateTime = {...talksGroupedByDateTime, [date]: timeObject};
  });


  return (
    <div key={stage.name} className={styles['stage-section']} id={stage.slug}>
      <div className={styles['crystal-stage-header']}>
        <h3 className={styles['stage-name']}>{stage.name}</h3>
        <CategoryFilter allCategories={allCategories} selectedCategories={selectedCategories} setSelectedCategories={setSelectedCategories} />
      </div>
      { stage.description && 
        <div className={styles['stage-description']} dangerouslySetInnerHTML={{__html: stage.description}}>
        </div>
      }
      <div>
        {
          Object.keys(talksGroupedByDateTime || {}).map((startDate: string) => {
            return (
              <DateRow key={startDate} date={startDate} talksWithinDate={talksGroupedByDateTime[startDate]} />
            );
          })
        }
      </div>
    </div>
  );
}

type Props = {
  allStages: Stage[];
  allCategories: Category[];
  talksFilter: string;
};

export default function Schedule({ allStages, allCategories, talksFilter }: Props) {
  const { talkDispatch, userData: currentUser } = useSiteSettingData();
  const [activeStages, setActiveStages] = useState<Stage[]>([]);
  
  if (process.browser && (!currentUser || !currentUser.id)) {
    toast.error(REGISTER_MESSAGE);
    window.location.href = '/';
  }

  useEffect(() => {
    setTimeout(function() {
      window.requestAnimationFrame(function() {
        var requested_hash = location.hash.slice(1);
        const element = document.getElementById(requested_hash);

        if (element) {
          // When there is an input, scroll this input into view.
          element.scrollIntoView({ behavior: 'smooth' })
        }
      });
    });
  }, []);

  // Build My Talks
  useEffect(() => {
    talkDispatch({ type: 'reset' });
    allStages.forEach(stage => {
      stage.schedule.forEach(talk => {
        if (isCurrentUserParticipating(talk.participants, currentUser.username || '')) talkDispatch({ type: 'add', payload: talk });
      });
    })
  }, []);

  useEffect(() => {
    if (currentUser.username === SUPERADMIN) 
      setActiveStages(allStages);
    else
      setActiveStages(allStages.filter(stage => stage.slug !== 'test-stage'));
  }, [allStages, currentUser]);

  return (
    <div className={styles.container}>
      <div className={styles['row-wrapper']}>
        {activeStages.map(stage => {
          return stage.slug == 'crystal-ball' ? 
              <CrystallBallStageSection key={stage.slug} stage={stage} talksFilter={talksFilter} allCategories={allCategories} /> 
            : 
              <StageSection key={stage.slug} stage={stage} talksFilter={talksFilter} />;
        })}
      </div>
    </div>
  );
}
