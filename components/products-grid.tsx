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

import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@lib/types';
import { toast } from 'react-toastify';
import { REGISTER_MESSAGE } from '@lib/constants';
import useSiteSettingData from '@lib/hooks/use-site-setting';
import IconProductDownload from './icons/icon-product-download';
import styles from './products-grid.module.css';

type Props = {
  products: Product[];
};

export default function ProductsGrid({ products }: Props) {
  // Security Check
  const { userData: currentUser } = useSiteSettingData();
  if (process.browser && (!currentUser || !currentUser.id)) {
    toast.error(REGISTER_MESSAGE);
    window.location.href = '/';
  }
  return (
    <div className={styles.grid}>
      {products.map(product => (
        <div key={product.name} className={styles.card}>
          <div className={styles.imageWrapper}>
            <Image
              alt={product.name}
              src={product.image.url}
              className={styles.image}
              loading="lazy"
              quality="50"
              title={product.name}
              width={300}
              height={300}
              unoptimized={true}
            />
          </div>
          <div className={styles.cardBody}>
            <h2 className={styles.name}>{product.name}</h2>
            <p className={styles.title}>
              {product.description}
            </p>
            <a className={styles['btn-download']} href={product.asset.url} target="_blank">
              <IconProductDownload /> Download
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
