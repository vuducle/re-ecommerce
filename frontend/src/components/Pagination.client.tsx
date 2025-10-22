'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface PaginationProps {
  totalItems: number;
  perPage: number;
  page: number;
}

export default function Pagination({ totalItems, perPage, page }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const totalPages = Math.ceil(totalItems / perPage);

  const handlePerPageChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('perPage', value);
    params.set('page', '1'); // Reset to first page
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center justify-between mt-8">
      <div className="flex items-center space-x-2">
        <label htmlFor="per-page" className="text-sm font-medium">Items per page</label>
        <Select onValueChange={handlePerPageChange} defaultValue={perPage.toString()}>
          <SelectTrigger className="w-[80px]">
            <SelectValue placeholder="Per page" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5</SelectItem>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          onClick={() => handlePageChange(page - 1)}
          disabled={page <= 1}
        >
          Previous
        </Button>
        <span className="text-sm">Page {page} of {totalPages}</span>
        <Button
          variant="outline"
          onClick={() => handlePageChange(page + 1)}
          disabled={page >= totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
