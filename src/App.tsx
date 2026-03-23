/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Save, 
  X, 
  Trash2, 
  Search, 
  FileText,
  Cloud,
  CloudOff,
  Copy
} from 'lucide-react';
import { db } from './firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';

// --- Types ---

declare global {
  interface Window {
    require: any;
  }
}

type TabType = 'admission' | 'lab' | 'prescription' | 'outpatient' | 'er' | 'none';

interface SoapBlock {
  s: string;
  o: string;
  a: string;
  p: string;
}

interface Patient {
  id: string;
  name: string;
  chartNo: string;
  age: string;
  gender: 'M' | 'F';
  room: string;
  dept: string;
  doctor: string;
  bloodType: string;
  dx: string;
  cc: string;
  onset: string;
  address: string;
  dobYear: string;
  dobMonth: string;
  dobDay: string;
  height: string;
  weight: string;
  // Additional fields for records
  admissionDate: string;
  soapNote: string;
  soapBlocks: SoapBlock[];
  exam: string;
  labRows: string[][];
  regimenRows: string[][];
  outpatientVS: string[];
  outpatientExam: string;
  outpatientNote: string;
  erVS: string;
  erMode: string;
  erTime: string;
  erLabNote: string;
  imagingNote: string;
  imagingPhotos: string[];
  prescriptionNotes: Record<string, string>;
}

const PRESCRIPTION_SUB_TABS = ['검사 처방', '영상 검사', '약물 지시', '처치/시술', '진료 지시', '컨설트', '기타'];

const INITIAL_FORM_DATA: Patient = {
  id: '',
  name: '',
  chartNo: '',
  age: '',
  gender: 'M',
  room: '',
  dept: '',
  doctor: '',
  bloodType: '',
  dx: '',
  cc: '',
  onset: '',
  address: '',
  dobYear: '2024',
  dobMonth: '01',
  dobDay: '01',
  height: '',
  weight: '',
  admissionDate: '',
  soapNote: '',
  soapBlocks: [],
  exam: '',
  labRows: Array(10).fill(0).map(() => Array(12).fill('')),
  regimenRows: Array(4).fill(0).map(() => Array(4).fill('')),
  outpatientVS: ['', '', '', ''],
  outpatientExam: '',
  outpatientNote: '',
  erVS: '',
  erMode: '',
  erTime: '',
  erLabNote: '',
  imagingNote: '',
  imagingPhotos: [],
  prescriptionNotes: PRESCRIPTION_SUB_TABS.reduce((acc, tab) => ({ ...acc, [tab]: '' }), {}),
};

const ACCOUNTS: Record<string, { pw: string, name: string }> = {
  'jungroo_2': { pw: 'haesol123', name: '정루이' },
  'U_joongh': { pw: 'haesol123', name: '유중혁' },
  'kangjooo': { pw: 'haesol123', name: '강동주' },
  'lilly_lil': { pw: 'haesol123', name: '릴리' },
  'mincook': { pw: 'haesol123', name: '박민국' },
  'chanho8': { pw: 'haesol123', name: '찬호' },
  'sonamoo': { pw: 'haesol123', name: '소나무' },
  'ikjoooon': { pw: 'haesol123', name: '이익준' },
  'gagaeun': { pw: 'haesol123', name: '최가은' },
  'jiapark84': { pw: 'haesol123', name: '박지아' },
  'leegarden': { pw: 'haesol123', name: '이정원' },
  'jeongout7': { pw: 'haesol123', name: '이정인' },
  'peppersun': { pw: 'haesol123', name: '순후추' },
  'dohahado': { pw: 'haesol123', name: '도하' },
  'taehyns64': { pw: 'haesol123', name: '박태현' },
  'siuuhyun': { pw: 'haesol123', name: '이수현' },
  'sheepone': { pw: 'haesol123', name: '양재원' },
};

// --- Components ---

