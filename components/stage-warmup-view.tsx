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
import { Exercise } from '@lib/types';
import styles from './stage-warmup-view.module.css';


type Props = {
  warmupExercises: Exercise[];
};

export default function StageWarmpupView({ warmupExercises }: Props) {
  return (
    <div className={styles.container}>
      {
        warmupExercises.map((exercise: Exercise) => {
          return (
            <div key={exercise.name} className={styles.card}>
              <h5>{exercise.name}</h5>
              <p>{exercise.description}</p>
            </div>
          );
        })
      }
    </div>
  );
}
