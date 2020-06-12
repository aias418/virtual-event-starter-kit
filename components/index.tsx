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

import { useEffect, useState } from 'react';
import { ParseConfig, SiteSetting } from '@lib/types';
import { PageState, ConfDataContext } from '@lib/hooks/use-conf-data';
import Ticket from './ticket';
import Layout from './layout';
import ConfContainer from './conf-container';
import Hero from './hero';
import Form from './form';
import { getWithExpiry } from '@lib/local-storage';

type Props = {
  sharePage?: boolean;
  defaultPageState?: PageState;
  clientId: string;
  redirectURI: string;
  siteSetting: SiteSetting;
  parseConfig: ParseConfig
};

export default function Conf({
  sharePage,
  defaultPageState = 'registration',
  clientId,
  redirectURI,
  siteSetting,
  parseConfig
}: Props) {
  const [pageState, setPageState] = useState<PageState>(defaultPageState);
  /* const [currentUser, setCurrentUser] = useState({});
  useEffect(() => {
    setCurrentUser(getWithExpiry('userData'));
  }, []); */
  const currentUser = getWithExpiry('currentUser');
  return (
    <ConfDataContext.Provider
      value={{
        setPageState
      }}
    >
      <Layout siteSetting={siteSetting} parseConfig={parseConfig}>
        <ConfContainer>
          { (!currentUser || !currentUser.username) ? (
            <div>
              <Hero siteSetting={siteSetting} />
              <Form appId={parseConfig.appId} serverURL={parseConfig.serverURL} siteId={parseConfig.siteId} />
            </div>
          ) : (
              <Ticket
                sharePage={sharePage}
                appId={parseConfig.appId}
                serverURL={parseConfig.serverURL}
                siteId={parseConfig.siteId}
                clientId={clientId}
                redirectURI={redirectURI}
              />
            )}
        </ConfContainer>
      </Layout>
    </ConfDataContext.Provider>
  );
}
