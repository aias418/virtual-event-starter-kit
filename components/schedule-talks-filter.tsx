import cn from 'classnames';
import { Stage } from '@lib/types';
import Switch from 'react-switch';
import Select from './select';
import styles from './schedule-talks-filter.module.css';

const talksFiltersList = [
  { value: 'all', label: 'All Sessions' }, 
  { value: 'my', label: 'My Sessions' }
];
type Props = {
  setTalksFilter: Function;
  talksFilter: string;
  allStages: Stage[];
};

export default function ScheduleTalksFilter({ talksFilter, setTalksFilter, allStages }: Props) {

  const handleFilterChange = (checked:boolean) => {
    setTalksFilter(checked === true ? 'my' : 'all');
  }

  return (
    <div className={styles['filter-wrapper']}>
      <label htmlFor="filter-switch" className={styles['filter-switch']}>
        <span className={cn(styles['switch-label'], { [styles.active]: talksFilter === 'all' })}>All Sessions</span>
        <Switch
          checked={talksFilter === 'my'}
          onChange={handleFilterChange}
          onColor="#FF0066"
          onHandleColor="#FF0066"
          handleDiameter={30}
          uncheckedIcon={false}
          checkedIcon={false}
          boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
          activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
          height={20}
          width={48}
          className="react-switch"
          id="filter-switch"
        />
        <span className={cn(styles['switch-label'], { [styles.active]: talksFilter === 'my' })}>My Sessions</span>
      </label>
      { allStages && 
        allStages.filter(stage => stage.slug !== 'test-stage')
          .map(stage => <a key={stage.slug} className={styles.button} href={`#${stage.slug}`}>{stage.name}</a>)
      }
    </div>
  );
}
