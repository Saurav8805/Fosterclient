'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function HeaderContent() {
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState<number | null>(null);

  useEffect(() => {
    const name = localStorage.getItem('userName');
    const mobile = localStorage.getItem('userMobile');
    const role = localStorage.getItem('userRole');
    
    // Use full name if available, otherwise use mobile
    if (name) {
      setUserName(name);
    } else if (mobile) {
      setUserName(mobile);
    }
    
    if (role) setUserRole(Number(role));
  }, []);

  const roleName = userRole === 8 ? 'Administrator' : userRole === 6 ? 'Faculty' : 'Student';

  return (
    <header className="flex-shrink-0">
      <div className="px-4 h-20 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold text-gray-800">Welcome, {userName}</h1>
          <p className="text-xs text-gray-400">{roleName}</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <Link href="/dashboard/profile">
            <div className="w-9 h-9 bg-[#5e3a9e] rounded-full flex items-center justify-center text-white text-sm font-semibold cursor-pointer hover:bg-[#4a2d7e] transition">
              {userName.charAt(0).toUpperCase()}
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
