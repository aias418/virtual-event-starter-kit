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
import { Stage, Category, Talk, MinimumTalk } from '@lib/types';
import { toTimeString, toDateString } from '@lib/date-time-helper';
import useSiteSettingData from '@lib/hooks/use-site-setting';
import { TALK_WRAP_MODEL_NAME } from '@lib/model-names';
import styles from './schedule.module.css';
import NewTalkCard from './new-talk-card';
import Schedule from './schedule';
const ParseFront = require('parse');
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
                  <NewTalkCard key={talk.title} talk={talk} showTime={index === 0} />
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
  mineTalks: MinimumTalk[];
}


// Stage section
// Direct child of Schedule component,  may contain multi-Date slots
// Apply all / my talk filter, too
function StageSection({ stage, talksFilter, mineTalks }: StageSectionProps) {
  const { timezone: timezoneFilter } = useSiteSettingData();
  const [talksData, setTalksData] = useState({});

  useEffect(() => {
    let myTalkSlugsList : string[] = [];
    if (mineTalks) {
      myTalkSlugsList = mineTalks.map(talk => talk.slug);
    }
    // Group talks by the date block
    const talksGroupedByDate = stage.schedule.reduce((allBlocks: any, talk) => {
      const talkDate = toDateString(talk.start, timezoneFilter);
      if (talksFilter === 'my') { // My Filter(talks with the current user in participant list)
        if (!myTalkSlugsList.includes(talk.slug)) return allBlocks;
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
    setTalksData(talksGroupedByDateTime);  
  }, [stage, mineTalks, talksFilter, timezoneFilter])
  
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
          Object.keys(talksData || {}).map((startDate: string) => {
            return (
              <DateRow key={startDate} date={startDate} talksWithinDate={(talksData as any)[startDate]} />
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
  mineTalks: MinimumTalk[];
}

// Crystal Ball Stage section, specified for Crystal Ball only
// Direct child of Schedule component,  may contain multi-Date slots
// Apply all / my talk filter, too
function CrystallBallStageSection({ stage, talksFilter, allCategories, mineTalks }: CrystalBallStageSectionProps) {
  const { timezone: timezoneFilter } = useSiteSettingData();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]); // icon name array
  const [talksData, setTalksData] = useState({});

  // At initial stage, set all categories
  useEffect(() => {
    if(allCategories) {
      setSelectedCategories(
        allCategories.map(({ icon }) => icon)
      )
    }
  }, [allCategories]);


  useEffect(() => {
    let myTalkSlugsList : string[] = [];
    if (mineTalks) {
      myTalkSlugsList = mineTalks.map(talk => talk.slug);
    }
    // Group talks by the date block
    const talksGroupedByDate = stage.schedule.reduce((allBlocks: any, talk) => {
      const talkDate = toDateString(talk.start, timezoneFilter);
      if (talksFilter === 'my') { // My Filter(talks with the current user in participant list)
        if (!myTalkSlugsList.includes(talk.slug)) return allBlocks;
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
    })
    setTalksData(talksGroupedByDateTime);  
  }, [stage, mineTalks, talksFilter, timezoneFilter, selectedCategories])
  

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
          Object.keys(talksData || {}).map((startDate: string) => {
            return (
              <DateRow key={startDate} date={startDate} talksWithinDate={(talksData as any)[startDate]} />
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

export default function StageComponent({ allStages, allCategories, talksFilter }: Props) {
  const { talkDispatch, userData: currentUser, parseConfig, mineTalks, setMineTalks } = useSiteSettingData();
  const [activeStages, setActiveStages] = useState<Stage[]>([]);
  
  if (process.browser && (!currentUser || !currentUser.id)) {
    toast.error(REGISTER_MESSAGE);
    window.location.href = '/';
  }

  // Jump to link from url
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
    const fetchMyTalks = async() => {
      if (currentUser) {
        const cloudTalks = await ParseFront.Cloud.run('myTalks', { participant: currentUser.id, siteId: parseConfig.siteId });
        setMineTalks(cloudTalks.myTalks);
      }
    }
    
    // - show Test stage for super admin only
    // - Update talk/participants info in getAllStages object
    const fetchAllTalkWraps = async() => {
      const talkWrapQuery = new ParseFront.Query(TALK_WRAP_MODEL_NAME);
      talkWrapQuery.equalTo('t__status', 'Published');
      talkWrapQuery.limit(10000);
      const allTalkWraps = await talkWrapQuery.find();
      const mappedTalkWraps = allTalkWraps.reduce((acc: any, cur: any) => {
        if (acc[cur.get('Talk')[0].id]) console.log("duplicate entry", cur);
        acc[cur.get('Talk')[0].id] = cur.get('Participants');
        return acc;
      }, {});
      let filteredStages = allStages;
      // Hack, only superadmin can view test stage
      if (currentUser.username !== SUPERADMIN) filteredStages = allStages.filter(stage => stage.slug !== 'test-stage');
      
      const newStages = filteredStages.map((stage: any) => {
        const schedule = stage.schedule.map((talk: any) => {
          return {...talk, participants: mappedTalkWraps[talk.id] || []};
        });
        return {...stage, schedule};
      })

      setActiveStages(newStages);   
    };
    ParseFront.initialize(parseConfig.appId);
    ParseFront.serverURL = parseConfig.serverURL;
    fetchMyTalks();
    fetchAllTalkWraps();
  }, [allStages, currentUser]);

  return (
    <div className={styles.container}>
      <div className={styles['row-wrapper']}>
        {activeStages.map(stage => {
          return stage.slug == 'crystal-ball' ? 
              <CrystallBallStageSection key={stage.slug} stage={stage} talksFilter={talksFilter} allCategories={allCategories} mineTalks={mineTalks} /> 
            : 
              <StageSection key={stage.slug} stage={stage} talksFilter={talksFilter} mineTalks={mineTalks} />;
        })}
      </div>
    </div>
  );
}
