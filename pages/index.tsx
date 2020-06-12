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
import { useRouter } from 'next/router';
import { SkipNavContent } from '@reach/skip-nav';

import Page from '@components/page';
import ConfContent from '@components/index';
import { getSiteSetting } from '@lib/cms-api';
import { ParseConfig, SiteSetting } from '@lib/types';

type Props = {
  clientId: string;
  redirectURI: string;
  siteSetting: SiteSetting;
  parseConfig: ParseConfig
};

export default function Conf({ clientId, redirectURI, siteSetting, parseConfig }: Props) {
  const { query } = useRouter();
  const meta = {
    title: 'MURAL Renaissance 2021',
    description: siteSetting.metaDescription
  };
  const ticketNumber = query.ticketNumber?.toString();

  return (
    <Page meta={meta} fullViewport>
      <SkipNavContent />
      <ConfContent
        clientId={clientId}
        redirectURI={redirectURI}
        defaultPageState={query.ticketNumber ? 'ticket' : 'registration'}
        siteSetting={siteSetting}
        parseConfig={parseConfig}
      />
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
    revalidate: 1,
    props: {
      clientId: process.env.MURAL_OAUTH_CLIENT_ID || '',
      redirectURI: process.env.MURAL_OAUTH_REDIRECT_URI || '',
      siteSetting,
      parseConfig
    }
  };
};
