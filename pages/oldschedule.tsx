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
import Schedule from '@components/schedule';
import Layout from '@components/layout';
import ScheduleHeader from '@components/schedule-header';
import { getAllStages, getAllCategories, getSiteSetting } from '@lib/cms-api';
import { TALK_MODEL_NAME } from '@lib/model-names';
import { Stage, Category, SiteSetting, ParseConfig } from '@lib/types';
import PacmanLoader from 'react-spinners/PacmanLoader';
const ParseFront = require('parse');

type Props = {
  allStages: Stage[];
  allCategories: Category[];
  siteSetting: SiteSetting;
  parseConfig: ParseConfig
};

export default function SchedulePage({ allStages, allCategories, siteSetting, parseConfig }: Props) {
  const meta = {
    title: 'Schedule - MURAL Renaissance 2021',
    description: siteSetting.metaDescription
  };
  const [stages, setStages] = useState<Stage[]>(allStages);
  const [talksFilter, setTalksFilter] = useState('all'); // ['all', 'my']
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const getAllStages = async () => {
      if (loading) return;
      setLoading(true);

      ParseFront.initialize(parseConfig.appId);
      ParseFront.serverURL = parseConfig.serverURL;

      const TalkModel = ParseFront.Object.extend(TALK_MODEL_NAME);
      const query = new ParseFront.Query(TalkModel);
      query.equalTo('t__status', 'Published');
      query.include(['participants'])
      query.include(['schedule_collection.participants']);
      const talks = await query.find();
    
      const talksCollection = talks.map((talk: any) => {
        let participants = [];
        if (talk.get('participants'))
          participants = talk.get('participants')
            .filter((participant: any) => participant.get('t__status') == 'Published')
            .map((participant: any) => {
              return {
                id: participant.id,
                email: participant.get('Email'),
                points: participant.get('Points') || null,
                ticket: participant.get('Ticket') || null
              }
            });
        return {
          slug: talk.get('slug'),
          participants
        }
      });
      
      if (stages && stages.length > 0) {
        const tempStages = stages.map((stage) => {
          let schedule = [];
          schedule = stage.schedule.map(talk => {
            const talkObject = talksCollection.find((t:any) => t.slug === talk.slug);
            if (talkObject && talkObject.participants) return {...talk, participants: talkObject.participants};
            return talk;
          });
          return {...stage, schedule};
        })
        setStages(tempStages);
      }
      setLoading(false);
    }
    if (process.browser) getAllStages();
  }, []);


  return (
    <Page meta={meta}>
      <Layout siteSetting={siteSetting} parseConfig={parseConfig}>
        <ScheduleHeader hero="Schedule" description={meta.description} talksFilter={talksFilter} setTalksFilter={setTalksFilter} allStages={stages} />
        <Schedule allStages={stages} talksFilter={talksFilter} allCategories={allCategories} />
        <div className='loading-container'>
          <PacmanLoader loading={loading} size={50} color="#FF0066" />
        </div>
      </Layout>
    </Page>
  );
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const allStages = await getAllStages();
  const allCategories = await getAllCategories();
  const siteSetting = await getSiteSetting();
  const parseConfig = {
    appId: process.env.CHISEL_APP_ID || '',
    serverURL: process.env.CHISEL_SERVER_URL || '',
    siteId: process.env.CHISEL_SITE_ID || ''
  };
  return {
    props: {
      parseConfig,
      allStages,
      allCategories,
      siteSetting
    },
    revalidate: 60
  };
};

