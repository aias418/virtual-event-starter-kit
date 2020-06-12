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

import Page from '@components/page';
import SpeakersGrid from '@components/speakers-grid';
import Layout from '@components/layout';
import Header from '@components/header';

import { getAllSpeakers, getSiteSetting } from '@lib/cms-api';
import { Speaker, SiteSetting, ParseConfig } from '@lib/types';

type Props = {
  speakers: Speaker[];
  siteSetting: SiteSetting;
  parseConfig: ParseConfig;
};

export default function Speakers({ speakers, siteSetting, parseConfig }: Props) {
  const meta = {
    title: 'Facilitators & Speakers',
    description: siteSetting.metaDescription
  };
  return (
    <Page meta={meta}>
      <Layout siteSetting={siteSetting} parseConfig={parseConfig}>
        <Header hero="Facilitators & Speakers" description={meta.description} />
        <SpeakersGrid speakers={speakers} />
      </Layout>
    </Page>
  );
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const speakers = await getAllSpeakers();
  const siteSetting =  await getSiteSetting();
  const parseConfig = {
    appId: process.env.CHISEL_APP_ID || '',
    serverURL: process.env.CHISEL_SERVER_URL || '',
    siteId: process.env.CHISEL_SITE_ID || ''
  };

  return {
    props: {
      speakers,
      siteSetting,
      parseConfig
    },
    revalidate: 60
  };
};
