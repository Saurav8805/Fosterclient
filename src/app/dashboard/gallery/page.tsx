'use client';

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function GalleryPage() {
  const router = useRouter()
  const [userRole, setUserRole] = useState<number | null>(null)

  useEffect(() => {
    const role = localStorage.getItem('userRole')
    if (!role) { router.push('/login'); return }
    setUserRole(Number(role))
  }, [router])

  if (userRole === null) return <div className="flex items-center justify-center min-h-screen">Loading...</div>

  const isStudent = userRole === 19

  const images = [
    { id: 1, title: 'Annual Day 2024', category: 'Events', url: '/pic1.jpg' },
    { id: 2, title: 'Sports Day', category: 'Sports', url: '/pic2.jpg' },
    { id: 3, title: 'Classroom Activities', category: 'Activities', url: '/pic3.jpg' },
    { id: 4, title: 'Art & Craft', category: 'Activities', url: '/pic4.jpg' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-50 px-6 pt-6 pb-2">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">Gallery</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-xl font-semibold">School Gallery</h2>
            {!isStudent && (
              <button className="bg-[#5e3a9e] text-white px-4 py-2 rounded-lg hover:bg-[#4a2d7e] transition text-sm">
                + Upload Image
              </button>
            )}
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {images.map((image) => (
                <div key={image.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition group">
                  <img src={image.url} alt={image.title} className="w-full h-48 object-cover" />
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm mb-1">{image.title}</h3>
                      <span className="text-xs px-2 py-1 bg-purple-100 text-[#5e3a9e] rounded-full">{image.category}</span>
                    </div>
                    {!isStudent && (
                      <button className="text-red-400 hover:text-red-600 text-xs opacity-0 group-hover:opacity-100 transition">Delete</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
