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

import Link from 'next/link';
import cn from 'classnames';
import { Participant, Team } from '@lib/types';
import styles from './leader-tabview.module.css';
import { useState } from 'react';
import IndividualLeaderGrid from './individual-leaders-grid';
import TeamRankGrid from './team-rank-grid';

type Props = {
  participants: Participant[];
  teams: Team[];
};

export default function LeaderTeamview({ participants, teams }: Props) {
  const [currentTab, setCurrentTab] = useState<string>('individual');

  const switchTab = (activeTab: string) => {
    setCurrentTab(activeTab);
  }

  const getTabLabel = (tab: string) => {
    return tab === 'individual' ? 'Individual Leaders' : 'Team Leaderboard';
  }

  return (
    <div className={styles.tabs}>
      <TabButtons currentTab={currentTab} switchTab={switchTab} />
      <div className={styles['tab-content']}>
        { currentTab === 'individual' ? <IndividualLeaderGrid participants={participants} /> : <TeamRankGrid teams={teams} />}
      </div>
    </div>
  );
}

function TabButtons({ currentTab, switchTab}: {currentTab: string, switchTab: Function}) {
  return (<div className={styles['tab-buttons']}>
    {
      ['individual', 'team'].map((tab: string) => {
        return (
          <a
            key={tab} 
            className={cn(
              styles['tab-label'],
              { [styles.active]: currentTab === tab }
            )} 
            onClick={() => switchTab(tab)}>
            {tab === 'individual' ? 'Individual Leaders' : 'Team Leaderboard'}
          </a>
        )
      })
    }
  </div>);
}