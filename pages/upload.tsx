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
import Layout from '@components/layout';

import { getSiteSetting } from '@lib/cms-api';
import { SiteSetting, ParseConfig } from '@lib/types';
import { PARTICIPANT_MODEL_NAME, TEAM_MODEL_NAME, TALK_MODEL_NAME } from '@lib/model-names';
import { toast } from 'react-toastify';

const ParseFront = require('parse');
const papa = require('papaparse');

type Props = {
  siteSetting: SiteSetting;
  parseConfig: ParseConfig
};
  
const SURNAME_INDEX = 0;
const FIRSTNAME_INDEX = 1;
const TEAM_INDEX = 2;
const JOB_TITLE_INDEX = 4;
const LOCATION_INDEX = 5;
const EMAIL_INDEX = 6;

export default function Maze({ siteSetting, parseConfig }: Props) {
  const [statistics, setStatistics] = useState<any[]>([]);
  useEffect(() => {
    const fetchTalksList = async () => {
      const TalkModel = ParseFront.Object.extend(TALK_MODEL_NAME);
      const talkQuery = new ParseFront.Query(TalkModel);
      talkQuery.equalTo('t__status', 'Published');
      talkQuery.limit(10000);
      const talkRecords = await talkQuery.find();
      const talksStaticstics = [];
      for (const talk of talkRecords) {
        if (talk.get('participants')) {
          const participantIds = talk.get('participants').map((p:any) => p.id);
          const newParticipants = talk.get('participants').filter((participant: any, index: number) => participantIds.indexOf(participant.id) === index);
          talksStaticstics.push({ 
            title: talk.get('title'), 
            max_capacity: talk.get('max_capacity'),
            talkCount: participantIds.length, 
            uniqueCount: newParticipants.length 
          });
        }
      }
      setStatistics(talksStaticstics);
    }
    ParseFront.initialize(parseConfig.appId);
    ParseFront.serverURL = parseConfig.serverURL;
    fetchTalksList();
  }, []);

  const clearConflict = async () => {
    const TalkModel = ParseFront.Object.extend(TALK_MODEL_NAME);
    const talkQuery = new ParseFront.Query(TalkModel);
    talkQuery.equalTo('t__status', 'Published');
    talkQuery.limit(10000);
    const talkRecords = await talkQuery.find();
    for (const talk of talkRecords) {
      if (talk.get('participants')) {
        const participantIds = talk.get('participants').map((p:any) => p.id);
        const newParticipants = talk.get('participants').filter((participant: any, index: number) => participantIds.indexOf(participant.id) === index);
        if (newParticipants.length !== participantIds.length) {
          talk.set('participants', newParticipants);
          await talk.save();
        }

      }
    }
    toast.success('Yay! Conflict free.');
  }

  const upload = (evt: any) => {
    var data = null;
    var file = evt.target.files[0];
    var reader = new FileReader();
    reader.readAsText(file);
    reader.onload = async function(event) {
      const TeamModel = ParseFront.Object.extend(TEAM_MODEL_NAME);
      const teamQuery = new ParseFront.Query(TeamModel);
      const teamRecords = await teamQuery.find();

      const ParticipantModel = ParseFront.Object.extend(PARTICIPANT_MODEL_NAME);
      const query = new ParseFront.Query(ParticipantModel);
      const sampleParticipant = await query.first();
      var csvData = event?.target?.result;
      var parsed = papa.parse(csvData);
      for (let atom of parsed.data) {
        if (atom[0] === 'Surname' ||  atom[0] === '') continue;

        const teamIndex = teamRecords.findIndex((record: any) => record.get('Name') === atom[TEAM_INDEX]);

        const participant = new ParticipantModel();
        participant.set('First_Name', atom[FIRSTNAME_INDEX]);
        participant.set('Surname', atom[SURNAME_INDEX]);
        participant.set('Points', 0);
        participant.set('Team', [teamRecords[teamIndex]]);
        participant.set('Location', atom[LOCATION_INDEX])
        participant.set('Job_Title', atom[JOB_TITLE_INDEX])
        participant.set('Email', atom[EMAIL_INDEX]);
        participant.set('t__status', 'Published');
        participant.set('t__model', sampleParticipant.get('t__model'));
        participant.set('t__color', sampleParticipant.get('t__color'));
        await participant.save();
      }
      
    };
    reader.onerror = function() {
        alert('Unable to read ' + file.fileName);
    };
  }
  return (
    <Layout siteSetting={siteSetting} parseConfig={parseConfig}>
      <div id="dvImportSegments" className="file-upload ">
        <fieldset>
          <legend>Upload your CSV File</legend>
          <input type="file" name="File Upload" id="txtFileUpload" accept=".csv" onChange={upload} />
        </fieldset>
      </div>
      <h3>Talk Table</h3>
      <div>
        <button onClick={() => clearConflict()}>Clear Conflict</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <td>Total Count</td>
            <th>Real count</th>
            <th>Unique count</th>
            <th>Conflict</th>
          </tr>
        </thead>
        <tbody>
          {
            statistics && statistics.map(talk => (<tr>
              <td>{talk.title}</td>
              <td>{talk.max_capacity}</td>
              <td>{talk.talkCount}</td>
              <td>{talk.uniqueCount}</td>
              <td>{talk.talkCount !== talk.uniqueCount ? 'Conflict' : '' }</td>
            </tr>
            ))
          }
          <tr>
            
          </tr>
        </tbody>

      </table>
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
  