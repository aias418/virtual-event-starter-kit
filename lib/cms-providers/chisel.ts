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
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-var-requires */

const Parse = require('parse/node');

import { Job, Participant, Speaker, Sponsor, Stage, Talk, Challenge, Exercise, Product, SiteSetting, Category } from '../types';
import { SPEAKER_MODEL_NAME, STAGE_MODEL_NAME, TALK_MODEL_NAME, CHALLENGE_MODEL_NAME, PRODUCT_MODEL_NAME, SETTING_MODEL_NAME, CATEGORY_MODEL_NAME } from '../model-names';

// Parse Initialization with MASTER KEY
Parse.initialize(process.env.CHISEL_APP_ID, null, process.env.CHISEL_MASTER_KEY);
Parse.serverURL = process.env.CHISEL_SERVER_URL;
Parse.Cloud.useMasterKey();





export async function getAllSpeakers(): Promise<Speaker[]> {
  
  const SpeakerModel = Parse.Object.extend(SPEAKER_MODEL_NAME);
  const query = new Parse.Query(SpeakerModel);
  query.equalTo('t__status', 'Published');
  query.include('image');
  query.include('image_square');
  query.include(['talk']);
  const speakers = await query.find();

  const lst: Speaker[] = speakers.map((speaker: any) => {
    const talks = (speaker.get('talk') || [])
      .map((t: any) => {
        return {
          title: t.get('title'),
          description: t.get('description') || null
        };
      });
    const talk = talks.length > 0 ? talks[0] : null;
    return {
      name: speaker.get('name'),
      title: speaker.get('title'),
      bio: speaker.get('bio'),
      slug: speaker.get('slug'),
      twitter: speaker.get('twitter') || null,
      github: speaker.get('github') || null,
      company: speaker.get('company') || null,
      image: {
        url: speaker.get('image').get('file')._url
      },
      imageSquare: {
        url: speaker.get('image_square').get('file')._url
      },
      talk
    }
  });
  return lst.sort((a, b) => (a.name > b.name ? 1 : -1));
}







export async function getAllStages(): Promise<Stage[]> {
  const StageModel = Parse.Object.extend(STAGE_MODEL_NAME);
  const query = new Parse.Query(StageModel);
  query.ascending('order');
  query.equalTo('t__status', 'Published');
  query.include(['schedule_collection'])
  query.include(['schedule_collection.speaker_collection']);
  query.include(['schedule_collection.speaker_collection.image']);
  query.include(['schedule_collection.participants']);
  query.include(['schedule_collection.category']);
  query.include(['warmup_exercises']);
  const stages = await query.find();

  const lst: Stage[] = stages.map((stage: any) => {
    let schedule = [];
    /* Build schedule list for stage */
    if (stage.get('schedule_collection')) {
      schedule = stage.get('schedule_collection')
        .filter((schedule_record: any) => schedule_record.get('t__status') === 'Published')
        .sort((scheduleA: any, scheduleB: any) => scheduleA.get('start').getTime() > scheduleB.get('start').getTime() ? 1 : -1)
        .map((schedule_record: any) => {
          let speakers= [];
          let participants = [];
          let categories = [];
          if (schedule_record.get('speaker_collection'))
            speakers = schedule_record.get('speaker_collection').map((speaker_record: any) => {
              return {
                name: speaker_record.get('name'),
                slug: speaker_record.get('slug'),
                image: {
                  url: speaker_record.get('image').get('file')._url
                }
              }
            })
          if (schedule_record.get('participants'))
            participants = schedule_record.get('participants')
              .filter((participant: any) => participant.get('t__status') == 'Published')
              .map((participant: any) => {
                return {
                  id: participant.id,
                  email: participant.get('Email'),
                  points: participant.get('Points') || null,
                  ticket: participant.get('Ticket') || null
                }
              });
          if (schedule_record.get('category'))
            categories = schedule_record.get('category')
              .filter((category: any) => category.get('t__status') == 'Published')
              .map((category: any) => {
                return {
                  icon: category.get('Icon'),
                  stroke: category.get('Stroke_Colour'),
                  background: category.get('Background_Colour')
                }
              });
          return {
            id: schedule_record.id,
            title: schedule_record.get('title'),
            slug: schedule_record.get('slug'),
            start: schedule_record.get('start').toISOString(),
            end: schedule_record.get('end').toISOString(),
            speakers,
            participants,
            categories,
            max_capacity: schedule_record.get('max_capacity') || 0,
            self_assign: schedule_record.get('self_assign')
          }
        });
    }

    /* Build warmup exercises list for stage */
    let warmupExercises = [];
    if (stage.get('warmup_exercises')) {
      warmupExercises = stage.get('warmup_exercises')
        .map((exercise: any) => {
          return {
            name: exercise.get('Name'),
            description: exercise.get('Description')
          }
        });
    }


    return {
      name: stage.get('name'),
      description: stage.get('description') || null,
      slug: stage.get('slug'),
      live: stage.get('live'),
      schedule,
      warmupExercises
    }
  });

  return lst;
}








