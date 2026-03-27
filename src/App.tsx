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
  Copy,
  Printer,
  Plus,
  Settings,
  LogOut,
  ChevronDown,
  Edit
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

type TabType = 'admission' | 'surgery' | 'consult' | 'discharge' | 'lab' | 'other_record' | 'other_hospital' | 'prescription' | 'er' | 'nursing' | 'none';
type NursingSubTab = '간호기록' | '투약기록' | '처치기록' | '기록작성' | '간호계획' | '특수기록';

interface SoapBlock {
  s: string;
  o: string;
  a: string;
  p: string;
}

interface NursingRecord {
  occurTime: string;
  occurPlace: string;
  eventType: string;
  action: string;
  reporter: string;
  patientChange: string;
  detail: string;
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
  hr: string;
  rr: string;
  bpSys: string;
  bpDia: string;
  bt: string;
  // Additional fields for records
  admissionDate: string;
  soapNote: string;
  soapBlocks: SoapBlock[];
  exam: string;
  labRows: string[][];
  regimenRows: string[][];
  erVS: string;
  erMode: string;
  erTime: string;
  erLabNote: string;
  erSoapNote: string;
  erSoapBlocks: SoapBlock[];
  erExam: string;
  erAssessment: string;
  imagingNote: string;
  imagingPhotos: string[];
  diagnosticNote: string;
  diagnosticPhotos: string[];
  prescriptionNotes: Record<string, string>;
  surgeryNote: string;
  surgeryAttending: string;
  surgeryAnesthesia: string;
  surgeryAssistant: string;
  surgeryName: string;
  surgeryVital: string;
  surgeryLabNote: string;
  surgeryType: string;
  surgerySoap: string;
  surgeryExam: string;
  consultNote: string;
  consultDept: string;
  consultProfessor: string;
  consultReason: string;
  consultSoap: string;
  consultExam: string;
  consultOtherNote: string;
  dischargeNote: string;
  dischargeReason: string;
  dischargeDiagnosis: string;
  dischargeExam: string;
  dischargeProgress: string;
  dischargeSurgeryStatus: string;
  dischargeStatus: string;
  dischargePlan: string;
  otherRecordNote: string;
  otherGuardian: string;
  otherReason: string;
  otherSpecial: string;
  otherExtraNote: string;
  otherHospitalNote: string;
  surgerySoapBlocks: SoapBlock[];
  consultSoapBlocks: SoapBlock[];
  dischargeSoapBlocks: SoapBlock[];
  otherRecordSoapBlocks: SoapBlock[];
  nursingCategory: string;
  nursingRecords: Record<string, NursingRecord>;
  // New Nursing Fields
  nursingSubTab: NursingSubTab;
  nursingNote: string;
  nursingSoapBlocks: SoapBlock[];
  nursingExam: string;
  medicationData: {
    time: string;
    date: string;
    drug: string;
    dose: string;
    route: string;
    prescriber: string;
    status: string;
    statusChecked: boolean;
    note: string;
  };
  medicationRows: string[][];
  treatmentData: Record<string, { date: string, time: string, status: string, note: string }>;
  nursingPlan: { diagnosis: string, plan: string, evaluation: string };
  specialRecord: { before: string, after: string };
}

const PRESCRIPTION_SUB_TABS = ['검사 처방', '영상 검사', '약물 지시', '처치/시술', '진료 지시', '컨설트', '항암 처방', '기타'];

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
  hr: '',
  rr: '',
  bpSys: '',
  bpDia: '',
  bt: '',
  admissionDate: '',
  soapNote: '',
  soapBlocks: [],
  exam: '',
  labRows: Array(10).fill(0).map(() => Array(12).fill('')),
  regimenRows: Array(4).fill(0).map(() => Array(4).fill('')),
  erVS: '',
  erMode: '',
  erTime: '',
  erLabNote: '',
  erSoapNote: '',
  erSoapBlocks: [],
  erExam: '',
  erAssessment: '',
  imagingNote: '',
  imagingPhotos: [],
  diagnosticNote: '',
  diagnosticPhotos: [],
  prescriptionNotes: PRESCRIPTION_SUB_TABS.reduce((acc, tab) => ({ ...acc, [tab]: '' }), {}),
  surgeryNote: '',
  surgeryAttending: '',
  surgeryAnesthesia: '',
  surgeryAssistant: '',
  surgeryName: '',
  surgeryVital: '',
  surgeryLabNote: '',
  surgeryType: '',
  surgerySoap: '',
  surgeryExam: '',
  consultNote: '',
  consultDept: '',
  consultProfessor: '',
  consultReason: '',
  consultSoap: '',
  consultExam: '',
  consultOtherNote: '',
  dischargeNote: '',
  dischargeReason: '',
  dischargeDiagnosis: '',
  dischargeExam: '',
  dischargeProgress: '',
  dischargeSurgeryStatus: '',
  dischargeStatus: '',
  dischargePlan: '',
  otherRecordNote: '',
  otherGuardian: '',
  otherReason: '',
  otherSpecial: '',
  otherExtraNote: '',
  otherHospitalNote: '',
  surgerySoapBlocks: [],
  consultSoapBlocks: [],
  dischargeSoapBlocks: [],
  otherRecordSoapBlocks: [],
  nursingCategory: '낙상기록지',
  nursingRecords: {},
  nursingSubTab: '간호기록',
  nursingNote: '',
  nursingSoapBlocks: [],
  nursingExam: '',
  medicationData: {
    time: '',
    date: '',
    drug: '',
    dose: '',
    route: '',
    prescriber: '',
    status: '',
    statusChecked: false,
    note: ''
  },
  medicationRows: Array(1).fill(0).map(() => Array(8).fill('')),
  treatmentData: {
    '드레싱': { date: '', time: '', status: '', note: '' },
    '카테터': { date: '', time: '', status: '', note: '' },
    '산소치료': { date: '', time: '', status: '', note: '' },
    '검사': { date: '', time: '', status: '', note: '' },
  },
  nursingPlan: { diagnosis: '', plan: '', evaluation: '' },
  specialRecord: { before: '', after: '' },
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

const THEME_COLORS = [
  { name: 'Pink', color: '#FF99FF', shadow: '#CC77CC', inactive: '#FFCCFF', bg: '#D0D0D0' },
  { name: 'Cyan', color: '#00D1D1', shadow: '#00A8A8', inactive: '#B2EFEF', bg: '#B2EFEF' },
  { name: 'Navy', color: '#000080', shadow: '#000066', inactive: '#B0B0C0', bg: '#B0B0C0' },
  { name: 'Green', color: '#2D8A57', shadow: '#236D45', inactive: '#C1DBCB', bg: '#C1DBCB' },
  { name: 'Gray', color: '#999999', shadow: '#666666', inactive: '#D0D0D0', bg: '#D0D0D0' },
];

// --- Components ---

