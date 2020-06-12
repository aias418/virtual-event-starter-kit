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
import Image from 'next/image';
import { Participant } from '@lib/types';
import styles from './individual-leaders-grid.module.css';

type Props = {
  participants: Participant[];
};

const LEADER_LIMIT = 5;

export default function IndividualLeaderGrid({ participants }: Props) {

  return (
    <div className={styles.grid}>
      {participants.map(participant => (
        <Link key={participant.email} href={`/participants/${participant.email}`}>
          <div className={participant.rank <= LEADER_LIMIT ? styles.leaders : styles.participants}>
            <a role="button" tabIndex={0} className={styles.cardBody}>
              <span className={styles.rank}>{participant.rank}</span>
              <span className={styles.email}>{participant.email}</span>
              <span className={styles.points}>{participant.points} points</span>
            </a>
          </div>
        </Link>
      ))}
    </div>
  );
}
