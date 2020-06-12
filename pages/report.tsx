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
import { ParseConfig, SiteSetting } from '@lib/types';
import { PARTICIPANT_MODEL_NAME, TALK_MODEL_NAME, TALK_WRAP_MODEL_NAME } from '@lib/model-names';
import { format } from 'date-fns-tz';
import { toast } from 'react-toastify';
import PacmanLoader from 'react-spinners/PacmanLoader';


const ParseFront = require('parse');

type Props = {
  siteSetting: SiteSetting;
  parseConfig: ParseConfig
};


export default function Report({ siteSetting, parseConfig }: Props) {
  const [participantData, setParticipantData] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [validCount, setValidCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [teamSort, setTeamSort] = useState(-1);
  const [locationSort, setLocationSort] = useState(-1);
  useEffect(() => {
    ParseFront.initialize(parseConfig.appId);
    ParseFront.serverURL = parseConfig.serverURL;
    if (process.browser) generateReport();
  }, []);

  const fillInFetchWrap = async () => {
    setLoading(true);
    const TalkModel = ParseFront.Object.extend(TALK_MODEL_NAME);
    const TalkWrapModel = ParseFront.Object.extend(TALK_WRAP_MODEL_NAME);
    const talkWraperQuery= new ParseFront.Query(TalkWrapModel);
    const talkWrapperRecordSample = await talkWraperQuery.first();

    const talkQuery = new ParseFront.Query(TalkModel);
    talkQuery.equalTo('t__status', 'Published');
    talkQuery.limit(10000);
    const talkRecords = await talkQuery.find();
    for (const talk of talkRecords) {
      const talkWrapName=`${talk.get('title')}-${format(talk.get('start'), 'EEE MMM dd yyyy, HH:mm')}-${format(talk.get('end'), 'HH:mm')}`;
      if (talk.get('participants')) {
        const participantIds = talk.get('participants').map((p:any) => p.id);
        const newParticipants = talk.get('participants').filter((participant: any, index: number) => participantIds.indexOf(participant.id) === index);
      
        const record = new TalkWrapModel();
        record.set('Name', talkWrapName);
        record.set('Talk', [talk]);
        record.set('Participants', newParticipants);
        record.set('t__color', 'rgba(28, 224, 230, 1)');
        record.set('t__status', 'Published');
        record.set('t__model', talkWrapperRecordSample.get('t__model'))
        await record.save();         
      }
    }
    toast.success('Finished adding talk wrap records.');
    setLoading(false);
  }

  const generateReport = async () => {
    setLoading(true);
    const ParticipantModel = ParseFront.Object.extend(PARTICIPANT_MODEL_NAME);
    const participantQuery = new ParseFront.Query(ParticipantModel);
    participantQuery.equalTo('t__status', 'Published');
    participantQuery.include(['Team']);
    participantQuery.limit(10000);
    const participants = await participantQuery.find();
    const participantMapping = participants.reduce((acc: any, cur: any) => {
      const teamObject = cur.get('Team');
      let team = 'No Team';
      if (teamObject && teamObject.length > 0 && teamObject[0]) team = teamObject[0].get('Name');
      acc[cur.id] = {
        id: cur.id,
        name: `${cur.get('First_Name') || ''} ${cur.get('Surname') || ''}`,
        email: cur.get('Email'),
        location: cur.get('Location'),
        team,
        count: 0
      };
      return acc;
    }, {});


    const TalkWrapModel = ParseFront.Object.extend(TALK_WRAP_MODEL_NAME);
    const talkWraperQuery= new ParseFront.Query(TalkWrapModel);
    talkWraperQuery.equalTo('t__status', 'Published');
    talkWraperQuery.limit(10000);
    const talkRecords = await talkWraperQuery.find();

    for (const talk of talkRecords) {
      if (talk.get('Participants')) {
        const participantIds = talk.get('Participants').map((p:any) => p.id);
        for (const participantId of participantIds) {
          if (participantMapping[participantId])
            participantMapping[participantId] = {...participantMapping[participantId], count: participantMapping[participantId].count + 1};
          else
            console.log("participant id", participantId);
        }
      }
    }

    let filteredMapping = {};
    const participantArray:any[] = [];
    Object.keys(participantMapping).forEach(key => {
      if (participantMapping[key].count > 0) filteredMapping = { ...filteredMapping, [key]: participantMapping[key] };
      participantArray.push(participantMapping[key]);
    });
    setParticipantData(participantArray);
    setTotalCount(Object.keys(participantMapping).length);
    setValidCount(Object.keys(filteredMapping).length);
    toast.success('Finished generating records.');
    setLoading(false);
  }

  const sortByTeam = () => {
    setLoading(true);
    const updatedParticipants = [...participantData];
    updatedParticipants.sort((a, b) => {
      return teamSort * ((a.team > b.team) ? -1 : 1);
    });
    setParticipantData(updatedParticipants);
    setTeamSort(teamSort * -1);
    setLoading(false);
  }

  const sortByLocation = () => {
    setLoading(true);
    const updatedParticipants = [...participantData];
    updatedParticipants.sort((a, b) => {
      return locationSort * ((a.location > b.location) ? -1 : 1);
    });
    setParticipantData(updatedParticipants);
    setLocationSort(locationSort * -1);
    setLoading(false);
  }

  return (
    <Layout siteSetting={siteSetting} parseConfig={parseConfig}>
      <div className="report-page">
        <h3>Report</h3>
        { !loading && <p>Total Participants Count: { validCount } / { totalCount } </p> }
        { !loading &&
          <table className="report-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Count</th>
                <th className="sorting-available" onClick={sortByTeam}>Team</th>
                <th className="sorting-available" onClick={sortByLocation}>Location</th>
              </tr>
            </thead>
            <tbody>
              {
                participantData && participantData.map((record: any) => {
                  return (
                    <tr key={record.id}>
                      <td>{ record?.name }</td>
                      <td>{ record?.email }</td>
                      <td>{ record?.count }</td>
                      <td>{ record?.team }</td>
                      <td>{ record?.location }</td>
                    </tr>
                  );
                })
              }
            </tbody>

          </table>
        }
        <div className='loading-container'>
          <PacmanLoader loading={loading} size={50} color="#FF0066" />
        </div>
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
      parseConfig
    }
  };
};
  