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
  type: 'Positive' | 'Negative' | 'Neutral';
  incident: string;
  action_taken: string;
  date: string;
  reported_by: string;
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

  // States for Teacher/Principal View
  const [students, setStudents] = useState<Student[]>([]);
  const [allRecords, setAllRecords] = useState<BehaviourRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<BehaviourRecord[]>([]);
  
  // Filters
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    type: 'Positive',
    incident: '',
    action_taken: '',
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
      // For students, we need to get the student record ID
      const storedStudentId = localStorage.getItem('studentId');
      const studentRecordId = storedStudentId || userId;
      
      console.log('👨‍🎓 Fetching student behaviour for ID:', studentRecordId);
      fetchStudentRecords(studentRecordId);
      
      // Auto-refresh every 15 seconds for students
      const interval = setInterval(() => {
        fetchStudentRecords(studentRecordId);
      }, 15000);
      
      return () => clearInterval(interval);
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

  // Auto-refresh for principal to see real-time updates
  useEffect(() => {
    if (userRole === 6 && userId) {
      console.log('👔 Setting up principal auto-refresh');
      const interval = setInterval(() => {
        console.log('🔄 Principal auto-refresh triggered');
        fetchAllRecords();
      }, 5000); // Refresh every 5 seconds for principal
      
      return () => clearInterval(interval);
    }
  }, [userRole, userId]);

  // Filter records when filters change
  useEffect(() => {
    filterRecords();
  }, [allRecords, typeFilter, searchQuery]);

  const fetchStudentRecords = async (studentId: string) => {
    try {
      setLoading(true);
      const res = await behaviourApi.getMyBehaviour(studentId);
      console.log('📊 Student behaviour records fetched:', res);
      setStudentRecords(res?.data || []);
    } catch (error) {
      console.error('Error fetching student records:', error);
      setStudentRecords([]);
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
    
    // Filter by type
    if (typeFilter !== 'All') {
      filtered = filtered.filter(r => r.type === typeFilter);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r => 
        r.studentName?.toLowerCase().includes(query) ||
        r.incident?.toLowerCase().includes(query) ||
        r.action_taken?.toLowerCase().includes(query)
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
        type: formData.type as 'Positive' | 'Negative' | 'Neutral',
        incident: formData.incident,
        actionTaken: formData.action_taken,
        date: formData.date,
        reportedBy: userId,
      });
      
      console.log('✅ Behaviour record added:', response);
      
      setMessage({ type: 'success', text: 'Behaviour record added successfully!' });
      setIsModalOpen(false);
      setFormData({
        type: 'Positive',
        incident: '',
        action_taken: '',
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
      type: 'Positive',
      incident: '',
      action_taken: '',
      date: new Date().toISOString().split('T')[0],
    });
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Positive': return 'bg-green-100 text-green-800 border-green-300';
      case 'Negative': return 'bg-red-100 text-red-800 border-red-300';
      case 'Neutral': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Positive': 
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'Negative':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'Neutral':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  // Render Student View (Role 19)
  if (userRole === 19) {
    const totalPositive = studentRecords.filter(r => r.type === 'Positive').length;
    const totalNegative = studentRecords.filter(r => r.type === 'Negative').length;
    const totalNeutral = studentRecords.filter(r => r.type === 'Neutral').length;

    return (
      <div className="p-6 bg-white min-h-screen">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#5e3a9e]">My Behaviour Records</h1>
          <button
            onClick={() => {
              const storedStudentId = localStorage.getItem('studentId');
              const studentRecordId = storedStudentId || userId;
              if (studentRecordId) fetchStudentRecords(studentRecordId);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white border shadow-sm rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              {getTypeIcon('Positive')}
              <h3 className="text-gray-500 text-sm font-medium">Positive</h3>
            </div>
            <p className="text-2xl font-bold text-green-600">{totalPositive}</p>
          </div>
          <div className="bg-white border shadow-sm rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              {getTypeIcon('Negative')}
              <h3 className="text-gray-500 text-sm font-medium">Negative</h3>
            </div>
            <p className="text-2xl font-bold text-red-600">{totalNegative}</p>
          </div>
          <div className="bg-white border shadow-sm rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              {getTypeIcon('Neutral')}
              <h3 className="text-gray-500 text-sm font-medium">Neutral</h3>
            </div>
            <p className="text-2xl font-bold text-yellow-600">{totalNeutral}</p>
          </div>
        </div>

        {/* Records List */}
        {studentRecords.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-gray-50 text-gray-500">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-lg font-medium">No behaviour records found</p>
            <p className="text-sm text-gray-400 mt-2">Your behaviour records will appear here</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {studentRecords.map((record, idx) => (
              <div key={record.id || idx} className="border rounded-lg p-5 shadow-sm bg-white hover:shadow-md transition">
                <div className="flex justify-between items-start mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getTypeColor(record.type)}`}>
                    {getTypeIcon(record.type)}
                    {record.type}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(record.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="mb-3">
                  <h4 className="text-sm font-semibold text-gray-700 mb-1">Incident</h4>
                  <p className="text-gray-600 text-sm">{record.incident}</p>
                </div>
                {record.action_taken && (
                  <div className="mb-3">
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Action Taken</h4>
                    <p className="text-gray-600 text-sm">{record.action_taken}</p>
                  </div>
                )}
                {record.reported_by && (
                  <div className="mt-4 pt-4 border-t text-xs text-gray-400">
                    Reported by: {record.reported_by}
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
  const totalPos = filteredRecords.filter(r => r.type === 'Positive').length;
  const totalNeg = filteredRecords.filter(r => r.type === 'Negative').length;
  const totalNeu = filteredRecords.filter(r => r.type === 'Neutral').length;

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
      <div className="flex items-center justify-between mb-6">
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
        <button
          onClick={async () => {
            setLoading(true);
            await fetchAllRecords();
            setLoading(false);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border shadow-sm rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-gray-500 text-sm font-medium">Total Records</h3>
          </div>
          <p className="text-2xl font-bold text-gray-800">{totalRecords}</p>
        </div>
        <div className="bg-white border shadow-sm rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            {getTypeIcon('Positive')}
            <h3 className="text-gray-500 text-sm font-medium">Positive</h3>
          </div>
          <p className="text-2xl font-bold text-green-600">{totalPos}</p>
        </div>
        <div className="bg-white border shadow-sm rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            {getTypeIcon('Negative')}
            <h3 className="text-gray-500 text-sm font-medium">Negative</h3>
          </div>
          <p className="text-2xl font-bold text-red-600">{totalNeg}</p>
        </div>
        <div className="bg-white border shadow-sm rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            {getTypeIcon('Neutral')}
            <h3 className="text-gray-500 text-sm font-medium">Neutral</h3>
          </div>
          <p className="text-2xl font-bold text-yellow-600">{totalNeu}</p>
        </div>
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
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#5e3a9e] focus:ring-1 focus:ring-[#5e3a9e]"
            >
              <option value="All">All Types</option>
              <option value="Positive">Positive</option>
              <option value="Negative">Negative</option>
              <option value="Neutral">Neutral</option>
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
                  <th className="py-3 px-4 font-medium text-sm">Type</th>
                  <th className="py-3 px-4 font-medium text-sm">Incident</th>
                  <th className="py-3 px-4 font-medium text-sm">Action Taken</th>
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
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getTypeColor(record.type)} flex items-center gap-1 w-fit`}>
                          {getTypeIcon(record.type)}
                          {record.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 max-w-xs">
                        <div className="truncate" title={record.incident}>
                          {record.incident}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 max-w-xs">
                        <div className="truncate" title={record.action_taken || '-'}>
                          {record.action_taken || '-'}
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
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Behaviour Type</label>
                <select
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5e3a9e] focus:border-transparent"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                >
                  <option value="Positive">✅ Positive</option>
                  <option value="Negative">❌ Negative</option>
                  <option value="Neutral">ℹ️ Neutral</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Incident Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5e3a9e] focus:border-transparent"
                  placeholder="Describe what happened..."
                  value={formData.incident}
                  onChange={(e) => setFormData({...formData, incident: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Action Taken</label>
                <textarea
                  rows={2}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5e3a9e] focus:border-transparent"
                  placeholder="e.g. Discussed with parents, gave warning..."
                  value={formData.action_taken}
                  onChange={(e) => setFormData({...formData, action_taken: e.target.value})}
                />
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-[#5e3a9e] text-white rounded-lg text-sm font-medium hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
