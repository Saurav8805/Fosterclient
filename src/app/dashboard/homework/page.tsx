"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { homeworkApi, staffApi, usersApi, configApi } from '@/lib/api';

const CLASSES = ['Playgroup', 'Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'];
const SECTIONS = ['A', 'B', 'C', 'D'];
const SUBJECTS = ['Mathematics', 'English', 'Hindi', 'Science', 'Social Studies', 'Computer', 'Drawing', 'GK', 'Other'];

export default function HomeworkPage() {
  const router = useRouter();
  
  // All Hooks
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [homeworkList, setHomeworkList] = useState<any[]>([]);
  const [assignedClass, setAssignedClass] = useState<string>('');
  const [assignedSection, setAssignedSection] = useState<string>('');
  
  // All classes from database (for teachers to select from)
  const [allClassesList, setAllClassesList] = useState<Array<{class: string, section: string}>>([])
  const [selectedClass, setSelectedClass] = useState<{class: string, section: string} | null>(null)
  
  // Principal filter states
  const [filterClass, setFilterClass] = useState<string>('');
  const [filterSection, setFilterSection] = useState<string>('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    subject: '',
    title: '',
    description: '',
    assignedDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    class: '',
    section: ''
  });

  // Expanded descriptions for students
  const [expandedDesc, setExpandedDesc] = useState<Record<string, boolean>>({});

  // Helper function to sort homework by date (most recent first)
  const sortHomeworkByDate = (homeworkArray: any[]) => {
    return [...homeworkArray].sort((a, b) => {
      // Sort by assignedDate in descending order (most recent first)
      const dateA = new Date(a.assignedDate || a.assigned_date || 0).getTime();
      const dateB = new Date(b.assignedDate || b.assigned_date || 0).getTime();
      return dateB - dateA; // Descending order (recent to old)
    });
  };

  useEffect(() => {
    const init = async () => {
      try {
        const storedUserId = localStorage.getItem('userId');
        const storedUserRole = localStorage.getItem('userRole');
        
        console.log('🔐 Homework page init:', { userId: storedUserId, role: storedUserRole });
        
        if (storedUserId) setUserId(storedUserId);
        if (storedUserRole) setUserRole(Number(storedUserRole));

        if (storedUserRole === '7' && storedUserId) {
          // Teacher - fetch ALL classes (not restricted to assigned classes for homework)
          console.log('👨‍🏫 Fetching all classes for teacher homework...');
          
          // Fetch all classes from config
          const classStatsRes = await configApi.getClassStats()
          if (classStatsRes.success && Array.isArray(classStatsRes.data)) {
            const allClasses: Array<{class: string, section: string}> = []
            classStatsRes.data.forEach((cls: any) => {
              cls.sections.forEach((sec: string) => {
                allClasses.push({class: cls.name, section: sec})
              })
            })
            console.log('📚 All classes available for homework:', allClasses)
            setAllClassesList(allClasses)
            
            // Set first class as default
            if (allClasses.length > 0) {
              const firstClass = allClasses[0]
              setSelectedClass(firstClass)
              setAssignedClass(firstClass.class)
              setAssignedSection(firstClass.section)
              
              const hwRes = await homeworkApi.list(firstClass.class, firstClass.section)
              console.log('✅ Fetched homework for first class:', hwRes)
              setHomeworkList(sortHomeworkByDate(hwRes.success && Array.isArray(hwRes.data) ? hwRes.data : []))
            }
          }
        } else if (storedUserRole === '6') {
          // Principal - fetch all
          console.log('👔 Fetching all homework (Principal)...');
          const hwRes = await homeworkApi.list('', '');
          console.log('✅ Fetched principal homework:', hwRes);
          setHomeworkList(sortHomeworkByDate(hwRes.success && Array.isArray(hwRes.data) ? hwRes.data : []));
        } else if (storedUserRole === '19' && storedUserId) {
          // Student - fetch by class/section
          console.log('👨‍🎓 Fetching student homework...');
          try {
            const profileRes = await usersApi.getProfile(storedUserId);
            const profile = profileRes.success ? profileRes.data : {};
            const sClass = profile?.class || profile?.additionalData?.class || localStorage.getItem('userClass') || '';
            const sSection = profile?.section || profile?.additionalData?.section || localStorage.getItem('userSection') || '';
            console.log('📚 Student class:', sClass, sSection);
            const hwRes = await homeworkApi.list(sClass, sSection);
            console.log('✅ Fetched student homework:', hwRes);
            setHomeworkList(sortHomeworkByDate(hwRes.success && Array.isArray(hwRes.data) ? hwRes.data : []));
          } catch (e) {
             const sClass = localStorage.getItem('userClass') || '';
             const sSection = localStorage.getItem('userSection') || '';
             const hwRes = await homeworkApi.list(sClass, sSection);
             console.log('✅ Fetched student homework (fallback):', hwRes);
             setHomeworkList(sortHomeworkByDate(hwRes.success && Array.isArray(hwRes.data) ? hwRes.data : []));
          }
        }
      } catch (error) {
        console.error("❌ Error initializing homework page:", error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Principal re-fetch on filter change
  useEffect(() => {
    if (userRole === 6 && !loading) {
      const fetchFiltered = async () => {
        try {
          const hwRes = await homeworkApi.list(filterClass, filterSection);
          setHomeworkList(sortHomeworkByDate(hwRes.success && Array.isArray(hwRes.data) ? hwRes.data : []));
        } catch (error) {
          console.error("Error fetching filtered homework:", error);
        }
      };
      fetchFiltered();
    }
  }, [filterClass, filterSection, userRole, loading]);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this homework?')) {
      try {
        console.log('🗑️ Deleting homework:', id);
        const response = await homeworkApi.delete(id);
        
        if (response.success) {
          setHomeworkList(prev => prev.filter(hw => hw.id !== id));
          console.log('✅ Homework deleted successfully');
        }
      } catch (error) {
        console.error("❌ Error deleting homework:", error);
        alert('Failed to delete homework');
      }
    }
  };

  const handleEdit = (hw: any) => {
    setIsEditMode(true);
    setEditingId(hw.id);
    setFormData({
      subject: hw.subject || '',
      title: hw.title || '',
      description: hw.description || '',
      assignedDate: hw.assignedDate || new Date().toISOString().split('T')[0],
      dueDate: hw.dueDate || '',
      class: hw.class || '',
      section: hw.section || ''
    });
    setIsModalOpen(true);
  };

  const handleOpenModal = () => {
    setIsEditMode(false);
    setEditingId(null);
    setFormData({
      subject: '',
      title: '',
      description: '',
      assignedDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      class: userRole === 7 ? assignedClass : '',
      section: userRole === 7 ? assignedSection : ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Get the current user's ID for assignedBy
      const currentUserId = localStorage.getItem('userId') || '';
      
      // Prepare data with correct field names
      const payload = {
        title: formData.title,
        description: formData.description,
        subject: formData.subject,
        class: formData.class,
        section: formData.section,
        dueDate: formData.dueDate,
        assignedDate: formData.assignedDate,
        assignedBy: currentUserId
      };
      
      console.log('💾 Saving homework:', payload);
      
      if (isEditMode && editingId) {
        const response = await homeworkApi.update(editingId, payload);
        console.log('✅ Update response:', response);
        
        if (response.success && response.data) {
          setHomeworkList(prev => sortHomeworkByDate(prev.map(hw => hw.id === editingId ? response.data : hw)));
        }
      } else {
        const response = await homeworkApi.create(payload);
        console.log('✅ Create response:', response);
        
        if (response.success && response.data) {
          setHomeworkList(prev => sortHomeworkByDate([response.data, ...prev]));
        }
      }
      
      setIsModalOpen(false);
      setLoading(false);
    } catch (error) {
      console.error("❌ Error saving homework:", error);
      alert('Failed to save homework. Please check the console for details.');
      setLoading(false);
    }
  };

  const toggleDesc = (id: string) => {
    setExpandedDesc(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) {
    return <div className="p-6">Loading homework...</div>;
  }

  const isTeacher = userRole === 7;
  const isPrincipal = userRole === 6;
  const isStudent = userRole === 19;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {isTeacher && selectedClass ? `Homework - ${selectedClass.class} ${selectedClass.section}` : 'Homework Management'}
              </h1>
              <p className="text-sm text-gray-500 mt-1">Manage and track student assignments</p>
            </div>
            
            {/* Teacher Class Dropdown - Shows ALL classes */}
            {isTeacher && allClassesList.length > 0 && (
              <select
                value={selectedClass ? `${selectedClass.class}-${selectedClass.section}` : ''}
                onChange={async (e) => {
                  const [cls, sec] = e.target.value.split('-')
                  const classObj = allClassesList.find(a => a.class === cls && a.section === sec)
                  if (classObj) {
                    setSelectedClass(classObj)
                    setAssignedClass(classObj.class)
                    setAssignedSection(classObj.section)
                    
                    // Fetch homework for selected class
                    setLoading(true)
                    try {
                      const hwRes = await homeworkApi.list(classObj.class, classObj.section)
                      setHomeworkList(sortHomeworkByDate(hwRes.success && Array.isArray(hwRes.data) ? hwRes.data : []))
                    } finally {
                      setLoading(false)
                    }
                  }
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-800 bg-white focus:ring-2 focus:ring-[#5e3a9e]/30 focus:border-[#5e3a9e] outline-none shadow-sm"
              >
                {allClassesList.map((classObj, idx) => (
                  <option key={idx} value={`${classObj.class}-${classObj.section}`}>
                    {classObj.class} - {classObj.section}
                  </option>
                ))}
              </select>
            )}
          </div>
          
          <div className="flex gap-3">
            {(isTeacher || isPrincipal) && (
              <button 
                onClick={handleOpenModal}
                className="px-4 py-2 bg-[#5e3a9e] text-white rounded-md hover:bg-[#4a2e7d] transition-colors shadow-sm"
              >
                + Assign Homework
              </button>
            )}
          </div>
        </div>

        {/* Filters for Principal */}
        {isPrincipal && (
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-wrap gap-4 items-center">
            <span className="font-medium text-gray-700">Filters:</span>
            <select 
              value={filterClass} 
              onChange={e => setFilterClass(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#5e3a9e]"
            >
              <option value="">All Classes</option>
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select 
              value={filterSection} 
              onChange={e => setFilterSection(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#5e3a9e]"
            >
              <option value="">All Sections</option>
              {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}

        {/* Content Table / List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {isStudent ? (
            <div className="flex flex-col">
              {homeworkList.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No homework assigned yet.</div>
              ) : (
                homeworkList.map((hw) => {
                  const isOverdue = new Date(hw.dueDate) < new Date(new Date().setHours(0,0,0,0));
                  return (
                    <div key={hw.id} className="border-2 border-purple-300 rounded-lg last:border-2 p-5 mb-4 hover:bg-gray-50 hover:border-purple-400 transition-all shadow-sm">
                      {/* Header with Subject and Title (SWAPPED) */}
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-[#5e3a9e] mb-1">{hw.subject}</h3>
                          <p className="text-sm font-semibold text-gray-700 bg-purple-50 inline-block px-3 py-1 rounded-full">
                            📝 {hw.title}
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${isOverdue ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {isOverdue ? '⚠️ Overdue' : '✅ Active'}
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="mb-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <p className="text-sm font-medium text-gray-500 mb-1">Description:</p>
                        <div className="text-gray-700 text-sm leading-relaxed">
                          {expandedDesc[hw.id] ? hw.description : `${(hw.description || '').substring(0, 150)}...`}
                          {(hw.description || '').length > 150 && (
                            <button onClick={() => toggleDesc(hw.id)} className="text-[#5e3a9e] ml-2 font-medium hover:underline">
                              {expandedDesc[hw.id] ? 'Show less' : 'Read more'}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Dates and Teacher Info - 60% (dates) and 40% (teacher) */}
                      <div className="flex flex-col sm:flex-row gap-3 text-sm">
                        {/* Left side: Dates (60%) */}
                        <div className="flex-[0_0_100%] sm:flex-[0_0_60%] grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                            <span className="text-blue-600 font-semibold">📅 Assigned:</span>
                            <span className="text-gray-700 font-medium">{hw.assignedDate || hw.assigned_date || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2 bg-orange-50 px-3 py-2 rounded-lg border border-orange-200">
                            <span className="text-orange-600 font-semibold">⏰ Due:</span>
                            <span className="text-gray-700 font-medium">{hw.dueDate || hw.due_date || 'N/A'}</span>
                          </div>
                        </div>
                        
                        {/* Right side: Teacher (40%) */}
                        <div className="flex-[0_0_100%] sm:flex-[0_0_40%]">
                          <div className="flex items-center gap-2 bg-purple-50 px-3 py-2 rounded-lg border border-purple-200 h-full">
                            <span className="text-purple-600 font-semibold whitespace-nowrap">👨‍🏫 Assigned By:</span>
                            <span className="text-gray-700 font-medium truncate" title={hw.teacher?.full_name || hw.teacher_name || hw.assignedBy || 'Teacher'}>
                              {hw.teacher?.full_name || hw.teacher_name || hw.assignedBy || 'Teacher'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                    {isPrincipal && (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sec</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">By</th>
                      </>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {homeworkList.length === 0 ? (
                    <tr>
                      <td colSpan={isPrincipal ? 8 : 5} className="px-6 py-4 text-center text-gray-500">
                        No homework found.
                      </td>
                    </tr>
                  ) : (
                    homeworkList.map((hw) => (
                      <tr key={hw.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{hw.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{hw.subject}</td>
                        {isPrincipal && (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{hw.class}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{hw.section}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{hw.assignedBy}</td>
                          </>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{hw.assignedDate}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{hw.dueDate}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button onClick={() => handleEdit(hw)} className="text-[#5e3a9e] hover:text-[#4a2e7d] mr-3">Edit</button>
                          <button onClick={() => handleDelete(hw.id)} className="text-red-600 hover:text-red-900">Delete</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold mb-4 text-[#5e3a9e]">
                {isEditMode ? 'Edit Homework' : 'Assign Homework'}
              </h2>
              
              <form onSubmit={handleSave} className="space-y-4">
                
                {isPrincipal && (
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                      <select 
                        required
                        value={formData.class}
                        onChange={e => setFormData({...formData, class: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-[#5e3a9e] focus:border-[#5e3a9e]"
                      >
                        <option value="">Select</option>
                        {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                      <select 
                        required
                        value={formData.section}
                        onChange={e => setFormData({...formData, section: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-[#5e3a9e] focus:border-[#5e3a9e]"
                      >
                        <option value="">Select</option>
                        {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                )}

                {isTeacher && (
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                      <select
                        required
                        value={formData.class}
                        onChange={e => {
                          const selectedClassName = e.target.value
                          const classObj = allClassesList.find(a => a.class === selectedClassName && a.section === formData.section)
                          if (!classObj) {
                            // Find first matching class
                            const firstMatch = allClassesList.find(a => a.class === selectedClassName)
                            if (firstMatch) {
                              setFormData({
                                ...formData, 
                                class: selectedClassName,
                                section: firstMatch.section
                              })
                            }
                          } else {
                            setFormData({...formData, class: selectedClassName})
                          }
                        }}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-[#5e3a9e] focus:border-[#5e3a9e]"
                      >
                        <option value="">Select Class</option>
                        {[...new Set(allClassesList.map(c => c.class))].map((className, idx) => (
                          <option key={idx} value={className}>{className}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                      <select
                        required
                        value={formData.section}
                        onChange={e => setFormData({...formData, section: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-[#5e3a9e] focus:border-[#5e3a9e]"
                        disabled={!formData.class}
                      >
                        <option value="">Select Section</option>
                        {allClassesList
                          .filter(c => c.class === formData.class)
                          .map((classObj, idx) => (
                            <option key={idx} value={classObj.section}>{classObj.section}</option>
                          ))}
                      </select>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <select 
                    required
                    value={formData.subject}
                    onChange={e => setFormData({...formData, subject: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-[#5e3a9e] focus:border-[#5e3a9e]"
                  >
                    <option value="">Select Subject</option>
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input 
                    type="text" 
                    required
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-[#5e3a9e] focus:border-[#5e3a9e]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea 
                    rows={3}
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-[#5e3a9e] focus:border-[#5e3a9e]"
                  />
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Date</label>
                    <input 
                      type="date" 
                      required
                      value={formData.assignedDate}
                      onChange={e => setFormData({...formData, assignedDate: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-[#5e3a9e] focus:border-[#5e3a9e]"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                    <input 
                      type="date" 
                      required
                      value={formData.dueDate}
                      onChange={e => setFormData({...formData, dueDate: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-[#5e3a9e] focus:border-[#5e3a9e]"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-[#5e3a9e] text-white rounded-md hover:bg-[#4a2e7d] transition-colors"
                  >
                    Save Homework
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
