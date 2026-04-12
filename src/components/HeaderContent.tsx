'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function HeaderContent() {
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState<number | null>(null);

  useEffect(() => {
    const mobile = localStorage.getItem('userMobile');
    const role = localStorage.getItem('userRole');
    
    if (mobile) setUserName(mobile);
    if (role) setUserRole(Number(role));
  }, []);

  const roleName = userRole === 8 ? 'Administrator' : userRole === 6 ? 'Faculty' : 'Student';

  return (
    <header className="bg-white shadow-sm border-b flex-shrink-0">
      <div className="px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Welcome, {userName}</h1>
          <p className="text-sm text-gray-500">{roleName}</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition">
            <span className="text-xl">🔔</span>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <Link href="/dashboard/profile">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold cursor-pointer hover:bg-blue-700 transition">
              {userName.charAt(0)}
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
