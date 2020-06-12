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
import { Team, Participant } from '@lib/types';
import styles from './team-rank-grid.module.css';

type Props = {
  teams: Team[];
};

const LEADER_LIMIT = 5;

export default function TeamRankGrid({ teams }: Props) {

  return (
    <div className={styles.grid}>
      {
        teams.map((team, index) => {
          return (
            <Link key={team.name} href={`/participants/${team.name}`}>
              <div className={index < LEADER_LIMIT ? styles.leaders : styles.teams}>
                <a role="button" tabIndex={0} className={styles.cardBody}>
                  <span className={styles.rank}>{index + 1}</span>
                  <span className={styles.email}>{team.name}</span>
                  <span className={styles.points}>{team.points} points</span>
                </a>
              </div>
            </Link>
          );
        })
      }
    </div>
  );
}