export async function getAllTalks(): Promise<Talk[]> {
  
  const query = new Parse.Query(TALK_MODEL_NAME);
  query.limit(1000);
  query.equalTo('t__status', 'Published');
  query.include(['category']);
  query.include(['speaker_collection']);
  query.include(['speaker_collection.image']);
  query.include(['participants']);
  const talks = await query.find();
  const lst: Talk[] = talks
    .map((talk: any) => {
      let speakers = [];
      let participants = [];
      let categories = [];
      if (talk.get('speaker_collection'))
        speakers = talk.get('speaker_collection').map((speaker: any) => {
          return {
            name: speaker.get('name'),
            slug: speaker.get('slug'),
            image: {
              url: speaker.get('image').get('file')._url
            }
          }
        });
      if (talk.get('participants'))
        participants = talk.get('participants')
          .filter((participant: any) => participant.get('t__status') == 'Published')
          .map((participant: any) => {
            return {
              id: participant.id,
              email: participant.get('Email'),
              points: participant.get('Points') || null,
              ticket: participant.get('Ticket') || null
            }
          });
      if (talk.get('category'))
        categories = talk.get('category')
          .map((category: any) => {
            return {
              icon: category.get('Icon'),
              stroke: category.get('Stroke_Colour'),
              background: category.get('Background_Colour')
            }
          });
      return {
        id: talk.id,
        title: talk.get('title'),
        slug: talk.get('slug'),
        start: talk.get('start').toISOString(),
        end: talk.get('end').toISOString(),
        mural_link: talk.get('mural_link') || null,
        zoom_link: talk.get('zoom_link') || null,
        mural_embed: talk.get('mural_embed') || null,
        mibo_link: talk.get('mibo_link') || null,
        speakers,
        participants,
        categories,
        max_capacity: talk.get('max_capacity') || 0,
        self_assign: talk.get('self_assign'),
        description: talk.get('description') || null,
        videoUrl_left: talk.get('videoUrl_left') || null
      }
    });
  return lst;
}



export async function getAllChallenges(): Promise<Challenge[]> {
  
  const query = new Parse.Query(CHALLENGE_MODEL_NAME);
  query.equalTo('t__status', 'Published');
  query.equalTo('Enabled', true);
  query.include(['Question_Set']);
  const challenges = await query.find();

  const lst: Challenge[] = challenges
    .map((challenge: any) => {
      return {
        name: challenge.get('Name'),
        points: challenge.get('Points'),
        type: challenge.get('Type'),
        description: challenge.get('Description'),
        code: challenge.get('Code') || null,
        typeformURL: challenge.get('Typeform_URL') || null
      }
    });
  return lst;
}

export async function getAllProducts(): Promise<Product[]> {
  
  const ProductModel = Parse.Object.extend(PRODUCT_MODEL_NAME);
  const query = new Parse.Query(ProductModel);
  query.equalTo('t__status', 'Published');
  query.include('Image');
  query.include('Asset_Download');
  const products = await query.find();

  const lst: Product[] = products.map((product: any) => {
    return {
      name: product.get('Name'),
      price: product.get('Price'),
      description: product.get('Description'),
      image: {
        url: product.get('Image').get('file')._url
      },
      asset: {
        url: product.get('Asset_Download').get('file')._url
      }
    }
  });
  return lst.sort((a, b) => (a.name > b.name ? 1 : -1));
}



export async function getAllSponsors(): Promise<Sponsor[]> {
  
  const lst: Sponsor[] = [];
  return lst;
}

export async function getAllJobs(): Promise<Job[]> {
  const lst: Job[] = [];
  return lst;
}

// Get site setting to replace constant
export async function getSiteSetting(): Promise<SiteSetting> {
  const query = new Parse.Query(SETTING_MODEL_NAME);
  query.equalTo('t__status', 'Published');
  query.include(['Navigation_Items']);
  const settings = await query.find();

  if (settings && settings.length > 0) {
    const setting = settings[0];
    const navigationItems = setting.get('Navigation_Items').map((navigationItem: any) => {
      return {
        route: navigationItem.get('Route'),
        hidden: navigationItem.get('Hidden'),
        name: navigationItem.get('Name')
      }
    });

    const siteSetting: SiteSetting = {
      metaDescription: setting.get('Meta_Description'),
      twitterUsername: setting.get('Twitter_Username'),
      brandName: setting.get('Brand_Name'),
      siteName: setting.get('Site_Name'),
      siteDescription: setting.get('Site_Description'),
      copyrightText: setting.get('Copyright_Text'),
      sampleTicketNumber: setting.get('Sample_Ticket_Number'),
      legalURL: setting.get('Legal_URL'),
      name: setting.get('Meta_Description'),
      githubRepo: setting.get('Github_Repo'),
      navigationItems,
      siteNameMultiline: setting.get('Site_Name_Multi_Line'),
      siteURL: setting.get('Site_URL'),
      ticketThemes: setting.get('Ticket_Themes'),
      codeOfConduct: setting.get('Code_of_Conduct_Text'),
      dateText: setting.get('Date_Text'),
      fullDate: setting.get('Full_Date')
    };
    return siteSetting;
  }
  return {
    metaDescription: '',
    twitterUsername: '',
    brandName: '',
    siteName: '',
    siteDescription: '',
    copyrightText: '',
    sampleTicketNumber: 0,
    legalURL: '',
    name: '',
    githubRepo: '',
    navigationItems: [],
    siteNameMultiline: [],
    siteURL: '',
    ticketThemes: [],
    codeOfConduct: '',
    dateText: '',
    fullDate: ''
  };
}

// Crystall Ball talk categories
export async function getAllCategories(): Promise<Category[]> {
  const CategoryModel = Parse.Object.extend(CATEGORY_MODEL_NAME);
  const query = new Parse.Query(CategoryModel);
  query.equalTo('t__status', 'Published');
  const categories = await query.find();

  const lst: Category[] = categories.map((category: any) => {
    return {
      name: category.get('Name'),
      icon: category.get('Icon'),
      strokeColor: category.get('Stroke_Colour'),
      backgroundColor: category.get('Background_Colour')
    }
  });
  return lst.sort((a, b) => (a.name > b.name ? 1 : -1));
}