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

import { useState, useEffect, useReducer } from 'react';
import Link from 'next/link';
import cn from 'classnames';
import { useRouter } from 'next/router';
import { SkipNavContent } from '@reach/skip-nav';
import { SiteSetting, NavigationItem, ParseConfig, MinimumTalk } from '@lib/types';
import { getWithExpiry, setWithExpiry } from '@lib/local-storage';
import { DEFAULT_TIMEZONE } from '@lib/constants';
import { SiteSettingDataContext, UserData } from '@lib/hooks/use-site-setting';
import { talkReducer } from '@lib/hooks/use-site-setting';
import styles from './layout.module.css';
import Select from './select';
import IconMazeLogo from './icons/icon-maze-logo';
import MobileMenu from './mobile-menu';
import Footer from './footer';
import ViewSource from '@components/view-source';
import PacmanLoader from 'react-spinners/PacmanLoader';
import { toast } from 'react-toastify';
import { differenceInMinutes } from 'date-fns';
const ParseFront = require('parse');

type Props = {
  children: React.ReactNode;
  siteSetting: SiteSetting;
  parseConfig: ParseConfig;
  className?: string;
  hideNav?: boolean;
  layoutStyles?: any;
};

const defaultUserData : UserData = {
  id: '',
  ticketNumber: 0,
  username: '',
  name: ''
};

export default function Layout({ children, className, hideNav, layoutStyles, siteSetting, parseConfig }: Props) {
  const router = useRouter();
  const activeRoute = router.asPath;
  const [timezoneList, setTimezoneList] = useState<string[]>([DEFAULT_TIMEZONE]);
  const [timezone, setTimezone] = useState(getWithExpiry('timezone') || DEFAULT_TIMEZONE);
  const [userData, setUserData] = useState<UserData>(getWithExpiry('currentUser') || defaultUserData);
  const [loading, setLoading] = useState<boolean>(false);
  const [myTalks, talkDispatch] = useReducer(talkReducer, getWithExpiry('myTalks') || []);
  const [mineTalks, setMineTalks] = useState<MinimumTalk[]>([]);


  useEffect(() => {
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setTimezoneList([DEFAULT_TIMEZONE, timezone, userTimezone].filter((v, i, a) => a.indexOf(v) === i)); // avoid duplicate in timezone list
    
    ParseFront.initialize(parseConfig.appId);
    ParseFront.serverURL = parseConfig.serverURL;
  }, [])

  // timezone filter update event handler
  const updateTimezone = (e: any) => {
    setWithExpiry('timezone', e?.target?.value, 24 * 60 * 60 * 1000);
    setTimezone(e?.target?.value);
  }

  const logout = () => {
    localStorage.removeItem('myTalks');
    localStorage.removeItem('currentUser');
    window.location.href = '/';
  }

  return (
    <SiteSettingDataContext.Provider value={{
      siteSetting,
      parseConfig,
      timezone,
      userData,
      setUserData,
      loading,
      setLoading,
      myTalks,
      talkDispatch,
      mineTalks,
      setMineTalks
    }}>
      <ViewSource />
      <div className={styles.background}>
        {!hideNav && (
          <header className={cn(styles.header)}>
            <div className={styles['header-logos']}>
              <MobileMenu key={router.asPath} />
              {
                activeRoute !== '/' && 
                <Link href="/">
                  {/* eslint-disable-next-line */}
                  <a className={styles.logo}>
                    <IconMazeLogo />
                  </a>
                </Link>
              }
            </div>
            <div className={styles.tabs}>
              {
                (userData && userData.username) && 
                siteSetting.navigationItems
                  .filter((nav: NavigationItem) => !nav.hidden)
                  .map(({ name, route }) => (
                    <Link key={name} href={route}>
                      <a
                        className={cn(styles.tab, {
                          [styles['tab-active']]: activeRoute.startsWith(route)
                        })}
                      >
                        {name}
                      </a>
                    </Link>
                  ))
                }
            </div>
            <div className={cn(styles['header-right'])}>
              { (userData && userData.username) && <span className={styles.username} onClick={logout}>{ userData.username }</span> }
              <div className={styles['filter-select']}>
                <Select
                  aria-label="Select timezone filter"
                  value={timezone}
                  onChange={updateTimezone}
                >
                  { timezoneList.map(filter => (
                    <option key={filter} value={filter}>
                      { filter }
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </header>
        )}
        <div className={styles.page}>
          <main className={styles.main} style={layoutStyles}>
            <SkipNavContent />
            <div className={cn(styles.full, className)}>
              {children}
            </div>
          </main>
          {!activeRoute.startsWith('/stage') && !activeRoute.startsWith('/talks') && <Footer siteSetting={siteSetting} />}
        </div>
      </div>
      <div className='loading-container'>
        <PacmanLoader loading={loading} size={50} color="#FF0066" />
      </div>
    </SiteSettingDataContext.Provider>
  );
}
