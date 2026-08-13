"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { homeworkApi, staffApi, usersApi } from '@/lib/api';

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

  useEffect(() => {
    const init = async () => {
      try {
        const storedUserId = localStorage.getItem('userId');
        const storedUserRole = localStorage.getItem('userRole');
        
        console.log('🔐 Homework page init:', { userId: storedUserId, role: storedUserRole });
        
        if (storedUserId) setUserId(storedUserId);
        if (storedUserRole) setUserRole(Number(storedUserRole));

        if (storedUserRole === '7' && storedUserId) {
          // Teacher - fetch assigned class
          console.log('👨‍🏫 Fetching teacher assignment...');
          const staffRes = await staffApi.list();
          const staffs = staffRes.success && Array.isArray(staffRes.data) ? staffRes.data : [];
          const me = staffs.find((s: any) => String(s.user_id || s.userId || s.user?.id) === String(storedUserId));
          
          if (me) {
            const cls = me.assigned_class || me.assignedClass || '';
            const sec = me.assigned_section || me.assignedSection || '';
            console.log('📚 Teacher assigned to:', cls, sec);
            setAssignedClass(cls);
            setAssignedSection(sec);
            
            const hwRes = await homeworkApi.list(cls, sec);
            console.log('✅ Fetched teacher homework:', hwRes);
            setHomeworkList(hwRes.success && Array.isArray(hwRes.data) ? hwRes.data : []);
          }
        } else if (storedUserRole === '6') {
          // Principal - fetch all
          console.log('👔 Fetching all homework (Principal)...');
          const hwRes = await homeworkApi.list('', '');
          console.log('✅ Fetched principal homework:', hwRes);
          setHomeworkList(hwRes.success && Array.isArray(hwRes.data) ? hwRes.data : []);
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
            setHomeworkList(hwRes.success && Array.isArray(hwRes.data) ? hwRes.data : []);
          } catch (e) {
             const sClass = localStorage.getItem('userClass') || '';
             const sSection = localStorage.getItem('userSection') || '';
             const hwRes = await homeworkApi.list(sClass, sSection);
             console.log('✅ Fetched student homework (fallback):', hwRes);
             setHomeworkList(hwRes.success && Array.isArray(hwRes.data) ? hwRes.data : []);
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
          setHomeworkList(hwRes.success && Array.isArray(hwRes.data) ? hwRes.data : []);
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
          setHomeworkList(prev => prev.map(hw => hw.id === editingId ? response.data : hw));
        }
      } else {
        const response = await homeworkApi.create(payload);
        console.log('✅ Create response:', response);
        
        if (response.success && response.data) {
          setHomeworkList(prev => [response.data, ...prev]);
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
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {isTeacher && assignedClass ? `Homework - ${assignedClass} ${assignedSection}` : 'Homework Management'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">Manage and track student assignments</p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={async () => {
                setLoading(true);
                try {
                  if (userRole === 7) {
                    const hwRes = await homeworkApi.list(assignedClass, assignedSection);
                    setHomeworkList(hwRes.success && Array.isArray(hwRes.data) ? hwRes.data : []);
                  } else if (userRole === 6) {
                    const hwRes = await homeworkApi.list(filterClass, filterSection);
                    setHomeworkList(hwRes.success && Array.isArray(hwRes.data) ? hwRes.data : []);
                  }
                } finally {
                  setLoading(false);
                }
              }}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
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
                    <div key={hw.id} className="border-b last:border-0 p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-lg text-[#5e3a9e]">{hw.title}</h3>
                          <p className="text-sm font-medium text-gray-600">{hw.subject}</p>
                        </div>
                        <div className="text-right">
                          <span className={`text-sm px-2 py-1 rounded ${isOverdue ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                            Due: {hw.dueDate} {isOverdue && '(Overdue)'}
                          </span>
                        </div>
                      </div>
                      <div className="text-gray-700 mt-2 text-sm">
                        {expandedDesc[hw.id] ? hw.description : `${(hw.description || '').substring(0, 100)}...`}
                        {(hw.description || '').length > 100 && (
                          <button onClick={() => toggleDesc(hw.id)} className="text-[#5e3a9e] ml-2 font-medium hover:underline">
                            {expandedDesc[hw.id] ? 'Show less' : 'Read more'}
                          </button>
                        )}
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
                  <div className="flex gap-4 opacity-75">
                     <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                      <input type="text" value={formData.class} disabled className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                      <input type="text" value={formData.section} disabled className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100" />
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