const HeaderButton = ({ icon: Icon, label, onClick, color = "text-black", disabled = false, bgColor, borderColor = "border-gray-400" }: { icon?: any, label: string, onClick?: () => void, color?: string, disabled?: boolean, bgColor?: string, borderColor?: string }) => {
  const isHexBg = bgColor?.startsWith('#');
  const isHexBorder = borderColor?.startsWith('#');
  
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      style={{ 
        backgroundColor: isHexBg ? bgColor : undefined,
        borderColor: isHexBorder ? borderColor : undefined
      }}
      className={`flex items-center gap-1 px-2.5 py-1 hover:opacity-80 transition-opacity ${color} font-bold text-[13px] border ${!isHexBorder ? borderColor : ''} rounded shadow-sm ${!isHexBg ? (bgColor || 'bg-transparent') : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {Icon && <Icon size={15} strokeWidth={2.5} />}
      <span>{label}</span>
    </button>
  );
};

const TabButton: React.FC<{ label: string, count: number, active: boolean, onClick: () => void, theme: any }> = ({ label, count, active, onClick, theme }) => (
  <div className="relative flex flex-col items-center">
    <button 
      onClick={onClick}
      className={`px-3 py-2 rounded-md font-bold text-[14px] border transition-all min-w-[100px] ${
        active 
          ? 'text-white border-gray-600 shadow-inner' 
          : 'bg-[#E0E0E0] border-gray-400 text-gray-700 hover:bg-gray-200'
      }`}
      style={{ backgroundColor: active ? theme.color : undefined }}
    >
      {label}({count})
    </button>
    {active && (
      <div 
        className="absolute -bottom-1 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] z-10" 
        style={{ borderTopColor: theme.color }}
      ></div>
    )}
  </div>
);

const InputField = ({ label, value, onChange, readOnly = false, labelWidth = "w-20" }: { label: string, value?: string | number, onChange?: (val: string) => void, readOnly?: boolean, labelWidth?: string }) => (
  <div className="flex items-center gap-2 mb-1">
    <span className={`${labelWidth} font-bold text-sm text-gray-700 shrink-0`}>{label}</span>
    <input 
      type="text" 
      value={value || ''} 
      onChange={(e) => onChange?.(e.target.value)}
      readOnly={readOnly}
      spellCheck="false"
      className="flex-1 border-2 border-black px-2 py-0.5 text-sm focus:outline-none"
    />
  </div>
);

const AutoHeightTextarea = ({ value, onChange, placeholder, className, minHeight = '64px' }: any) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(textareaRef.current.scrollHeight, parseInt(minHeight))}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      spellCheck="false"
      className={`${className} overflow-hidden resize-none`}
      style={{ minHeight }}
    />
  );
};

const EditableSummary = ({ label, value, onChange }: { label: string, value: string, onChange: (val: string) => void }) => (
  <div className="flex items-center gap-1">
    <span>{label}:</span>
    <input 
      type="text" 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      spellCheck="false"
      className="border-b border-black focus:outline-none bg-transparent px-1 min-w-[50px]"
    />
  </div>
);

// --- Main App ---

export default function App() {
  const [activeTopMenu, setActiveTopMenu] = useState<string>('E.M.R');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginId, setLoginId] = useState('');
  const [loginPw, setLoginPw] = useState('');
  const [autoLogin, setAutoLogin] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(THEME_COLORS[2]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('none');
  const [prescriptionSubTab, setPrescriptionSubTab] = useState<string>(PRESCRIPTION_SUB_TABS[0]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState<Patient>(INITIAL_FORM_DATA);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, patientId: string } | null>(null);
  const [showPrintMenu, setShowPrintMenu] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [printType, setPrintType] = useState<TabType | null>(null);
  const lastSyncedIdRef = useRef<string | null>(null);

  const [showAssessmentTool, setShowAssessmentTool] = useState(false);
  const [assessmentTab, setAssessmentTab] = useState<'NRS' | 'FLACC'>('NRS');
  const [nrsScore, setNrsScore] = useState<number | null>(null);
  const [flaccScores, setFlaccScores] = useState<Record<string, number>>({
    face: 0,
    legs: 0,
    activity: 0,
    cry: 0,
    consolability: 0
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = ACCOUNTS[loginId];
    if (user && user.pw === loginPw) {
      setIsLoggedIn(true);
      if (autoLogin) {
        localStorage.setItem('autoLoginUser', JSON.stringify({ id: loginId, pw: loginPw }));
      } else {
        localStorage.removeItem('autoLoginUser');
      }
    } else {
      alert('아이디 또는 비밀번호가 틀렸습니다.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoginId('');
    setLoginPw('');
    setShowUserMenu(false);
    localStorage.removeItem('autoLoginUser');
  };

  // Auto-login check
  useEffect(() => {
    const savedTheme = localStorage.getItem('themeName');
    if (savedTheme) {
      const theme = THEME_COLORS.find(t => t.name === savedTheme);
      if (theme) setCurrentTheme(theme);
    }

    const savedUser = localStorage.getItem('autoLoginUser');
    if (savedUser) {
      try {
        const { id, pw } = JSON.parse(savedUser);
        const user = ACCOUNTS[id];
        if (user && user.pw === pw) {
          setLoginId(id);
          setLoginPw(pw);
          setIsLoggedIn(true);
        }
      } catch (e) {
        console.error("Auto-login error:", e);
      }
    }
  }, []);

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
          diagnosticPhotos: typeof data.diagnosticPhotos === 'string' ? JSON.parse(data.diagnosticPhotos) : (data.diagnosticPhotos || []),
          soapNote: data.soapNote ?? data.soap ?? '',
          soapBlocks: typeof data.soapBlocks === 'string' ? JSON.parse(data.soapBlocks) : (data.soapBlocks || []),
          exam: data.exam ?? '',
          erSoapNote: data.erSoapNote ?? '',
          erSoapBlocks: typeof data.erSoapBlocks === 'string' ? JSON.parse(data.erSoapBlocks) : (data.erSoapBlocks || []),
          erExam: data.erExam ?? '',
          surgerySoapBlocks: typeof data.surgerySoapBlocks === 'string' ? JSON.parse(data.surgerySoapBlocks) : (data.surgerySoapBlocks || []),
          consultSoapBlocks: typeof data.consultSoapBlocks === 'string' ? JSON.parse(data.consultSoapBlocks) : (data.consultSoapBlocks || []),
          dischargeSoapBlocks: typeof data.dischargeSoapBlocks === 'string' ? JSON.parse(data.dischargeSoapBlocks) : (data.dischargeSoapBlocks || []),
          otherRecordSoapBlocks: typeof data.otherRecordSoapBlocks === 'string' ? JSON.parse(data.otherRecordSoapBlocks) : (data.otherRecordSoapBlocks || []),
          nursingCategory: data.nursingCategory ?? '낙상기록지',
          nursingRecords: typeof data.nursingRecords === 'string' ? JSON.parse(data.nursingRecords) : (data.nursingRecords || {}),
          nursingSubTab: data.nursingSubTab ?? '간호기록',
          nursingNote: data.nursingNote ?? '',
          nursingSoapBlocks: typeof data.nursingSoapBlocks === 'string' ? JSON.parse(data.nursingSoapBlocks) : (data.nursingSoapBlocks || []),
          nursingExam: data.nursingExam ?? '',
          medicationRows: typeof data.medicationRows === 'string' ? JSON.parse(data.medicationRows) : (data.medicationRows || Array(1).fill(0).map(() => Array(8).fill(''))),
          treatmentData: typeof data.treatmentData === 'string' ? JSON.parse(data.treatmentData) : (data.treatmentData || {
            '드레싱': { date: '', time: '', status: '', note: '' },
            '카테터': { date: '', time: '', status: '', note: '' },
            '산소치료': { date: '', time: '', status: '', note: '' },
            '검사': { date: '', time: '', status: '', note: '' },
          }),
          nursingPlan: typeof data.nursingPlan === 'string' ? JSON.parse(data.nursingPlan) : (data.nursingPlan || { diagnosis: '', plan: '', evaluation: '' }),
          specialRecord: typeof data.specialRecord === 'string' ? JSON.parse(data.specialRecord) : (data.specialRecord || { before: '', after: '' }),
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
    const handleClick = () => {
      setContextMenu(null);
      setShowUserMenu(false);
    };
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
    if (isSaving) return; // Don't sync while saving to prevent race conditions

    if (selectedPatientId) {
      const p = patients.find(p => p.id === selectedPatientId);
      // Only sync from patients if the ID has changed or if we haven't synced this ID yet
      if (p && lastSyncedIdRef.current !== selectedPatientId) {
        setFormData({ ...p });
        lastSyncedIdRef.current = selectedPatientId;
      }
    } else {
      // Only reset if we were previously on a patient
      if (lastSyncedIdRef.current !== null) {
        setFormData(INITIAL_FORM_DATA);
        lastSyncedIdRef.current = null;
      }
    }
  }, [selectedPatientId, patients, isSaving]);

  const tabCounts = useMemo(() => {
    if (selectedPatientId) {
      const p = patients.find(p => p.id === selectedPatientId);
      if (!p) return { er: 0, admission: 0, surgery: 0, consult: 0, discharge: 0, lab: 0, other_record: 0, other_hospital: 0, prescription: 0 };
      return {
        er: p.erVS || p.erMode || p.erTime || p.erSoapBlocks.length > 0 || p.erSoapNote || p.erExam ? 1 : 0,
        admission: p.soapBlocks.length > 0 || p.soapNote || p.exam ? 1 : 0,
        surgery: p.surgeryNote || p.surgeryAttending || p.surgeryName || p.surgerySoapBlocks.length > 0 ? 1 : 0,
        consult: p.consultNote || p.consultReason || p.consultSoapBlocks.length > 0 ? 1 : 0,
        discharge: p.dischargeNote || p.dischargeReason || p.dischargeSoapBlocks.length > 0 ? 1 : 0,
        lab: p.labRows.some(r => r.some(c => c !== '')) ? 1 : 0,
        other_record: p.otherRecordNote || p.otherReason || p.otherRecordSoapBlocks.length > 0 ? 1 : 0,
        other_hospital: p.otherHospitalNote ? 1 : 0,
        prescription: Object.values(p.prescriptionNotes).some(v => v !== '') ? 1 : 0,
        nursing: (p.nursingNote || p.nursingSoapBlocks.length > 0 || p.nursingExam || p.medicationRows.some(r => r.some(c => c !== '')) || Object.values(p.nursingRecords).length > 0) ? 1 : 0
      };
    } else {
      return patients.reduce((acc, p) => ({
        er: acc.er + (p.erVS || p.erMode || p.erTime || p.erSoapBlocks.length > 0 || p.erSoapNote || p.erExam ? 1 : 0),
        admission: acc.admission + (p.soapBlocks.length > 0 || p.soapNote || p.exam ? 1 : 0),
        surgery: acc.surgery + (p.surgeryNote || p.surgeryAttending || p.surgeryName || p.surgerySoapBlocks.length > 0 ? 1 : 0),
        consult: acc.consult + (p.consultNote || p.consultReason || p.consultSoapBlocks.length > 0 ? 1 : 0),
        discharge: acc.discharge + (p.dischargeNote || p.dischargeReason || p.dischargeSoapBlocks.length > 0 ? 1 : 0),
        lab: acc.lab + (p.labRows.some(r => r.some(c => c !== '')) ? 1 : 0),
        other_record: acc.other_record + (p.otherRecordNote || p.otherReason || p.otherRecordSoapBlocks.length > 0 ? 1 : 0),
        other_hospital: acc.other_hospital + (p.otherHospitalNote ? 1 : 0),
        prescription: acc.prescription + (Object.values(p.prescriptionNotes).some(v => v !== '') ? 1 : 0),
        nursing: acc.nursing + ((p.nursingNote || p.nursingSoapBlocks.length > 0 || p.nursingExam || p.medicationRows.some(r => r.some(c => c !== '')) || Object.values(p.nursingRecords).length > 0) ? 1 : 0)
      }), { er: 0, admission: 0, surgery: 0, consult: 0, discharge: 0, lab: 0, other_record: 0, other_hospital: 0, prescription: 0, nursing: 0 });
    }
  }, [selectedPatientId, patients]);

  const filteredPatients = useMemo(() => 
    patients.filter(p => 
      p.name.includes(searchQuery) || p.chartNo.includes(searchQuery)
    ), 
    [searchQuery, patients]
  );

  const handleSave = async () => {
    if (isSaving) return;
    if (!formData.name && !formData.chartNo) {
      return;
    }

    try {
      setIsSaving(true);
      const id = selectedPatientId || Date.now().toString();
      
      // Append timestamp to record fields in Korean time
      const now = new Date();
      const userName = ACCOUNTS[loginId]?.name || loginId;
      const timestamp = `\n[저장됨: ${now.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })} / ${userName}]`;
      
      const appendTimestamp = (text: string) => {
        if (!text) return "";
        // Match timestamp at start of string or after a newline
        const cleaned = text.replace(/(?:\n|^)\[저장됨: .*\]/g, "").trim();
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
        diagnosticPhotos: JSON.stringify(formData.diagnosticPhotos || []),
        soapNote: appendTimestamp(formData.soapNote),
        soapBlocks: JSON.stringify(formData.soapBlocks),
        exam: appendTimestamp(formData.exam),
        erLabNote: appendTimestamp(formData.erLabNote),
        erSoapNote: appendTimestamp(formData.erSoapNote),
        erSoapBlocks: JSON.stringify(formData.erSoapBlocks),
        erExam: appendTimestamp(formData.erExam),
        imagingNote: appendTimestamp(formData.imagingNote),
        diagnosticNote: appendTimestamp(formData.diagnosticNote),
        prescriptionNotes: newPrescriptionNotes,
        surgerySoapBlocks: JSON.stringify(formData.surgerySoapBlocks),
        consultSoapBlocks: JSON.stringify(formData.consultSoapBlocks),
        dischargeSoapBlocks: JSON.stringify(formData.dischargeSoapBlocks),
        otherRecordSoapBlocks: JSON.stringify(formData.otherRecordSoapBlocks),
        nursingRecords: JSON.stringify(formData.nursingRecords || {}),
        nursingSoapBlocks: JSON.stringify(formData.nursingSoapBlocks || []),
        medicationRows: JSON.stringify(formData.medicationRows || []),
        treatmentData: JSON.stringify(formData.treatmentData || {}),
        nursingPlan: JSON.stringify(formData.nursingPlan || {}),
        specialRecord: JSON.stringify(formData.specialRecord || {}),
        nursingNote: appendTimestamp(formData.nursingNote),
        nursingExam: appendTimestamp(formData.nursingExam),
      };
      
      // Update local state immediately to prevent sync issues and provide instant feedback
      const updatedFormData = {
        ...formData,
        id,
        soapNote: patientData.soapNote,
        exam: patientData.exam,
        erLabNote: patientData.erLabNote,
        erSoapNote: patientData.erSoapNote,
        erExam: patientData.erExam,
        imagingNote: patientData.imagingNote,
        diagnosticNote: patientData.diagnosticNote,
        nursingNote: patientData.nursingNote,
        nursingExam: patientData.nursingExam,
        prescriptionNotes: newPrescriptionNotes,
        soapBlocks: [...formData.soapBlocks], // Ensure fresh copy
        surgerySoapBlocks: [...formData.surgerySoapBlocks],
        consultSoapBlocks: [...formData.consultSoapBlocks],
        dischargeSoapBlocks: [...formData.dischargeSoapBlocks],
        otherRecordSoapBlocks: [...formData.otherRecordSoapBlocks],
        nursingRecords: { ...formData.nursingRecords },
        nursingSoapBlocks: [...formData.nursingSoapBlocks],
        medicationRows: [...formData.medicationRows],
        treatmentData: { ...formData.treatmentData },
        nursingPlan: { ...formData.nursingPlan },
        specialRecord: { ...formData.specialRecord }
      };
      
      setFormData(updatedFormData);
      setSelectedPatientId(id);
      lastSyncedIdRef.current = id;
      localStorage.setItem('lastSelectedId', id);

      await setDoc(doc(db, "patients", id), patientData);
      
      alert("저장되었습니다.");
    } catch (e: any) {
      console.error("Save error:", e);
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleNewPatient = () => {
    setFormData(INITIAL_FORM_DATA);
    setSelectedPatientId(null);
    lastSyncedIdRef.current = null;
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

  const addRegimenRow = () => {
    const newRows = [...formData.regimenRows, ['', '', '', '']];
    updateField('regimenRows', newRows);
  };

  const updatePrescriptionNote = (tab: string, value: string) => {
    const newNotes = { ...formData.prescriptionNotes, [tab]: value };
    updateField('prescriptionNotes', newNotes);
  };

  const addSoapBlock = () => {
    const field = 
      activeTab === 'er' ? 'erSoapBlocks' : 
      activeTab === 'surgery' ? 'surgerySoapBlocks' :
      activeTab === 'consult' ? 'consultSoapBlocks' :
      activeTab === 'discharge' ? 'dischargeSoapBlocks' :
      activeTab === 'other_record' ? 'otherRecordSoapBlocks' :
      activeTab === 'nursing' ? 'nursingSoapBlocks' :
      'soapBlocks';
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] as SoapBlock[]), { s: '', o: '', a: '', p: '' }]
    }));
  };

  const updateSoapBlock = (index: number, field: keyof SoapBlock, value: string) => {
    const blockField = 
      activeTab === 'er' ? 'erSoapBlocks' : 
      activeTab === 'surgery' ? 'surgerySoapBlocks' :
      activeTab === 'consult' ? 'consultSoapBlocks' :
      activeTab === 'discharge' ? 'dischargeSoapBlocks' :
      activeTab === 'other_record' ? 'otherRecordSoapBlocks' :
      activeTab === 'nursing' ? 'nursingSoapBlocks' :
      'soapBlocks';
    setFormData(prev => {
      const newBlocks = [...(prev[blockField] as SoapBlock[])];
      newBlocks[index] = { ...newBlocks[index], [field]: value };
      return { ...prev, [blockField]: newBlocks };
    });
  };

  const removeSoapBlock = (index: number) => {
    const blockField = 
      activeTab === 'er' ? 'erSoapBlocks' : 
      activeTab === 'surgery' ? 'surgerySoapBlocks' :
      activeTab === 'consult' ? 'consultSoapBlocks' :
      activeTab === 'discharge' ? 'dischargeSoapBlocks' :
      activeTab === 'other_record' ? 'otherRecordSoapBlocks' :
      activeTab === 'nursing' ? 'nursingSoapBlocks' :
      'soapBlocks';
    setFormData(prev => {
      const newBlocks = [...(prev[blockField] as SoapBlock[])];
      newBlocks.splice(index, 1);
      return { ...prev, [blockField]: newBlocks };
    });
  };

  const duplicateSoapBlock = (index: number) => {
    const blockField = 
      activeTab === 'er' ? 'erSoapBlocks' : 
      activeTab === 'surgery' ? 'surgerySoapBlocks' :
      activeTab === 'consult' ? 'consultSoapBlocks' :
      activeTab === 'discharge' ? 'dischargeSoapBlocks' :
      activeTab === 'other_record' ? 'otherRecordSoapBlocks' :
      activeTab === 'nursing' ? 'nursingSoapBlocks' :
      'soapBlocks';
    setFormData(prev => {
      const newBlocks = [...(prev[blockField] as SoapBlock[])];
      newBlocks.splice(index + 1, 0, { ...newBlocks[index] });
      return { ...prev, [blockField]: newBlocks };
    });
  };

  const handlePrint = (type: TabType) => {
    setPrintType(type);
    setShowPrintMenu(false);
    setTimeout(() => {
      window.print();
      setPrintType(null);
    }, 500);
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

  const handleDiagnosticPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024) {
      alert('파일 크기가 너무 큽니다. 500KB 이하의 이미지를 사용해주세요.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const newPhotos = [...(formData.diagnosticPhotos || []), base64String];
      updateField('diagnosticPhotos', newPhotos);
    };
    reader.readAsDataURL(file);
  };

  const removeDiagnosticPhoto = (index: number) => {
    const newPhotos = [...(formData.diagnosticPhotos || [])];
    newPhotos.splice(index, 1);
    updateField('diagnosticPhotos', newPhotos);
  };

  const renderContent = () => {
    if (activeTab === 'none') {
      return (
        <div className="flex-1 flex items-center justify-center bg-white">
        </div>
      );
    }

    switch (activeTab) {
      case 'admission':
      case 'surgery':
      case 'consult':
      case 'discharge':
      case 'other_record':
      case 'other_hospital':
        const isAdmission = activeTab === 'admission';
        const isSurgery = activeTab === 'surgery';
        const isConsult = activeTab === 'consult';
        const isDischarge = activeTab === 'discharge';
        const isOtherRecord = activeTab === 'other_record';
        const isOtherHospital = activeTab === 'other_hospital';

        const noteField = 
          isSurgery ? 'surgeryNote' :
          isConsult ? 'consultNote' :
          isDischarge ? 'dischargeNote' :
          isOtherRecord ? 'otherRecordNote' :
          isOtherHospital ? 'otherHospitalNote' :
          'soapNote';

        const currentSoapBlocks = 
          isSurgery ? formData.surgerySoapBlocks :
          isConsult ? formData.consultSoapBlocks :
          isDischarge ? formData.dischargeSoapBlocks :
          isOtherRecord ? formData.otherRecordSoapBlocks :
          isAdmission ? formData.soapBlocks :
          [];

        return (
          <div className="flex-1 flex gap-4 p-4 bg-white overflow-hidden">
            <div className="flex-1 flex flex-col gap-4 overflow-hidden">
              {isAdmission && (
                <div className="border-2 border-black py-1 px-2 bg-gray-100 flex items-center gap-4 shrink-0">
                  <span className="font-bold">입원일</span>
                  <input 
                    type="text" 
                    value={formData.admissionDate}
                    onChange={(e) => updateField('admissionDate', e.target.value)}
                    spellCheck="false"
                    className="border-2 border-black px-2 py-1 text-sm focus:outline-none w-32"
                    placeholder="YYYY-MM-DD"
                  />
                </div>
              )}

              {isSurgery && (
                <div className="border-2 border-black p-2 bg-gray-100 grid grid-cols-2 gap-x-4 gap-y-2 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="w-20 font-bold text-sm">수술명</span>
                    <input type="text" value={formData.surgeryName} onChange={(e) => updateField('surgeryName', e.target.value)} className="flex-1 border-2 border-black px-2 py-1 text-sm focus:outline-none" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-20 font-bold text-sm">집도의</span>
                    <input type="text" value={formData.surgeryAttending} onChange={(e) => updateField('surgeryAttending', e.target.value)} className="flex-1 border-2 border-black px-2 py-1 text-sm focus:outline-none" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-20 font-bold text-sm">마취방법</span>
                    <input type="text" value={formData.surgeryAnesthesia} onChange={(e) => updateField('surgeryAnesthesia', e.target.value)} className="flex-1 border-2 border-black px-2 py-1 text-sm focus:outline-none" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-20 font-bold text-sm">어시스트</span>
                    <input type="text" value={formData.surgeryAssistant} onChange={(e) => updateField('surgeryAssistant', e.target.value)} className="flex-1 border-2 border-black px-2 py-1 text-sm focus:outline-none" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-20 font-bold text-sm">수술구분</span>
                    <input type="text" value={formData.surgeryType} onChange={(e) => updateField('surgeryType', e.target.value)} className="flex-1 border-2 border-black px-2 py-1 text-sm focus:outline-none" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-20 font-bold text-sm">V/S</span>
                    <input type="text" value={formData.surgeryVital} onChange={(e) => updateField('surgeryVital', e.target.value)} className="flex-1 border-2 border-black px-2 py-1 text-sm focus:outline-none" />
                  </div>
                  <div className="flex items-center gap-2 col-span-2">
                    <span className="w-20 font-bold text-sm">Lab Note</span>
                    <input type="text" value={formData.surgeryLabNote} onChange={(e) => updateField('surgeryLabNote', e.target.value)} className="flex-1 border-2 border-black px-2 py-1 text-sm focus:outline-none" />
                  </div>
                </div>
              )}

              {isConsult && (
                <div className="border-2 border-black p-2 bg-gray-100 grid grid-cols-2 gap-x-4 gap-y-2 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="w-20 font-bold text-sm">협진과</span>
                    <input type="text" value={formData.consultDept} onChange={(e) => updateField('consultDept', e.target.value)} className="flex-1 border-2 border-black px-2 py-1 text-sm focus:outline-none" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-20 font-bold text-sm">협진교수</span>
                    <input type="text" value={formData.consultProfessor} onChange={(e) => updateField('consultProfessor', e.target.value)} className="flex-1 border-2 border-black px-2 py-1 text-sm focus:outline-none" />
                  </div>
                  <div className="flex items-center gap-2 col-span-2">
                    <span className="w-20 font-bold text-sm">의뢰사유</span>
                    <input type="text" value={formData.consultReason} onChange={(e) => updateField('consultReason', e.target.value)} className="flex-1 border-2 border-black px-2 py-1 text-sm focus:outline-none" />
                  </div>
                  <div className="flex items-center gap-2 col-span-2">
                    <span className="w-20 font-bold text-sm">기타사항</span>
                    <input type="text" value={formData.consultOtherNote} onChange={(e) => updateField('consultOtherNote', e.target.value)} className="flex-1 border-2 border-black px-2 py-1 text-sm focus:outline-none" />
                  </div>
                </div>
              )}

              {isDischarge && (
                <div className="border-2 border-black p-2 bg-gray-100 grid grid-cols-2 gap-x-4 gap-y-2 shrink-0">
                  <div className="flex items-center gap-2 col-span-2">
                    <span className="w-20 font-bold text-sm">퇴원사유</span>
                    <input type="text" value={formData.dischargeReason} onChange={(e) => updateField('dischargeReason', e.target.value)} className="flex-1 border-2 border-black px-2 py-1 text-sm focus:outline-none" />
                  </div>
                  <div className="flex items-center gap-2 col-span-2">
                    <span className="w-20 font-bold text-sm">최종진단</span>
                    <input type="text" value={formData.dischargeDiagnosis} onChange={(e) => updateField('dischargeDiagnosis', e.target.value)} className="flex-1 border-2 border-black px-2 py-1 text-sm focus:outline-none" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-20 font-bold text-sm">수술여부</span>
                    <input type="text" value={formData.dischargeSurgeryStatus} onChange={(e) => updateField('dischargeSurgeryStatus', e.target.value)} className="flex-1 border-2 border-black px-2 py-1 text-sm focus:outline-none" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-20 font-bold text-sm">퇴원상태</span>
                    <input type="text" value={formData.dischargeStatus} onChange={(e) => updateField('dischargeStatus', e.target.value)} className="flex-1 border-2 border-black px-2 py-1 text-sm focus:outline-none" />
                  </div>
                  <div className="flex items-center gap-2 col-span-2">
                    <span className="w-20 font-bold text-sm">경과요약</span>
                    <input type="text" value={formData.dischargeProgress} onChange={(e) => updateField('dischargeProgress', e.target.value)} className="flex-1 border-2 border-black px-2 py-1 text-sm focus:outline-none" />
                  </div>
                  <div className="flex items-center gap-2 col-span-2">
                    <span className="w-20 font-bold text-sm">향후계획</span>
                    <input type="text" value={formData.dischargePlan} onChange={(e) => updateField('dischargePlan', e.target.value)} className="flex-1 border-2 border-black px-2 py-1 text-sm focus:outline-none" />
                  </div>
                </div>
              )}

              {isOtherRecord && (
                <div className="border-2 border-black p-2 bg-gray-100 grid grid-cols-2 gap-x-4 gap-y-2 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="w-20 font-bold text-sm">보호자</span>
                    <input type="text" value={formData.otherGuardian} onChange={(e) => updateField('otherGuardian', e.target.value)} className="flex-1 border-2 border-black px-2 py-1 text-sm focus:outline-none" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-20 font-bold text-sm">작성사유</span>
                    <input type="text" value={formData.otherReason} onChange={(e) => updateField('otherReason', e.target.value)} className="flex-1 border-2 border-black px-2 py-1 text-sm focus:outline-none" />
                  </div>
                  <div className="flex items-center gap-2 col-span-2">
                    <span className="w-20 font-bold text-sm">특이사항</span>
                    <input type="text" value={formData.otherSpecial} onChange={(e) => updateField('otherSpecial', e.target.value)} className="flex-1 border-2 border-black px-2 py-1 text-sm focus:outline-none" />
                  </div>
                  <div className="flex items-center gap-2 col-span-2">
                    <span className="w-20 font-bold text-sm">추가기록</span>
                    <input type="text" value={formData.otherExtraNote} onChange={(e) => updateField('otherExtraNote', e.target.value)} className="flex-1 border-2 border-black px-2 py-1 text-sm focus:outline-none" />
                  </div>
                </div>
              )}

              <div className="border-2 border-black flex flex-col flex-1 min-h-0 overflow-y-auto bg-white">
                <div className="bg-[#999] text-white px-4 py-1 font-bold sticky top-0 z-10">
                  {activeTab === 'surgery' ? '수술처치' :
                   activeTab === 'consult' ? '협진기록' :
                   activeTab === 'discharge' ? '퇴원요약' :
                   activeTab === 'other_record' ? '기타기록' :
                   activeTab === 'other_hospital' ? '타병원기록' :
                   'SOAP'}
                </div>
                <div className="p-2 flex flex-col gap-4">
                  {currentSoapBlocks.map((block, idx) => (
                    <div key={idx} className="border-2 border-black bg-white shadow-sm shrink-0">
                      <table className="w-full border-collapse">
                        <tbody>
                          {[
                            { id: 's', label: 'Subjective' },
                            { id: 'o', label: 'Objective' },
                            { id: 'a', label: 'Assessment' },
                            { id: 'p', label: 'Plan' }
                          ].map((row) => (
                            <tr key={row.id} className="border-b border-black">
                              <td className="w-32 bg-[#C0C0C0] border-r-2 border-black p-2 text-center font-bold text-gray-700">
                                {row.label}
                              </td>
                              <td className="p-0">
                                <AutoHeightTextarea 
                                  value={block[row.id as keyof SoapBlock]}
                                  onChange={(e: any) => updateSoapBlock(idx, row.id as keyof SoapBlock, e.target.value)}
                                  className="w-full p-2 focus:outline-none block"
                                  minHeight="64px"
                                />
                              </td>
                            </tr>
                          ))}
                          <tr>
                            <td className="w-32 bg-[#C0C0C0] border-r-2 border-black p-2 text-center font-bold text-gray-700">
                              관리
                            </td>
                            <td className="p-2 flex justify-end gap-2">
                              <button 
                                onClick={() => duplicateSoapBlock(idx)}
                                className="bg-gray-400 text-white px-4 py-1 rounded-lg font-bold hover:bg-gray-500 transition-colors text-sm"
                              >
                                복제
                              </button>
                              <button 
                                onClick={() => removeSoapBlock(idx)}
                                className="bg-gray-400 text-white px-4 py-1 rounded-lg font-bold hover:bg-gray-500 transition-colors text-sm"
                              >
                                삭제
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  ))}
                  <AutoHeightTextarea 
                    value={(formData as any)[noteField]}
                    onChange={(e: any) => updateField(noteField, e.target.value)}
                    placeholder="여기에 자유롭게 기록하세요..."
                    className="w-full p-2 focus:outline-none block" 
                    minHeight="400px"
                  />
                </div>
              </div>
              {(isAdmission || isSurgery || isConsult || isDischarge || isOtherRecord) && (
                <div className="border-2 border-black flex flex-col flex-1 min-h-0 overflow-y-auto bg-white">
                  <div className="bg-[#999] text-white px-4 py-1 font-bold sticky top-0 z-10">EXAM</div>
                  <div className="p-2 flex flex-col">
                    <AutoHeightTextarea 
                      value={
                        isSurgery ? formData.surgeryExam :
                        isConsult ? formData.consultExam :
                        isDischarge ? formData.dischargeExam :
                        formData.exam
                      }
                      onChange={(e: any) => updateField(
                        isSurgery ? 'surgeryExam' :
                        isConsult ? 'consultExam' :
                        isDischarge ? 'dischargeExam' :
                        'exam', 
                        e.target.value
                      )}
                      className="w-full p-2 focus:outline-none block" 
                      minHeight="200px"
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="w-[400px] border-2 border-black p-4 flex flex-col gap-2 shrink-0 overflow-y-auto">
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

              <div className="mt-4">
                <div className="bg-[#999] text-white px-3 py-1 font-bold text-lg mb-2 flex items-center justify-between">
                  <span>V/S</span>
                  <span>&gt;</span>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-12 font-bold">HR</span>
                    <input type="text" value={formData.hr} onChange={(e) => updateField('hr', e.target.value)} className="flex-1 border-2 border-black px-2 h-8 focus:outline-none" />
                    <span className="text-xs font-bold">bpm</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-12 font-bold">RR</span>
                    <input type="text" value={formData.rr} onChange={(e) => updateField('rr', e.target.value)} className="flex-1 border-2 border-black px-2 h-8 focus:outline-none" />
                    <span className="text-xs font-bold">회/min</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-12 font-bold">BP</span>
                    <div className="flex-1 flex items-center gap-1">
                      <input type="text" value={formData.bpSys} onChange={(e) => updateField('bpSys', e.target.value)} className="w-12 border-2 border-black px-1 h-8 focus:outline-none text-center" />
                      <span>/</span>
                      <input type="text" value={formData.bpDia} onChange={(e) => updateField('bpDia', e.target.value)} className="w-12 border-2 border-black px-1 h-8 focus:outline-none text-center" />
                      <span className="text-xs font-bold ml-1">mmHg</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-12 font-bold">BT</span>
                    <input type="text" value={formData.bt} onChange={(e) => updateField('bt', e.target.value)} className="flex-1 border-2 border-black px-2 h-8 focus:outline-none" />
                    <span className="text-xs font-bold">°C</span>
                  </div>
                </div>
              </div>

              {(isAdmission || isSurgery || isConsult || isDischarge || isOtherRecord) && (
                <div className="mt-4 border-t-2 border-black pt-4">
                  <div className="bg-gray-700 text-white px-3 py-1 font-bold text-sm mb-2">경과기록</div>
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={addSoapBlock}
                      className="py-3 bg-gray-300 border-2 border-black font-bold text-lg hover:bg-gray-400 flex flex-col items-center"
                    >
                      <span>SOAP 추가</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      case 'lab':
      case 'prescription':
        const isLab = activeTab === 'lab';
        const isPrescription = activeTab === 'prescription';

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
                        <tr key={i} className={`border-b border-black ${i % 3 === 0 ? 'bg-slate-100' : i % 3 === 1 ? 'bg-green-50' : 'bg-yellow-50'}`}>
                          {row.map((cell, j) => (
                            <td key={j} className="border-r-2 border-black p-0 h-8">
                              <input 
                                type="text" 
                                value={cell} 
                                onChange={(e) => updateLabCell(i, j, e.target.value)}
                                spellCheck="false"
                                className="w-full h-full bg-transparent px-1 text-xs focus:outline-none"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col gap-4 mb-4">
                  <div className="border-2 border-black">
                    <div className="border-b-2 border-black p-1 font-bold text-xl flex justify-between items-center">
                      <span>영상검사 (Imaging Test)</span>
                      <label className="bg-gray-400 text-white px-3 py-1 rounded cursor-pointer hover:bg-gray-500 font-bold text-sm">
                        사진 업로드
                        <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                      </label>
                    </div>
                    <div className="p-2">
                      <textarea 
                        value={formData.imagingNote}
                        onChange={(e) => updateField('imagingNote', e.target.value)}
                        placeholder="영상검사 결과 및 판독 내용을 입력하세요..."
                        spellCheck="false"
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

                  <div className="border-2 border-black">
                    <div className="border-b-2 border-black p-1 font-bold text-xl flex justify-between items-center">
                      <span>진단검사 (Diagnostic Test)</span>
                      <label className="bg-gray-400 text-white px-3 py-1 rounded cursor-pointer hover:bg-gray-500 font-bold text-sm">
                        사진 업로드
                        <input type="file" accept="image/*" onChange={handleDiagnosticPhotoUpload} className="hidden" />
                      </label>
                    </div>
                    <div className="p-2">
                      <textarea 
                        value={formData.diagnosticNote}
                        onChange={(e) => updateField('diagnosticNote', e.target.value)}
                        placeholder="진단검사 결과 및 부가 설명을 입력하세요..."
                        spellCheck="false"
                        className="w-full h-24 p-2 border border-gray-300 focus:outline-none resize-none"
                      />
                    </div>
                    <div className="p-2 border-t border-gray-300">
                      <div className="flex flex-wrap gap-4">
                        {(formData.diagnosticPhotos || []).map((photo, idx) => (
                          <div key={idx} className="relative group">
                            <img 
                              src={photo} 
                              alt={`Diagnostic ${idx}`} 
                              className="w-32 h-32 object-cover border-2 border-black rounded shadow-sm cursor-zoom-in"
                              onClick={() => window.open(photo)}
                            />
                            <button 
                              onClick={() => removeDiagnosticPhoto(idx)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                        {(formData.diagnosticPhotos || []).length === 0 && (
                          <div className="text-sm text-gray-400 py-4">등록된 사진이 없습니다.</div>
                        )}
                      </div>
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
                        prescriptionSubTab === t ? 'text-white' : 'hover:bg-gray-100'
                      }`}
                      style={{ backgroundColor: prescriptionSubTab === t ? currentTheme.color : undefined }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <div className="flex-1 border-2 border-black p-4 overflow-y-auto">
                  {prescriptionSubTab === '항암 처방' ? (
                    <div className="flex flex-col h-full">
                      <div className="flex items-center gap-6 mb-4 bg-gray-50 p-3 border-2 border-black">
                        <div className="flex items-center gap-2">
                          <span className="font-bold">Height:</span>
                          <input 
                            type="text" 
                            value={formData.height} 
                            onChange={(e) => updateField('height', e.target.value)}
                            className="w-20 border-b-2 border-black bg-transparent px-1 focus:outline-none text-center font-bold"
                            placeholder="cm"
                          />
                          <span className="text-sm">cm</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">Weight:</span>
                          <input 
                            type="text" 
                            value={formData.weight} 
                            onChange={(e) => updateField('weight', e.target.value)}
                            className="w-20 border-b-2 border-black bg-transparent px-1 focus:outline-none text-center font-bold"
                            placeholder="kg"
                          />
                          <span className="text-sm">kg</span>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <span className="font-bold text-[#000080]">BSA:</span>
                          <div className="bg-white border-2 border-black px-4 py-1 font-black text-xl text-[#000080] min-w-[80px] text-center">
                            {(() => {
                              const h = parseFloat(formData.height);
                              const w = parseFloat(formData.weight);
                              if (isNaN(h) || isNaN(w) || h <= 0 || w <= 0) return '0.00';
                              return Math.sqrt((h * w) / 3600).toFixed(2);
                            })()}
                          </div>
                          <span className="font-bold text-sm">m²</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <table className="w-full border-collapse border-2 border-black">
                          <thead>
                            <tr className="bg-gray-300 border-b-2 border-black">
                              {['Cycle', 'Day', 'Drug', 'Dose'].map(h => (
                                <th key={h} className="border-r-2 border-black p-2 w-1/4 text-center font-bold">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {formData.regimenRows.map((row, i) => (
                              <tr key={i} className="border-b border-black h-10">
                                {row.map((cell, j) => (
                                  <td key={j} className={`border-r-2 border-black p-0 ${j === 1 ? 'bg-slate-100' : j === 2 ? 'bg-yellow-50' : j === 3 ? 'bg-green-50' : ''}`}>
                                    <input 
                                      type="text" 
                                      value={cell} 
                                      onChange={(e) => updateRegimenCell(i, j, e.target.value)}
                                      spellCheck="false"
                                      className="w-full h-full bg-transparent px-2 focus:outline-none font-medium"
                                    />
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                        <button 
                          onClick={() => setShowCalculator(true)}
                          className="bg-[#00A86B] text-white px-6 py-2 rounded font-bold hover:opacity-90 transition-opacity border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        >
                          계산기
                        </button>
                        <button 
                          onClick={addRegimenRow}
                          className="bg-[#00A86B] text-white px-6 py-2 rounded font-bold hover:opacity-90 transition-opacity border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        >
                          추가
                        </button>
                        <button 
                          onClick={handleSave}
                          className="bg-[#00A86B] text-white px-6 py-2 rounded font-bold hover:opacity-90 transition-opacity border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        >
                          저장
                        </button>
                      </div>
                    </div>
                  ) : (
                    <AutoHeightTextarea 
                      value={formData.prescriptionNotes[prescriptionSubTab] || ''}
                      onChange={(e: any) => updatePrescriptionNote(prescriptionSubTab, e.target.value)}
                      className="w-full focus:outline-none" 
                      placeholder={`${prescriptionSubTab} 내용을 입력하세요...`} 
                      minHeight="500px"
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        );
      case 'er':
        return (
          <div className="flex-1 flex gap-4 p-4 bg-white overflow-hidden">
            <div className="w-80 flex flex-col gap-4 shrink-0 overflow-y-auto pr-2">
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

                  <div className="mt-4">
                    <div className="bg-[#5a9a9a] text-white font-bold p-2 text-lg flex items-center justify-between">
                      <span>V/S</span>
                      <span>&gt;</span>
                    </div>
                    <div className="flex flex-col gap-2 mt-2">
                      <div className="flex items-center gap-2">
                        <span className="w-12 font-bold">HR</span>
                        <input type="text" value={formData.hr} onChange={(e) => updateField('hr', e.target.value)} className="flex-1 border-2 border-black px-2 h-8 focus:outline-none" />
                        <span className="text-xs font-bold">bpm</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-12 font-bold">RR</span>
                        <input type="text" value={formData.rr} onChange={(e) => updateField('rr', e.target.value)} className="flex-1 border-2 border-black px-2 h-8 focus:outline-none" />
                        <span className="text-xs font-bold">회/min</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-12 font-bold">BP</span>
                        <div className="flex-1 flex items-center gap-1">
                          <input type="text" value={formData.bpSys} onChange={(e) => updateField('bpSys', e.target.value)} className="w-12 border-2 border-black px-1 h-8 focus:outline-none text-center" />
                          <span>/</span>
                          <input type="text" value={formData.bpDia} onChange={(e) => updateField('bpDia', e.target.value)} className="w-12 border-2 border-black px-1 h-8 focus:outline-none text-center" />
                          <span className="text-xs font-bold ml-1">mmHg</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-12 font-bold">BT</span>
                        <input type="text" value={formData.bt} onChange={(e) => updateField('bt', e.target.value)} className="flex-1 border-2 border-black px-2 h-8 focus:outline-none" />
                        <span className="text-xs font-bold">°C</span>
                      </div>
                    </div>
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
                      <span>SOAP 추가</span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="border-2 border-black flex flex-col shrink-0">
                <div className="bg-[#5a9a9a] text-white font-bold p-2 text-center">Mode of arrival</div>
                <input 
                  type="text" 
                  value={formData.erMode} 
                  onChange={(e) => updateField('erMode', e.target.value)}
                  spellCheck="false"
                  className="border-b border-black h-12 px-2 focus:outline-none"
                />
                <div className="bg-[#5a9a9a] text-white font-bold p-2 text-center">ED arrival time</div>
                <input 
                  type="text" 
                  value={formData.erTime} 
                  onChange={(e) => updateField('erTime', e.target.value)}
                  spellCheck="false"
                  className="h-12 px-2 focus:outline-none border-b border-black"
                />
                <button 
                  onClick={() => setShowAssessmentTool(true)}
                  className="h-12 bg-gray-300 border-b border-black font-bold hover:bg-gray-400"
                >
                  평가도구
                </button>
                {formData.erAssessment && (
                  <div className="p-2 text-sm font-bold bg-yellow-50 border-b border-black">
                    {formData.erAssessment}
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-4 overflow-hidden">
              <div className="border-2 border-black flex flex-col flex-1 min-h-0 overflow-y-auto bg-white">
                <div className="bg-[#999] text-white font-bold p-2 text-lg sticky top-0 z-10">SOAP</div>
                <div className="p-2 flex flex-col gap-4">
                  {formData.erSoapBlocks.map((block, idx) => (
                    <div key={idx} className="border-2 border-black bg-white shadow-sm shrink-0">
                      <table className="w-full border-collapse">
                        <tbody>
                          {[
                            { id: 's', label: 'Subjective' },
                            { id: 'o', label: 'Objective' },
                            { id: 'a', label: 'Assessment' },
                            { id: 'p', label: 'Plan' }
                          ].map((row) => (
                            <tr key={row.id} className="border-b border-black">
                              <td className="w-32 bg-[#C0C0C0] border-r-2 border-black p-2 text-center font-bold text-gray-700">
                                {row.label}
                              </td>
                              <td className="p-0">
                                <AutoHeightTextarea 
                                  value={block[row.id as keyof SoapBlock]}
                                  onChange={(e: any) => updateSoapBlock(idx, row.id as keyof SoapBlock, e.target.value)}
                                  className="w-full p-2 focus:outline-none block"
                                  minHeight="64px"
                                />
                              </td>
                            </tr>
                          ))}
                          <tr>
                            <td className="w-32 bg-[#C0C0C0] border-r-2 border-black p-2 text-center font-bold text-gray-700">
                              관리
                            </td>
                            <td className="p-2 flex justify-end gap-2">
                              <button 
                                onClick={() => duplicateSoapBlock(idx)}
                                className="bg-gray-400 text-white px-4 py-1 rounded-lg font-bold hover:bg-gray-500 transition-colors text-sm"
                              >
                                복제
                              </button>
                              <button 
                                onClick={() => removeSoapBlock(idx)}
                                className="bg-gray-400 text-white px-4 py-1 rounded-lg font-bold hover:bg-gray-500 transition-colors text-sm"
                              >
                                삭제
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  ))}
                  <AutoHeightTextarea 
                    value={formData.erSoapNote}
                    onChange={(e: any) => updateField('erSoapNote', e.target.value)}
                    placeholder="여기에 자유롭게 기록하세요..."
                    className="w-full p-2 focus:outline-none block" 
                    minHeight="200px"
                  />
                </div>
              </div>
              <div className="border-2 border-black flex flex-col flex-1 min-h-0 overflow-y-auto bg-white">
                <div className="bg-[#999] text-white font-bold p-2 text-lg sticky top-0 z-10">EXAM</div>
                <div className="p-2 flex flex-col">
                  <AutoHeightTextarea 
                    value={formData.erExam}
                    onChange={(e: any) => updateField('erExam', e.target.value)}
                    className="w-full p-2 focus:outline-none block" 
                    minHeight="200px"
                  />
                </div>
              </div>
            </div>
            <div className="w-40 border-2 border-black flex flex-col shrink-0">
              <div className="bg-[#5a9a9a] text-white font-bold p-2 text-center">LAB NOTE</div>
              <div className="flex-1 p-2">
                <textarea 
                  value={formData.erLabNote}
                  onChange={(e) => updateField('erLabNote', e.target.value)}
                  spellCheck="false"
                  className="w-full h-full resize-none focus:outline-none" 
                />
              </div>
            </div>
          </div>
        );
      case 'nursing':
        return renderNursingContent();
      default:
        return null;
    }
  };

  const renderNursingContent = () => {
    const NURSING_SUB_TABS: NursingSubTab[] = ['간호기록', '투약기록', '처치기록', '기록작성', '간호계획', '특수기록'];

    const currentNursingRecord = (formData.nursingRecords?.[formData.nursingCategory]) || {
      occurTime: '',
      occurPlace: '',
      eventType: '',
      action: '',
      reporter: '',
      patientChange: '',
      detail: '',
    };

    const updateNursingField = (field: keyof NursingRecord, value: string) => {
      const newRecords = {
        ...(formData.nursingRecords || {}),
        [formData.nursingCategory]: {
          ...currentNursingRecord,
          [field]: value
        }
      };
      updateField('nursingRecords', newRecords);
    };

    const renderSubTabContent = () => {
      switch (formData.nursingSubTab) {
        case '간호기록':
          return (
            <div className="flex-1 flex gap-4 overflow-hidden">
              <div className="flex-1 border-2 border-black flex flex-col bg-white">
                <div 
                  style={{ backgroundColor: currentTheme.color }}
                  className="text-white py-2 text-center font-bold text-2xl border-b-2 border-black"
                >
                  간호기록지
                </div>
                <AutoHeightTextarea 
                  value={formData.nursingNote}
                  onChange={(e: any) => updateField('nursingNote', e.target.value)}
                  className="flex-1 p-4 text-lg focus:outline-none"
                  minHeight="100%"
                />
              </div>
              <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                <div className="flex-1 border-2 border-black flex flex-col bg-white overflow-hidden">
                  <div 
                  style={{ backgroundColor: currentTheme.color }}
                  className="text-white py-2 text-center font-bold text-2xl border-b-2 border-black"
                >
                  Progress Note
                </div>
                  <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
                    <div className="flex-[2] border-2 border-black rounded overflow-hidden flex flex-col">
                      <div className="bg-gray-300 px-3 py-1 border-b-2 border-black font-bold text-sm flex justify-between items-center">
                        <span className="bg-white px-4 py-1 rounded text-gray-500">SOAP</span>
                        <button onClick={addSoapBlock} className="text-blue-600 hover:underline text-xs">+ 추가</button>
                      </div>
                      <div className="flex-1 overflow-y-auto">
                        {formData.nursingSoapBlocks.map((block, idx) => (
                          <div key={idx} className="border-b border-black last:border-b-0 p-2">
                            <div className="flex justify-end gap-2 mb-1">
                              <button onClick={() => duplicateSoapBlock(idx)} className="text-[10px] text-gray-500 hover:text-blue-600">복제</button>
                              <button onClick={() => removeSoapBlock(idx)} className="text-[10px] text-gray-500 hover:text-red-600">삭제</button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <AutoHeightTextarea value={block.s} onChange={(e: any) => updateSoapBlock(idx, 's', e.target.value)} placeholder="S" className="border p-1 text-sm" />
                              <AutoHeightTextarea value={block.o} onChange={(e: any) => updateSoapBlock(idx, 'o', e.target.value)} placeholder="O" className="border p-1 text-sm" />
                              <AutoHeightTextarea value={block.a} onChange={(e: any) => updateSoapBlock(idx, 'a', e.target.value)} placeholder="A" className="border p-1 text-sm" />
                              <AutoHeightTextarea value={block.p} onChange={(e: any) => updateSoapBlock(idx, 'p', e.target.value)} placeholder="P" className="border p-1 text-sm" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex-1 border-2 border-black rounded overflow-hidden flex flex-col">
                      <div className="bg-gray-300 px-3 py-1 border-b-2 border-black font-bold text-sm">
                        <span className="bg-white px-4 py-1 rounded text-gray-500">EXAM</span>
                      </div>
                      <AutoHeightTextarea 
                        value={formData.nursingExam}
                        onChange={(e: any) => updateField('nursingExam', e.target.value)}
                        className="flex-1 p-3 text-sm focus:outline-none"
                        minHeight="100px"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        case '투약기록':
          const medData = formData.medicationData || INITIAL_FORM_DATA.medicationData;
          const updateMed = (f: string, v: any) => updateField('medicationData', { ...medData, [f]: v });
          return (
            <div className="flex-1 border-2 border-black bg-white flex flex-col">
              <table className="w-full border-collapse h-full">
                <tbody>
                  {[
                    { id: 'time', label: '투여시간' },
                    { id: 'date', label: '투여일' },
                    { id: 'drug', label: '약품명' },
                    { id: 'dose', label: '용량' },
                    { id: 'route', label: '경로' },
                    { id: 'prescriber', label: '처방자' },
                    { id: 'status', label: '투약여부' },
                    { id: 'note', label: '기타기록' },
                  ].map((row) => (
                    <tr key={row.id} className="border-b-2 border-black last:border-b-0">
                      <td 
                        style={{ backgroundColor: currentTheme.color }}
                        className="w-48 border-r-2 border-black p-4 text-center font-bold text-2xl text-white"
                      >
                        {row.label}
                      </td>
                      <td className="p-0">
                        {row.id === 'status' ? (
                          <div className="flex items-center p-4">
                            <div 
                              onClick={() => updateMed('statusChecked', !medData.statusChecked)}
                              className="w-12 h-12 border-2 border-black flex items-center justify-center cursor-pointer hover:bg-gray-100"
                            >
                              {medData.statusChecked && <div className="w-8 h-8 bg-black"></div>}
                            </div>
                            <input type="text" value={(medData as any)[row.id]} onChange={(e) => updateMed(row.id, e.target.value)} className="flex-1 ml-4 focus:outline-none text-2xl" />
                          </div>
                        ) : (
                          <input 
                            type="text"
                            value={(medData as any)[row.id] || ''}
                            onChange={(e) => updateMed(row.id, e.target.value)}
                            className="w-full p-4 focus:outline-none text-2xl"
                          />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        case '처치기록':
          return (
            <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
              {['드레싱', '카테터', '산소치료', '검사'].map(section => (
                <div key={section} className="border-2 border-black bg-white flex flex-col">
                  <div className="bg-gray-300 p-2 border-b-2 border-black">
                    <span className="bg-white border-2 border-black px-8 py-1 rounded-xl font-bold text-2xl">{section}</span>
                  </div>
                  <table className="w-full border-collapse">
                    <tbody>
                      {[
                        { id: 'date', label: '시행일자' },
                        { id: 'time', label: '시행시간' },
                        { id: 'status', label: '시행여부' },
                        { id: 'note', label: '기타기록' },
                      ].map(row => (
                        <tr key={row.id} className="border-b-2 border-black last:border-b-0">
                          <td 
                            style={{ backgroundColor: currentTheme.color }}
                            className="w-48 border-r-2 border-black p-2 text-center font-bold text-xl text-white"
                          >
                            {row.label}
                          </td>
                          <td className="p-0">
                            <input 
                              type="text"
                              value={(formData.treatmentData[section] as any)[row.id] || ''}
                              onChange={(e) => updateField('treatmentData', {
                                ...formData.treatmentData,
                                [section]: { ...formData.treatmentData[section], [row.id]: e.target.value }
                              })}
                              className="w-full p-2 focus:outline-none text-xl"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          );
        case '기록작성':
          return (
            <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
              <div className="border-2 border-black flex flex-col bg-white">
                <div className="flex items-center justify-center gap-2 p-4 border-b-2 border-black">
                  <FileText size={40} />
                  <span className="text-4xl font-black">기록지</span>
                </div>
                <div className="flex p-4 gap-12">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 font-bold text-2xl">
                      <ChevronDown size={24} /> 환자 안전 사고
                    </div>
                    <div className="flex flex-col gap-1 ml-8 text-xl font-bold">
                      {['낙상기록지', '이탈기록지', '욕창기록지'].map(cat => (
                        <button key={cat} onClick={() => updateField('nursingCategory', cat)} className={`flex items-center gap-2 hover:text-blue-600 ${formData.nursingCategory === cat ? 'text-blue-600' : ''}`}>
                          <ChevronDown size={20} className="rotate-[-90deg]" /> {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 font-bold text-2xl">
                      <ChevronDown size={24} /> 폭력 및 보안
                    </div>
                    <div className="flex flex-col gap-1 ml-8 text-xl font-bold">
                      {['폭행', '보호자 문제'].map(cat => (
                        <button key={cat} onClick={() => updateField('nursingCategory', cat)} className={`flex items-center gap-2 hover:text-blue-600 ${formData.nursingCategory === cat ? 'text-blue-600' : ''}`}>
                          <ChevronDown size={20} className="rotate-[-90deg]" /> {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-2 border-black flex flex-col bg-white">
                <div 
                  style={{ backgroundColor: currentTheme.color }}
                  className="p-2 border-b-2 border-black text-center text-3xl font-black text-white"
                >
                  작성창
                </div>
                <table className="w-full border-collapse">
                  <tbody>
                    {[
                      { id: 'occurTime', label: '발생일시' },
                      { id: 'occurPlace', label: '발생장소' },
                      { id: 'eventType', label: '사건유형' },
                      { id: 'action', label: '즉각처치' },
                      { id: 'reporter', label: '보고자 / 확인자' },
                      { id: 'patientChange', label: '환자 상태 변화' },
                    ].map((row) => (
                      <tr key={row.id} className="border-b-2 border-black">
                        <td 
                          style={{ backgroundColor: currentTheme.color }}
                          className="w-64 border-r-2 border-black p-4 text-center font-bold text-2xl text-white"
                        >
                          {row.label}
                        </td>
                        <td className="p-0">
                          <input 
                            type="text"
                            value={(currentNursingRecord as any)[row.id] || ''}
                            onChange={(e) => updateNursingField(row.id as keyof NursingRecord, e.target.value)}
                            className="w-full p-4 focus:outline-none text-xl"
                          />
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td 
                        style={{ backgroundColor: currentTheme.color }}
                        className="w-64 border-r-2 border-black p-4 text-center font-bold text-2xl text-white align-middle"
                      >
                        상세 내용
                      </td>
                      <td className="p-0">
                        <AutoHeightTextarea 
                          value={currentNursingRecord.detail}
                          onChange={(e: any) => updateNursingField('detail', e.target.value)}
                          className="w-full p-4 focus:outline-none block text-xl"
                          minHeight="200px"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          );
        case '간호계획':
          return (
            <div className="flex-1 border-2 border-black bg-white flex overflow-hidden">
              <div className="flex-1 flex flex-col border-r-2 border-black">
                <div 
                  style={{ backgroundColor: currentTheme.color }}
                  className="text-white py-2 text-center font-bold text-2xl border-b-2 border-black"
                >
                  간호진단
                </div>
                <AutoHeightTextarea 
                  value={formData.nursingPlan.diagnosis}
                  onChange={(e: any) => updateField('nursingPlan', { ...formData.nursingPlan, diagnosis: e.target.value })}
                  className="flex-1 p-4 text-lg focus:outline-none"
                />
              </div>
              <div className="flex-1 flex flex-col border-r-2 border-black">
                <div 
                  style={{ backgroundColor: currentTheme.color }}
                  className="text-white py-2 text-center font-bold text-2xl border-b-2 border-black"
                >
                  향후계획
                </div>
                <AutoHeightTextarea 
                  value={formData.nursingPlan.plan}
                  onChange={(e: any) => updateField('nursingPlan', { ...formData.nursingPlan, plan: e.target.value })}
                  className="flex-1 p-4 text-lg focus:outline-none"
                />
              </div>
              <div className="flex-1 flex flex-col">
                <div 
                  style={{ backgroundColor: currentTheme.color }}
                  className="text-white py-2 text-center font-bold text-2xl border-b-2 border-black"
                >
                  평가
                </div>
                <AutoHeightTextarea 
                  value={formData.nursingPlan.evaluation}
                  onChange={(e: any) => updateField('nursingPlan', { ...formData.nursingPlan, evaluation: e.target.value })}
                  className="flex-1 p-4 text-lg focus:outline-none"
                />
              </div>
            </div>
          );
        case '특수기록':
          return (
            <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
              <div className="border-2 border-black bg-white flex flex-col">
                <div 
                  style={{ backgroundColor: currentTheme.color }}
                  className="p-2 border-b-2 border-black"
                >
                  <span className="bg-white border-2 border-black px-8 py-1 rounded-xl font-bold text-2xl">수술 간호 기록</span>
                </div>
                <div className="flex gap-4 p-4">
                  <div className="flex-1 border-2 border-black relative">
                    <div 
                      style={{ backgroundColor: currentTheme.color }}
                      className="absolute top-2 left-2 border-2 border-black px-4 py-1 rounded-xl font-bold text-2xl text-white"
                    >
                      전
                    </div>
                    <AutoHeightTextarea 
                      value={formData.specialRecord.before}
                      onChange={(e: any) => updateField('specialRecord', { ...formData.specialRecord, before: e.target.value })}
                      className="w-full p-4 pt-16 text-lg focus:outline-none"
                      minHeight="300px"
                    />
                  </div>
                  <div className="flex-1 border-2 border-black relative">
                    <div 
                      style={{ backgroundColor: currentTheme.color }}
                      className="absolute top-2 left-2 border-2 border-black px-4 py-1 rounded-xl font-bold text-2xl text-white"
                    >
                      후
                    </div>
                    <AutoHeightTextarea 
                      value={formData.specialRecord.after}
                      onChange={(e: any) => updateField('specialRecord', { ...formData.specialRecord, after: e.target.value })}
                      className="w-full p-4 pt-16 text-lg focus:outline-none"
                      minHeight="300px"
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        default:
          return null;
      }
    };

    return (
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        <div className="flex-1 flex gap-4 p-4 overflow-hidden">
          {/* Center Column */}
          <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            {renderSubTabContent()}
          </div>

          {/* Right Sidebar: 환자기본정보 */}
          <div className="w-96 border-2 border-black flex flex-col shrink-0 bg-white overflow-y-auto">
            <div className="bg-[#999] text-white font-bold p-4 text-2xl">환자기본정보</div>
            <div className="p-4 flex flex-col gap-4">
              <InputField label="차트번호" value={formData.chartNo} onChange={(v) => updateField('chartNo', v)} labelWidth="w-24" />
              <InputField label="병실" value={formData.room} onChange={(v) => updateField('room', v)} labelWidth="w-24" />
              <InputField label="전문의" value={formData.doctor} onChange={(v) => updateField('doctor', v)} labelWidth="w-24" />
              <InputField label="성명" value={formData.name} onChange={(v) => updateField('name', v)} labelWidth="w-24" />
              <InputField label="나이" value={formData.age} onChange={(v) => updateField('age', v)} labelWidth="w-24" />
              <InputField label="거주지" value={formData.address} onChange={(v) => updateField('address', v)} labelWidth="w-24" />
              <InputField label="Dx" value={formData.dx} onChange={(v) => updateField('dx', v)} labelWidth="w-24" />
              <InputField label="C.C" value={formData.cc} onChange={(v) => updateField('cc', v)} labelWidth="w-24" />
              <InputField label="On Set" value={formData.onset} onChange={(v) => updateField('onset', v)} labelWidth="w-24" />
              <InputField label="혈액형" value={formData.bloodType} onChange={(v) => updateField('bloodType', v)} labelWidth="w-24" />
              <InputField label="진료과" value={formData.dept} onChange={(v) => updateField('dept', v)} labelWidth="w-24" />
              <div className="flex items-center gap-2 text-lg font-bold">
                <span className="w-24">생년월일</span>
                <div className="flex items-center gap-1">
                  <input type="text" value={formData.dobYear} onChange={(e) => updateField('dobYear', e.target.value)} className="w-16 border-2 border-black px-1 text-center" />년
                  <input type="text" value={formData.dobMonth} onChange={(e) => updateField('dobMonth', e.target.value)} className="w-10 border-2 border-black px-1 text-center" />월
                  <input type="text" value={formData.dobDay} onChange={(e) => updateField('dobDay', e.target.value)} className="w-10 border-2 border-black px-1 text-center" />일
                </div>
              </div>
              <div className="flex items-center gap-4 text-lg font-bold">
                <span className="w-24">성별</span>
                <label className="flex items-center gap-1">
                  <input type="radio" name="nursing_gender" checked={formData.gender === 'M'} onChange={() => updateField('gender', 'M')} /> 남
                </label>
                <label className="flex items-center gap-1">
                  <input type="radio" name="nursing_gender" checked={formData.gender === 'F'} onChange={() => updateField('gender', 'F')} /> 여
                </label>
              </div>

              <div className="mt-4">
                <div className="bg-[#999] text-white font-bold p-4 text-2xl flex items-center justify-between">
                  <span>V/S</span>
                  <span>&gt;</span>
                </div>
                <div className="flex flex-col gap-4 mt-4 px-2">
                  <div className="flex items-center gap-4">
                    <span className="w-16 font-bold text-xl">HR</span>
                    <input type="text" value={formData.hr} onChange={(e) => updateField('hr', e.target.value)} className="flex-1 border-2 border-black px-2 h-10 focus:outline-none text-xl" />
                    <span className="text-sm font-bold">bpm</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="w-16 font-bold text-xl">RR</span>
                    <input type="text" value={formData.rr} onChange={(e) => updateField('rr', e.target.value)} className="flex-1 border-2 border-black px-2 h-10 focus:outline-none text-xl" />
                    <span className="text-sm font-bold">회/min</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="w-16 font-bold text-xl">BP</span>
                    <div className="flex-1 flex items-center gap-2">
                      <input type="text" value={formData.bpSys} onChange={(e) => updateField('bpSys', e.target.value)} className="w-20 border-2 border-black px-2 h-10 focus:outline-none text-center text-xl" />
                      <span className="text-xl">/</span>
                      <input type="text" value={formData.bpDia} onChange={(e) => updateField('bpDia', e.target.value)} className="w-20 border-2 border-black px-2 h-10 focus:outline-none text-center text-xl" />
                      <span className="text-sm font-bold ml-1">mmHg</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="w-16 font-bold text-xl">BT</span>
                    <input type="text" value={formData.bt} onChange={(e) => updateField('bt', e.target.value)} className="flex-1 border-2 border-black px-2 h-10 focus:outline-none text-xl" />
                    <span className="text-sm font-bold">°C</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

    if (!isLoggedIn) {
      return (
        <div 
          style={{ backgroundColor: currentTheme.bg }}
          className="h-screen flex items-center justify-center font-sans"
        >
          <div className="w-96 bg-white border-4 border-black p-8 shadow-[8px_8px_0_0_rgba(0,0,0,1)] flex flex-col items-center">
            <img 
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEhxWgTJu1Xvd3uDAeqeC5uDD4rgwaRVhjOrK5DOYOrfgO9ETjX_mz3kfK&s" 
              alt="Logo" 
              className="w-24 h-24 mb-4 object-contain"
            />
            <div className="text-2xl font-black mb-6 border-b-4 border-black pb-2 w-full text-center">TOTAL 간호 LOGIN</div>
            <form onSubmit={handleLogin} className="flex flex-col gap-4 w-full">
              <div>
                <label className="block font-bold mb-1">ID</label>
                <input 
                  type="text" 
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  spellCheck="false"
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
                  spellCheck="false"
                  className="w-full border-2 border-black p-2 focus:outline-none"
                  placeholder=""
                />
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="autoLogin"
                  checked={autoLogin}
                  onChange={(e) => setAutoLogin(e.target.checked)}
                  className="w-4 h-4 border-2 border-black"
                />
                <label htmlFor="autoLogin" className="font-bold text-sm cursor-pointer">자동 로그인</label>
              </div>
              <button 
                type="submit"
                style={{ backgroundColor: currentTheme.color }}
                className="mt-4 text-white font-black py-3 border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all"
              >
                LOGIN
              </button>
            </form>
          </div>
        </div>
      );
    }

  return (
    <div 
      style={{ backgroundColor: currentTheme.bg }}
      className="flex flex-col h-screen min-w-[1200px] font-sans overflow-hidden"
    >
      <div className="flex flex-col border-b-2 border-gray-400 shrink-0" style={{ backgroundColor: currentTheme.bg }}>
        {/* New Top Row */}
        <div className="flex items-center justify-start gap-2 px-4 py-1.5 border-b border-gray-300 bg-[#f0f0f0]">
          <button 
            onClick={() => {
              setActiveTopMenu('웹사이트');
              window.open('https://total-emr.vercel.app/', '_blank');
            }}
            className={`font-bold text-[14px] px-3 py-0.5 rounded transition-all ${activeTopMenu === '웹사이트' ? 'bg-[#555555] text-white' : 'text-black hover:bg-gray-300'}`}
          >
            웹사이트
          </button>
          <button 
            onClick={() => {
              setActiveTopMenu('E.M.R');
              if (selectedPatientId) setActiveTab('admission');
              else setActiveTab('none');
            }}
            className={`font-bold text-[14px] px-3 py-0.5 rounded transition-all ${activeTopMenu === 'E.M.R' ? 'bg-[#555555] text-white' : 'text-black hover:bg-gray-300'}`}
          >
            E.M.R
          </button>
          <button 
            onClick={() => {
              setActiveTopMenu('간호');
              if (selectedPatientId) setActiveTab('nursing');
              else setActiveTab('none');
            }}
            className={`font-bold text-[14px] px-3 py-0.5 rounded transition-all ${activeTopMenu === '간호' ? 'bg-[#555555] text-white' : 'text-black hover:bg-gray-300'}`}
          >
            간호
          </button>
          <button 
            onClick={() => {
              setActiveTopMenu('드라이브');
              window.open('https://drive.google.com/drive/folders/1glFfxZVQzXt4XeUdLagr32rjpvrYf01e?usp=sharing', '_blank');
            }}
            className={`font-bold text-[14px] px-3 py-0.5 rounded transition-all ${activeTopMenu === '드라이브' ? 'bg-[#555555] text-white' : 'text-black hover:bg-gray-300'}`}
          >
            드라이브
          </button>
          <button 
            onClick={() => {
              setActiveTopMenu('제증명 관리');
              window.open('https://www.medcerti.co.kr/medcerti_portal/index.jsp', '_blank');
            }}
            className={`font-bold text-[14px] px-3 py-0.5 rounded transition-all ${activeTopMenu === '제증명 관리' ? 'bg-[#555555] text-white' : 'text-black hover:bg-gray-300'}`}
          >
            제증명 관리
          </button>
          <button 
            onClick={() => {
              setActiveTopMenu('환경설정');
              setShowSettings(true);
            }}
            className={`font-bold text-[14px] px-3 py-0.5 rounded transition-all ${activeTopMenu === '환경설정' ? 'bg-[#555555] text-white' : 'text-black hover:bg-gray-300'}`}
          >
            환경설정
          </button>
          <button 
            onClick={() => {
              setActiveTopMenu('동의서');
              window.open('https://www.medcerti.co.kr/medcerti_portal/index.jsp', '_blank');
            }}
            className={`font-bold text-[14px] px-3 py-0.5 rounded transition-all ${activeTopMenu === '동의서' ? 'bg-[#555555] text-white' : 'text-black hover:bg-gray-300'}`}
          >
            동의서
          </button>
          <button 
            onClick={() => {
              setActiveTopMenu('종료');
              setSelectedPatientId(null);
              setFormData(INITIAL_FORM_DATA);
              setActiveTab('none');
            }}
            className={`font-bold text-[14px] px-3 py-0.5 rounded transition-all ${activeTopMenu === '종료' ? 'bg-[#555555] text-white' : 'text-black hover:bg-gray-300'}`}
          >
            종료
          </button>
        </div>

        {/* Existing Header Row */}
        <div className="flex items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-2">
            <HeaderButton 
              icon={Save} 
              label={isSaving ? "저장 중..." : "저장"} 
              onClick={handleSave} 
              color={isSaving ? "text-gray-400" : "text-black"} 
              borderColor="border-transparent"
              disabled={isSaving}
            />
            <HeaderButton icon={Trash2} label="삭제" color="text-black" borderColor="border-transparent" onClick={handleDelete} />
            <HeaderButton icon={X} label="종료" color="text-black" borderColor="border-transparent" onClick={() => {
              setSelectedPatientId(null);
              setFormData(INITIAL_FORM_DATA);
              setActiveTab('none');
            }} />
          </div>

          <div className="flex items-center gap-1">
            {activeTopMenu === '간호' ? (
              <>
                {(['간호기록', '투약기록', '처치기록', '기록작성', '간호계획', '특수기록'] as NursingSubTab[]).map(subTab => (
                  <TabButton 
                    key={subTab}
                    label={subTab} 
                    count={0} 
                    active={formData.nursingSubTab === subTab} 
                    onClick={() => updateField('nursingSubTab', subTab)} 
                    theme={currentTheme} 
                  />
                ))}
              </>
            ) : (
              <>
                <TabButton label="응급기록" count={tabCounts.er} active={activeTab === 'er'} onClick={() => setActiveTab('er')} theme={currentTheme} />
                <TabButton label="입원경과" count={tabCounts.admission} active={activeTab === 'admission'} onClick={() => setActiveTab('admission')} theme={currentTheme} />
                <TabButton label="수술처치" count={tabCounts.surgery} active={activeTab === 'surgery'} onClick={() => setActiveTab('surgery')} theme={currentTheme} />
                <TabButton label="협진기록" count={tabCounts.consult} active={activeTab === 'consult'} onClick={() => setActiveTab('consult')} theme={currentTheme} />
                <TabButton label="퇴원요약" count={tabCounts.discharge} active={activeTab === 'discharge'} onClick={() => setActiveTab('discharge')} theme={currentTheme} />
                <TabButton label="검사결과" count={tabCounts.lab} active={activeTab === 'lab'} onClick={() => setActiveTab('lab')} theme={currentTheme} />
                <TabButton label="기타기록" count={tabCounts.other_record} active={activeTab === 'other_record'} onClick={() => setActiveTab('other_record')} theme={currentTheme} />
                <TabButton label="타병원기록" count={tabCounts.other_hospital} active={activeTab === 'other_hospital'} onClick={() => setActiveTab('other_hospital')} theme={currentTheme} />
                <TabButton label="처방" count={tabCounts.prescription} active={activeTab === 'prescription'} onClick={() => setActiveTab('prescription')} theme={currentTheme} />
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
          <div className="relative">
            <HeaderButton icon={Printer} label="출력" onClick={() => setShowPrintMenu(!showPrintMenu)} color="text-black" bgColor="bg-gray-200" />
            {showPrintMenu && (
              <div className="absolute top-10 right-0 bg-white border-2 border-black shadow-lg z-50 w-48 py-1 max-h-[400px] overflow-y-auto">
                <button className="w-full text-left px-4 py-2 hover:bg-gray-100 font-bold text-sm" onClick={() => handlePrint('admission')}>입원기록지 출력</button>
                <button className="w-full text-left px-4 py-2 hover:bg-gray-100 font-bold text-sm" onClick={() => handlePrint('er')}>응급기록지 출력</button>
                <button className="w-full text-left px-4 py-2 hover:bg-gray-100 font-bold text-sm" onClick={() => handlePrint('surgery')}>수술처치기록지 출력</button>
                <button className="w-full text-left px-4 py-2 hover:bg-gray-100 font-bold text-sm" onClick={() => handlePrint('consult')}>협진의뢰기록지 출력</button>
                <button className="w-full text-left px-4 py-2 hover:bg-gray-100 font-bold text-sm" onClick={() => handlePrint('discharge')}>퇴원요약지 출력</button>
                <button className="w-full text-left px-4 py-2 hover:bg-gray-100 font-bold text-sm" onClick={() => handlePrint('lab')}>검사결과지 출력</button>
                <button className="w-full text-left px-4 py-2 hover:bg-gray-100 font-bold text-sm" onClick={() => handlePrint('other_record')}>기타기록지 출력</button>
                <button className="w-full text-left px-4 py-2 hover:bg-gray-100 font-bold text-sm" onClick={() => handlePrint('other_hospital')}>타병원기록지 출력</button>
                <button className="w-full text-left px-4 py-2 hover:bg-gray-100 font-bold text-sm" onClick={() => handlePrint('prescription')}>처방기록지 출력</button>
              </div>
            )}
          </div>
          <HeaderButton 
            label="서식저장" 
            color="text-white" 
            bgColor={currentTheme.color} 
            borderColor={currentTheme.shadow} 
            onClick={() => window.open('https://drive.google.com/drive/folders/1glFfxZVQzXt4XeUdLagr32rjpvrYf01e?usp=sharing', '_blank')} 
          />
          <HeaderButton 
            label="제증명" 
            color="text-black" 
            bgColor="bg-gray-200" 
            onClick={() => window.open('https://www.medcerti.co.kr/medcerti_portal/index.jsp', '_blank')} 
          />
          <HeaderButton 
            label="임시저장" 
            color="text-white" 
            bgColor={currentTheme.color} 
            borderColor={currentTheme.shadow} 
            onClick={() => {}} 
          />
        </div>
      </div>
    </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 bg-white border-r-2 border-black flex flex-col">
          <div 
            style={{ backgroundColor: currentTheme.color }}
            className="text-white p-2 flex items-center justify-center gap-2 font-bold border-b-2 border-black h-12 text-xl"
          >
            <FileText size={20} />
            <span>환자리스트</span>
          </div>
          <div className="p-2 border-b-2 border-black">
            <div className="relative">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                spellCheck="false"
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
                  if (activeTopMenu === '간호') setActiveTab('nursing');
                  else setActiveTab('admission');
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
                  selectedPatientId === patient.id ? 'bg-slate-100 border-l-4 border-[#000080]' : ''
                }`}
              >
                <div className="font-bold text-sm">
                  {patient.name} / {patient.chartNo} / {patient.gender} / {patient.dept}
                </div>
              </button>
            ))}
            {filteredPatients.length === 0 && (
              <div className="p-4 text-center text-gray-500 text-sm">환자가 없습니다.</div>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-[#D0D0D0] overflow-hidden">
          {renderContent()}
        </div>
      </div>

      {/* Footer Bar */}
      <div className="bg-[#BDBDBD] border-t border-[#808080] p-1 flex items-center shrink-0 h-12">
        <div className="flex items-center gap-1 ml-1">
          <button 
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-1 bg-[#E0E0E0] border border-[#707070] px-3 py-2 text-[13px] font-bold hover:bg-[#F0F0F0] active:bg-[#D0D0D0]"
          >
            <Settings size={16} /> 환경설정
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-1 bg-[#E0E0E0] border border-[#707070] px-3 py-2 text-[13px] font-bold hover:bg-[#F0F0F0] active:bg-[#D0D0D0] text-red-600"
          >
            <LogOut size={16} /> 로그아웃
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center gap-1 bg-[#E0E0E0] border border-[#707070] px-3 py-2 text-[13px] font-bold hover:bg-[#F0F0F0] active:bg-[#D0D0D0]"
          >
            <Save size={16} /> 저장
          </button>
          <button 
            className="flex items-center gap-1 bg-[#E0E0E0] border border-[#707070] px-3 py-2 text-[13px] font-bold hover:bg-[#F0F0F0] active:bg-[#D0D0D0]"
          >
            <Edit size={16} /> 수정
          </button>
        </div>
        
        <div className="flex items-center border border-[#707070] bg-white ml-3 h-[34px]">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            spellCheck="false"
            placeholder="환자 검색..."
            className="px-2 py-0.5 text-[13px] focus:outline-none w-44 h-full"
          />
          <button className="flex items-center gap-1 bg-[#E0E0E0] border-l border-[#707070] px-3 py-0.5 text-[13px] font-bold hover:bg-[#F0F0F0] h-full">
            <Search size={16} /> 환자조회
          </button>
        </div>

        <button 
          onClick={handleDelete}
          className="flex items-center gap-1 bg-[#E0E0E0] border border-[#707070] px-3 py-2 text-[13px] font-bold hover:bg-[#F0F0F0] active:bg-[#D0D0D0] ml-3"
        >
          <Trash2 size={16} /> 삭제
        </button>

        {/* Right Logo Section */}
        <div className="ml-auto mr-4 flex items-center gap-2">
          <div className="bg-white p-0.5 border border-[#707070] rounded-sm flex items-center justify-center">
            <img 
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEhxWgTJu1Xvd3uDAeqeC5uDD4rgwaRVhjOrK5DOYOrfgO9ETjX_mz3kfK&s" 
              alt="TOTAL 간호" 
              className="w-7 h-7 object-contain"
            />
          </div>
          <div className="flex items-center leading-none">
            <span className="text-[14px] font-black text-[#333]">TOTAL 간호</span>
          </div>
        </div>
      </div>

      {/* Context Menu */}
      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
          <div className="bg-white border-4 border-black p-6 w-80 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
            <div className="flex justify-between items-center mb-4 border-b-4 border-black pb-2">
              <h2 className="text-xl font-black">환경설정</h2>
              <button onClick={() => setShowSettings(false)} className="hover:bg-gray-100 p-1 rounded"><X size={24} /></button>
            </div>
            <div className="mb-6">
              <p className="font-bold mb-3">테마 컬러</p>
              <div className="flex gap-4">
                {THEME_COLORS.map((theme) => (
                  <button
                    key={theme.name}
                    onClick={() => {
                      setCurrentTheme(theme);
                      localStorage.setItem('themeName', theme.name);
                    }}
                    className={`w-12 h-12 rounded-lg border-2 border-black transition-transform ${currentTheme.name === theme.name ? 'scale-110 ring-2 ring-black ring-offset-2' : 'hover:scale-105'}`}
                    style={{ backgroundColor: theme.color }}
                    title={theme.name}
                  />
                ))}
              </div>
            </div>

            <div className="mb-6 pt-4 border-t-2 border-black">
              <p className="font-bold mb-1 text-xs text-gray-500">사용자 정보</p>
              <div className="flex items-center justify-between">
                <p className="font-black text-base">
                  {ACCOUNTS[loginId]?.name || loginId} ({loginId})
                </p>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-red-500 font-bold text-xs hover:underline"
                >
                  <LogOut size={12} /> 로그아웃
                </button>
              </div>
            </div>
            <button 
              onClick={() => setShowSettings(false)}
              className="w-full bg-[#000080] text-white font-black py-2 border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all"
            >
              닫기
            </button>
          </div>
        </div>
      )}

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
      
      {/* Print Layout */}
      {printType && (
        <div id="print-area" className="fixed inset-0 bg-white z-[9999] p-8 overflow-y-auto print:block hidden">
          <PrintForm patient={formData} type={printType} />
        </div>
      )}

      {showAssessmentTool && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
          <div className="bg-white border-2 border-black w-[800px] h-[500px] flex flex-col relative">
            {/* Tabs */}
            <div className="flex border-b-2 border-black">
              <button 
                onClick={() => setAssessmentTab('NRS')}
                className={`px-8 py-2 font-bold border-r-2 border-black ${assessmentTab === 'NRS' ? 'bg-[#ff99ff]' : 'bg-white'}`}
              >
                NRS
              </button>
              <button 
                onClick={() => setAssessmentTab('FLACC')}
                className={`px-8 py-2 font-bold border-r-2 border-black ${assessmentTab === 'FLACC' ? 'bg-[#ff99ff]' : 'bg-white'}`}
              >
                FLACC Scale
              </button>
              <button 
                onClick={() => setShowAssessmentTool(false)}
                className="ml-auto px-4 py-2 font-bold hover:bg-gray-100"
              >
                X
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-8 flex flex-col items-center justify-center">
              {assessmentTab === 'NRS' ? (
                <div className="w-full flex flex-col items-center gap-8">
                  <div className="w-full h-32 bg-[#a6a6a6] border-2 border-black"></div>
                  <div className="flex border-2 border-black">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => (
                      <button 
                        key={score}
                        onClick={() => setNrsScore(score)}
                        className={`w-16 h-10 border-r border-black last:border-r-0 font-bold hover:bg-gray-100 ${nrsScore === score ? 'bg-yellow-200' : 'bg-white'}`}
                      >
                        {score}점
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="w-full flex flex-col items-center gap-6">
                  <table className="w-full border-2 border-black border-collapse">
                    <tbody>
                      {(['face', 'legs', 'activity', 'cry', 'consolability'] as const).map(cat => (
                        <tr key={cat} className="border-b border-black last:border-b-0">
                          <td className="w-40 bg-[#ff99ff] text-white font-bold p-2 text-center border-r border-black capitalize">
                            {cat === 'consolability' ? 'Consolability' : cat}
                          </td>
                          {[1, 2].map(score => (
                            <td 
                              key={score}
                              onClick={() => setFlaccScores(prev => ({ ...prev, [cat]: score }))}
                              className={`p-2 text-center border-r border-black last:border-r-0 cursor-pointer hover:bg-gray-100 font-bold ${flaccScores[cat] === score ? 'bg-yellow-200' : ''}`}
                            >
                              {score}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="flex border-2 border-black">
                    <div className="bg-[#ff99ff] text-white font-bold px-8 py-2 border-r border-black">총점</div>
                    <div className="w-32 flex items-center justify-center font-bold">
                      {(Object.values(flaccScores) as number[]).reduce((a, b) => a + b, 0)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 flex justify-end">
              <button 
                onClick={() => {
                  const scoreText = assessmentTab === 'NRS' 
                    ? `NRS: ${nrsScore}점` 
                    : `FLACC: ${(Object.values(flaccScores) as number[]).reduce((a, b) => a + b, 0)}점`;
                  updateField('erAssessment', scoreText);
                  setShowAssessmentTool(false);
                }}
                className="bg-[#99cc66] border-2 border-black px-8 py-1 font-bold hover:opacity-90"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {showCalculator && (
        <Calculator onClose={() => setShowCalculator(false)} />
      )}
    </div>
  );
}

const Calculator = ({ onClose }: { onClose: () => void }) => {
  const [display, setDisplay] = useState('0');
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const inputDot = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setPrevValue(null);
    setOperator(null);
    setWaitingForOperand(false);
  };

  const performOperation = (nextOperator: string) => {
    const inputValue = parseFloat(display);

    if (prevValue === null) {
      setPrevValue(inputValue);
    } else if (operator) {
      const currentValue = prevValue || 0;
      let newValue = currentValue;

      switch (operator) {
        case '+': newValue = currentValue + inputValue; break;
        case '-': newValue = currentValue - inputValue; break;
        case '*': newValue = currentValue * inputValue; break;
        case '/': newValue = currentValue / inputValue; break;
      }

      setDisplay(String(newValue));
      setPrevValue(newValue);
    }

    setWaitingForOperand(true);
    setOperator(nextOperator);
  };

  const handleEqual = () => {
    const inputValue = parseFloat(display);
    if (operator && prevValue !== null) {
      let newValue = prevValue;
      switch (operator) {
        case '+': newValue = prevValue + inputValue; break;
        case '-': newValue = prevValue - inputValue; break;
        case '*': newValue = prevValue * inputValue; break;
        case '/': newValue = prevValue / inputValue; break;
      }
      setDisplay(String(newValue));
      setPrevValue(null);
      setOperator(null);
      setWaitingForOperand(true);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-[#F0F0F0] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-72 p-4 flex flex-col gap-4" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b-2 border-black pb-2">
          <span className="font-bold text-xl">계산기</span>
          <button onClick={onClose} className="hover:text-red-500"><X size={24} /></button>
        </div>
        <div className="bg-white border-2 border-black p-3 text-right text-3xl font-mono mb-2 h-16 flex items-center justify-end overflow-hidden">
          {display}
        </div>
        <div className="grid grid-cols-4 gap-2">
          <button onClick={clear} className="col-span-2 bg-red-100 border-2 border-black p-3 font-bold hover:bg-red-200">AC</button>
          <button onClick={() => performOperation('/')} className="bg-orange-100 border-2 border-black p-3 font-bold hover:bg-orange-200">÷</button>
          <button onClick={() => performOperation('*')} className="bg-orange-100 border-2 border-black p-3 font-bold hover:bg-orange-200">×</button>
          
          {[7, 8, 9].map(n => <button key={n} onClick={() => inputDigit(String(n))} className="bg-white border-2 border-black p-3 font-bold hover:bg-gray-100">{n}</button>)}
          <button onClick={() => performOperation('-')} className="bg-orange-100 border-2 border-black p-3 font-bold hover:bg-orange-200">-</button>
          
          {[4, 5, 6].map(n => <button key={n} onClick={() => inputDigit(String(n))} className="bg-white border-2 border-black p-3 font-bold hover:bg-gray-100">{n}</button>)}
          <button onClick={() => performOperation('+')} className="bg-orange-100 border-2 border-black p-3 font-bold hover:bg-orange-200">+</button>
          
          {[1, 2, 3].map(n => <button key={n} onClick={() => inputDigit(String(n))} className="bg-white border-2 border-black p-3 font-bold hover:bg-gray-100">{n}</button>)}
          <button onClick={handleEqual} className="row-span-2 bg-blue-500 text-white border-2 border-black p-3 font-bold hover:bg-blue-600">=</button>
          
          <button onClick={() => inputDigit('0')} className="col-span-2 bg-white border-2 border-black p-3 font-bold hover:bg-gray-100">0</button>
          <button onClick={inputDot} className="bg-white border-2 border-black p-3 font-bold hover:bg-gray-100">.</button>
        </div>
      </div>
    </div>
  );
};

const PrintForm = ({ patient, type }: { patient: Patient, type: TabType }) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  const title = type === 'admission' ? '입원기록지' : 
                type === 'er' ? '응급기록지' :
                type === 'surgery' ? '수술처치기록지' :
                type === 'consult' ? '협진의뢰기록지' :
                type === 'discharge' ? '퇴원요약지' :
                type === 'other_record' ? '기타기록지' :
                type === 'other_hospital' ? '타병원기록지' :
                type === 'lab' ? '검사결과지' : 
                type === 'prescription' ? '처방기록지' : '';

  const currentSoapBlocks = 
    type === 'surgery' ? patient.surgerySoapBlocks :
    type === 'consult' ? patient.consultSoapBlocks :
    type === 'discharge' ? patient.dischargeSoapBlocks :
    type === 'other_record' ? patient.otherRecordSoapBlocks :
    type === 'admission' ? patient.soapBlocks :
    type === 'er' ? patient.erSoapBlocks :
    [];

  const currentNote = 
    type === 'surgery' ? patient.surgeryNote :
    type === 'consult' ? patient.consultNote :
    type === 'discharge' ? patient.dischargeNote :
    type === 'other_record' ? patient.otherRecordNote :
    type === 'other_hospital' ? patient.otherHospitalNote :
    type === 'admission' ? patient.soapNote :
    '';

  const currentExam = 
    type === 'surgery' ? patient.surgeryExam :
    type === 'consult' ? patient.consultExam :
    type === 'discharge' ? patient.dischargeExam :
    patient.exam;

  const renderPatientInfoTable = () => (
    <div className="flex border-2 border-black mb-4">
      <div className="w-1/2 border-r-2 border-black">
        <table className="w-full border-collapse">
          <tbody>
            {[
              ['차트번호', patient.chartNo],
              ['병실', patient.room],
              ['전문의', patient.doctor],
              ['성명', patient.name],
              ['나이', patient.age],
              ['거주지', patient.address],
              ['Dx', patient.dx],
              ['C.C', patient.cc],
              ['On Set', patient.onset],
              ['혈액형', patient.bloodType],
              ['진료과', patient.dept],
              ['생년월일', `${patient.dobYear}-${patient.dobMonth}-${patient.dobDay}`],
              ['성별', patient.gender === 'M' ? '남' : '여'],
            ].map(([label, value]) => (
              <tr key={label} className="border-b border-black last:border-0">
                <td className="w-24 p-1 border-r border-black bg-gray-100 text-[10px] font-bold">{label}</td>
                <td className="p-1 text-[10px]">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="w-1/2 flex flex-col">
        <div className="flex-1 grid grid-cols-2 border-b border-black">
          <div className="border-r border-black p-2 flex flex-col">
            <div className="font-bold text-[10px] border-b border-black mb-1 text-center">SUBJECTIVE</div>
            <div className="text-[10px] whitespace-pre-wrap flex-1">{currentSoapBlocks[0]?.s || ''}</div>
          </div>
          <div className="p-2 flex flex-col">
            <div className="font-bold text-[10px] border-b border-black mb-1 text-center">OBJECTIVE</div>
            <div className="text-[10px] whitespace-pre-wrap flex-1">{currentSoapBlocks[0]?.o || ''}</div>
          </div>
        </div>
        <div className="flex-1 grid grid-cols-2 border-b border-black">
          <div className="border-r border-black p-2 flex flex-col">
            <div className="font-bold text-[10px] border-b border-black mb-1 text-center">ASSESSMENT</div>
            <div className="text-[10px] whitespace-pre-wrap flex-1">{currentSoapBlocks[0]?.a || ''}</div>
          </div>
          <div className="p-2 flex flex-col">
            <div className="font-bold text-[10px] border-b border-black mb-1 text-center">PLAN</div>
            <div className="text-[10px] whitespace-pre-wrap flex-1">{currentSoapBlocks[0]?.p || ''}</div>
          </div>
        </div>
        <div className="p-2 flex flex-col flex-1">
          <div className="font-bold text-[10px] border-b border-black mb-1 text-center">EXAM</div>
          <div className="text-[10px] whitespace-pre-wrap flex-1">{currentExam}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="text-black font-sans p-4">
      <div className="text-center text-3xl font-black mb-8 underline underline-offset-8">{title}</div>
      
      <div className="flex justify-between items-end mb-2">
        <div className="font-bold text-lg">{(type === 'admission' || type === 'er' || type === 'surgery' || type === 'consult' || type === 'discharge' || type === 'other_record' || type === 'other_hospital') ? '경과기록지' : '환자기본정보'}</div>
        <div className="text-sm font-bold">작성일: ( {year} )년 ( {month} )월 ( {day} )일</div>
      </div>

      {renderPatientInfoTable()}

      {(type === 'admission' || type === 'er' || type === 'surgery' || type === 'consult' || type === 'discharge' || type === 'other_record' || type === 'other_hospital') && (
        <div className="mt-8">
          <div className="font-bold text-lg mb-2">Progress Note</div>
          <div className="border-2 border-black min-h-[500px] flex">
            <div className="w-1/2 border-r-2 border-black p-4">
              <div className="font-bold text-center border-b-2 border-black mb-4 pb-1">SOAP</div>
              <div className="text-sm whitespace-pre-wrap">
                {currentSoapBlocks.map((b, i) => (
                  <div key={i} className="mb-4 border-b border-gray-300 pb-2 last:border-0">
                    <div className="font-bold text-xs text-gray-500">Block {i+1}</div>
                    <div>S: {b.s}</div>
                    <div>O: {b.o}</div>
                    <div>A: {b.a}</div>
                    <div>P: {b.p}</div>
                  </div>
                ))}
                <div className="mt-4 pt-4 border-t-2 border-black italic">{currentNote}</div>
              </div>
            </div>
            <div className="w-1/2 p-4">
              <div className="font-bold text-center border-b-2 border-black mb-4 pb-1">EXAM</div>
              <div className="text-sm whitespace-pre-wrap">{currentExam}</div>
            </div>
          </div>
        </div>
      )}

      {type === 'lab' && (
        <div className="mt-8">
          <div className="font-bold text-lg mb-2">검사결과</div>
          <table className="w-full border-collapse border-2 border-black">
            <thead>
              <tr className="bg-gray-100">
                {['검사명/검사일시', 'CBC', 'UA', '감염', 'LFT', 'PFT', 'TUMOR', 'ELECT ROLYTES', 'CRP', 'ESR', '특수혈액'].map(h => (
                  <th key={h} className="border border-black p-1 text-[8px]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {patient.labRows.map((row, i) => (
                <tr key={i}>
                  {row.slice(0, 11).map((cell, j) => (
                    <td key={j} className="border border-black p-1 text-[8px] h-6 text-center">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {type === 'prescription' && (
        <div className="mt-8">
          <div className="font-bold text-lg mb-2">처방기록</div>
          <table className="w-full border-collapse border-2 border-black">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black p-1 text-[10px] w-24">처방일자/처방명</th>
                {PRESCRIPTION_SUB_TABS.map(t => (
                  <th key={t} className="border border-black p-1 text-[10px]">{t}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 10 }).map((_, i) => (
                <tr key={i}>
                  <td className="border border-black p-1 text-[10px] h-12"></td>
                  {PRESCRIPTION_SUB_TABS.map(t => (
                    <td key={t} className="border border-black p-1 text-[10px] h-12">
                      {i === 0 ? patient.prescriptionNotes[t] : ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 text-[10px] italic">*위 처방기록 기록 시 처방명은 담당자와 함께 기재할 것. 예) [작성자: R1 OOO]</div>
        </div>
      )}
    </div>
  );
};
