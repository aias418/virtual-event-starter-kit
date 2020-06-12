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
import { Challenge } from '@lib/types';
import styles from './challenges-card-grid.module.css';

type Props = {
  challenges: Challenge[];
};

export default function ChallengesCardGrid({ challenges }: Props) {
  return (
    <div className={styles.grid}>
      {
        challenges.map(challenge => (
          <Link key={challenge.name} href={`/challenges/${challenge.code}`}>
            <a role="button" tabIndex={0} className={styles.card}>
              <ChallengeCardBody challenge={challenge} />
            </a>
          </Link>
        ))
      }
    </div>
  );
}

type ChallengeProps = {
  challenge: Challenge
}

function ChallengeCardBody({ challenge }: ChallengeProps) {
  return (
    <div className={styles.cardBody}>
      <h2 className={styles.name}>{challenge.type} {challenge.name}</h2>
      <p className={styles.label}>
        Points: {challenge.points}pts
      </p>
      <p className={styles.label}>
        {challenge.description}
      </p>
    </div>
  );
}