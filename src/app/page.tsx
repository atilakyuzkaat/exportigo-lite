import dynamic from 'next/dynamic';

export const revalidate = 0; // never static

const LiteApp = dynamic(() => import('@/components/lite/LiteApp'), { ssr: false });

export default function Page() {
  return <LiteApp />;
}
