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
import ProductsGrid from '@components/products-grid';
import Layout from '@components/layout';
import Header from '@components/header';

import { getAllProducts, getSiteSetting } from '@lib/cms-api';
import { ParseConfig, Product, SiteSetting } from '@lib/types';

type Props = {
	products: Product[];
	siteSetting: SiteSetting;
	parseConfig: ParseConfig
};

export default function Speakers({ products, siteSetting, parseConfig }: Props) {
	const meta = {
		title: 'Shop - Renaissance 2021 - Resources',
		description: siteSetting.metaDescription
	};
	return (
		<Page meta={meta}>
			<Layout siteSetting={siteSetting} parseConfig={parseConfig}>
				<Header hero="Shop" description={meta.description} />
				<ProductsGrid products={products} />
			</Layout>
		</Page>
	);
}

export const getStaticProps: GetStaticProps<Props> = async () => {
	const products = await getAllProducts();
	const siteSetting = await getSiteSetting();
	const parseConfig = {
    appId: process.env.CHISEL_APP_ID || '',
    serverURL: process.env.CHISEL_SERVER_URL || '',
    siteId: process.env.CHISEL_SITE_ID || ''
  };
	return {
		props: {
			products,
			siteSetting,
			parseConfig
		},
		revalidate: 60
	};
};