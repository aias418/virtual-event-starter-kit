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

export type Image = {
  url: string;
};

export type Speaker = {
  name: string;
  bio: string;
  title: string;
  slug: string;
  twitter: string;
  github: string;
  company: string;
  talk: Talk;
  image: Image;
  imageSquare: Image;
};

export type Stage = {
  name: string;
  slug: string;
  stream: string;
  discord: string;
  schedule: Talk[];
  live: boolean;
  warmupExercises: Exercise[];
  description: string;
};

export type Talk = {
  id: string;
  title: string;
  slug: string;
  description: string;
  start: string;
  end: string;
  speakers: Speaker[];
  mural_link: string;
  zoom_link: string;
  mural_embed?: string;
  mibo_link?: string;
  participants: Participant[];
  max_capacity: number;
  self_assign: boolean;
  categories: any[];
  videoUrl_left: string;
};

export type MinimumTalk = {
  id: string;
  slug: string;
  start: string;
  end: string;
}

export type Exercise = {
  name: string;
  description: string;
};

export type Link = {
  url: string;
};

export type Sponsor = {
  name: string;
  description: string;
  slug: string;
  website: string;
  callToAction: string;
  callToActionLink: string;
  links: SponsorLink[];
  discord: string;
  tier: string;
  cardImage: Image;
  logo: Image;
  youtubeSlug: string;
};

export type SponsorLink = {
  text: string;
  url: string;
};

export type Job = {
  id: string;
  companyName: string;
  title: string;
  description: string;
  discord: string;
  link: string;
  rank: number;
};

export type Participant = {
  email: string;
  points: number;
  ticket: string;
  rank: number;
  name?: string;
}

export type Team = {
  name: string;
  members: Participant[];
  points: number;
}

export type Challenge = {
  name: string;
  points: number;
  type: string; // Enum Type: Exercise, Poll, Survey, and Other
  description: string;
  code: string;
  typeformURL: string
}

export type Product = {
  name: string;
  price: number;
  description: string;
  image: Image;
  asset: Image;
}

export type ConfUser = {
  id?: string;
  email: string;
  ticketNumber: number;
  name?: string;
  username?: string;
  createdAt: number;
};

export type GitHubOAuthData =
  | {
      type: 'token';
      token: string;
    }
  | {
      type: 'user';
      name: string;
      login: string;
    };

export type NavigationItem = {
  route: string;
  hidden: boolean;
  name: string;
}

export type SiteSetting = {
  metaDescription: string;
  twitterUsername: string;
  brandName: string;
  siteName: string;
  siteDescription: string;
  copyrightText: string;
  sampleTicketNumber: number;
  legalURL: string;
  name: string;
  githubRepo: string;
  navigationItems: NavigationItem[];
  siteNameMultiline: string[];
  siteURL: string;
  ticketThemes: string[];
  codeOfConduct: string;
  dateText: string;
  fullDate: string;
};

export type Category = {
  name: string;
  icon: string;
  backgroundColor: string;
  strokeColor: string;
}

export type TalkWrap = {
  name: string;
  talk: Talk;
  participant: Participant;
};

export type ParseConfig = {
  appId: string;
  serverURL: string;
  siteId: string;
}