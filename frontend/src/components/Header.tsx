import HeaderClient from './Header.client';
import { getCategories } from '../lib/pocketbase';

export default async function Header() {
  const res = await getCategories();
  const categories = res.items;

  return <HeaderClient categories={categories} />;
}
