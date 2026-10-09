import { Suspense } from 'react';
import SearchContent from '@/components/searchcontent';
import { Loader2 } from 'lucide-react';

export const metadata = {
  title: 'Ürün Ara - HK BROS GÜMRÜK MALLARI',
  description: 'HK BROS GÜMRÜK MALLARI ürünlerinde arama yapın',
};

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-12 h-12 animate-spin text-[#1E3A5F]" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}