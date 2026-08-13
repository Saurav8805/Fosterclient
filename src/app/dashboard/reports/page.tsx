'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { reportsApi, progressApi, studentsApi, feesApi, salaryApi } from '@/lib/api';

const CLASSES = ['Playgroup', 'Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'];
const SECTIONS = ['A', 'B', 'C', 'D'];
const TERMS = ['Term 1', 'Term 2', 'Annual'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const SUBJECTS = ['Mathematics', 'English', 'Hindi', 'Science', 'Social Studies', 'Computer', 'Drawing', 'GK'];

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function downloadCSV(url: string) {
  window.location.href = url;
}

export default function ReportsPage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<number>(19);
  const [userId, setUserId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [userClass, setUserClass] = useState('');

  // Student progress state
  const [myProgress, setMyProgress] = useState<any[]>([]);
  const [progressTerm, setProgressTerm] = useState('');
  const [progressLoading, setProgressLoading] = useState(false);

  // Teacher state
  const [teacherStudents, setTeacherStudents] = useState<any[]>([]);
  const [teacherAssignedClass, setTeacherAssignedClass] = useState<string | null>(null);
  const [teacherAssignedSection, setTeacherAssignedSection] = useState<string | null>(null);
  const [marksForm, setMarksForm] = useState({ studentId: '', subject: '', term: 'Term 1', marksObtained: '', maxMarks: '100', remarks: '' });
  const [marksLoading, setMarksLoading] = useState(false);
  const [marksSuccess, setMarksSuccess] = useState('');
  const [marksError, setMarksError] = useState('');
  const [allProgress, setAllProgress] = useState<any[]>([]);
  
  // View student marks state
  const [showViewMarks, setShowViewMarks] = useState(false);
  const [selectedStudentForView, setSelectedStudentForView] = useState<any>(null);
  const [selectedStudentMarks, setSelectedStudentMarks] = useState<any[]>([]);

  // Principal filters
  const [attFilters, setAttFilters] = useState({ class: '', section: '', startDate: '', endDate: '' });
  const [feesFilters, setFeesFilters] = useState({ class: '', section: '' });
  const [progressFilters, setProgressFilters] = useState({ class: '', section: '', term: '' });
  const [salaryFilters, setSalaryFilters] = useState({ month: '', year: String(new Date().getFullYear()) });
  const [staffAttFilters, setStaffAttFilters] = useState({ startDate: '', endDate: '' });

  // Preview data
  const [attPreview, setAttPreview] = useState<any[]>([]);
  const [feesPreview, setFeesPreview] = useState<any[]>([]);
  const [progressPreview, setProgressPreview] = useState<any[]>([]);
  const [loadingPreviews, setLoadingPreviews] = useState<Record<string, boolean>>({});

  const [generalError, setGeneralError] = useState('');

  useEffect(() => {
    const role = Number(localStorage.getItem('userRole') || 19);
    const uid = localStorage.getItem('userId') || '';
    const sid = localStorage.getItem('studentId') || uid;
    const cls = localStorage.getItem('userClass') || '';
    setUserRole(role);
    setUserId(uid);
    setStudentId(sid);
    setUserClass(cls);
  }, []);

  useEffect(() => {
    if (!userId) return;
    if (userRole === 19) {
      loadMyProgress();
    } else if (userRole === 7) {
      fetchTeacherAssignment();
    }
  }, [userId, userRole]);
  
  // Load teacher students after assignment is fetched
  useEffect(() => {
    if (userRole === 7 && teacherAssignedClass) {
      loadTeacherStudents();
    }
  }, [userRole, teacherAssignedClass, teacherAssignedSection]);
  
  const fetchTeacherAssignment = async () => {
    try {
      const mobile = localStorage.getItem('userMobile');
      const { staffApi } = await import('@/lib/api');
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

  const loadMyProgress = async () => {
    setProgressLoading(true);
    const sid = studentId || userId;
    if (!sid) return;
    const res = await progressApi.getMyProgress(sid, progressTerm || undefined);
    if (res.success) setMyProgress(res.data || []);
    setProgressLoading(false);
  };

  useEffect(() => { if (userRole === 19 && userId) loadMyProgress(); }, [progressTerm]);

  const loadTeacherStudents = async () => {
    // Filter students by teacher's assigned class/section
    if (!teacherAssignedClass) {
      setTeacherStudents([]);
      return;
    }
    
    const res = await studentsApi.list();
    if (res.success) {
      const allStudents = res.data?.students || res.data || [];
      
      // Filter to only teacher's assigned class and section
      const filtered = allStudents.filter((s: any) => {
        const classMatch = s.class === teacherAssignedClass;
        const sectionMatch = !teacherAssignedSection || s.section === teacherAssignedSection;
        return classMatch && sectionMatch;
      });
      
      console.log(`📚 Teacher can manage ${filtered.length} students from ${teacherAssignedClass} ${teacherAssignedSection || ''}`);
      setTeacherStudents(filtered);
    }
    
    // Load existing progress records
    const pRes = await fetch(`${API_BASE}/progress/all`).then(r => r.json()).catch(() => ({ data: [] }));
    setAllProgress(pRes.data || []);
  };

  const handleAddMarks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!marksForm.studentId || !marksForm.subject || !marksForm.marksObtained) {
      setMarksError('Please fill all required fields');
      return;
    }
    setMarksLoading(true);
    setMarksError('');
    setMarksSuccess('');
    const res = await progressApi.add({
      studentId: marksForm.studentId,
      subject: marksForm.subject,
      term: marksForm.term,
      marksObtained: Number(marksForm.marksObtained),
      maxMarks: Number(marksForm.maxMarks) || 100,
      remarks: marksForm.remarks,
      grade: getGrade(Number(marksForm.marksObtained), Number(marksForm.maxMarks) || 100)
    });
    if (res.success) {
      setMarksSuccess('Marks added successfully!');
      setMarksForm({ studentId: '', subject: '', term: 'Term 1', marksObtained: '', maxMarks: '100', remarks: '' });
      loadTeacherStudents();
      setTimeout(() => setMarksSuccess(''), 3000);
    } else {
      setMarksError(res.error || 'Failed to add marks');
    }
    setMarksLoading(false);
  };
  
  const handleViewStudentMarks = async (student: any) => {
    setSelectedStudentForView(student);
    setShowViewMarks(true);
    
    try {
      // Fetch marks for this student
      const res = await progressApi.getMyProgress(student.id);
      if (res.success) {
        setSelectedStudentMarks(res.data || []);
      } else {
        setSelectedStudentMarks([]);
      }
    } catch (error) {
      console.error('Error fetching student marks:', error);
      setSelectedStudentMarks([]);
    }
  };
  
  const closeViewMarks = () => {
    setShowViewMarks(false);
    setSelectedStudentForView(null);
    setSelectedStudentMarks([]);
  };

  const getGrade = (obtained: number, max: number) => {
    const pct = (obtained / max) * 100;
    if (pct >= 90) return 'A+';
    if (pct >= 80) return 'A';
    if (pct >= 70) return 'B';
    if (pct >= 60) return 'C';
    if (pct >= 50) return 'D';
    return 'F';
  };

  const loadAttPreview = async () => {
    setLoadingPreviews(p => ({ ...p, att: true }));
    const res = await reportsApi.attendanceSummary({ class: attFilters.class, section: attFilters.section, startDate: attFilters.startDate, endDate: attFilters.endDate });
    if (res.success) setAttPreview((res.data || []).slice(0, 5));
    setLoadingPreviews(p => ({ ...p, att: false }));
  };

  const loadFeesPreview = async () => {
    setLoadingPreviews(p => ({ ...p, fees: true }));
    const res = await reportsApi.feesSummary({ class: feesFilters.class, section: feesFilters.section });
    if (res.success) setFeesPreview((res.data || []).slice(0, 5));
    setLoadingPreviews(p => ({ ...p, fees: false }));
  };

  const loadProgressPreview = async () => {
    setLoadingPreviews(p => ({ ...p, progress: true }));
    const res = await reportsApi.progressSummary({ class: progressFilters.class, section: progressFilters.section, term: progressFilters.term });
    if (res.success) setProgressPreview((res.data || []).slice(0, 5));
    setLoadingPreviews(p => ({ ...p, progress: false }));
  };

  // ─── STUDENT VIEW ────────────────────────────────────────────────────────────
  if (userRole === 19) {
    const avg = myProgress.length > 0
      ? myProgress.reduce((s, p) => s + ((Number(p.marks_obtained) / Number(p.max_marks || 100)) * 100), 0) / myProgress.length
      : 0;
    const grade = getGrade(avg, 100);
    const radius = 54, circumference = 2 * Math.PI * radius;
    const strokeDash = circumference - (avg / 100) * circumference;

    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My Progress Report</h1>
          <div className="flex gap-2">
            {TERMS.map(t => (
              <button key={t} onClick={() => setProgressTerm(progressTerm === t ? '' : t)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${progressTerm === t ? 'bg-[#5e3a9e] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {progressLoading ? (
          <div className="flex items-center justify-center h-48"><div className="w-8 h-8 border-4 border-[#5e3a9e] border-t-transparent rounded-full animate-spin" /></div>
        ) : myProgress.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
            <div className="text-5xl mb-4">📊</div>
            <p className="text-gray-500 text-lg">No progress records available</p>
            <p className="text-gray-400 text-sm mt-2">Marks will appear here once added by your teacher</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col items-center">
              <svg width="140" height="140" className="mb-4">
                <circle cx="70" cy="70" r={radius} fill="none" stroke="#f3f4f6" strokeWidth="12" />
                <circle cx="70" cy="70" r={radius} fill="none" stroke="#5e3a9e" strokeWidth="12"
                  strokeDasharray={circumference} strokeDashoffset={strokeDash}
                  strokeLinecap="round" transform="rotate(-90 70 70)" style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
                <text x="70" y="65" textAnchor="middle" className="text-2xl" fill="#1f2937" style={{ fontSize: '22px', fontWeight: 'bold' }}>{avg.toFixed(1)}%</text>
                <text x="70" y="85" textAnchor="middle" fill="#6b7280" style={{ fontSize: '14px' }}>Overall</text>
              </svg>
              <div className={`px-4 py-2 rounded-full text-xl font-bold ${avg >= 90 ? 'bg-green-100 text-green-700' : avg >= 70 ? 'bg-blue-100 text-blue-700' : avg >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                Grade: {grade}
              </div>
            </div>
            <div className="md:col-span-2 space-y-3">
              {myProgress.map((p, i) => {
                const pct = (Number(p.marks_obtained) / Number(p.max_marks || 100)) * 100;
                return (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <span className="font-semibold text-gray-800">{p.subject}</span>
                        {p.term && <span className="ml-2 text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{p.term}</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{p.marks_obtained}/{p.max_marks || 100}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${pct >= 90 ? 'bg-green-100 text-green-700' : pct >= 70 ? 'bg-blue-100 text-blue-700' : pct >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{getGrade(Number(p.marks_obtained), Number(p.max_marks || 100))}</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-[#5e3a9e] h-2 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="text-right text-xs text-gray-400 mt-1">{pct.toFixed(1)}%</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── TEACHER VIEW ────────────────────────────────────────────────────────────
  if (userRole === 7) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Progress & Reports</h1>

        {/* Add Marks Form */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Add Student Marks</h2>
          {marksSuccess && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm border border-green-200">{marksSuccess}</div>}
          {marksError && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">{marksError}</div>}
          <form onSubmit={handleAddMarks} className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="col-span-2 md:col-span-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">Student *</label>
              <select value={marksForm.studentId} onChange={e => setMarksForm(f => ({ ...f, studentId: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#5e3a9e] focus:ring-1 focus:ring-[#5e3a9e]">
                <option value="">Select Student</option>
                {teacherStudents.map((s: any) => <option key={s.id} value={s.id}>{s.student_name} — {s.class} {s.section}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Subject *</label>
              <select value={marksForm.subject} onChange={e => setMarksForm(f => ({ ...f, subject: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#5e3a9e] focus:ring-1 focus:ring-[#5e3a9e]">
                <option value="">Select Subject</option>
                {SUBJECTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Term</label>
              <select value={marksForm.term} onChange={e => setMarksForm(f => ({ ...f, term: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#5e3a9e]">
                {TERMS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Marks Obtained *</label>
              <input type="number" value={marksForm.marksObtained} onChange={e => setMarksForm(f => ({ ...f, marksObtained: e.target.value }))} min="0" max={marksForm.maxMarks} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#5e3a9e] focus:ring-1 focus:ring-[#5e3a9e]" placeholder="e.g. 85" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Max Marks</label>
              <input type="number" value={marksForm.maxMarks} onChange={e => setMarksForm(f => ({ ...f, maxMarks: e.target.value }))} min="1" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#5e3a9e] focus:ring-1 focus:ring-[#5e3a9e]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Remarks</label>
              <input type="text" value={marksForm.remarks} onChange={e => setMarksForm(f => ({ ...f, remarks: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#5e3a9e]" placeholder="Optional" />
            </div>
            <div className="col-span-2 md:col-span-3">
              <button type="submit" disabled={marksLoading} className="px-6 py-2 bg-[#5e3a9e] text-white rounded-lg text-sm font-medium hover:bg-[#4c2d8a] transition disabled:opacity-60">
                {marksLoading ? 'Adding...' : '+ Add Marks'}
              </button>
            </div>
          </form>
        </div>

        {/* View Student Marks Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">View Student Marks</h2>
          <p className="text-sm text-gray-600 mb-4">Click on a student to view their marks</p>
          
          {teacherStudents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📚</div>
              <p>No students found in your class</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {teacherStudents.map((student: any) => (
                <button
                  key={student.id}
                  onClick={() => handleViewStudentMarks(student)}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-[#5e3a9e] hover:bg-purple-50 transition text-left"
                >
                  <div>
                    <p className="font-medium text-gray-800">{student.student_name || student.user?.full_name}</p>
                    <p className="text-xs text-gray-500">Roll No: {student.roll_no || 'N/A'} | {student.class} - {student.section}</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* View Marks Modal */}
        {showViewMarks && selectedStudentForView && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white p-6 border-b flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedStudentForView.student_name || selectedStudentForView.user?.full_name}</h3>
                  <p className="text-sm text-gray-500">Class: {selectedStudentForView.class} - {selectedStudentForView.section} | Roll No: {selectedStudentForView.roll_no || 'N/A'}</p>
                </div>
                <button
                  onClick={closeViewMarks}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  &times;
                </button>
              </div>
              
              <div className="p-6">
                {selectedStudentMarks.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-5xl mb-4">📊</div>
                    <p className="text-gray-500 text-lg">No marks added yet</p>
                    <p className="text-gray-400 text-sm mt-2">Add marks using the form above</p>
                  </div>
                ) : (
                  <>
                    {/* Statistics */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="bg-blue-50 rounded-lg p-4 text-center">
                        <p className="text-sm text-gray-600 mb-1">Total Subjects</p>
                        <p className="text-2xl font-bold text-blue-600">{selectedStudentMarks.length}</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4 text-center">
                        <p className="text-sm text-gray-600 mb-1">Average</p>
                        <p className="text-2xl font-bold text-green-600">
                          {(selectedStudentMarks.reduce((acc, m) => acc + (Number(m.marks_obtained) / Number(m.max_marks || 100)) * 100, 0) / selectedStudentMarks.length).toFixed(1)}%
                        </p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4 text-center">
                        <p className="text-sm text-gray-600 mb-1">Grade</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {getGrade(
                            selectedStudentMarks.reduce((acc, m) => acc + Number(m.marks_obtained), 0),
                            selectedStudentMarks.reduce((acc, m) => acc + Number(m.max_marks || 100), 0)
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Marks List */}
                    <div className="space-y-3">
                      {selectedStudentMarks.map((mark: any, index: number) => {
                        const percentage = (Number(mark.marks_obtained) / Number(mark.max_marks || 100)) * 100;
                        return (
                          <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-[#5e3a9e] transition">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-semibold text-gray-800">{mark.subject}</h4>
                                {mark.term && <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded mt-1 inline-block">{mark.term}</span>}
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-gray-600">{mark.marks_obtained}/{mark.max_marks || 100}</p>
                                <span className={`px-2 py-0.5 rounded text-xs font-bold mt-1 inline-block ${
                                  percentage >= 90 ? 'bg-green-100 text-green-700' : 
                                  percentage >= 70 ? 'bg-blue-100 text-blue-700' : 
                                  percentage >= 50 ? 'bg-yellow-100 text-yellow-700' : 
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {mark.grade}
                                </span>
                              </div>
                            </div>
                            
                            {/* Progress Bar */}
                            <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                              <div 
                                className="bg-[#5e3a9e] h-2 rounded-full transition-all duration-300" 
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <div className="flex justify-between items-center text-xs text-gray-500">
                              <span>{percentage.toFixed(1)}%</span>
                              {mark.remarks && <span className="italic">"{mark.remarks}"</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              <div className="sticky bottom-0 bg-gray-50 p-4 border-t flex justify-end">
                <button
                  onClick={closeViewMarks}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* My Class Attendance Report */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">My Class Attendance Report</h2>
            <button onClick={() => { const url = reportsApi.exportUrl('student-attendance', { class: teacherAssignedClass || '', section: teacherAssignedSection || '' }); downloadCSV(url); }}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition">
              ⬇ Download Attendance CSV
            </button>
          </div>
          <p className="text-sm text-gray-500">Download attendance report for your assigned class to view detailed records.</p>
        </div>

        {/* My Class Progress/Marks Report */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">My Class Progress Report</h2>
              <p className="text-sm text-gray-500 mt-1">Download complete marks sheet for all students in your class</p>
            </div>
            <div className="flex gap-3">
              <select 
                id="termFilter"
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#5e3a9e] focus:ring-1 focus:ring-[#5e3a9e]"
                defaultValue=""
              >
                <option value="">All Terms</option>
                {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <button 
                onClick={() => { 
                  const termSelect = document.getElementById('termFilter') as HTMLSelectElement;
                  const selectedTerm = termSelect?.value || '';
                  const url = reportsApi.exportUrl('progress', { 
                    class: teacherAssignedClass || '', 
                    section: teacherAssignedSection || '',
                    term: selectedTerm
                  }); 
                  downloadCSV(url); 
                }}
                className="flex items-center gap-2 px-4 py-2 bg-[#5e3a9e] text-white rounded-lg text-sm font-medium hover:bg-[#4c2d8a] transition"
              >
                📊 Download Marks Excel
              </button>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-blue-900 mb-1">What's included in the export?</h4>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• Student names, class, section, and roll numbers</li>
                  <li>• Subject-wise marks for all students in your class</li>
                  <li>• Average percentage and overall grade for each student</li>
                  <li>• Filter by specific term or export all terms combined</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── PRINCIPAL VIEW ───────────────────────────────────────────────────────────
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Reports & Exports</h1>
        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Principal Dashboard</span>
      </div>

      <div className="grid gap-6">

        {/* Student Attendance Report */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">📅 Student Attendance Report</h2>
              <p className="text-xs text-gray-500 mt-0.5">Class-wise student attendance summary with percentage</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mb-4">
            <select value={attFilters.class} onChange={e => setAttFilters(f => ({ ...f, class: e.target.value }))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#5e3a9e]">
              <option value="">All Classes</option>{CLASSES.map(c => <option key={c}>{c}</option>)}
            </select>
            <select value={attFilters.section} onChange={e => setAttFilters(f => ({ ...f, section: e.target.value }))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#5e3a9e]">
              <option value="">All Sections</option>{SECTIONS.map(s => <option key={s}>{s}</option>)}
            </select>
            <input type="date" value={attFilters.startDate} onChange={e => setAttFilters(f => ({ ...f, startDate: e.target.value }))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#5e3a9e]" />
            <input type="date" value={attFilters.endDate} onChange={e => setAttFilters(f => ({ ...f, endDate: e.target.value }))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#5e3a9e]" />
            <button onClick={loadAttPreview} className="px-4 py-2 bg-[#5e3a9e]/10 text-[#5e3a9e] rounded-lg text-sm font-medium hover:bg-[#5e3a9e]/20 transition">Preview</button>
            <button onClick={() => downloadCSV(reportsApi.exportUrl('student-attendance', { class: attFilters.class, section: attFilters.section, startDate: attFilters.startDate, endDate: attFilters.endDate }))}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition">⬇ Export CSV</button>
          </div>
          {loadingPreviews.att ? <div className="h-12 flex items-center"><div className="w-5 h-5 border-2 border-[#5e3a9e] border-t-transparent rounded-full animate-spin" /></div>
           : attPreview.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-gray-100">
              <table className="w-full text-xs">
                <thead><tr className="bg-gray-50">{['Name','Class','Section','Total','Present','Absent','%'].map(h => <th key={h} className="px-3 py-2 text-left font-semibold text-gray-500">{h}</th>)}</tr></thead>
                <tbody>{attPreview.map((r,i) => <tr key={i} className="border-t border-gray-100"><td className="px-3 py-2">{r.student_name}</td><td className="px-3 py-2">{r.class}</td><td className="px-3 py-2">{r.section}</td><td className="px-3 py-2">{r.total}</td><td className="px-3 py-2 text-green-600">{r.present}</td><td className="px-3 py-2 text-red-600">{r.absent}</td><td className="px-3 py-2 font-medium">{r.percentage}%</td></tr>)}</tbody>
              </table>
              <p className="text-xs text-gray-400 px-3 py-2">Showing top 5 records. Download CSV for full report.</p>
            </div>
          )}
        </div>

        {/* Staff Attendance Report */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-gray-800">👨‍🏫 Staff Attendance Report</h2>
              <p className="text-xs text-gray-500 mt-0.5">Staff presence summary with attendance percentage</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mb-4">
            <input type="date" value={staffAttFilters.startDate} onChange={e => setStaffAttFilters(f => ({ ...f, startDate: e.target.value }))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#5e3a9e]" />
            <input type="date" value={staffAttFilters.endDate} onChange={e => setStaffAttFilters(f => ({ ...f, endDate: e.target.value }))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#5e3a9e]" />
            <button onClick={() => downloadCSV(reportsApi.exportUrl('staff-attendance', { startDate: staffAttFilters.startDate, endDate: staffAttFilters.endDate }))}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition">⬇ Export CSV</button>
          </div>
        </div>

        {/* Fees Report */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-gray-800">💳 Fees Collection Report</h2>
              <p className="text-xs text-gray-500 mt-0.5">Student fees status with paid/pending breakdown</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mb-4">
            <select value={feesFilters.class} onChange={e => setFeesFilters(f => ({ ...f, class: e.target.value }))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#5e3a9e]">
              <option value="">All Classes</option>{CLASSES.map(c => <option key={c}>{c}</option>)}
            </select>
            <select value={feesFilters.section} onChange={e => setFeesFilters(f => ({ ...f, section: e.target.value }))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#5e3a9e]">
              <option value="">All Sections</option>{SECTIONS.map(s => <option key={s}>{s}</option>)}
            </select>
            <button onClick={loadFeesPreview} className="px-4 py-2 bg-[#5e3a9e]/10 text-[#5e3a9e] rounded-lg text-sm font-medium hover:bg-[#5e3a9e]/20 transition">Preview</button>
            <button onClick={() => downloadCSV(reportsApi.exportUrl('fees', { class: feesFilters.class, section: feesFilters.section }))}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition">⬇ Export CSV</button>
          </div>
          {feesPreview.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-gray-100">
              <table className="w-full text-xs">
                <thead><tr className="bg-gray-50">{['Name','Class','Total','Paid','Pending','Status'].map(h => <th key={h} className="px-3 py-2 text-left font-semibold text-gray-500">{h}</th>)}</tr></thead>
                <tbody>{feesPreview.map((r,i) => <tr key={i} className="border-t border-gray-100"><td className="px-3 py-2">{r.studentName}</td><td className="px-3 py-2">{r.class}</td><td className="px-3 py-2">₹{r.totalFees}</td><td className="px-3 py-2 text-green-600">₹{r.paidAmount}</td><td className="px-3 py-2 text-red-600">₹{r.pendingAmount}</td><td className="px-3 py-2">{r.status}</td></tr>)}</tbody>
              </table>
              <p className="text-xs text-gray-400 px-3 py-2">Showing top 5 records.</p>
            </div>
          )}
        </div>

        {/* Progress Report */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-gray-800">📊 Student Progress Report</h2>
              <p className="text-xs text-gray-500 mt-0.5">Subject-wise marks and grade summary</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mb-4">
            <select value={progressFilters.class} onChange={e => setProgressFilters(f => ({ ...f, class: e.target.value }))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#5e3a9e]">
              <option value="">All Classes</option>{CLASSES.map(c => <option key={c}>{c}</option>)}
            </select>
            <select value={progressFilters.section} onChange={e => setProgressFilters(f => ({ ...f, section: e.target.value }))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#5e3a9e]">
              <option value="">All Sections</option>{SECTIONS.map(s => <option key={s}>{s}</option>)}
            </select>
            <select value={progressFilters.term} onChange={e => setProgressFilters(f => ({ ...f, term: e.target.value }))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#5e3a9e]">
              <option value="">All Terms</option>{TERMS.map(t => <option key={t}>{t}</option>)}
            </select>
            <button onClick={loadProgressPreview} className="px-4 py-2 bg-[#5e3a9e]/10 text-[#5e3a9e] rounded-lg text-sm font-medium hover:bg-[#5e3a9e]/20 transition">Preview</button>
            <button onClick={() => downloadCSV(reportsApi.exportUrl('progress', { class: progressFilters.class, section: progressFilters.section, term: progressFilters.term }))}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition">⬇ Export CSV</button>
          </div>
          {progressPreview.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-gray-100">
              <table className="w-full text-xs">
                <thead><tr className="bg-gray-50">{['Name','Class','Section','Avg %','Grade'].map(h => <th key={h} className="px-3 py-2 text-left font-semibold text-gray-500">{h}</th>)}</tr></thead>
                <tbody>{progressPreview.map((r,i) => <tr key={i} className="border-t border-gray-100"><td className="px-3 py-2">{r.student_name}</td><td className="px-3 py-2">{r.class}</td><td className="px-3 py-2">{r.section}</td><td className="px-3 py-2">{r.averagePercentage}%</td><td className="px-3 py-2 font-bold">{r.grade}</td></tr>)}</tbody>
              </table>
              <p className="text-xs text-gray-400 px-3 py-2">Showing top 5 records.</p>
            </div>
          )}
        </div>

        {/* Salary Report */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-gray-800">💵 Salary Disbursement Report</h2>
              <p className="text-xs text-gray-500 mt-0.5">Monthly salary payment records for all staff</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mb-4">
            <select value={salaryFilters.month} onChange={e => setSalaryFilters(f => ({ ...f, month: e.target.value }))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#5e3a9e]">
              <option value="">All Months</option>{MONTHS.map(m => <option key={m}>{m}</option>)}
            </select>
            <select value={salaryFilters.year} onChange={e => setSalaryFilters(f => ({ ...f, year: e.target.value }))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#5e3a9e]">
              {['2023','2024','2025','2026'].map(y => <option key={y}>{y}</option>)}
            </select>
            <button onClick={() => downloadCSV(reportsApi.exportUrl('salary', { month: salaryFilters.month, year: salaryFilters.year }))}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition">⬇ Export CSV</button>
          </div>
        </div>

      </div>
    </div>
  );
}
