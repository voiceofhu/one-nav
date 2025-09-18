import { Suspense } from 'react';

export default function Page({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="flex flex-col">{children}</div>
    </Suspense>
  );
}
