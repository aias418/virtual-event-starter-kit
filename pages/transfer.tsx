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

import Layout from '@components/layout';

import { getSiteSetting } from '@lib/cms-api';
import { SiteSetting, ParseConfig } from '@lib/types';
import { TALK_MODEL_NAME } from '@lib/model-names';
import { toast } from 'react-toastify';
import PacmanLoader from 'react-spinners/PacmanLoader';

const ParseRemote = require('parse');
const ParseFront = require('parse');

type Props = {
  siteSetting: SiteSetting;
  parseConfig: ParseConfig;
  remoteServerURL: string;
};

const REMOTE_TALK_MODEL_NAME = 'ct____steves_40mural_2eco__Maze_Event____Talk';

export default function Transfer({ siteSetting, parseConfig, remoteServerURL }: Props) {
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    ParseFront.initialize(parseConfig.appId);
    ParseFront.serverURL = parseConfig.serverURL;
  }, []);
  
  const fetchRemoteTalkData = async () => {
    setLoading(true);
    console.log("talk model", TALK_MODEL_NAME);
    const TalkModel = ParseFront.Object.extend(TALK_MODEL_NAME);
    const talkQuery= new ParseFront.Query(TalkModel);
    const talkSample = await talkQuery.first();
    
    ParseRemote.initialize(parseConfig.appId);
    ParseRemote.serverURL = remoteServerURL;
    const RemoteTalkModel = ParseRemote.Object.extend(REMOTE_TALK_MODEL_NAME);
    const talkRemoteQuery = new ParseRemote.Query(RemoteTalkModel);
    talkRemoteQuery.equalTo('t__status', 'Published');
    talkRemoteQuery.limit(10000);
    const talkRemoteRecords = await talkRemoteQuery.find();
    
    ParseFront.initialize(parseConfig.appId);
    ParseFront.serverURL = parseConfig.serverURL;
    for (const talk of talkRemoteRecords) {
      const record = new TalkModel();
      ['start', 'self_assign', 'slug', 'title', 'end'].forEach(key => {
        record.set(key, talk.get(key));;
      })
      record.set('t__color', talkSample.get('t__color'));
      record.set('t__model', talkSample.get('t__model'));
      record.set('t__status', 'Published');
      await record.save();
    }
    toast.success('Finished fetching / adding remote talk records.');
    setLoading(false);
  }


  return (
    <Layout siteSetting={siteSetting} parseConfig={parseConfig}>
      <h3>Report</h3>
      <div>
        <button onClick={() => fetchRemoteTalkData()} disabled={loading}>Fetch Remote Talk Data</button>
      </div>
      <div className='loading-container'>
        <PacmanLoader loading={loading} size={50} color="#FF0066" />
      </div>
    </Layout>
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
    revalidate: 1,
    props: {
      siteSetting,
      parseConfig,
      remoteServerURL: process.env.REMOTE_SERVER_URL || ''
    }
  };
};
  