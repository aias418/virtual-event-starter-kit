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
import { Job, Sponsor, Stage, Speaker, Talk, Product, Challenge, SiteSetting, Category } from '@lib/types';


import * as chiselApi from './cms-providers/chisel';

let cmsApi: {
  getAllSpeakers: () => Promise<Speaker[]>;
  getAllStages: () => Promise<Stage[]>;
  getAllSponsors: () => Promise<Sponsor[]>;
  getAllChallenges: () => Promise<Challenge[]>;
  getAllJobs: () => Promise<Job[]>;
  getAllTalks: () => Promise<Talk[]>;
  getAllProducts: () => Promise<Product[]>;
  getAllCategories: () => Promise<Category[]>;
  getSiteSetting: () => Promise<SiteSetting>;
};

cmsApi = chiselApi;

export async function getAllSpeakers(): Promise<Speaker[]> {
  return cmsApi.getAllSpeakers();
}

export async function getAllStages(): Promise<Stage[]> {
  return cmsApi.getAllStages();
}

export async function getAllSponsors(): Promise<Sponsor[]> {
  return cmsApi.getAllSponsors();
}

export async function getAllChallenges(): Promise<Challenge[]> {
  return cmsApi.getAllChallenges();
}

export async function getAllJobs(): Promise<Job[]> {
  return cmsApi.getAllJobs();
}

export async function getAllTalks(): Promise<Talk[]> {
  return cmsApi.getAllTalks();
}

export async function getAllProducts(): Promise<Product[]> {
  return cmsApi.getAllProducts();
}

export async function getAllCategories(): Promise<Category[]> {
  return cmsApi.getAllCategories();
}

export async function getSiteSetting(): Promise<SiteSetting> {
  return cmsApi.getSiteSetting();
}