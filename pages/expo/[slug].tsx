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
import SponsorSection from '@components/sponsor-section';
import Layout from '@components/layout';

import { getAllSponsors, getSiteSetting } from '@lib/cms-api';
import { Sponsor, SiteSetting, ParseConfig } from '@lib/types';

type Props = {
  sponsor: Sponsor;
  siteSetting: SiteSetting;
  parseConfig: ParseConfig;
};

export default function SponsorPage({ sponsor, siteSetting, parseConfig }: Props) {
  const meta = {
    title: 'Demo - Virtual Event Starter Kit',
    description: siteSetting.metaDescription
  };

  return (
    <Page meta={meta}>
      <Layout siteSetting={siteSetting} parseConfig={parseConfig}>
        <SponsorSection sponsor={sponsor} />
      </Layout>
    </Page>
  );
}

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const slug = params?.slug;
  const sponsors = await getAllSponsors();
  const sponsor = sponsors.find((s: Sponsor) => s.slug === slug) || null;
  const siteSetting = await getSiteSetting();
  const parseConfig = {
    appId: process.env.CHISEL_APP_ID || '',
    serverURL: process.env.CHISEL_SERVER_URL || '',
    siteId: process.env.CHISEL_SITE_ID || ''
  };

  if (!sponsor) {
    return {
      notFound: true
    };
  }

  return {
    props: {
      sponsor,
      siteSetting,
      parseConfig
    },
    revalidate: 60
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const sponsors = await getAllSponsors();
  const slugs = sponsors.map((s: Sponsor) => ({ params: { slug: s.slug } }));

  return {
    paths: slugs,
    fallback: false //'blocking'
  };
};
