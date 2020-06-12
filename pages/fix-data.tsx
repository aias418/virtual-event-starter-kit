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

import { GetStaticProps } from 'next';
import { useState, useEffect } from 'react';
import Page from '@components/page';
import StageComponent from '@components/stage';
import Layout from '@components/layout';
import ScheduleHeader from '@components/schedule-header';
import { getAllStages, getAllCategories, getSiteSetting } from '@lib/cms-api';
import { TALK_WRAP_MODEL_NAME } from '@lib/model-names';
import { Stage, Category, SiteSetting, ParseConfig } from '@lib/types';
import PacmanLoader from 'react-spinners/PacmanLoader';
const ParseFront = require('parse');

type Props = {
  siteSetting: SiteSetting;
  parseConfig: ParseConfig;
};

export default function FixDataPage({ siteSetting, parseConfig }: Props) {
  const meta = {
    title: 'Schedule - MURAL Renaissance 2021',
    description: siteSetting.metaDescription
  };
  const [loading, setLoading] = useState<boolean>(false);

  const fixData = async () => {
    if (loading) return;
    setLoading(true);

    ParseFront.initialize(parseConfig.appId);
    ParseFront.serverURL = parseConfig.serverURL;

    const TalkWrapModel = ParseFront.Object.extend(TALK_WRAP_MODEL_NAME);
    const query = new ParseFront.Query(TalkWrapModel);
    query.equalTo('t__status', 'Published');
    query.ascending('Name');
    query.limit(10000);
    const talkWraps = await query.find();
  
    const groupedByTalks:any = {};
    const talksIds: string[] = [];
    console.log("talk wrap length", talkWraps.length);
    for (const talkWrap of talkWraps) {
      const talkId = talkWrap.get('Talk')[0].id;
      console.log("talkId", talkId);
      if (talksIds.includes(talkId)) {
        groupedByTalks[talkId] = { ...groupedByTalks[talkId], objects: [...groupedByTalks[talkId].objects, talkWrap] };
        groupedByTalks[talkId] = { ...groupedByTalks[talkId], participants: [...groupedByTalks[talkId].participants, ...(talkWrap.get('Participants') || [])] };
      } else {
        groupedByTalks[talkId] = { 
          objects: [talkWrap],
          participants: talkWrap.get('Participants')
        };
        talksIds.push(talkId);
      }
    }

    console.log("grouped By Talks", groupedByTalks);
    for (const key of Object.keys(groupedByTalks)) {
      const atom = groupedByTalks[key];
      if (atom.objects.length > 1) {
        debugger;
        const firstObject = atom.objects[0];
        firstObject.set('Participants', atom.participants);
        await firstObject.save();

        for (let i = 1; i < atom.objects.length; i++) {
          const object = atom.objects[i];
          await object.destroy();
        }
      }
    }
    setLoading(false);
  }


  const fixTalkWrapTitle = async () => {
    if (loading) return;
    setLoading(true);

    ParseFront.initialize(parseConfig.appId);
    ParseFront.serverURL = parseConfig.serverURL;

    const TalkWrapModel = ParseFront.Object.extend(TALK_WRAP_MODEL_NAME);
    const query = new ParseFront.Query(TalkWrapModel);
    query.equalTo('t__status', 'Published');
    query.include(['Talk'])
    query.limit(10000);
    const talkWraps = await query.find();
  
    for (const talkWrap of talkWraps) {
      const talk = talkWrap.get('Talk')[0];
      const title = talk.get('title');
      const start = talk.get('start');
      const end = talk.get('end');
      const newTalkWrapName = `${title}-${new Date(start).toISOString()}-${new Date(end).toISOString()}`;
      talkWrap.set('Name', newTalkWrapName);
      await talkWrap.save();
    }
    setLoading(false);
  }

  return (
    <Page meta={meta}>
      <Layout siteSetting={siteSetting} parseConfig={parseConfig}>
        <button onClick={fixData}>Fix Data</button>
        <p>
          <button onClick={fixTalkWrapTitle}>Fix Talk Wrap Title</button>
        </p>
        <div className='loading-container'>
          <PacmanLoader loading={loading} size={50} color="#FF0066" />
        </div>
      </Layout>
    </Page>
  );
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const siteSetting = await getSiteSetting();
  const parseConfig = {
    appId: process.env.CHISEL_APP_ID || '',
    serverURL: process.env.CHISEL_SERVER_URL || '',
    siteId: process.env.CHISEL_SITE_ID || ''
  };
  return {
    props: {
      parseConfig,
      siteSetting
    },
    revalidate: 60
  };
};

