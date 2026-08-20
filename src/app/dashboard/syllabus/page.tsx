'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { syllabusApi, configApi } from '@/lib/api';

interface SyllabusRecord {
  id: string;
  class: string;
  subject?: string;
  topics?: string;
  description?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export default function SyllabusPage() {
  const router = useRouter();
  const [role, setRole] = useState<number | null>(null);

  // Navigation / View State
  const [viewMode, setViewMode] = useState<'classList' | 'syllabusDetail'>('classList');
  const [selectedClass, setSelectedClass] = useState<string | null>(null);

  // Data State
  const [classList, setClassList] = useState<string[]>([]);  // only real classes from API
  const [classSyllabusMap, setClassSyllabusMap] = useState<{ [className: string]: SyllabusRecord[] }>({});
  const [loading, setLoading] = useState<boolean>(true);
  
  // Edit State
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [rawContent, setRawContent] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  // Active syllabus text dynamically computed from classSyllabusMap
  const activeSyllabusText = useMemo(() => {
    if (!selectedClass) return '';
    const normKey = String(selectedClass).trim().toLowerCase();
    const records = classSyllabusMap[normKey] || classSyllabusMap[selectedClass] || [];
    if (records.length > 0) {
      return records.map(r => r.topics || r.description || '').filter(Boolean).join('\n\n');
    }
    return '';
  }, [selectedClass, classSyllabusMap]);

  useEffect(() => {
    const storedRole = localStorage.getItem('userRole');
    if (storedRole) setRole(Number(storedRole));

    // If student role, get their class and fetch only their syllabus
    if (storedRole && Number(storedRole) === 19) {
      fetchStudentSyllabus();
    } else {
      fetchClassesAndSyllabus();
    }
  }, []);

  const fetchStudentSyllabus = async () => {
    setLoading(true);
    try {
      // Get student's class from localStorage (stored as userClass during login)
      const studentClass = localStorage.getItem('userClass');
      
      if (!studentClass) {
        console.error('Student class not found in localStorage');
        setLoading(false);
        return;
      }

      console.log('📚 Loading syllabus for student class:', studentClass);

      // Fetch syllabus for this class only
      const syllabusRes = await syllabusApi.list(studentClass);
      const syllabusData: SyllabusRecord[] = (syllabusRes.success && Array.isArray(syllabusRes.data))
        ? syllabusRes.data : [];

      console.log('✅ Syllabus data fetched:', syllabusData);

      // Directly open syllabus detail for student's class
      setSelectedClass(studentClass);
      setViewMode('syllabusDetail');
      
      if (syllabusData.length > 0) {
        const combined = syllabusData.map(r => r.topics || r.description || '').filter(Boolean).join('\n\n');
        setRawContent(combined);
      } else {
        setRawContent('');
      }
    } catch (err) {
      console.error('Failed to load student syllabus:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClassesAndSyllabus = async () => {
    setLoading(true);
    try {
      const [statsRes, syllabusRes] = await Promise.all([
        configApi.getClassStats(),
        syllabusApi.list()
      ]);

      const syllabusData: SyllabusRecord[] = (syllabusRes.success && Array.isArray(syllabusRes.data))
        ? syllabusRes.data : [];

      // Build normalized syllabus map — keyed by lowercase class name
      const map: { [key: string]: SyllabusRecord[] } = {};
      syllabusData.forEach((s: SyllabusRecord) => {
        if (s.class) {
          const key = String(s.class).trim().toLowerCase();
          if (!map[key]) map[key] = [];
          map[key].push(s);
        }
      });
      setClassSyllabusMap(map);

      // Build classList: from class-stats + from syllabus (so classes with syllabus always show)
      const statsNames: string[] = (statsRes.success && Array.isArray(statsRes.data) && statsRes.data.length > 0)
        ? statsRes.data.map((c: any) => String(c.name).trim())
        : [];

      const syllabusClassNames: string[] = syllabusData
        .map((s: SyllabusRecord) => String(s.class).trim())
        .filter(Boolean);

      // Merge unique class names preserving original casing
      const merged = Array.from(new Set([...statsNames, ...syllabusClassNames]));

      // Sort standard order
      const ORDER = ['Nursery', 'LKG', 'UKG', 'Playgroup', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
      merged.sort((a, b) => {
        const ia = ORDER.indexOf(a), ib = ORDER.indexOf(b);
        if (ia !== -1 && ib !== -1) return ia - ib;
        if (ia !== -1) return -1;
        if (ib !== -1) return 1;
        return a.localeCompare(b);
      });

      setClassList(merged);
    } catch (err) {
      console.error('Failed to load syllabus data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Open Level 2 Syllabus Detail for Class
  const handleOpenClassSyllabus = (className: string) => {
    setSelectedClass(className);
    setViewMode('syllabusDetail');
    setIsEditing(false);

    const normKey = String(className).trim().toLowerCase();
    const records = classSyllabusMap[normKey] || classSyllabusMap[className] || [];
    if (records.length > 0) {
      const combined = records.map(r => r.topics || r.description || '').filter(Boolean).join('\n\n');
      setRawContent(combined);
    } else {
      setRawContent('');
    }
  };

  // Save / Update Syllabus for selected class
  const handleSaveSyllabus = async () => {
    if (!selectedClass || !rawContent.trim()) return;

    setSaving(true);
    try {
      const normKey = String(selectedClass).trim().toLowerCase();
      const records = classSyllabusMap[normKey] || [];

      let savedRecord: SyllabusRecord | null = null;

      if (records.length > 0) {
        // UPDATE existing record
        const res = await syllabusApi.update(records[0].id, {
          class: selectedClass,
          topic: rawContent,
          topics: rawContent,
          description: rawContent
        });
        if (res.success) savedRecord = res.data;
      } else {
        // CREATE new record
        const res = await syllabusApi.create({
          class: selectedClass,
          studentClass: selectedClass,
          topic: rawContent,
          topics: rawContent,
          description: rawContent
        });
        if (res.success) savedRecord = res.data;
      }

      // Immediately update local state so badge and content reflect instantly
      if (savedRecord || rawContent.trim()) {
        setClassSyllabusMap(prev => {
          const normKey = String(selectedClass).trim().toLowerCase();
          const existingRecords = prev[normKey] || [];
          const updatedRecord: SyllabusRecord = savedRecord || {
            id: existingRecords[0]?.id || 'temp-' + Date.now(),
            class: selectedClass,
            subject: 'General',
            topics: rawContent,
            description: rawContent,
            status: 'Active'
          };
          return {
            ...prev,
            [normKey]: existingRecords.length > 0
              ? existingRecords.map((r, i) => i === 0 ? { ...r, topics: rawContent, description: rawContent } : r)
              : [updatedRecord]
          };
        });
      }

      setIsEditing(false);

      // Background refresh to sync with DB
      fetchClassesAndSyllabus();
    } catch (err) {
      console.error('Failed to save syllabus:', err);
    } finally {
      setSaving(false);
    }
  };

  // Download PDF / Print
  const handleDownloadPDF = () => {
    window.print();
  };

  // Helper to display raw syllabus content (no formatting)
  const renderFormattedSyllabus = (content: string) => {
    if (!content.trim()) {
      return (
        <div className="text-center py-16 px-4 text-gray-400">
          <p className="text-lg font-medium text-gray-600 mb-1">No syllabus added yet for Class {selectedClass}</p>
          <p className="text-xs">Click "Add / Update Syllabus" to add syllabus content.</p>
        </div>
      );
    }

    return (
      <div className="whitespace-pre-wrap text-gray-800 leading-relaxed font-sans text-sm">
        {content}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12 print:bg-white print:p-0">
      {/* Header Bar (Hidden during print) */}
      <div className="bg-white border-b px-6 py-6 shadow-sm print:hidden">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-1">
              {role !== 19 && (
                <span
                  onClick={() => setViewMode('classList')}
                  className="hover:text-[#5e3a9e] cursor-pointer transition"
                >
                  📚 Syllabus Management
                </span>
              )}
              {role === 19 && <span>📚 My Syllabus</span>}
              {viewMode === 'syllabusDetail' && selectedClass && role !== 19 && (
                <>
                  <span>/</span>
                  <span className="text-[#5e3a9e]">Class {selectedClass}</span>
                </>
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              {role === 19 ? `My Syllabus - Class ${selectedClass}` : viewMode === 'classList' ? 'Class Syllabus Overview' : `Syllabus - Class ${selectedClass}`}
            </h1>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {viewMode === 'syllabusDetail' && (
              <>
                {role !== 19 && (
                  <button
                    onClick={() => setViewMode('classList')}
                    className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-xl text-xs font-semibold transition"
                  >
                    ← Back to Classes
                  </button>
                )}

                {role !== 19 && !isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-[#5e3a9e] text-white px-5 py-2.5 rounded-xl hover:bg-[#4a2d7e] transition text-xs font-bold shadow-sm"
                  >
                    ✏️ Add / Update Syllabus
                  </button>
                )}

                {!isEditing && (
                  <button
                    onClick={handleDownloadPDF}
                    className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition flex items-center gap-2 text-xs font-bold shadow-sm"
                  >
                    📥 Download PDF
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6 print:p-8 print:max-w-none">
        {/* LEVEL 1: CLASS CARDS GRID */}
        {viewMode === 'classList' && (
          <>
            {loading ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#5e3a9e] border-t-transparent mb-3"></div>
                <p className="text-gray-500 text-sm">Loading syllabus classes...</p>
              </div>
            ) : classList.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="w-16 h-16 bg-purple-50 text-[#5e3a9e] rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                  📚
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">No Active Classes Found</h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
                  Only classes available in your Class List panel are displayed here. Add classes in the Class List panel to manage their syllabus.
                </p>
                <button
                  onClick={() => router.push('/dashboard/class-list')}
                  className="bg-[#5e3a9e] text-white px-5 py-2.5 rounded-xl hover:bg-[#4a2d7e] transition text-xs font-bold shadow-sm"
                >
                  Go to Class List Panel →
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {classList.map((className, index) => {
                  const normKey = String(className).trim().toLowerCase();
                  const records = classSyllabusMap[normKey] || [];
                  const hasSyllabus = records.length > 0 && records.some(r => (r.topics || r.description || '').trim().length > 0);
                  return (
                    <div
                      key={index}
                      onClick={() => handleOpenClassSyllabus(className)}
                      className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm hover:shadow-md hover:border-[#5e3a9e]/50 transition duration-200 cursor-pointer group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 rounded-xl bg-purple-50 text-[#5e3a9e] font-bold text-xl flex items-center justify-center group-hover:scale-105 transition">
                            📖
                          </div>
                          <span
                            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                              hasSyllabus
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {hasSyllabus ? 'Syllabus Added' : 'No Syllabus'}
                          </span>
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#5e3a9e] transition mb-2">
                          Class {className}
                        </h3>
                        <p className="text-xs text-gray-500 mb-6">
                          Click to view or edit curriculum and syllabus topics for Class {className}.
                        </p>
                      </div>

                      <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#5e3a9e]">
                        <span>View Class Syllabus</span>
                        <span className="group-hover:translate-x-1 transition">→</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* LEVEL 2: CLASS SYLLABUS DETAIL / EDITOR */}
        {viewMode === 'syllabusDetail' && selectedClass && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 print:shadow-none print:border-none">
            {/* Print Header */}
            <div className="hidden print:block text-center border-b pb-6 mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Foster Kids School</h1>
              <h2 className="text-xl font-semibold text-[#5e3a9e] mt-1">Official Class Syllabus — Class {selectedClass}</h2>
              <p className="text-xs text-gray-500 mt-1">Academic Session 2025-2026</p>
            </div>

            {isEditing ? (
              /* Simple Text Editor */
              <div className="space-y-4 print:hidden">
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                  <h3 className="text-sm font-bold text-[#5e3a9e] mb-1">📋 Add/Update Syllabus</h3>
                  <p className="text-xs text-gray-600">
                    Enter the syllabus content below. The text will be displayed exactly as you type it.
                  </p>
                </div>

                <textarea
                  rows={14}
                  value={rawContent}
                  onChange={(e) => setRawContent(e.target.value)}
                  placeholder="Enter syllabus content here..."
                  className="w-full p-4 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#5e3a9e] outline-none"
                ></textarea>

                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveSyllabus}
                    disabled={saving}
                    className="px-6 py-2 bg-[#5e3a9e] text-white hover:bg-[#4a2d7e] rounded-xl text-sm font-semibold shadow-sm transition disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Syllabus'}
                  </button>
                </div>
              </div>
            ) : (
              /* Display Syllabus Content */
              <div>
                {renderFormattedSyllabus(activeSyllabusText || rawContent)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
