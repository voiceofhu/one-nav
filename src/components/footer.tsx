'use client';

import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';

import pkg from '../../package.json';

export function Footer() {
  const [hostname, setHost] = useState('');
  useEffect(() => {
    setHost(location.hostname);
  }, []);
  return (
    <footer className=" container mx-auto px-2 md:px-0  text-gray-500 py-4 ">
      {/* 版权信息 */}
      <div className="">
        <div className="flex flex-col justify-between items-center space-y-4 md:space-y-0">
          <p className="flex w-full flex-col gap-1 md:flex-row text-[#999] justify-between items-center">
            <span className="text-xs">
              © 2018 - {format(new Date(), 'yyyy')} {hostname}. All rights
              reserved.
            </span>
            <span className="ml-3 text-xs ">
              {pkg.seo.title} v{pkg.version}
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
