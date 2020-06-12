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
import Error from 'next/error';
import Head from 'next/head';
import { SkipNavContent } from '@reach/skip-nav';
import redis from '@lib/redis';

import Page from '@components/page';
import ConfContent from '@components/index';
import { ParseConfig, SiteSetting } from '@lib/types';
import { getSiteSetting } from '@lib/cms-api';

type Props = {
  username: string | null;
  usernameFromParams: string | null;
  name: string | null;
  ticketNumber: number | null;
  clientId: string;
  redirectURI: string;
  siteSetting: SiteSetting;
  parseConfig: ParseConfig
};

export default function TicketShare({ username, ticketNumber, name, usernameFromParams, clientId, redirectURI, siteSetting, parseConfig }: Props) {
  if (!ticketNumber) {
    return <Error statusCode={404} />;
  }

  const meta = username
    ? {
        title: `${name}’s ${siteSetting.siteName} Ticket`,
        description: siteSetting.metaDescription,
        image: `/api/ticket-images/${username}`,
        url: `${siteSetting.siteURL}/tickets/${username}`
      }
    : {
        title: 'Ticket - MURAL Maze 2021',
        description: siteSetting.metaDescription,
        image: `/api/ticket-images/${usernameFromParams}`,
        url: `${siteSetting.siteURL}/tickets/${usernameFromParams}`
      };

  return (
    <Page meta={meta}>
      <Head>
        <meta name="robots" content="noindex" />
      </Head>
      <SkipNavContent />
      <ConfContent
        clientId={clientId}
        redirectURI={redirectURI}
        siteSetting={siteSetting}
        sharePage
        parseConfig={parseConfig}
      />
    </Page>
  );
}

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const username = params?.username?.toString() || null;
  const siteSetting = await getSiteSetting();
  const parseConfig = {
    appId: process.env.CHISEL_APP_ID || '',
    serverURL: process.env.CHISEL_SERVER_URL || '',
    siteId: process.env.CHISEL_SITE_ID || ''
  };
  
  if (redis) {
    if (username) {
      const [name, ticketNumber] = await redis.hmget(`user:${username}`, 'name', 'ticketNumber');

      if (ticketNumber) {
        return {
          props: {
            username: username || null,
            usernameFromParams: username || null,
            name: name || username || null,
            ticketNumber: parseInt(ticketNumber, 10) || null,
            parseConfig,
            clientId: process.env.MURAL_OAUTH_CLIENT_ID || '',
            redirectURI: process.env.MURAL_OAUTH_REDIRECT_URI || '',
            siteSetting
          },
          revalidate: 5
        };
      }
    }
    return {
      props: {
        username: null,
        usernameFromParams: username || null,
        name: null,
        ticketNumber: null,
        parseConfig,
        clientId: process.env.MURAL_OAUTH_CLIENT_ID || '',
        redirectURI: process.env.MURAL_OAUTH_REDIRECT_URI || '',
        siteSetting
      },
      revalidate: 5
    };
  } else {
    return {
      props: {
        username: null,
        usernameFromParams: username || null,
        name: null,
        ticketNumber: siteSetting.sampleTicketNumber,
        parseConfig,
        clientId: process.env.MURAL_OAUTH_CLIENT_ID || '',
        redirectURI: process.env.MURAL_OAUTH_REDIRECT_URI || '',
        siteSetting
      },
      revalidate: 5
    };
  }
};

export const getStaticPaths: GetStaticPaths = async () => {
  return Promise.resolve({
    paths: [],
    fallback: false //'blocking'
  });
};