const HeaderButton = ({ icon: Icon, label, onClick, color = "text-black" }: { icon?: any, label: string, onClick?: () => void, color?: string }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-1 px-3 py-1 hover:bg-gray-200 transition-colors ${color} font-bold text-lg`}
  >
    {Icon && <Icon size={24} strokeWidth={3} />}
    <span>{label}</span>
  </button>
);

const TabButton = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`px-6 py-2 rounded-lg font-bold text-lg transition-all ${
      active 
        ? 'bg-[#FF99FF] text-white shadow-[0_4px_0_0_#CC77CC]' 
        : 'bg-[#FFCCFF] text-[#666] hover:bg-[#FFBBFF]'
    }`}
  >
    {label}
  </button>
);

const InputField = ({ label, value, onChange, readOnly = false }: { label: string, value?: string | number, onChange?: (val: string) => void, readOnly?: boolean }) => (
  <div className="flex items-center gap-2 mb-1">
    <span className="w-20 font-bold text-sm text-gray-700">{label}</span>
    <input 
      type="text" 
      value={value || ''} 
      onChange={(e) => onChange?.(e.target.value)}
      readOnly={readOnly}
      className="flex-1 border-2 border-black px-2 py-0.5 text-sm focus:outline-none"
    />
  </div>
);

const EditableSummary = ({ label, value, onChange }: { label: string, value: string, onChange: (val: string) => void }) => (
  <div className="flex items-center gap-1">
    <span>{label}:</span>
    <input 
      type="text" 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      className="border-b border-black focus:outline-none bg-transparent px-1 min-w-[50px]"
    />
  </div>
);

// --- Main App ---

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginId, setLoginId] = useState('');
  const [loginPw, setLoginPw] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('none');
  const [prescriptionSubTab, setPrescriptionSubTab] = useState<string>(PRESCRIPTION_SUB_TABS[0]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState<Patient>(INITIAL_FORM_DATA);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, patientId: string } | null>(null);
  const lastSyncedIdRef = useRef<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = ACCOUNTS[loginId];
    if (user && user.pw === loginPw) {
      setIsLoggedIn(true);
    } else {
      alert('아이디 또는 비밀번호가 틀렸습니다.');
    }
  };

  // Load data from Firestore (Real-time)
  useEffect(() => {
    const q = query(collection(db, "patients"), orderBy("name"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const patientsData: Patient[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        patientsData.push({ 
          ...data, 
          id: doc.id,
          labRows: typeof data.labRows === 'string' ? JSON.parse(data.labRows) : data.labRows,
          regimenRows: typeof data.regimenRows === 'string' ? JSON.parse(data.regimenRows) : data.regimenRows,
          imagingPhotos: typeof data.imagingPhotos === 'string' ? JSON.parse(data.imagingPhotos) : (data.imagingPhotos || []),
          soapNote: data.soapNote || data.soap || '',
          soapBlocks: typeof data.soapBlocks === 'string' ? JSON.parse(data.soapBlocks) : (data.soapBlocks || []),
          exam: data.exam || '',
        } as Patient);
      });
      setPatients(patientsData);
      setIsOnline(true);
      
      // Handle initial selection
      if (!isLoaded) {
        const lastId = localStorage.getItem('lastSelectedId');
        if (lastId && patientsData.find(p => p.id === lastId)) {
          setSelectedPatientId(lastId);
        }
        setIsLoaded(true);
      }
    }, (error) => {
      console.error("Firestore error details:", error);
      setIsOnline(false);
    });

    return () => unsubscribe();
  }, []); // Empty dependency array to run only once on mount

  // Close context menu on click anywhere
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  // Save selection preference locally
  useEffect(() => {
    if (selectedPatientId) {
      localStorage.setItem('lastSelectedId', selectedPatientId);
    } else {
      localStorage.removeItem('lastSelectedId');
    }
  }, [selectedPatientId]);

  // Sync formData when selectedPatientId changes or when patients are first loaded for the selected ID
  useEffect(() => {
    if (selectedPatientId) {
      const p = patients.find(p => p.id === selectedPatientId);
      // Only sync from patients if the ID has changed or if we haven't synced this ID yet
      if (p && lastSyncedIdRef.current !== selectedPatientId) {
        setFormData({ ...p });
        lastSyncedIdRef.current = selectedPatientId;
      }
    } else {
      setFormData(INITIAL_FORM_DATA);
      lastSyncedIdRef.current = null;
    }
  }, [selectedPatientId, patients]);

  const filteredPatients = useMemo(() => 
    patients.filter(p => 
      p.name.includes(searchQuery) || p.chartNo.includes(searchQuery)
    ), 
    [searchQuery, patients]
  );

  const handleSave = async () => {
    if (!formData.name && !formData.chartNo) {
      return;
    }

    try {
      const id = selectedPatientId || Date.now().toString();
      
      // Append timestamp to record fields in Korean time
      const now = new Date();
      const userName = ACCOUNTS[loginId]?.name || loginId;
      const timestamp = `\n[저장됨: ${now.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })} / ${userName}]`;
      
      const appendTimestamp = (text: string) => {
        if (!text) return "";
        const cleaned = text.replace(/\n\[저장됨: .*\]/g, "").trim();
        return cleaned ? cleaned + timestamp : "";
      };

      const newPrescriptionNotes = { ...formData.prescriptionNotes };
      Object.keys(newPrescriptionNotes).forEach(key => {
        newPrescriptionNotes[key] = appendTimestamp(newPrescriptionNotes[key]);
      });

      const patientData = { 
        ...formData, 
        id,
        labRows: JSON.stringify(formData.labRows),
        regimenRows: JSON.stringify(formData.regimenRows),
        imagingPhotos: JSON.stringify(formData.imagingPhotos || []),
        soapNote: appendTimestamp(formData.soapNote),
        soapBlocks: JSON.stringify(formData.soapBlocks),
        exam: appendTimestamp(formData.exam),
        outpatientExam: appendTimestamp(formData.outpatientExam),
        outpatientNote: appendTimestamp(formData.outpatientNote),
        erLabNote: appendTimestamp(formData.erLabNote),
        imagingNote: appendTimestamp(formData.imagingNote),
        prescriptionNotes: newPrescriptionNotes
      };
      
      await setDoc(doc(db, "patients", id), patientData);
      
      // Update local state and prevent immediate overwrite from useEffect
      const updatedFormData = { 
        ...formData, 
        soapNote: patientData.soapNote,
        exam: patientData.exam,
        outpatientExam: patientData.outpatientExam,
        outpatientNote: patientData.outpatientNote,
        erLabNote: patientData.erLabNote,
        imagingNote: patientData.imagingNote,
        prescriptionNotes: patientData.prescriptionNotes
      };
      setFormData(updatedFormData);
      
      if (!selectedPatientId) {
        setSelectedPatientId(id);
        lastSyncedIdRef.current = id;
      }
    } catch (e: any) {
      console.error("Save error:", e);
    }
  };

  const handleDelete = async () => {
    if (!selectedPatientId) return;
    if (!confirm('정말 삭제하시겠습니까? 이 작업은 모든 기기에서 반영됩니다.')) return;

    try {
      await deleteDoc(doc(db, "patients", selectedPatientId));
      setSelectedPatientId(null);
      setFormData(INITIAL_FORM_DATA);
      setActiveTab('none');
    } catch (e) {
      console.error("Delete error:", e);
      alert('삭제 실패');
    }
  };

  const updateField = (field: keyof Patient, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateLabCell = (rowIndex: number, colIndex: number, value: string) => {
    const newRows = [...formData.labRows];
    newRows[rowIndex][colIndex] = value;
    updateField('labRows', newRows);
  };

  const updateRegimenCell = (rowIndex: number, colIndex: number, value: string) => {
    const newRows = [...formData.regimenRows];
    newRows[rowIndex][colIndex] = value;
    updateField('regimenRows', newRows);
  };

  const updateOutpatientVS = (index: number, value: string) => {
    const newVS = [...formData.outpatientVS];
    newVS[index] = value;
    updateField('outpatientVS', newVS);
  };

  const updatePrescriptionNote = (tab: string, value: string) => {
    const newNotes = { ...formData.prescriptionNotes, [tab]: value };
    updateField('prescriptionNotes', newNotes);
  };

  const addSoapBlock = () => {
    setFormData(prev => ({
      ...prev,
      soapBlocks: [...prev.soapBlocks, { s: '', o: '', a: '', p: '' }]
    }));
  };

  const updateSoapBlock = (index: number, field: keyof SoapBlock, value: string) => {
    setFormData(prev => {
      const newBlocks = [...prev.soapBlocks];
      newBlocks[index] = { ...newBlocks[index], [field]: value };
      return { ...prev, soapBlocks: newBlocks };
    });
  };

  const removeSoapBlock = (index: number) => {
    setFormData(prev => {
      const newBlocks = [...prev.soapBlocks];
      newBlocks.splice(index, 1);
      return { ...prev, soapBlocks: newBlocks };
    });
  };

  const duplicateSoapBlock = (index: number) => {
    setFormData(prev => {
      const newBlocks = [...prev.soapBlocks];
      newBlocks.splice(index + 1, 0, { ...newBlocks[index] });
      return { ...prev, soapBlocks: newBlocks };
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024) {
      alert('파일 크기가 너무 큽니다. 500KB 이하의 이미지를 사용해주세요.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const newPhotos = [...(formData.imagingPhotos || []), base64String];
      updateField('imagingPhotos', newPhotos);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = (index: number) => {
    const newPhotos = [...(formData.imagingPhotos || [])];
    newPhotos.splice(index, 1);
    updateField('imagingPhotos', newPhotos);
  };

  const renderContent = () => {
    if (activeTab === 'none') {
      return (
        <div className="flex-1 flex items-center justify-center bg-white">
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-800 mb-2">위 탭에서 기능을 선택하거나</p>
            <p className="text-3xl font-bold text-gray-800">환자를 검색하세요.</p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'admission':
        return (
          <div className="flex-1 flex gap-4 p-4 bg-white overflow-hidden">
            <div className="flex-1 flex flex-col gap-4">
              <div className="border-2 border-black flex flex-col h-[60%] overflow-y-auto">
                <div className="border-b-2 border-black text-center font-bold py-1 flex flex-col items-center shrink-0 bg-gray-50">
                  <span>입원일</span>
                  <input 
                    type="text" 
                    value={formData.admissionDate}
                    onChange={(e) => updateField('admissionDate', e.target.value)}
                    className="border border-gray-400 px-2 py-0.5 text-sm focus:outline-none w-40 mt-1"
                    placeholder="YYYY-MM-DD"
                  />
                </div>
                <div className="bg-[#999] text-white px-4 py-1 font-bold shrink-0">SOAP</div>
                <div className="p-2 flex-1 flex flex-col gap-4 min-h-full">
                  {formData.soapBlocks.map((block, idx) => (
                    <div key={idx} className="border-2 border-black relative bg-white shadow-sm shrink-0">
                      <div className="absolute -top-2 -right-2 flex gap-1 z-10">
                        <button 
                          onClick={() => duplicateSoapBlock(idx)}
                          className="bg-blue-500 text-white rounded-full p-1 hover:bg-blue-600 shadow-md"
                          title="복제"
                        >
                          <Copy size={14} />
                        </button>
                        <button 
                          onClick={() => removeSoapBlock(idx)}
                          className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md"
                          title="삭제"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <table className="w-full border-collapse">
                        <tbody>
                          {[
                            { id: 's', label: 'Subjective' },
                            { id: 'o', label: 'Objective' },
                            { id: 'a', label: 'Assessment' },
                            { id: 'p', label: 'Plan' }
                          ].map((row) => (
                            <tr key={row.id} className="border-b border-black last:border-0">
                              <td className="w-32 bg-[#C0C0C0] border-r-2 border-black p-2 text-center font-bold text-gray-700">
                                {row.label}
                              </td>
                              <td className="p-0">
                                <textarea 
                                  value={block[row.id as keyof SoapBlock]}
                                  onChange={(e) => updateSoapBlock(idx, row.id as keyof SoapBlock, e.target.value)}
                                  className="w-full h-16 p-2 resize-none focus:outline-none block"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                  <textarea 
                    value={formData.soapNote}
                    onChange={(e) => updateField('soapNote', e.target.value)}
                    placeholder="여기에 자유롭게 기록하세요..."
                    className="w-full flex-1 p-2 resize-none focus:outline-none block" 
                  />
                </div>
              </div>
              <div className="border-2 border-black flex flex-col h-[40%] overflow-y-auto">
                <div className="bg-[#999] text-white px-4 py-1 font-bold shrink-0">EXAM</div>
                <textarea 
                  value={formData.exam}
                  onChange={(e) => updateField('exam', e.target.value)}
                  className="w-full flex-1 p-2 resize-none focus:outline-none block min-h-[80px]" 
                />
              </div>
            </div>
            <div className="w-80 border-2 border-black p-4 flex flex-col gap-2">
              <div className="bg-[#999] text-white px-3 py-1 font-bold text-lg mb-2">환자기본정보</div>
              <InputField label="차트번호" value={formData.chartNo} onChange={(v) => updateField('chartNo', v)} />
              <InputField label="병실" value={formData.room} onChange={(v) => updateField('room', v)} />
              <InputField label="전문의" value={formData.doctor} onChange={(v) => updateField('doctor', v)} />
              <InputField label="성명" value={formData.name} onChange={(v) => updateField('name', v)} />
              <InputField label="나이" value={formData.age} onChange={(v) => updateField('age', v)} />
              <InputField label="거주지" value={formData.address} onChange={(v) => updateField('address', v)} />
              <InputField label="Dx" value={formData.dx} onChange={(v) => updateField('dx', v)} />
              <InputField label="C.C" value={formData.cc} onChange={(v) => updateField('cc', v)} />
              <InputField label="On Set" value={formData.onset} onChange={(v) => updateField('onset', v)} />
              <InputField label="혈액형" value={formData.bloodType} onChange={(v) => updateField('bloodType', v)} />
              <InputField label="진료과" value={formData.dept} onChange={(v) => updateField('dept', v)} />
              <div className="flex items-center gap-1 text-sm font-bold">
                <span className="w-20">생년월일</span>
                <select 
                  value={formData.dobYear} 
                  onChange={(e) => updateField('dobYear', e.target.value)}
                  className="border-2 border-black px-1"
                >
                  {Array.from({ length: 2101 - 1900 }, (_, i) => 1900 + i).map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select> <span>년</span>
                <select 
                  value={formData.dobMonth} 
                  onChange={(e) => updateField('dobMonth', e.target.value)}
                  className="border-2 border-black px-1"
                >
                  {Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0')).map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select> <span>월</span>
                <select 
                  value={formData.dobDay} 
                  onChange={(e) => updateField('dobDay', e.target.value)}
                  className="border-2 border-black px-1"
                >
                  {Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0')).map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select> <span>일</span>
              </div>
              <div className="flex items-center gap-4 text-sm font-bold mt-2">
                <span className="w-20">성별</span>
                <label className="flex items-center gap-1">
                  <input type="radio" name="gender" checked={formData.gender === 'M'} onChange={() => updateField('gender', 'M')} /> 남
                </label>
                <label className="flex items-center gap-1">
                  <input type="radio" name="gender" checked={formData.gender === 'F'} onChange={() => updateField('gender', 'F')} /> 여
                </label>
              </div>

              <div className="mt-4 border-t-2 border-black pt-4">
                <div className="bg-gray-700 text-white px-3 py-1 font-bold text-sm mb-2">경과기록</div>
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={addSoapBlock}
                    className="py-3 bg-gray-300 border-2 border-black font-bold text-lg hover:bg-gray-400 flex flex-col items-center"
                  >
                    <span>S, O, A, P 블록 추가</span>
                    <span className="text-[10px] font-normal">(표 형태 블록 생성)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'lab':
      case 'prescription':
      case 'outpatient':
        const isLab = activeTab === 'lab';
        const isPrescription = activeTab === 'prescription';
        const isOutpatient = activeTab === 'outpatient';

        return (
          <div className="flex-1 flex flex-col p-4 bg-white overflow-auto">
            <div className="grid grid-cols-4 gap-x-8 gap-y-1 mb-4 font-bold text-sm border-b-2 border-black pb-2">
              <EditableSummary label="성명" value={formData.name} onChange={(v) => updateField('name', v)} />
              <EditableSummary label="진료과" value={formData.dept} onChange={(v) => updateField('dept', v)} />
              <EditableSummary label="키" value={formData.height} onChange={(v) => updateField('height', v)} />
              <EditableSummary label="나이" value={formData.age} onChange={(v) => updateField('age', v)} />
              <EditableSummary label="차트번호" value={formData.chartNo} onChange={(v) => updateField('chartNo', v)} />
              <EditableSummary label="혈액형" value={formData.bloodType} onChange={(v) => updateField('bloodType', v)} />
              <EditableSummary label="체중" value={formData.weight} onChange={(v) => updateField('weight', v)} />
              <EditableSummary label="병실" value={formData.room} onChange={(v) => updateField('room', v)} />
            </div>

            {isLab && (
              <>
                <div className="border-2 border-black mb-4 overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-200 border-b-2 border-black">
                        {['검사일자', 'CBC', 'UA', '감염', 'LFT', 'PFT', 'TUMOR', 'ABGA', 'CRP', 'ESR', '특수혈액', '기타'].map(h => (
                          <th key={h} className="border-r-2 border-black p-1 text-xs">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {formData.labRows.map((row, i) => (
                        <tr key={i} className={`border-b border-black ${i % 3 === 0 ? 'bg-blue-50' : i % 3 === 1 ? 'bg-green-50' : 'bg-yellow-50'}`}>
                          {row.map((cell, j) => (
                            <td key={j} className="border-r-2 border-black p-0 h-8">
                              <input 
                                type="text" 
                                value={cell} 
                                onChange={(e) => updateLabCell(i, j, e.target.value)}
                                className="w-full h-full bg-transparent px-1 text-xs focus:outline-none"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="border-2 border-black mb-4">
                  <div className="border-b-2 border-black p-1 font-bold text-xl">Regimen</div>
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-400 border-b-2 border-black">
                        {['Cycle', 'Day', 'Drug', 'Does'].map(h => (
                          <th key={h} className="border-r-2 border-black p-1 w-1/4">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {formData.regimenRows.map((row, i) => (
                        <tr key={i} className="border-b border-black h-8">
                          {row.map((cell, j) => (
                            <td key={j} className={`border-r-2 border-black p-0 ${j === 1 ? 'bg-blue-50' : j === 2 ? 'bg-yellow-50' : j === 3 ? 'bg-green-50' : ''}`}>
                              <input 
                                type="text" 
                                value={cell} 
                                onChange={(e) => updateRegimenCell(i, j, e.target.value)}
                                className="w-full h-full bg-transparent px-1 focus:outline-none"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="border-2 border-black mb-4">
                  <div className="border-b-2 border-black p-1 font-bold text-xl flex justify-between items-center">
                    <span>영상검사 (Imaging Test)</span>
                    <label className="bg-blue-500 text-white px-3 py-1 rounded cursor-pointer hover:bg-blue-600 font-bold text-sm">
                      사진 업로드
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    </label>
                  </div>
                  <div className="p-2">
                    <textarea 
                      value={formData.imagingNote}
                      onChange={(e) => updateField('imagingNote', e.target.value)}
                      placeholder="영상검사 결과 및 판독 내용을 입력하세요..."
                      className="w-full h-24 p-2 border border-gray-300 focus:outline-none resize-none"
                    />
                  </div>
                  <div className="p-2 border-t border-gray-300">
                    <div className="flex flex-wrap gap-4">
                      {(formData.imagingPhotos || []).map((photo, idx) => (
                        <div key={idx} className="relative group">
                          <img 
                            src={photo} 
                            alt={`Imaging ${idx}`} 
                            className="w-32 h-32 object-cover border-2 border-black rounded shadow-sm cursor-zoom-in"
                            onClick={() => window.open(photo)}
                          />
                          <button 
                            onClick={() => removePhoto(idx)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                      {(formData.imagingPhotos || []).length === 0 && (
                        <div className="text-sm text-gray-400 py-4">등록된 사진이 없습니다.</div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {isPrescription && (
              <div className="flex flex-col flex-1">
                <div className="flex border-2 border-black border-b-0">
                  {PRESCRIPTION_SUB_TABS.map(t => (
                    <button 
                      key={t} 
                      onClick={() => setPrescriptionSubTab(t)}
                      className={`px-4 py-1 border-r-2 border-black font-bold transition-colors ${
                        prescriptionSubTab === t ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <div className="flex-1 border-2 border-black p-4">
                  <textarea 
                    value={formData.prescriptionNotes[prescriptionSubTab] || ''}
                    onChange={(e) => updatePrescriptionNote(prescriptionSubTab, e.target.value)}
                    className="w-full h-full resize-none focus:outline-none" 
                    placeholder={`${prescriptionSubTab} 내용을 입력하세요...`} 
                  />
                </div>
              </div>
            )}

            {isOutpatient && (
              <div className="flex flex-col flex-1">
                <div className="flex-1 flex border-2 border-black mt-4">
                  <div className="flex-1 border-r-2 border-black flex flex-col">
                    <div className="bg-[#1a3a5a] text-white font-bold p-1">전체 검사</div>
                    <div className="flex-1 p-2">
                      <textarea 
                        value={formData.outpatientExam}
                        onChange={(e) => updateField('outpatientExam', e.target.value)}
                        className="w-full h-full resize-none focus:outline-none" 
                      />
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="bg-[#1a3a5a] text-white font-bold p-1">외래노트</div>
                    <div className="flex-1 p-2">
                      <textarea 
                        value={formData.outpatientNote}
                        onChange={(e) => updateField('outpatientNote', e.target.value)}
                        className="w-full h-full resize-none focus:outline-none" 
                      />
                    </div>
                  </div>
                  <div className="w-32 border-l-2 border-black flex flex-col">
                    <div className="bg-[#1a3a5a] text-white font-bold p-1 text-center">V/S</div>
                    {formData.outpatientVS.map((vs, i) => (
                      <input 
                        key={i}
                        type="text"
                        value={vs}
                        onChange={(e) => updateOutpatientVS(i, e.target.value)}
                        className="border-b border-black h-10 px-2 focus:outline-none text-sm"
                        placeholder={`V/S ${i+1}`}
                      />
                    ))}
                    <div className="flex-1"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case 'er':
        return (
          <div className="flex-1 flex gap-4 p-4 bg-white overflow-hidden">
            <div className="w-80 flex flex-col gap-4">
              <div className="border-2 border-black flex flex-col">
                <div className="bg-[#5a9a9a] text-white font-bold p-2 text-lg">환자기본정보</div>
                <div className="p-4 flex flex-col gap-2">
                  <InputField label="성명" value={formData.name} onChange={(v) => updateField('name', v)} />
                  <InputField label="차트번호" value={formData.chartNo} onChange={(v) => updateField('chartNo', v)} />
                  <InputField label="진료과" value={formData.dept} onChange={(v) => updateField('dept', v)} />
                  <InputField label="혈액형" value={formData.bloodType} onChange={(v) => updateField('bloodType', v)} />
                  <InputField label="나이" value={formData.age} onChange={(v) => updateField('age', v)} />
                  <div className="flex items-center gap-4 text-sm font-bold">
                    <span className="w-20">성별</span>
                    <label className="flex items-center gap-1">
                      <input type="radio" name="er_gender" checked={formData.gender === 'M'} onChange={() => updateField('gender', 'M')} /> 남
                    </label>
                    <label className="flex items-center gap-1">
                      <input type="radio" name="er_gender" checked={formData.gender === 'F'} onChange={() => updateField('gender', 'F')} /> 여
                    </label>
                  </div>
                </div>

                {/* 응급실 기록 퀵 메뉴 */}
                <div className="mt-auto border-t-2 border-black p-4 bg-gray-200">
                  <div className="bg-gray-700 text-white px-3 py-1 font-bold text-sm mb-2">경과기록</div>
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={addSoapBlock}
                      className="py-3 bg-gray-300 border-2 border-black font-bold text-lg hover:bg-gray-400 flex flex-col items-center"
                    >
                      <span>S, O, A, P 블록 추가</span>
                      <span className="text-[10px] font-normal">(표 형태 블록 생성)</span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="border-2 border-black flex-1 flex flex-col">
                <div className="bg-[#5a9a9a] text-white font-bold p-2 text-center">V/S</div>
                <input 
                  type="text" 
                  value={formData.erVS} 
                  onChange={(e) => updateField('erVS', e.target.value)}
                  className="border-b border-black h-12 px-2 focus:outline-none"
                />
                <div className="bg-[#5a9a9a] text-white font-bold p-2 text-center">Mode of arrival</div>
                <input 
                  type="text" 
                  value={formData.erMode} 
                  onChange={(e) => updateField('erMode', e.target.value)}
                  className="border-b border-black h-12 px-2 focus:outline-none"
                />
                <div className="bg-[#5a9a9a] text-white font-bold p-2 text-center">ED arrival time</div>
                <input 
                  type="text" 
                  value={formData.erTime} 
                  onChange={(e) => updateField('erTime', e.target.value)}
                  className="h-12 px-2 focus:outline-none"
                />
                <div className="flex-1 bg-gray-50"></div>
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
              <div className="border-2 border-black flex flex-col min-h-[60%]">
                <div className="bg-[#999] text-white font-bold p-2 text-lg shrink-0">SOAP</div>
                <div className="p-2 flex-1 flex flex-col gap-4 min-h-full">
                  {formData.soapBlocks.map((block, idx) => (
                    <div key={idx} className="border-2 border-black relative bg-white shadow-sm shrink-0">
                      <div className="absolute -top-2 -right-2 flex gap-1 z-10">
                        <button 
                          onClick={() => duplicateSoapBlock(idx)}
                          className="bg-blue-500 text-white rounded-full p-1 hover:bg-blue-600 shadow-md"
                          title="복제"
                        >
                          <Copy size={14} />
                        </button>
                        <button 
                          onClick={() => removeSoapBlock(idx)}
                          className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md"
                          title="삭제"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <table className="w-full border-collapse">
                        <tbody>
                          {[
                            { id: 's', label: 'Subjective' },
                            { id: 'o', label: 'Objective' },
                            { id: 'a', label: 'Assessment' },
                            { id: 'p', label: 'Plan' }
                          ].map((row) => (
                            <tr key={row.id} className="border-b border-black last:border-0">
                              <td className="w-32 bg-[#C0C0C0] border-r-2 border-black p-2 text-center font-bold text-gray-700">
                                {row.label}
                              </td>
                              <td className="p-0">
                                <textarea 
                                  value={block[row.id as keyof SoapBlock]}
                                  onChange={(e) => updateSoapBlock(idx, row.id as keyof SoapBlock, e.target.value)}
                                  className="w-full h-16 p-2 resize-none focus:outline-none block"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                  <textarea 
                    value={formData.soapNote}
                    onChange={(e) => updateField('soapNote', e.target.value)}
                    placeholder="여기에 자유롭게 기록하세요..."
                    className="w-full flex-1 p-2 resize-none focus:outline-none block" 
                  />
                </div>
              </div>
              <div className="border-2 border-black flex flex-col min-h-[40%]">
                <div className="bg-[#999] text-white font-bold p-2 text-lg shrink-0">EXAM</div>
                <textarea 
                  value={formData.exam}
                  onChange={(e) => updateField('exam', e.target.value)}
                  className="w-full flex-1 p-2 resize-none focus:outline-none block min-h-[80px]" 
                />
              </div>
            </div>
            <div className="w-40 border-2 border-black flex flex-col">
              <div className="bg-[#5a9a9a] text-white font-bold p-2 text-center">LAB NOTE</div>
              <div className="flex-1 p-2">
                <textarea 
                  value={formData.erLabNote}
                  onChange={(e) => updateField('erLabNote', e.target.value)}
                  className="w-full h-full resize-none focus:outline-none" 
                />
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#D0D0D0] font-sans">
        <div className="w-96 bg-white border-4 border-black p-8 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
          <div className="text-2xl font-black mb-6 border-b-4 border-black pb-2">HAE-SOL EMR LOGIN</div>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block font-bold mb-1">ID</label>
              <input 
                type="text" 
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                className="w-full border-2 border-black p-2 focus:outline-none"
                placeholder=""
              />
            </div>
            <div>
              <label className="block font-bold mb-1">PASSWORD</label>
              <input 
                type="password" 
                value={loginPw}
                onChange={(e) => setLoginPw(e.target.value)}
                className="w-full border-2 border-black p-2 focus:outline-none"
                placeholder=""
              />
            </div>
            <button 
              type="submit"
              className="mt-4 bg-blue-500 text-white font-black py-3 border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all"
            >
              LOGIN
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen min-w-[1200px] bg-[#D0D0D0] font-sans overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-[#D0D0D0] border-b-2 border-gray-400 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-xs mr-2">
            {isOnline ? (
              <><Cloud size={14} className="text-emerald-500" /> <span className="text-emerald-600 font-bold">실시간 클라우드 연결됨</span></>
            ) : (
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-1">
                  <CloudOff size={14} className="text-red-500" /> 
                  <span className="text-red-600 font-bold">연결 오류: 파이어베이스 설정을 확인하세요.</span>
                </div>
                <span className="text-[10px] text-gray-500 ml-5">Netlify 도메인이 Firebase 승인 도메인에 등록되었는지 확인이 필요합니다.</span>
              </div>
            )}
          </div>
          <HeaderButton icon={Save} label="저장" onClick={handleSave} color="text-blue-600" />
          <HeaderButton icon={X} label="종료" color="text-red-600" onClick={() => {
            setSelectedPatientId(null);
            setFormData(INITIAL_FORM_DATA);
            setActiveTab('none');
          }} />
        </div>
        <div className="flex items-center gap-2">
          <TabButton label="입원기록" active={activeTab === 'admission'} onClick={() => setActiveTab('admission')} />
          <TabButton label="검사결과" active={activeTab === 'lab'} onClick={() => setActiveTab('lab')} />
          <TabButton label="처방기록" active={activeTab === 'prescription'} onClick={() => setActiveTab('prescription')} />
          <TabButton label="외래기록" active={activeTab === 'outpatient'} onClick={() => setActiveTab('outpatient')} />
          <TabButton label="응급실 차트" active={activeTab === 'er'} onClick={() => setActiveTab('er')} />
        </div>
        <div>
          <HeaderButton icon={Trash2} label="삭제" color="text-red-600" onClick={handleDelete} />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 bg-white border-r-2 border-black flex flex-col">
          <div className="bg-[#FF99FF] text-white p-2 flex items-center gap-2 font-bold border-b-2 border-black">
            <FileText size={20} />
            <span>환자리스트</span>
          </div>
          <div className="p-2 border-b-2 border-black">
            <div className="relative">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border-2 border-black pl-8 pr-2 py-1 text-sm focus:outline-none"
                placeholder="환자 검색..."
              />
              <Search className="absolute left-2 top-1.5 text-gray-500" size={16} />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredPatients.map(patient => (
              <button 
                key={patient.id}
                onClick={() => {
                  setSelectedPatientId(patient.id);
                  setActiveTab('admission');
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setContextMenu({
                    x: e.clientX,
                    y: e.clientY,
                    patientId: patient.id
                  });
                }}
                className={`w-full text-left p-3 border-b border-gray-200 hover:bg-gray-100 transition-colors ${
                  selectedPatientId === patient.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="font-bold text-sm">
                  {patient.name} / {patient.chartNo} / {patient.gender === 'M' ? '남' : '여'} / {patient.dept}
                </div>
              </button>
            ))}
            {filteredPatients.length === 0 && (
              <div className="p-4 text-center text-gray-500 text-sm">환자가 없습니다.</div>
            )}
          </div>
          <div className="p-2 border-t-2 border-black bg-gray-100">
            <button 
              onClick={() => {
                setSelectedPatientId(null);
                setFormData(INITIAL_FORM_DATA);
                setActiveTab('admission');
              }}
              className="w-full py-2 bg-blue-500 text-white font-bold rounded hover:bg-blue-600"
            >
              + 새 환자 추가
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-[#D0D0D0]">
          {renderContent()}
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div 
          className="fixed z-50 bg-white border-2 border-black shadow-lg py-1 w-48"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            className="w-full text-left px-4 py-2 hover:bg-gray-100 font-bold text-sm"
            onClick={() => {
              setSelectedPatientId(contextMenu.patientId);
              setActiveTab('admission');
            }}
          >
            S (Subjective) 추가
          </button>
          <button 
            className="w-full text-left px-4 py-2 hover:bg-gray-100 font-bold text-sm"
            onClick={() => {
              setSelectedPatientId(contextMenu.patientId);
              setActiveTab('admission');
            }}
          >
            O (Objective) 추가
          </button>
          <button 
            className="w-full text-left px-4 py-2 hover:bg-gray-100 font-bold text-sm"
            onClick={() => {
              setSelectedPatientId(contextMenu.patientId);
              setActiveTab('admission');
            }}
          >
            A (Assessment) 추가
          </button>
          <button 
            className="w-full text-left px-4 py-2 hover:bg-gray-100 font-bold text-sm"
            onClick={() => {
              setSelectedPatientId(contextMenu.patientId);
              setActiveTab('admission');
            }}
          >
            P (Plan) 추가
          </button>
        </div>
      )}

      {/* 저장 성공 알림 토스트 제거됨 */}
    </div>
  );
}
