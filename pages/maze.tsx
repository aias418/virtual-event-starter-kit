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
import Layout from '@components/layout';
import { toast } from 'react-toastify';
import { REGISTER_MESSAGE, MAIN_EMBED_URL } from '@lib/constants';
import { getSiteSetting } from '@lib/cms-api';
import { SiteSetting, ParseConfig } from '@lib/types';
import { getWithExpiry } from '@lib/local-storage';

type Props = {
  siteSetting: SiteSetting;
  parseConfig: ParseConfig;
};
  

export default function Maze({ siteSetting, parseConfig }: Props) {
  const meta = {
    title: 'Maze - Renaissance 2021',
    description: siteSetting.metaDescription
  };
  const currentUser = getWithExpiry('currentUser');
  if (process.browser && (!currentUser || !currentUser.id)) {
    toast.error(REGISTER_MESSAGE);
    window.location.href = '/';
  }

  return (
    <Page meta={meta}>
      <Layout siteSetting={siteSetting} parseConfig={parseConfig}>
        <div style={{ height: "100%", width: "100%" }}>
          <iframe src={MAIN_EMBED_URL}
            width="100%"
            style={{ minWidth: 640, minHeight: 480, backgroundColor: '#f4f4f4', border: '1px solid #efefef' }}
            sandbox="allow-same-origin allow-scripts allow-popups allow-modals allow-popups-to-escape-sandbox">
          </iframe>
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
    revalidate: 1,
    props: {
      siteSetting,
      parseConfig
    }
  };
};
  