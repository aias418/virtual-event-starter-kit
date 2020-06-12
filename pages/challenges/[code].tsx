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

import { GetStaticProps, GetStaticPaths } from 'next';

import Page from '@components/page';
import ChallengeSection from '@components/challenge-section';
import Layout from '@components/layout';

import { getAllChallenges } from '@lib/cms-api';
import { Challenge, SiteSetting, ParseConfig } from '@lib/types';
import { getSiteSetting } from '@lib/cms-providers/chisel';

type Props = {
  challenge: Challenge;
  siteSetting: SiteSetting
  parseConfig: ParseConfig
};

export default function ChallengePage({ challenge, siteSetting, parseConfig }: Props) {
  const meta = {
    title: 'Demo - Virtual Event Starter Kit',
    description: siteSetting.metaDescription
  };

  return (
    <Page meta={meta}>
      <Layout siteSetting={siteSetting} parseConfig={parseConfig}>
        <ChallengeSection challenge={challenge} />
      </Layout>
    </Page>
  );
}

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const code = params?.code;
  const challenges = await getAllChallenges();
  const currentChallenge = challenges.find((c: Challenge) => c.code === code) || null;
  const parseConfig = {
    appId: process.env.CHISEL_APP_ID || '',
    serverURL: process.env.CHISEL_SERVER_URL || '',
    siteId: process.env.CHISEL_SITE_ID || ''
  };
  const siteSetting = await getSiteSetting();
  if (!currentChallenge) {
    return {
      notFound: true
    };
  }

  return {
    props: {
      challenge: currentChallenge,
      siteSetting,
      parseConfig
    },
    revalidate: 60
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const challenges = await getAllChallenges();
  const codes = challenges.map((c: Challenge) => ({ params: { code: c.code } }));

  return {
    paths: codes,
    fallback: false
  };
};
