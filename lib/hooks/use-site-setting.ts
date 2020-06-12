import { setWithExpiry } from '@lib/local-storage';
import { SiteSetting, ParseConfig, Talk, MinimumTalk } from '@lib/types';
import { createContext, useContext } from 'react';

export type UserData = {
  id?: string;
  ticketNumber?: number;
  username?: string;
  name?: string;
  isAdmin?: boolean;
};

type SiteSettingDataContextType = {
  siteSetting: SiteSetting;
  parseConfig: ParseConfig;
  timezone: string;
  userData: UserData;
  setUserData: React.Dispatch<React.SetStateAction<UserData>>;
  loading: boolean;
  setLoading: Function;
  myTalks: Talk[];
  talkDispatch: Function;
  mineTalks: MinimumTalk[];
  setMineTalks: Function;
};

export const SiteSettingDataContext = createContext<SiteSettingDataContextType | null>(null);

export default function useSiteSettingData() {
  const result = useContext(SiteSettingDataContext);
  if (!result) {
    throw new Error();
  }
  return result;
}

export const talkReducer = (talks: Talk[], action: any) => {
  let myTalks = [...talks];
  if (action.type === 'add') {
    myTalks = talks.filter(talk => action.payload.slug !== talk.slug);
    myTalks.push(action.payload);
  }
  if (action.type === 'remove') {
    myTalks = talks.filter(talk => action.payload.slug !== talk.slug);
  }
  if (action.type === 'reset') {
    myTalks = [];
  }
  if (action.type === 'set') {
    console.log("action.payload", action.payload);
    myTalks = [...action.payload];
  }
  setWithExpiry('myTalks', myTalks, 24 * 60 * 60 * 1000);
  return myTalks;
}