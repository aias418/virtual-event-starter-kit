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
import LeaderTeamview from '@components/leader-tabview';
import Layout from '@components/layout';
import Header from '@components/header';
import { useState, useEffect } from 'react';
import { getSiteSetting } from '@lib/cms-api';
import { Participant, Team, SiteSetting, ParseConfig } from '@lib/types';
import { PARTICIPANT_MODEL_NAME, TEAM_MODEL_NAME } from '@lib/model-names';
import { parseClassName } from 'react-toastify/dist/utils';

const ParseFront = require('parse');



type Props = {
  siteSetting: SiteSetting;
  parseConfig: ParseConfig
};

export default function LeaderBoard({ siteSetting, parseConfig }: Props) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [teamsList, setTeamsList] = useState<Team[]>([]);

  // On initial load, get TeamsList and ParticipantsList
  useEffect(() => {
    const handler = setTimeout(async () => {
      ParseFront.initialize(parseConfig.appId);
      ParseFront.serverURL = parseConfig.serverURL;

      const participantQuery = new ParseFront.Query(PARTICIPANT_MODEL_NAME);
      participantQuery.equalTo('t__status', 'Published');
      const participants = await participantQuery.find();
      const participantList: Participant[] = participants
        .sort((a: any, b: any) => a.get("Points") < b.get("Points") ? 1 : -1)
        .map((participant: any, i: number) => {
          return {
            email: participant.get("Email"),
            points: participant.get("Points"),
            rank: i + 1
          };
        });
      setParticipants(participantList);
      const teamQuery = new ParseFront.Query(TEAM_MODEL_NAME);
      teamQuery.equalTo('t__status', 'Published');
      teamQuery.include(['Members']);
      const teams = await teamQuery.find();
      const teamList: Team[] = teams
        .map((team: any, i: number) => {
          if (team.get("Members")) {
            const members = team.get("Members").map((participant: any, i: number) => {
              return {
                email: participant.get("Email"),
                points: participant.get("Points"),
                rank: i + 1
              };
            });
            const points = members.reduce((sum:number, acc:any) => (sum + acc.points), 0)
            return {
              name: team.get("Name"),
              members,
              points
            };
          }
        })
        .sort((a: any, b: any) => a.points < b.points ? 1 : -1)
      setTeamsList(teamList);
    }, 0)

    return () => clearTimeout(handler);
  }, [])
  const meta = {
    title: 'Leaderboard - Virtual Event Starter Kit',
    description: siteSetting.metaDescription
  };

  return (
    <Page meta={meta}>
      <Layout siteSetting={siteSetting} parseConfig={parseConfig}>
        <Header hero="Leaderboard" description={meta.description} />
        <LeaderTeamview participants={participants} teams={teamsList} />
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
