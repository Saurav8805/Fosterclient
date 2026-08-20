'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { behaviourApi, studentsApi, staffApi } from '@/lib/api';

interface BehaviourRecord {
  id?: string;
  student_id: string;
  studentName?: string;
  studentClass?: string;
  studentSection?: string;
  rating: number; // 1-5 star rating
  comment?: string;
  date: string;
  teacher_id: string;
  teacher?: {
    full_name: string;
  };
  reporterName?: string;
  created_at?: string;
}

interface Student {
  id: string;
  student_name?: string;
  user?: { full_name: string };
  class?: string;
  section?: string;
  roll_no?: number;
}

export default function BehaviourManagementPage() {
  const router = useRouter();

  // Roles: 6 = Principal, 7 = Teacher, 19 = Student
  const [userRole, setUserRole] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Teacher's assigned class/section
  const [teacherAssignedClass, setTeacherAssignedClass] = useState<string | null>(null);
  const [teacherAssignedSection, setTeacherAssignedSection] = useState<string | null>(null);

  // States for Student View
  const [studentRecords, setStudentRecords] = useState<BehaviourRecord[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);

  // States for Teacher/Principal View
  const [students, setStudents] = useState<Student[]>([]);
  const [allRecords, setAllRecords] = useState<BehaviourRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<BehaviourRecord[]>([]);
  
  // Filters
  const [ratingFilter, setRatingFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    rating: 5,
    comment: '',
    date: new Date().toISOString().split('T')[0],
  });
  
  // Success/Error messages
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    const id = localStorage.getItem('userId');

    console.log('🔐 User authentication:', { role, userId: id });

    if (role) setUserRole(parseInt(role, 10));
    if (id) setUserId(id);
    
    // Fetch teacher assignment if role is teacher
    if (role && parseInt(role, 10) === 7) {
      fetchTeacherAssignment();
    }

    setLoading(false);
  }, []);
  
  const fetchTeacherAssignment = async () => {
    try {
      const mobile = localStorage.getItem('userMobile');
      const res = await staffApi.list() as { success: boolean; data?: any[] };
      if (res.success && res.data) {
        const myStaff = res.data.find((s: any) => s.user?.mobile === mobile);
        if (myStaff) {
          const assignedClass = myStaff.assigned_class || null;
          const assignedSection = myStaff.assigned_section || null;
          
          console.log('👨‍🏫 Teacher assigned to:', { class: assignedClass, section: assignedSection });
          
          setTeacherAssignedClass(assignedClass);
          setTeacherAssignedSection(assignedSection);
        }
      }
    } catch (err) {
      console.error('Error fetching teacher assignment:', err);
    }
  };

  useEffect(() => {
    if (userRole === 19 && userId) {
      const storedStudentId = localStorage.getItem('studentId');
      const studentRecordId = storedStudentId || userId;
      
      console.log('👨‍🎓 Fetching student behaviour for ID:', studentRecordId);
      fetchStudentRecords(studentRecordId);
    } else if ((userRole === 7 || userRole === 6) && userId) {
      if (userRole === 7 && teacherAssignedClass) {
        fetchStudents();
        fetchAllRecords();
      } else if (userRole === 6) {
        fetchStudents();
        fetchAllRecords();
      }
    }
  }, [userRole, userId, teacherAssignedClass, teacherAssignedSection]);

  // Filter records when filters change
  useEffect(() => {
    filterRecords();
  }, [allRecords, ratingFilter, searchQuery]);

  const fetchStudentRecords = async (studentId: string) => {
    try {
      setLoading(true);
      const res = await behaviourApi.getMyBehaviour(studentId);
      console.log('📊 Student behaviour records fetched:', res);
      
      if (res?.data) {
        setStudentRecords(res.data.records || []);
        setAverageRating(res.data.averageRating || 0);
      } else {
        setStudentRecords([]);
        setAverageRating(0);
      }
    } catch (error) {
      console.error('Error fetching student records:', error);
      setStudentRecords([]);
      setAverageRating(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await studentsApi.list();
      
      if (res.success) {
        let studentsList = res.data?.students || res.data || [];
        
        // Filter students by teacher's assigned class/section
        if (userRole === 7) {
          if (!teacherAssignedClass) {
            setStudents([]);
            return;
          }
          
          studentsList = studentsList.filter((s: any) => {
            const classMatch = s.class === teacherAssignedClass;
            const sectionMatch = !teacherAssignedSection || s.section === teacherAssignedSection;
            return classMatch && sectionMatch;
          });
          
          console.log(`📚 Teacher can manage behaviour for ${studentsList.length} students`);
        }
        
        setStudents(studentsList);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllRecords = async () => {
    try {
      setLoading(true);
      const res = await behaviourApi.list();
      
      console.log('🔄 Fetching behaviour records...', res);
      
      if (res.success) {
        let records = res.data || [];
        
        console.log(`📊 Total records fetched: ${records.length}`);
        
        // Map nested student data from API response
        records = records.map((r: any) => ({
          ...r,
          studentName: r.student?.student_name || 'Unknown',
          studentClass: r.student?.class,
          studentSection: r.student?.section,
        }));
        
        // Filter records by teacher's assigned class
        if (userRole === 7 && teacherAssignedClass) {
          records = records.filter((r: any) => {
            return r.studentClass === teacherAssignedClass && 
                   (!teacherAssignedSection || r.studentSection === teacherAssignedSection);
          });
          console.log(`👨‍🏫 Teacher filtered records: ${records.length}`);
        } else if (userRole === 6) {
          console.log(`👔 Principal viewing all ${records.length} records`);
        }
        
        setAllRecords(records);
      }
    } catch (error) {
      console.error('Error fetching all records:', error);
      setAllRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const filterRecords = () => {
    let filtered = [...allRecords];
    
    // Filter by rating
    if (ratingFilter !== 'All') {
      const rating = parseInt(ratingFilter);
      filtered = filtered.filter(r => r.rating === rating);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r => 
        r.studentName?.toLowerCase().includes(query) ||
        r.comment?.toLowerCase().includes(query)
      );
    }
    
    setFilteredRecords(filtered);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !userId) return;

    setSaving(true);
    setMessage(null);

    try {
      const response = await behaviourApi.add({
        studentId: selectedStudent.id,
        rating: formData.rating,
        incident: formData.comment,
        date: formData.date,
        reportedBy: userId,
      });
      
      console.log('✅ Behaviour record added:', response);
      
      setMessage({ type: 'success', text: 'Behaviour record added successfully!' });
      setIsModalOpen(false);
      setFormData({
        rating: 5,
        comment: '',
        date: new Date().toISOString().split('T')[0],
      });
      setSelectedStudent(null);

      // Refresh records immediately
      await fetchAllRecords();
      
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error adding record:', error);
      setMessage({ type: 'error', text: 'Failed to add behaviour record' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (recordId: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    
    try {
      await behaviourApi.delete(recordId);
      setMessage({ type: 'success', text: 'Record deleted successfully!' });
      
      // Refresh records immediately
      await fetchAllRecords();
      
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error deleting record:', error);
      setMessage({ type: 'error', text: 'Failed to delete record' });
    }
  };

  const openModal = (student: Student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
    setFormData({
      rating: 5,
      comment: '',
      date: new Date().toISOString().split('T')[0],
    });
  };

  // Star rendering component with half-star support
  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    const sizeClass = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6'
    }[size];

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg key={`full-${i}`} className={`${sizeClass} text-yellow-400 fill-current`} viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      );
    }

    // Half star
    if (hasHalfStar) {
      stars.push(
        <svg key="half" className={`${sizeClass} text-yellow-400`} viewBox="0 0 24 24">
          <defs>
            <linearGradient id="half-fill">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path fill="url(#half-fill)" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          <path fill="none" stroke="currentColor" strokeWidth="1" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      );
    }

    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <svg key={`empty-${i}`} className={`${sizeClass} text-gray-300`} fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      );
    }

    return <div className="flex items-center gap-0.5">{stars}</div>;
  };

  const getRatingLabel = (rating: number) => {
    if (rating >= 5) return 'Excellent';
    if (rating >= 4) return 'Very Good';
    if (rating >= 3) return 'Good';
    if (rating >= 2) return 'Fair';
    return 'Poor';
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 5) return 'text-green-600';
    if (rating >= 4) return 'text-blue-600';
    if (rating >= 3) return 'text-yellow-600';
    if (rating >= 2) return 'text-orange-600';
    return 'text-red-600';
  };

  const getRatingDescription = (rating: number) => {
    if (rating === 5) return 'Outstanding behaviour; highly respectful, responsible, disciplined, and cooperative.';
    if (rating === 4) return 'Consistently positive and respectful behaviour with minor issues.';
    if (rating === 3) return 'Meets normal behavioural expectations.';
    if (rating === 2) return 'Below expectations; occasional significant behaviour issues.';
    return 'Frequently inappropriate or disrespectful behaviour.';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading Behaviour Data...</p>
        </div>
      </div>
    );
  }

  if (!userRole) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🔒</div>
          <p className="text-red-500 text-lg">Unauthorized. Please log in.</p>
        </div>
      </div>
    );
  }

  // Render Student View (Role 19)
  if (userRole === 19) {
    // Count ratings by star level
    const ratingCounts = {
      5: studentRecords.filter(r => r.rating === 5).length,
      4: studentRecords.filter(r => r.rating === 4).length,
      3: studentRecords.filter(r => r.rating === 3).length,
      2: studentRecords.filter(r => r.rating === 2).length,
      1: studentRecords.filter(r => r.rating === 1).length,
    };

    return (
      <div className="p-6 bg-white min-h-screen">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#5e3a9e]">My Behaviour Records</h1>
        </div>
        
        {/* Overall Rating Card */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 shadow-lg rounded-xl p-3 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <h2 className="text-sm font-semibold text-gray-700">Overall Behaviour Rating</h2>
            <p className="text-xs text-gray-500">Based on {studentRecords.length} record{studentRecords.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1">
              {renderStars(averageRating, 'sm')}
            </div>
            <div className="flex items-center gap-1">
              <p className="text-lg font-bold text-gray-700">
                {averageRating.toFixed(2)}
              </p>
              <p className="text-sm font-medium text-gray-400">/ 5.00</p>
            </div>
            <p className="text-xs text-gray-600 font-medium">{getRatingLabel(averageRating)}</p>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 mb-4">
          {[5, 4, 3, 2, 1].map((rating) => {
            const shadowColors = {
              5: 'shadow-[0_2px_8px_rgba(34,197,94,0.3)]', // green
              4: 'shadow-[0_2px_8px_rgba(59,130,246,0.3)]', // blue
              3: 'shadow-[0_2px_8px_rgba(234,179,8,0.3)]', // yellow
              2: 'shadow-[0_2px_8px_rgba(249,115,22,0.3)]', // orange
              1: 'shadow-[0_2px_8px_rgba(239,68,68,0.3)]', // red
            };
            return (
              <div key={rating} className={`bg-white border rounded-lg p-2 ${shadowColors[rating as keyof typeof shadowColors]}`}>
                <div className="flex items-center justify-between">
                  <div className="pl-1">
                    <div className="flex scale-75 origin-left mb-0.5">
                      {renderStars(rating, 'sm')}
                    </div>
                    <p className="text-[10px] text-gray-500 leading-tight">{getRatingLabel(rating)}</p>
                  </div>
                  <p className="text-sm font-bold text-gray-800 pr-1">{ratingCounts[rating as keyof typeof ratingCounts]}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Records List */}
        {studentRecords.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-gray-50 text-gray-500">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-lg font-medium">No behaviour records found</p>
            <p className="text-sm text-gray-400 mt-2">Your behaviour records will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {studentRecords.map((record, idx) => (
              <div key={record.id || idx} className="border rounded-lg p-4 shadow-sm bg-white hover:shadow-md transition">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      {renderStars(record.rating, 'sm')}
                    </div>
                    <p className={`text-xs font-semibold ${getRatingColor(record.rating)}`}>
                      {getRatingLabel(record.rating)}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(record.date).toLocaleDateString()}
                  </span>
                </div>
                {record.comment && (
                  <div className="mb-2">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Comments</h4>
                    <p className="text-gray-600 text-xs leading-relaxed">{record.comment}</p>
                  </div>
                )}
                {record.teacher_id && (
                  <div className="mt-3 pt-3 border-t text-xs text-gray-400">
                    Reported by: {record.teacher?.full_name || 'Teacher'}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Render Teacher (Role 7) or Principal (Role 6) View
  const isPrincipal = userRole === 6;
  const totalRecords = filteredRecords.length;
  
  // Calculate rating counts for filtered records
  const ratingCounts = {
    5: filteredRecords.filter(r => r.rating === 5).length,
    4: filteredRecords.filter(r => r.rating === 4).length,
    3: filteredRecords.filter(r => r.rating === 3).length,
    2: filteredRecords.filter(r => r.rating === 2).length,
    1: filteredRecords.filter(r => r.rating === 1).length,
  };

  // Check if teacher has no assigned class
  if (userRole === 7 && !teacherAssignedClass) {
    return (
      <div className="p-6 bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">👨‍🏫</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">No Class Assigned</h2>
          <p className="text-gray-500">You need to be assigned to a class to manage behaviour records.</p>
          <p className="text-gray-400 text-sm mt-2">Please contact the principal.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#5e3a9e]">
            {isPrincipal ? 'School Behaviour Management' : 'Class Behaviour Management'}
          </h1>
          {userRole === 7 && teacherAssignedClass && (
            <p className="text-sm text-gray-500 mt-1">
              Managing: <span className="font-medium text-[#5e3a9e]">{teacherAssignedClass} {teacherAssignedSection || ''}</span>
            </p>
          )}
        </div>
      </div>

      {/* Success/Error Messages */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
        <div className="bg-white border shadow-sm rounded-lg p-2">
          <div className="flex items-center justify-between">
            <div className="pl-1">
              <svg className="w-4 h-4 text-gray-400 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-[10px] text-gray-500 leading-tight">Total</p>
            </div>
            <p className="text-sm font-bold text-gray-800 pr-1">{totalRecords}</p>
          </div>
        </div>
        {[5, 4, 3, 2, 1].map((rating) => {
          const shadowColors = {
            5: 'shadow-[0_2px_8px_rgba(34,197,94,0.3)]', // green
            4: 'shadow-[0_2px_8px_rgba(59,130,246,0.3)]', // blue
            3: 'shadow-[0_2px_8px_rgba(234,179,8,0.3)]', // yellow
            2: 'shadow-[0_2px_8px_rgba(249,115,22,0.3)]', // orange
            1: 'shadow-[0_2px_8px_rgba(239,68,68,0.3)]', // red
          };
          return (
            <div key={rating} className={`bg-white border rounded-lg p-2 ${shadowColors[rating as keyof typeof shadowColors]}`}>
              <div className="flex items-center justify-between">
                <div className="pl-1">
                  <div className="flex scale-75 origin-left mb-0.5">
                    {renderStars(rating, 'sm')}
                  </div>
                  <p className="text-[10px] text-gray-500 leading-tight">{getRatingLabel(rating)}</p>
                </div>
                <p className="text-sm font-bold text-gray-800 pr-1">
                  {ratingCounts[rating as keyof typeof ratingCounts]}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Students List Section */}
      <div className="bg-white border shadow-sm rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">
          {isPrincipal ? 'All Students' : 'My Class Students'}
        </h3>
        
        {students.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-2">👥</div>
            <p>No students found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 border-y">
                  <th className="py-3 px-4 font-medium text-sm">Roll No</th>
                  <th className="py-3 px-4 font-medium text-sm">Name</th>
                  <th className="py-3 px-4 font-medium text-sm">Class</th>
                  <th className="py-3 px-4 font-medium text-sm">Section</th>
                  <th className="py-3 px-4 font-medium text-sm text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="border-b hover:bg-gray-50 transition">
                    <td className="py-3 px-4 text-sm text-gray-600">{student.roll_no || '-'}</td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-800">
                      {student.student_name || student.user?.full_name || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{student.class}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{student.section}</td>
                    <td className="py-3 px-4 text-sm text-right">
                      <button
                        onClick={() => openModal(student)}
                        className="bg-[#5e3a9e] text-white px-4 py-1.5 rounded text-xs font-medium hover:bg-opacity-90 transition"
                      >
                        + Add Record
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Behaviour Records Section */}
      <div className="bg-white border shadow-sm rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-700">Behaviour Records</h3>
          
          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#5e3a9e] focus:ring-1 focus:ring-[#5e3a9e]"
            >
              <option value="All">All Ratings</option>
              <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
              <option value="4">⭐⭐⭐⭐ Very Good</option>
              <option value="3">⭐⭐⭐ Good</option>
              <option value="2">⭐⭐ Fair</option>
              <option value="1">⭐ Poor</option>
            </select>
            
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#5e3a9e] focus:ring-1 focus:ring-[#5e3a9e]"
            />
          </div>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="text-center py-12 text-gray-500 border rounded-lg bg-gray-50">
            <div className="text-4xl mb-2">📋</div>
            <p>No behaviour records found</p>
            <p className="text-sm text-gray-400 mt-1">Add records using the student list above</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 border-y">
                  <th className="py-3 px-4 font-medium text-sm">Date</th>
                  <th className="py-3 px-4 font-medium text-sm">Student</th>
                  <th className="py-3 px-4 font-medium text-sm">Class</th>
                  <th className="py-3 px-4 font-medium text-sm">Rating</th>
                  <th className="py-3 px-4 font-medium text-sm">Comments</th>
                  <th className="py-3 px-4 font-medium text-sm text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => {
                  const student = students.find(s => s.id === record.student_id);
                  return (
                    <tr key={record.id} className="border-b hover:bg-gray-50 transition">
                      <td className="py-3 px-4 text-sm text-gray-600 whitespace-nowrap">
                        {new Date(record.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-800">
                        {record.studentName || student?.student_name || student?.user?.full_name || 'Unknown'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {record.studentClass || student?.class} - {record.studentSection || student?.section}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <div className="flex flex-col gap-1">
                          {renderStars(record.rating, 'sm')}
                          <span className={`text-xs font-medium ${getRatingColor(record.rating)}`}>
                            {getRatingLabel(record.rating)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 max-w-xs">
                        <div className="truncate" title={record.comment}>
                          {record.comment || '-'}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-right">
                        <button
                          onClick={() => handleDelete(record.id || '')}
                          className="text-red-500 hover:text-red-700 text-sm font-medium transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Record Modal */}
      {isModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h3 className="text-lg font-bold text-gray-800">
                Add Behaviour Record
              </h3>
              <button 
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none"
              >
                ×
              </button>
            </div>
            
            <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Student:</span> {selectedStudent.student_name || selectedStudent.user?.full_name}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {selectedStudent.class} - {selectedStudent.section} | Roll: {selectedStudent.roll_no || 'N/A'}
              </p>
            </div>
            
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5e3a9e] focus:border-transparent"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Behaviour Rating</label>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <label
                      key={rating}
                      className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition ${
                        formData.rating === rating
                          ? 'border-[#5e3a9e] bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="rating"
                        value={rating}
                        checked={formData.rating === rating}
                        onChange={(e) => setFormData({...formData, rating: parseInt(e.target.value)})}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {renderStars(rating, 'sm')}
                          <span className={`font-semibold text-sm ${getRatingColor(rating)}`}>
                            {getRatingLabel(rating)}
                          </span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comments / Observations</label>
                <textarea
                  required
                  rows={4}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5e3a9e] focus:border-transparent"
                  placeholder="Describe the behaviour observation or incident..."
                  value={formData.comment}
                  onChange={(e) => setFormData({...formData, comment: e.target.value})}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-[#5e3a9e] text-white rounded-lg text-sm font-medium hover:bg-opacity-90 transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Add Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
