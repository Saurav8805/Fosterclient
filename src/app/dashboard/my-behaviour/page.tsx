'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';

export default function MyBehaviourPage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<number | null>(null);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    if (!role) {
      router.push('/login');
      return;
    }
    setUserRole(Number(role));
  }, [router]);

  if (userRole === null) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Sample behaviour data
  const behaviourData = {
    overallRating: 4.5,
    discipline: 5,
    participation: 4,
    punctuality: 5,
    cooperation: 4,
    leadership: 4
  };

  const behaviourRecords = [
    { 
      date: '2024-01-15', 
      teacher: 'Mr. John Smith', 
      subject: 'Mathematics',
      rating: 5,
      comment: 'Excellent participation in class. Shows great interest in problem-solving.' 
    },
    { 
      date: '2024-01-10', 
      teacher: 'Ms. Sarah Johnson', 
      subject: 'Science',
      rating: 4,
      comment: 'Good behavior and active in group activities.' 
    },
    { 
      date: '2024-01-05', 
      teacher: 'Mr. David Brown', 
      subject: 'English',
      rating: 5,
      comment: 'Outstanding presentation skills and respectful towards peers.' 
    },
  ];

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-blue-600';
    if (rating >= 2.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRatingBg = (rating: number) => {
    if (rating >= 4.5) return 'bg-green-100';
    if (rating >= 3.5) return 'bg-blue-100';
    if (rating >= 2.5) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Behaviour</h1>

      {/* Overall Rating */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Overall Behaviour Rating</p>
            <p className={`text-6xl font-bold ${getRatingColor(behaviourData.overallRating)}`}>
              {behaviourData.overallRating}/5
            </p>
            <div className="flex justify-center mt-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className={`text-3xl ${star <= behaviourData.overallRating ? 'text-yellow-400' : 'text-gray-300'}`}>
                  ★
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Behaviour Categories */}
      <Card className="mb-6">
        <CardHeader>
          <h3 className="text-xl font-semibold text-gray-900">Behaviour Categories</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(behaviourData).filter(([key]) => key !== 'overallRating').map(([category, rating]) => (
              <div key={category}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 capitalize">{category}</span>
                  <span className="text-sm font-medium text-gray-700">{rating}/5</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full ${
                      rating >= 4.5 ? 'bg-green-600' : 
                      rating >= 3.5 ? 'bg-blue-600' : 
                      rating >= 2.5 ? 'bg-yellow-600' : 'bg-red-600'
                    }`}
                    style={{ width: `${(rating / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Teacher Comments */}
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold text-gray-900">Teacher Comments</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {behaviourRecords.map((record, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">{record.teacher}</p>
                    <p className="text-sm text-gray-600">{record.subject} • {record.date}</p>
                  </div>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getRatingBg(record.rating)} ${getRatingColor(record.rating)}`}>
                    {record.rating}/5
                  </span>
                </div>
                <p className="text-sm text-gray-700 italic">"{record.comment}"</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
