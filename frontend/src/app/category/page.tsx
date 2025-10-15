import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { buildFileUrl } from '@/lib/pocketbase';

type Category = {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
};

async function getCategories(): Promise<Category[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_POCKETBASE_URL}/api/collections/categories/records`,
    { cache: 'no-store' }
  );
  const data = await res.json();
  return data.items;
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <>
      <div className="max-w-7xl mx-auto p-8 bg-[#0a0a0a] border border-[#2a0808] shadow-[0_0_40px_rgba(200,16,30,0.15)] rounded-lg mt-10 mb-10">
        <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
          <div className="w-full md:w-1/2">
            <h1 className="text-4xl font-extrabold tracking-wider text-white drop-shadow-[0_0_5px_rgba(200,16,30,0.5)] mb-4">
              Explore Our Categories
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed">
              From the latest in survival horror technology to
              essential gear for your next mission, our categories are
              curated to provide you with the best equipment and
              supplies. Browse through our selection and find exactly
              what you need to survive the nightmare.
            </p>
          </div>
          <div className="w-full md:w-1/2">
            <Image
              src="/img/mr-x.jpg"
              alt="Categories Header"
              width={500}
              height={300}
              className="rounded-lg object-cover"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const imageUrl = buildFileUrl(
              category.image,
              'categories',
              category.id
            );
            return (
              <Link
                href={`/category/${category.slug}`}
                key={category.id}
              >
                <Card className="bg-[#0b0b0b] border border-[#2a0808] rounded-lg p-4 flex flex-col gap-4 h-full hover:border-red-500 transition-colors">
                  <CardHeader className="p-0">
                    <div className="flex-shrink-0">
                      {imageUrl ? (
                        <div className="rounded-lg overflow-hidden w-full h-48 relative">
                          <Image
                            src={imageUrl}
                            alt={category.name || 'Category Image'}
                            layout="fill"
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="w-full h-48 rounded-lg bg-[#0b0b0b] flex items-center justify-center text-gray-400 font-bold">
                          RE
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <CardTitle className="text-lg font-bold text-white truncate">
                      {category.name || '—'}
                    </CardTitle>
                    <p className="text-sm text-gray-500 mt-2 flex-grow">
                      {category.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
