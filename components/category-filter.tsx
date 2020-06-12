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
import { Category } from '@lib/types';
import { toast } from 'react-toastify';
import styles from './category-filter.module.css';
import useSiteSettingData from '@lib/hooks/use-site-setting';
import IconCheck from './icons/icon-check';
import { TALK_MODEL_NAME, PARTICIPANT_MODEL_NAME } from '@lib/model-names';
import { isTimeslotAvailable, abracademyConditionCheck } from '@lib/check-participants';


type ItemProps = {
  category: Category;
  selectedCategories: string[];
  toggleCategory: Function;
};

type Style = {
  backgroundColor?: string;
  borderColor?: string;
}

function CategoryFilterItem({ category, selectedCategories, toggleCategory } : ItemProps) {
  const [style, setStyle] = useState<Style>({});
  useEffect(() => {
    if (selectedCategories && selectedCategories.includes(category.icon)) 
      setStyle({ backgroundColor: category.backgroundColor, borderColor: category.strokeColor });
    else
      setStyle({ backgroundColor: category.backgroundColor });
  }, [selectedCategories, category]);
  return (
    <div className={cn(styles.item, { [styles.disabled]: (!selectedCategories || !selectedCategories.includes(category.icon)) })} 
      style={ style }
      onClick={() => toggleCategory(category.icon)}>
      <img
        src={`${category.icon}.png`}
        width={28}
        height={28}
        />
      <span className={styles.label}>
        { category.name }
      </span>
    </div>
  );
}


type Props = {
  allCategories: Category[];
  selectedCategories: string[];
  setSelectedCategories: Function;
};

// Category filter in Crystal Ball filter
export default function CategoryFilter({ allCategories, selectedCategories, setSelectedCategories }: Props) {

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category))
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    else
      setSelectedCategories([...selectedCategories, category]);
  }

  return (
    <div className={styles['category-filter']}>
      { 
        allCategories && allCategories.map(category => 
          <CategoryFilterItem category={category} selectedCategories={selectedCategories} toggleCategory={toggleCategory} key={category.name} />
        )
      }
    </div>
  );
}

