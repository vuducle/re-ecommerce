'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function FilterDropdown() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', value);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="sort-by" className="text-sm font-medium">Sort by</label>
      <Select onValueChange={handleSortChange} defaultValue={searchParams.get('sort') || '-created'}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="-created">Newest</SelectItem>
          <SelectItem value="price">Price: Low to High</SelectItem>
          <SelectItem value="-price">Price: High to Low</SelectItem>
          <SelectItem value="name">Name: A to Z</SelectItem>
          <SelectItem value="-name">Name: Z to A</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
