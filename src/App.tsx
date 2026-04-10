/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef, Component } from 'react';
import NursingDashboard from './components/NursingDashboard';
import NursingWriter from './components/NursingWriter';
import RichEditor from './components/RichEditor';

class ErrorBoundary extends Component<any, any> {
  state = { hasError: false };

  static getDerivedStateFromError(_: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen flex items-center justify-center bg-red-50 p-4 font-sans">
          <div className="bg-white border-4 border-red-600 p-8 shadow-[8px_8px_0_0_rgba(220,38,38,1)] max-w-md">
            <h1 className="text-2xl font-black text-red-600 mb-4 underline">SYSTEM ERROR</h1>
            <p className="font-bold mb-6">애플리케이션 렌더링 중 오류가 발생했습니다. 환자 데이터가 불완전하거나 예기치 않은 상태일 수 있습니다.</p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-red-600 text-white font-black py-3 border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              새로고침
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
import { 
  Check,
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
  ChevronRight,
  Upload,
  Edit,
  ChevronsLeft,
  ChevronsRight,
  RefreshCw,
  ExternalLink,
  AlertTriangle,
  UserX,
  ShieldAlert,
  ClipboardList,
  Pill,
  FlaskConical,
  Image as ImageIcon,
  Stethoscope,
  Users,
  Star,
  TrendingUp,
  History,
  Apple,
  Activity,
  Droplet,
  HeartHandshake,
  List,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  Info
} from 'lucide-react';
import { db } from './firebase';

import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc,
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

export type TabType = 'admission' | 'surgery' | 'consult' | 'discharge' | 'lab' | 'other_record' | 'other_hospital' | 'prescription' | 'er' | 'nursing' | 'doctor_prescription' | 'support_dept' | 'certificate' | 'none';
export type NursingSubTab = string;

export interface CertificateRecord {
  id: string;
  applyDate: string;
  patientName: string;
  type: string;
  purpose: string;
  applicant: string;
  status: '신청 중' | '발급 대기' | '발급 완료' | '반려/보안';
  expectedDate: string;
  issuedDate: string;
  content?: string;
}

export interface SoapBlock {
  s: string;
  o: string;
  a: string;
  p: string;
  lastModified?: {
    time: string;
    name: string;
  };
}

export interface NursingRecord {
  occurTime: string;
  occurPlace: string;
  eventType: string;
  action: string;
  reporter: string;
  patientChange: string;
  detail: string;
}

export interface NursingNarrativeNote {
  id: string;
  time: string;
  author: string;
  note: string;
}

export interface ImagingRecordItem {
  id: string;
  time: string;
  nameKo: string;
  nameEn: string;
  result: string;
  note: string;
  images: string[];
}

export interface ClinicalPathologyRecord {
  id: string;
  time: string;
  nameKo: string;
  nameEn: string;
}

export interface OtherRecordItem {
  id: string;
  memo: string;
  memoChecked?: boolean;
  cp: string;
  wardRoom: string;
  patientName: string;
  patientNo: string;
  genderAge: string;
  deptDoctorDx: string;
  otherRecord: string;
  color: string;
  cellColors?: {
    memo?: string;
    cp?: string;
    wardRoom?: string;
    patientName?: string;
    patientNo?: string;
    genderAge?: string;
    deptDoctorDx?: string;
    otherRecord?: string;
  };
}

export interface ConsultRecordItem {
  id: string;
  patientName: string;
  patientNo: string;
  ageGender: string;
  wardDoctor: string;
  consultReason: string;
  otherNote: string;
}

export interface Patient {
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
  onsetYear: string;
  onsetMonth: string;
  onsetDay: string;
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
  
  // Sidebar SOAP fields
  sidebarS: string;
  sidebarO: string;
  sidebarA: string;
  sidebarP: string;

  // Surgery Records
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
  surgerySoapBlocks: SoapBlock[];
  surgeryAnesthesiaDept: string;
  surgeryOpLabNote: string;
  surgerySpecialNote: string;

  // Consult Records
  consultNote: string;
  consultDept: string;
  consultProfessor: string;
  consultReason: string;
  consultSoap: string;
  consultExam: string;
  consultOtherNote: string;
  consultSoapBlocks: SoapBlock[];
  consultRecords: ConsultRecordItem[];

  // Discharge Records
  dischargeNote: string;
  dischargeReason: string;
  dischargeDiagnosis: string;
  dischargeExam: string;
  dischargeProgress: string;
  dischargeSurgeryStatus: string;
  dischargeStatus: string;
  dischargePlan: string;
  dischargeSoapBlocks: SoapBlock[];
  dischargeCC: string;
  dischargeAdmissionDate: string;
  dischargeDate: string;
  dischargeMainDx: string;
  dischargePostPlan: string;

  // Other Records
  otherRecordNote: string;
  otherGuardian: string;
  otherReason: string;
  otherSpecial: string;
  otherExtraNote: string;
  otherRecordSoapBlocks: SoapBlock[];
  otherRecordsList: OtherRecordItem[];
  otherRecordActiveSubTab: string;

  // Other Hospital Records
  otherHospitalNote: string;
  otherHospitalName: string;
  otherHospitalPrevWardDoctor: string;
  otherHospitalTransferReason: string;
  otherHospitalRecord: string;

  nursingCategory: string;
  nursingRecords: Record<string, NursingRecord>;
  nursingNarrativeNotes: NursingNarrativeNote[];
  nursingStructuredRecords: { date: string, time: string, type: string, content: string, medicationStatus: string, author: string }[];
  nursingPrescriptionNote: string;
  clinicalPathologyRecords: ClinicalPathologyRecord[];
  imagingRecordItems: ImagingRecordItem[];
  imagingImages: string[];
  // New Nursing Fields
  nursingSubTab: NursingSubTab;
  nursingNote: string;
  assignedNurse: string;
  assignedProfessor: string;
  ward: string;
  nursingSoapNote: string;
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
  medicationChecked: boolean[];
  treatmentData: Record<string, { date: string, time: string, status: string, note: string }>;
  nursingPlan: { diagnosis: string, plan: string, evaluation: string };
  specialRecord: { before: string, after: string };
  // Day & Diagnosis Management
  surgeryDate: string;
  mainDxCode: string;
  mainDxName: string;
  subDxCode: string;
  subDxName: string;
  
  // Discharge Nursing Record Fields
  dischargeType: string;
  dischargeFollowUpDate: string;
  dischargeMedication: string;
  dietEdu: boolean;
  exerciseEdu: boolean;
  medEdu: boolean;
  woundEdu: boolean;
  emergencyEdu: boolean;
  otherEdu: boolean;
  
  // Imaging Record
  imagingRecordImage: string;
  
  // Medication Records
  medicationRecords: any[];
  
  // Diet Records
  dietRecords: any[];
  
  // GCS
  gcsEye: string;
  gcsVerbal: string;
  gcsMotor: string;
  // History
  hpi: string;
  pmh: string;
  psh: string;
  medication: string;
  allergy: string;
  // New ER fields
  erOrder: string;
  erTreatmentRecord: string;
  erFinalResult: string;
  
  recentOrders: { date: string, type: string, content: string, status: string }[];
  supportRequests: { date: string, dept: string, content: string, status: string }[];
  reports: { type: string, date: string, location: string, details: string, actions: string }[];
  certificates: CertificateRecord[];

  // New Patient Assessment Fields
  admissionPath?: string;
  admissionMethod?: string;
  mentalStatus?: string;
  familyHistory?: string;
  familyHistoryNote?: string;
  drugAllergyStatus?: string;
  contrastAllergyStatus?: string;
  contrastAllergyNote?: string;
  domain?: string;
  class?: string;
  diagnosis?: string;
  target?: string;
  recorder?: string;
  infoProvider?: string;
  admissionTime?: string;
  admissionBP?: string;
  admissionBT?: string;
  admissionHR?: string;
  admissionRR?: string;
  admissionSpO2?: string;
  smokingStatus?: string;
  drinkingStatus?: string;
  religion?: string;
  education?: string;
  occupation?: string;
  maritalStatus?: string;
  livingArrangement?: string;
  admissionDiagnosis?: string;
  chiefComplaint?: string;
  presentIllness?: string;
  pastMedicalHistory?: string;
  pastSurgicalHistory?: string;
  allergies?: string;
  pressureUlcerRisk?: {
    sensoryPerception: number;
    moisture: number;
    activity: number;
    mobility: number;
    nutrition: number;
    friction: number;
    totalScore: number;
    riskLevel: string;
  };
  fallRisk?: {
    history: number;
    secondaryDiagnosis: number;
    ambulatoryAid: number;
    ivTherapy: number;
    gait: number;
    mentalStatus: number;
    totalScore: number;
    riskLevel: string;
  };
  nrsPain?: {
    score: number;
    location: string;
    character: string;
    frequency: string;
    factors: string;
  };
  dietNutrition?: {
    dietType: string;
    intakeAmount: string;
    fluidIntake: string;
    nutritionStatus: string;
    note: string;
  };
  currentDiet: string;
  isFasting: boolean;
  dietNote: string;
}

const PRESCRIPTION_SUB_TABS = ['검사 처방', '영상 검사', '약물 지시', '처치/시술', '진료 지시', '컨설트', '항암 처방', '기타'];

const DX_CODES = [
  { code: '', name: '' },
  // 제1장 특정 감염성 및 기생충성 질환 (A00-B99)
  { code: 'A00', name: '콜레라' },
  { code: 'A01', name: '장티푸스 및 파라티푸스' },
  { code: 'A02', name: '기타 살모넬라감염' },
  { code: 'A03', name: '이질' },
  { code: 'A04', name: '기타 세균성 장감염' },
  { code: 'A05', name: '기타 세균성 식중독' },
  { code: 'A06', name: '아메바증' },
  { code: 'A07', name: '기타 원충성 장질환' },
  { code: 'A08', name: '바이러스성 및 기타 명시된 장감염' },
  { code: 'A09', name: '감염성 및 상세불명 기원의 위장염 및 결장염' },
  { code: 'A15', name: '호흡기 결핵, 세균학적 및 조직학적으로 확인된 것' },
  { code: 'A16', name: '호흡기 결핵, 세균학적으로나 조직학적으로 확인되지 않은 것' },
  { code: 'A17', name: '신경계통의 결핵' },
  { code: 'A18', name: '기타 기관의 결핵' },
  { code: 'A19', name: '속립성 결핵' },
  { code: 'A30', name: '나병[한센병]' },
  { code: 'A50', name: '선천 매독' },
  { code: 'A51', name: '조기 매독' },
  { code: 'A52', name: '만기 매독' },
  { code: 'A53', name: '기타 및 상세불명의 매독' },
  { code: 'A54', name: '임균감염' },
  { code: 'A56', name: '기타 성행위로 전파되는 클라미디아질환' },
  { code: 'A60', name: '항문생식기의 헤르페스바이러스[단순포진]감염' },
  { code: 'A80', name: '급성 회백수염' },
  { code: 'B00', name: '헤르페스바이러스[단순포진] 감염' },
  { code: 'B01', name: '수두' },
  { code: 'B02', name: '대상포진' },
  { code: 'B15', name: '급성 A형간염' },
  { code: 'B16', name: '급성 B형간염' },
  { code: 'B17', name: '기타 급성 바이러스간염' },
  { code: 'B18', name: '만성 바이러스간염' },
  { code: 'B19', name: '상세불명의 바이러스간염' },
  { code: 'B20', name: '인체면역결핍바이러스[HIV]병' },
  { code: 'B35', name: '백선증' },
  { code: 'B36', name: '기타 표재성 진균증' },
  { code: 'B37', name: '칸디다증' },
  // 제2장 신생물 (C00-D48)
  { code: 'C00', name: '입술의 악성 신생물' },
  { code: 'C15', name: '식도의 악성 신생물' },
  { code: 'C16', name: '위의 악성 신생물' },
  { code: 'C18', name: '결장의 악성 신생물' },
  { code: 'C19', name: '직장구불결장 이행부의 악성 신생물' },
  { code: 'C20', name: '직장의 악성 신생물' },
  { code: 'C22', name: '간 및 간내 담관의 악성 신생물' },
  { code: 'C23', name: '담낭의 악성 신생물' },
  { code: 'C24', name: '기타 및 상세불명 담도의 악성 신생물' },
  { code: 'C25', name: '췌장의 악성 신생물' },
  { code: 'C32', name: '후두의 악성 신생물' },
  { code: 'C34', name: '기관지 및 폐의 악성 신생물' },
  { code: 'C43', name: '피부의 악성 흑색종' },
  { code: 'C44', name: '피부의 기타 악성 신생물' },
  { code: 'C50', name: '유방의 악성 신생물' },
  { code: 'C53', name: '자궁경부의 악성 신생물' },
  { code: 'C54', name: '자궁체부의 악성 신생물' },
  { code: 'C56', name: '난소의 악성 신생물' },
  { code: 'C61', name: '전립선의 악성 신생물' },
  { code: 'C64', name: '신장의 악성 신생물' },
  { code: 'C67', name: '방광의 악성 신생물' },
  { code: 'C73', name: '갑상선의 악성 신생물' },
  { code: 'C81', name: '호지킨 림프종' },
  { code: 'C82', name: '여포성 림프종' },
  { code: 'C83', name: '비여포성 림프종' },
  { code: 'C90', name: '다발성 골수종 및 악성 형질세포신생물' },
  { code: 'C91', name: '림프성 백혈병' },
  { code: 'C92', name: '골수성 백혈병' },
  { code: 'D00', name: '구강, 식도 및 위의 제자리암종' },
  { code: 'D01', name: '기타 및 상세불명의 소화기관의 제자리암종' },
  { code: 'D05', name: '유방의 제자리암종' },
  { code: 'D06', name: '자궁경부의 제자리암종' },
  { code: 'D12', name: '결장, 직장, 항문 및 항문관의 양성 신생물' },
  { code: 'D24', name: '유방의 양성 신생물' },
  { code: 'D25', name: '자궁의 평활근종' },
  { code: 'D36', name: '기타 및 상세불명 부위의 양성 신생물' },
  // 제3장 혈액 및 조혈기관의 질환 (D50-D89)
  { code: 'D50', name: '철결핍빈혈' },
  { code: 'D51', name: '비타민B12결핍빈혈' },
  { code: 'D52', name: '엽산결핍빈혈' },
  { code: 'D59', name: '후천성 용혈빈혈' },
  { code: 'D60', name: '후천성 순수적혈구무형성[적혈구모세포감소증]' },
  { code: 'D61', name: '기타 무형성빈혈' },
  { code: 'D62', name: '급성 출혈후 빈혈' },
  { code: 'D64', name: '기타 빈혈' },
  { code: 'D65', name: '파종성 혈관내응고[탈섬유소증후군]' },
  { code: 'D69', name: '자색반 및 기타 출혈성 병태' },
  // 제4장 내분비, 영양 및 대사 질환 (E00-E90)
  { code: 'E03', name: '기타 갑상선기능저하증' },
  { code: 'E04', name: '기타 비독성 고이터' },
  { code: 'E05', name: '갑상선독증[갑상선기능항진증]' },
  { code: 'E06', name: '갑상선염' },
  { code: 'E10', name: '1형 당뇨병' },
  { code: 'E11', name: '2형 당뇨병' },
  { code: 'E14', name: '상세불명의 당뇨병' },
  { code: 'E66', name: '비만' },
  { code: 'E78', name: '지단백대사장애 및 기타 지질증' },
  { code: 'E79', name: '퓨린 및 피리미딘 대사장애' },
  { code: 'E89', name: '처치후 내분비 및 대사 장애, 달리 분류되지 않은 것' },
  // 제5장 정신 및 행동 장애 (F00-F99)
  { code: 'F00', name: '알츠하이머병에서의 치매' },
  { code: 'F01', name: '혈관성 치매' },
  { code: 'F03', name: '상세불명의 치매' },
  { code: 'F10', name: '알코올 사용에 의한 정신 및 행동 장애' },
  { code: 'F20', name: '조현병' },
  { code: 'F30', name: '조증에피소드' },
  { code: 'F31', name: '양극성 정동장애' },
  { code: 'F32', name: '우울에피소드' },
  { code: 'F40', name: '공포성 불안장애' },
  { code: 'F41', name: '기타 불안장애' },
  { code: 'F42', name: '강박장애' },
  { code: 'F43', name: '심한 스트레스에 대한 반응 및 적응장애' },
  { code: 'F51', name: '비기질성 수면장애' },
  // 제6장 신경계통의 질환 (G00-G99)
  { code: 'G20', name: '파킨슨병' },
  { code: 'G30', name: '알츠하이머병' },
  { code: 'G40', name: '뇌전증' },
  { code: 'G43', name: '편두통' },
  { code: 'G44', name: '기타 두통증후군' },
  { code: 'G45', name: '일과성 대뇌허혈발작 및 관련 증후군' },
  { code: 'G47', name: '수면장애' },
  { code: 'G51', name: '안면신경장애' },
  { code: 'G81', name: '편마비' },
  { code: 'G82', name: '대마비 및 사지마비' },
  // 제7장 눈 및 눈부속기의 질환 (H00-H59)
  { code: 'H00', name: '맥립종 및 콩다래끼' },
  { code: 'H01', name: '눈꺼풀의 기타 염증' },
  { code: 'H10', name: '결막염' },
  { code: 'H11', name: '결막의 기타 장애' },
  { code: 'H16', name: '각막염' },
  { code: 'H25', name: '노년백내장' },
  { code: 'H26', name: '기타 백내장' },
  { code: 'H40', name: '녹내장' },
  { code: 'H52', name: '굴절 및 조절의 장애' },
  // 제8장 귀 및 꼭지돌기의 질환 (H60-H95)
  { code: 'H60', name: '외이도염' },
  { code: 'H65', name: '비화농성 중이염' },
  { code: 'H66', name: '화농성 및 상세불명의 중이염' },
  { code: 'H81', name: '전정기능의 장애' },
  { code: 'H90', name: '전음성 및 감각신경성 청력소실' },
  { code: 'H91', name: '기타 청력소실' },
  // 제9장 순환계통의 질환 (I00-I99)
  { code: 'I10', name: '본태성(원발성) 고혈압' },
  { code: 'I20', name: '협심증' },
  { code: 'I21', name: '급성 심근경색증' },
  { code: 'I25', name: '만성 허혈심장병' },
  { code: 'I48', name: '심방세동 및 조동' },
  { code: 'I50', name: '심부전' },
  { code: 'I60', name: '거미막하출혈' },
  { code: 'I61', name: '뇌내출혈' },
  { code: 'I63', name: '뇌경색증' },
  { code: 'I69', name: '뇌혈관질환의 후유증' },
  { code: 'I80', name: '정맥염 및 혈전정맥염' },
  { code: 'I83', name: '하지의 정맥류' },
  { code: 'I84', name: '치핵' },
  // 제10장 호흡계통의 질환 (J00-J99)
  { code: 'J00', name: '급성 비인두염[감기]' },
  { code: 'J01', name: '급성 부비동염' },
  { code: 'J02', name: '급성 인두염' },
  { code: 'J03', name: '급성 편도염' },
  { code: 'J06', name: '다발성 및 상세불명 부위의 급성 상기도감염' },
  { code: 'J09', name: '인플루엔자' },
  { code: 'J20', name: '급성 기관지염' },
  { code: 'J30', name: '혈관운동성 및 앨러지성 비염' },
  { code: 'J32', name: '만성 부비동염' },
  { code: 'J44', name: '기타 만성 폐쇄성 폐질환' },
  { code: 'J45', name: '천식' },
  // 제11장 소화계통의 질환 (K00-K93)
  { code: 'K02', name: '치아우식증' },
  { code: 'K04', name: '치수 및 치근단주위조직의 질환' },
  { code: 'K05', name: '치은염 및 치주질환' },
  { code: 'K21', name: '위식도역류병' },
  { code: 'K25', name: '위궤양' },
  { code: 'K29', name: '위염 및 십이지장염' },
  { code: 'K35', name: '급성 충수염' },
  { code: 'K52', name: '기타 비감염성 위장염 및 결장염' },
  { code: 'K58', name: '과민대장증후군' },
  { code: 'K59', name: '기타 기능성 장장애' },
  { code: 'K70', name: '알코올성 간질환' },
  { code: 'K76', name: '간의 기타 질환' },
  { code: 'K80', name: '담석증' },
  // 제12장 피부 및 피하조직의 질환 (L00-L99)
  { code: 'L01', name: '농가진' },
  { code: 'L02', name: '피부의 농양, 종기 및 큰종기' },
  { code: 'L03', name: '연조직염' },
  { code: 'L20', name: '아토피피부염' },
  { code: 'L23', name: '앨러지성 접촉피부염' },
  { code: 'L30', name: '기타 피부염' },
  { code: 'L50', name: '두드러기' },
  { code: 'L89', name: '욕창궤양 및 압박부위' },
  // 제13장 근골격계통 및 결합조직의 질환 (M00-M99)
  { code: 'M05', name: '혈청검사양성 류마티스관절염' },
  { code: 'M15', name: '다발관절증' },
  { code: 'M17', name: '무릎관절증' },
  { code: 'M48', name: '기타 척추병증' },
  { code: 'M50', name: '경추간판장애' },
  { code: 'M51', name: '기타 추간판장애' },
  { code: 'M54', name: '등통증' },
  { code: 'M62', name: '근육의 기타 장애' },
  { code: 'M79', name: '달리 분류되지 않은 기타 연조직장애' },
  { code: 'M81', name: '병적 골절이 없는 골다공증' },
  // 제14장 비뇨생식계통의 질환 (N00-N99)
  { code: 'N00', name: '급성 신염증후군' },
  { code: 'N18', name: '만성 신장병' },
  { code: 'N20', name: '신장 및 요관의 결석' },
  { code: 'N30', name: '방광염' },
  { code: 'N39', name: '비뇨기계통의 기타 장애' },
  { code: 'N40', name: '전립선증식증' },
  { code: 'N73', name: '기타 여성골반염증질환' },
  { code: 'N76', name: '질 및 외음부의 기타 염증' },
  { code: 'N84', name: '여성생식관의 폴립' },
  { code: 'N92', name: '과다, 빈발 및 불규칙 월경' },
  // 제15장 임신, 출산 및 산후기 (O00-O99)
  { code: 'O20', name: '초기임신 중 출혈' },
  { code: 'O21', name: '임신 중 과도한 구토' },
  { code: 'O80', name: '단일자연분만' },
  { code: 'O82', name: '제왕절개에 의한 단일분만' },
  // 제16장 출생전후기에 기원한 특정 병태 (P00-P96)
  { code: 'P07', name: '짧은 임신기간 및 저출생체중과 관련된 장애' },
  { code: 'P22', name: '신생아의 호흡곤란' },
  { code: 'P59', name: '기타 및 상세불명 원인의 신생아황달' },
  // 제17장 선천기형, 변형 및 염색체이상 (Q00-Q99)
  { code: 'Q21', name: '심장중격의 선천기형' },
  { code: 'Q90', name: '다운증후군' },
  // 제18장 달리 분류되지 않은 증상, 징후 (R00-R99)
  { code: 'R05', name: '기침' },
  { code: 'R07', name: '목구멍 및 가슴의 통증' },
  { code: 'R10', name: '복부 및 골반 통증' },
  { code: 'R11', name: '구역 및 구토' },
  { code: 'R42', name: '어지럼증 및 어지럼' },
  { code: 'R50', name: '기타 및 상세불명의 원인의 열' },
  { code: 'R51', name: '두통' },
  { code: 'R55', name: '실신 및 허탈' },
  // 제19장 손상, 중독 및 외인에 의한 특정 기타 결과 (S00-T98)
  { code: 'S06', name: '두개내손상' },
  { code: 'S13', name: '목의 관절 및 인대의 탈구, 염좌 및 긴장' },
  { code: 'S22', name: '갈비뼈, 복장뼈 및 등뼈의 골절' },
  { code: 'S33', name: '요추 및 골반의 관절 및 인대의 탈구, 염좌 및 긴장' },
  { code: 'S52', name: '아래팔의 골절' },
  { code: 'S62', name: '손목 및 손 부위의 골절' },
  { code: 'S82', name: '아랫다리의 골절, 발목 포함' },
  { code: 'S92', name: '발의 골절, 발목 제외' },
  { code: 'T07', name: '상세불명의 다발손상' },
  { code: 'T14', name: '상세불명 신체부위의 손상' },
  { code: 'T30', name: '상세불명 신체부위의 화상 및 부식' },
  // 제20장 질병이환 및 사망의 외인 (V01-Y98)
  { code: 'W00', name: '얼음 및 눈과 관련된 동일면상에서의 낙상' },
  { code: 'W01', name: '미끄러짐, 걸림 및 헛디딤에 의한 동일면상에서의 낙상' },
  { code: 'X99', name: '날카로운 물체에 의한 가해' },
  // 제21장 건강상태 및 보건서비스 접촉에 영향을 주는 요인 (Z00-Z99)
  { code: 'Z00', name: '불만 또는 진단명이 없는 사람의 일반검사 및 조사' },
  { code: 'Z01', name: '불만 또는 진단명이 없는 사람의 기타 특수검사 및 조사' },
  { code: 'Z30', name: '피임관리' },
  { code: 'Z71', name: '달리 분류되지 않은 보건서비스와 접촉한 사람' }
];

const calculateDays = (dateStr: string, isHOD: boolean = true) => {
  if (!dateStr) return '-';
  try {
    const targetDate = new Date(dateStr);
    targetDate.setHours(0, 0, 0, 0);
    const now = new Date();
    // Convert to KST (UTC+9)
    const kstNow = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + (9 * 60 * 60 * 1000));
    kstNow.setHours(0, 0, 0, 0);
    
    const diffTime = kstNow.getTime() - targetDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (isHOD) {
      return diffDays >= 0 ? (diffDays + 1).toString() : '-';
    } else {
      return diffDays >= 0 ? diffDays.toString() : '-';
    }
  } catch (e) {
    return '-';
  }
};

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
  onsetYear: '2024',
  onsetMonth: '01',
  onsetDay: '01',
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
  sidebarS: '',
  sidebarO: '',
  sidebarA: '',
  sidebarP: '',
  surgeryNote: '',
  surgeryAttending: '',
  surgeryAnesthesia: '',
  surgeryAssistant: '',
  surgeryName: '',
  surgeryVital: '',
  admissionPath: '',
  admissionMethod: '',
  admissionTime: '',
  infoProvider: '',
  recorder: '',
  admissionBP: '',
  admissionBT: '',
  admissionHR: '',
  admissionRR: '',
  admissionSpO2: '',
  smokingStatus: '',
  drinkingStatus: '',
  religion: '',
  education: '',
  occupation: '',
  maritalStatus: '',
  livingArrangement: '',
  admissionDiagnosis: '',
  mentalStatus: '',
  familyHistory: '',
  familyHistoryNote: '',
  drugAllergyStatus: '',
  contrastAllergyStatus: '',
  contrastAllergyNote: '',
  domain: '',
  class: '',
  diagnosis: '',
  pressureUlcerRisk: {
    sensoryPerception: 0,
    moisture: 0,
    activity: 0,
    mobility: 0,
    nutrition: 0,
    friction: 0,
    totalScore: 0,
    riskLevel: '위험 없음'
  },
  fallRisk: {
    history: 0,
    secondaryDiagnosis: 0,
    ambulatoryAid: 0,
    ivTherapy: 0,
    gait: 0,
    mentalStatus: 0,
    totalScore: 0,
    riskLevel: '저위험군'
  },
  nrsPain: {
    score: 0,
    location: '',
    character: '',
    frequency: '',
    factors: ''
  },
  dietNutrition: {
    dietType: '',
    intakeAmount: '',
    fluidIntake: '',
    nutritionStatus: '',
    note: ''
  },
  medicationRecords: [],
  dietEdu: false,
  exerciseEdu: false,
  medEdu: false,
  woundEdu: false,
  emergencyEdu: false,
  otherEdu: false,
  dischargeType: '자택',
  dischargeFollowUpDate: '',
  dischargeMedication: '',
  dietRecords: [],
  currentDiet: '일반식',
  isFasting: false,
  dietNote: '',
  surgeryLabNote: '',
  surgeryType: '',
  surgerySoap: '',
  surgeryExam: '',
  surgerySoapBlocks: [],
  surgeryAnesthesiaDept: '',
  surgeryOpLabNote: '',
  surgerySpecialNote: '',
  consultNote: '',
  consultDept: '',
  consultProfessor: '',
  consultReason: '',
  consultSoap: '',
  consultExam: '',
  consultOtherNote: '',
  consultSoapBlocks: [],
  consultRecords: [],
  dischargeNote: '',
  dischargeReason: '',
  dischargeDiagnosis: '',
  dischargeExam: '',
  dischargeProgress: '',
  dischargeSurgeryStatus: '',
  dischargeStatus: '',
  dischargePlan: '',
  dischargeSoapBlocks: [],
  dischargeCC: '',
  dischargeAdmissionDate: '',
  dischargeDate: '',
  dischargeMainDx: '',
  dischargePostPlan: '',
  imagingRecordImage: '',
  otherRecordNote: '',
  otherGuardian: '',
  otherReason: '',
  otherSpecial: '',
  otherExtraNote: '',
  otherRecordSoapBlocks: [],
  otherRecordsList: [],
  otherRecordActiveSubTab: 'Set',
  otherHospitalNote: '',
  otherHospitalName: '',
  otherHospitalPrevWardDoctor: '',
  otherHospitalTransferReason: '',
  otherHospitalRecord: '',
  nursingCategory: '낙상기록지',
  nursingRecords: {},
  nursingNarrativeNotes: [],
  nursingStructuredRecords: [],
  nursingPrescriptionNote: '',
  clinicalPathologyRecords: [
    { id: '1', time: '09:00 AM', nameKo: '경피적혈액산소포화도측정[1일당]', nameEn: 'Percutaneous Blood O2 Saturation Monitoring' }
  ],
  imagingRecordItems: [],
  imagingImages: [],
  nursingSubTab: '간호 기록지',
  nursingNote: '',
  assignedNurse: '',
  assignedProfessor: '',
  ward: '',
  nursingSoapNote: '',
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
  medicationChecked: [false],
  treatmentData: {
    '드레싱': { date: '', time: '', status: '', note: '' },
    '카테터': { date: '', time: '', status: '', note: '' },
    '산소치료': { date: '', time: '', status: '', note: '' },
    '검사': { date: '', time: '', status: '', note: '' },
  },
  nursingPlan: { diagnosis: '', plan: '', evaluation: '' },
  specialRecord: { before: '', after: '' },
  surgeryDate: '',
  mainDxCode: '',
  mainDxName: '',
  subDxCode: '',
  subDxName: '',
  gcsEye: '',
  gcsVerbal: '',
  gcsMotor: '',
  hpi: '',
  pmh: '',
  psh: '',
  medication: '',
  allergy: '',
  erOrder: '',
  erTreatmentRecord: '',
  erFinalResult: '',
  recentOrders: [],
  supportRequests: [],
  reports: [],
  certificates: []
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
  'huchu': { pw: 'haesol123', name: '순후추' },
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
  <div className="relative flex flex-col items-center font-gulim">
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
  <div className="flex items-center gap-4">
    <span className={`${labelWidth} font-bold text-sm text-gray-700 shrink-0`}>{label}</span>
    <input 
      type="text" 
      value={value || ''} 
      onChange={(e) => onChange?.(e.target.value)}
      readOnly={readOnly}
      spellCheck={false}
      className="flex-1 border-b border-black px-1 py-0.5 text-sm focus:outline-none"
    />
  </div>
);

const UnderlineInputField = ({ label, value, onChange, unit, labelWidth = "w-24" }: { label: string, value: string, onChange: (v: string) => void, unit?: string, labelWidth?: string }) => (
  <div className="flex items-center gap-2 text-[14px]">
    <span className={`${labelWidth} font-bold shrink-0`}>{label}</span>
    <input 
      type="text" 
      value={value || ''} 
      onChange={(e) => onChange(e.target.value)} 
      className="flex-1 border-b border-black focus:outline-none h-8 bg-transparent"
    />
    {unit && <span className="text-[12px] font-bold shrink-0 w-14">{unit}</span>}
  </div>
);

const SectionHeader = ({ label }: { label: string }) => (
  <div className="bg-[#A6A6A6] text-black px-4 py-2 rounded-md font-bold block w-full text-[16px] mb-4">
    {label}
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

const RECORD_COLORS = [
  { color: '#FFFFFF', label: '#기본 정보' },
  { color: '#FFB6C1', label: '#필요 정보' },
  { color: '#FF9966', label: '#기타 정보' },
  { color: '#D2B48C', label: '#상태 정보' },
  { color: '#FFFF99', label: '#주요 정보' },
  { color: '#9ACD32', label: '#진행 완료' },
  { color: '#87CEFA', label: '#진행 중' },
];

// --- Main App ---

const DEPARTMENTS = [
  '전체',
  '101병동',
  'OB101병동',
  'OB산후병동',
  'PACU',
  'ICU',
  'PED101병동',
  'EM응급의학과',
  'GS일반외과',
  'OS정형외과',
  'CS흉부외과',
  'OB산부인과',
  'GY산부인과',
  'PED소아청소년과',
  'PES소아외과',
  'AN마취통증의학과',
  'RD영상의학과',
  'NS신경외과',
  'PS성형외과',
  'GI소화기내과',
  'TS외상외과'
];

const BRADEN_SCALE = {
  sensoryPerception: [
    { score: 1, label: '완전 제한', description: '통증 자극에 반응 없음' },
    { score: 2, label: '매우 제한', description: '통증 자극에만 반응' },
    { score: 3, label: '약간 제한', description: '질문에 반응하나 불편감 표현 못함' },
    { score: 4, label: '제한 없음', description: '질문에 반응하고 의사소통 가능' }
  ],
  moisture: [
    { score: 1, label: '지속적 젖음', description: '피부가 항상 축축함' },
    { score: 2, label: '매우 젖음', description: '하루 1회 이상 홑이불 교환' },
    { score: 3, label: '약간 젖음', description: '하루 1회 정도 홑이불 교환' },
    { score: 4, label: '드물게 젖음', description: '피부가 보통 건조함' }
  ],
  activity: [
    { score: 1, label: '침상 상태', description: '침대에 누워만 있음' },
    { score: 2, label: '의자 상태', description: '걷지 못하고 의자에 앉음' },
    { score: 3, label: '약간 보행', description: '도움 받아 짧은 거리 보행' },
    { score: 4, label: '자주 보행', description: '하루 2회 이상 병실 밖 보행' }
  ],
  mobility: [
    { score: 1, label: '완전 부동', description: '스스로 움직이지 못함' },
    { score: 2, label: '매우 제한', description: '자주 미세한 움직임' },
    { score: 3, label: '약간 제한', description: '자주 큰 움직임' },
    { score: 4, label: '제한 없음', description: '스스로 자유롭게 움직임' }
  ],
  nutrition: [
    { score: 1, label: '매우 불량', description: '제공된 식사의 1/3 미만 섭취' },
    { score: 2, label: '부족', description: '제공된 식사의 1/2 정도 섭취' },
    { score: 3, label: '적당', description: '제공된 식사의 1/2 이상 섭취' },
    { score: 4, label: '양호', description: '대부분의 식사 섭취' }
  ],
  friction: [
    { score: 1, label: '문제 있음', description: '움직일 때 상당한 도움 필요' },
    { score: 2, label: '잠재적 문제', description: '약간의 도움 필요' },
    { score: 3, label: '문제 없음', description: '스스로 움직임' }
  ]
};

const MORSE_FALL_SCALE = {
  history: [
    { score: 0, label: '없음' },
    { score: 25, label: '있음' }
  ],
  secondaryDiagnosis: [
    { score: 0, label: '없음' },
    { score: 15, label: '있음' }
  ],
  ambulatoryAid: [
    { score: 0, label: '침상안정/휠체어/간호사 도움' },
    { score: 15, label: '목발/지팡이/보행기' },
    { score: 30, label: '가구 잡고 보행' }
  ],
  ivTherapy: [
    { score: 0, label: '없음' },
    { score: 20, label: '있음' }
  ],
  gait: [
    { score: 0, label: '정상/침상안정/부동' },
    { score: 10, label: '약함' },
    { score: 20, label: '장애 있음' }
  ],
  mentalStatus: [
    { score: 0, label: '자신의 능력에 대해 잘 앎' },
    { score: 15, label: '자신의 능력을 과대평가하거나 잊음' }
  ]
};

export default function App() {
  const [activeTopMenu, setActiveTopMenu] = useState<string>('E.M.R');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginId, setLoginId] = useState('');
  const [loginPw, setLoginPw] = useState('');
  const [autoLogin, setAutoLogin] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(THEME_COLORS[2]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('none');
  const [prescriptionSubTab, setPrescriptionSubTab] = useState<string>(PRESCRIPTION_SUB_TABS[0]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [patientTab, setPatientTab] = useState<'all' | 'er'>('all');
  const [filterByAll, setFilterByAll] = useState(true);
  const [filterByName, setFilterByName] = useState(true);
  const [filterByDept, setFilterByDept] = useState(false);
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('전체');
  const [globalOtherRecords, setGlobalOtherRecords] = useState<OtherRecordItem[]>([]);
  const [formData, setFormData] = useState<Patient>(INITIAL_FORM_DATA);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, patientId: string } | null>(null);
  const [showPrintMenu, setShowPrintMenu] = useState(false);
  const [modalTab, setModalTab] = useState('admission_record');
  const [showCalculator, setShowCalculator] = useState(false);
  const [printType, setPrintType] = useState<TabType | null>(null);
  const lastSyncedIdRef = useRef<string | null>(null);

  const [nursingIsWriting, setNursingIsWriting] = useState(false);
  const [activeOrderForm, setActiveOrderForm] = useState<string | null>(null);
  const [orderInputs, setOrderInputs] = useState<Record<string, string>>({});
  const [activeSupportRequestForm, setActiveSupportRequestForm] = useState<string | null>(null);
  const [supportInputs, setSupportInputs] = useState<Record<string, string>>({});
  const [activeReportType, setActiveReportType] = useState<'fall' | 'absconding' | 'pressure-ulcer' | null>(null);
  const [newNursingRecord, setNewNursingRecord] = useState({ type: '', content: '', medicationStatus: '' });
  const [newMedicationRecord, setNewMedicationRecord] = useState({ dateTime: '', name: '', dosage: '', route: '', frequency: '', status: '투약완료' });
  const [newDietRecord, setNewDietRecord] = useState({ date: '', type: '아침', dietName: '', amount: 'Full', note: '' });
  const [newPathologyRecord, setNewPathologyRecord] = useState({ time: '', nameKo: '', nameEn: '' });
  const [newReport, setNewReport] = useState({ type: '낙상', reportDate: '', author: '', date: '', location: '', details: '', actions: '', content: '' });
  const [nursingSidebarOpen, setNursingSidebarOpen] = useState<Record<string, boolean>>({
    'patient-assessment': true,
    'pain-assessment': false
  });
  const [patientListWidth, setPatientListWidth] = useState(320);
  const [rightSidebarWidth, setRightSidebarWidth] = useState(384);
  const [rightSidebarTopHeight, setRightSidebarTopHeight] = useState(400);
  const [isPatientListCollapsed, setIsPatientListCollapsed] = useState(false);
  const [expandedWards, setExpandedWards] = useState<Record<string, boolean>>({
    'ICU': true,
    '101병동': true,
    'PED101병동': true,
    'OB101병동': true,
    'OB산후병동': true,
    'PACU': true,
    'EM응급실': true,
    '퇴원완료': true
  });
  const [isResizingLeft, setIsResizingLeft] = useState(false);
  const [isResizingRight, setIsResizingRight] = useState(false);
  const [isResizingRightVertical, setIsResizingRightVertical] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingLeft) {
        const newWidth = e.clientX;
        if (newWidth > 50 && newWidth < 600) {
          setPatientListWidth(newWidth);
        }
      }
      if (isResizingRight) {
        const newWidth = window.innerWidth - e.clientX;
        if (newWidth > 50 && newWidth < 800) {
          setRightSidebarWidth(newWidth);
        }
      }
      if (isResizingRightVertical) {
        const sidebar = document.getElementById('right-sidebar');
        if (sidebar) {
          const rect = sidebar.getBoundingClientRect();
          const newHeight = e.clientY - rect.top;
          if (newHeight > 100 && newHeight < rect.height - 100) {
            setRightSidebarTopHeight(newHeight);
          }
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizingLeft(false);
      setIsResizingRight(false);
      setIsResizingRightVertical(false);
    };

    if (isResizingLeft || isResizingRight) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingLeft, isResizingRight]);

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
          recentOrders: typeof data.recentOrders === 'string' ? JSON.parse(data.recentOrders) : (data.recentOrders || []),
          supportRequests: typeof data.supportRequests === 'string' ? JSON.parse(data.supportRequests) : (data.supportRequests || []),
          reports: typeof data.reports === 'string' ? JSON.parse(data.reports) : (data.reports || []),
          certificates: typeof data.certificates === 'string' ? JSON.parse(data.certificates) : (data.certificates || []),
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
        setFormData({ ...INITIAL_FORM_DATA, ...p });
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
        discharge: (p.dischargeNote || p.dischargeReason || p.dischargeDiagnosis || p.dischargeCC || p.dischargeMainDx || p.dischargeDate || p.dischargeProgress || p.dischargeStatus || p.dischargePlan || p.dischargeSoapBlocks.length > 0) ? 1 : 0,
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
        discharge: acc.discharge + ((p.dischargeNote || p.dischargeReason || p.dischargeDiagnosis || p.dischargeCC || p.dischargeMainDx || p.dischargeDate || p.dischargeProgress || p.dischargeStatus || p.dischargePlan || p.dischargeSoapBlocks.length > 0) ? 1 : 0),
        lab: acc.lab + (p.labRows.some(r => r.some(c => c !== '')) ? 1 : 0),
        other_record: acc.other_record + (p.otherRecordNote || p.otherReason || p.otherRecordSoapBlocks.length > 0 ? 1 : 0),
        other_hospital: acc.other_hospital + (p.otherHospitalNote ? 1 : 0),
        prescription: acc.prescription + (Object.values(p.prescriptionNotes).some(v => v !== '') ? 1 : 0),
        nursing: acc.nursing + ((p.nursingNote || p.nursingSoapBlocks.length > 0 || p.nursingExam || p.medicationRows.some(r => r.some(c => c !== '')) || Object.values(p.nursingRecords).length > 0) ? 1 : 0)
      }), { er: 0, admission: 0, surgery: 0, consult: 0, discharge: 0, lab: 0, other_record: 0, other_hospital: 0, prescription: 0, nursing: 0 });
    }
  }, [selectedPatientId, patients]);

  const filteredPatients = useMemo(() => 
    patients.filter(p => {
      if (selectedDeptFilter !== '전체') {
        const pDept = p.dept.toLowerCase().trim();
        const sDept = selectedDeptFilter.toLowerCase();
        if (!pDept) return false;
        
        const codeMatch = sDept.match(/^[a-z]+/);
        const nameMatch = sDept.match(/[가-힣]+/);
        
        const code = codeMatch ? codeMatch[0] : '';
        const name = nameMatch ? nameMatch[0] : '';
        
        const matchesCode = code && pDept.includes(code);
        const matchesName = name && pDept.includes(name);
        
        if (!matchesCode && !matchesName && !sDept.includes(pDept) && !pDept.includes(sDept)) {
          return false;
        }
      }

      if (patientTab === 'er' && !p.chartNo.startsWith('ER')) return false;

      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      
      if (filterByAll) {
         return p.name.toLowerCase().includes(query) || 
                p.chartNo.toLowerCase().includes(query) || 
                p.dept.toLowerCase().includes(query) || 
                p.room.toLowerCase().includes(query);
      }
      
      const matchName = filterByName && p.name.toLowerCase().includes(query);
      const matchDept = filterByDept && p.dept.toLowerCase().includes(query);
      
      if (!filterByName && !filterByDept) return false;
      
      return matchName || matchDept;
    }), 
    [searchQuery, patients, filterByAll, filterByName, filterByDept, selectedDeptFilter, patientTab]
  );

  const handleSave = async (overrideData?: Partial<Patient>) => {
    if (isSaving) return;
    const dataToSave = { ...formData, ...overrideData };
    if (!dataToSave.name && !dataToSave.chartNo) {
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
        // Remove any existing timestamps (including those with or without leading newline)
        const cleaned = text.replace(/\n?\[저장됨: [^\]]*\]/g, "").trim();
        return cleaned ? cleaned + timestamp : "";
      };

      const newPrescriptionNotes = { ...dataToSave.prescriptionNotes };
      Object.keys(newPrescriptionNotes).forEach(key => {
        newPrescriptionNotes[key] = appendTimestamp(newPrescriptionNotes[key]);
      });

      const patientData = { 
        ...dataToSave, 
        id,
        labRows: JSON.stringify(dataToSave.labRows),
        regimenRows: JSON.stringify(dataToSave.regimenRows),
        imagingPhotos: JSON.stringify(dataToSave.imagingPhotos || []),
        diagnosticPhotos: JSON.stringify(dataToSave.diagnosticPhotos || []),
        soapNote: appendTimestamp(dataToSave.soapNote),
        soapBlocks: JSON.stringify(dataToSave.soapBlocks),
        exam: appendTimestamp(dataToSave.exam),
        erLabNote: appendTimestamp(dataToSave.erLabNote),
        erSoapNote: appendTimestamp(dataToSave.erSoapNote),
        erSoapBlocks: JSON.stringify(dataToSave.erSoapBlocks),
        erExam: appendTimestamp(dataToSave.erExam),
        imagingNote: appendTimestamp(dataToSave.imagingNote),
        diagnosticNote: appendTimestamp(dataToSave.diagnosticNote),
        prescriptionNotes: newPrescriptionNotes,
        surgerySoapBlocks: JSON.stringify(dataToSave.surgerySoapBlocks),
        consultSoapBlocks: JSON.stringify(dataToSave.consultSoapBlocks),
        dischargeSoapBlocks: JSON.stringify(dataToSave.dischargeSoapBlocks),
        otherRecordSoapBlocks: JSON.stringify(dataToSave.otherRecordSoapBlocks),
        nursingRecords: JSON.stringify(dataToSave.nursingRecords || {}),
        nursingSoapBlocks: JSON.stringify(dataToSave.nursingSoapBlocks || []),
        medicationRows: JSON.stringify(dataToSave.medicationRows || []),
        treatmentData: JSON.stringify(dataToSave.treatmentData || {}),
        nursingPlan: JSON.stringify(dataToSave.nursingPlan || {}),
        specialRecord: JSON.stringify(dataToSave.specialRecord || {}),
        recentOrders: JSON.stringify(dataToSave.recentOrders || []),
        supportRequests: JSON.stringify(dataToSave.supportRequests || []),
        reports: JSON.stringify(dataToSave.reports || []),
        certificates: JSON.stringify(dataToSave.certificates || []),
        nursingNote: appendTimestamp(dataToSave.nursingNote),
        nursingExam: appendTimestamp(dataToSave.nursingExam),
        sidebarS: appendTimestamp(dataToSave.sidebarS),
        sidebarO: appendTimestamp(dataToSave.sidebarO),
        sidebarA: appendTimestamp(dataToSave.sidebarA),
        sidebarP: appendTimestamp(dataToSave.sidebarP),
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
        sidebarS: patientData.sidebarS,
        sidebarO: patientData.sidebarO,
        sidebarA: patientData.sidebarA,
        sidebarP: patientData.sidebarP,
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
        specialRecord: { ...formData.specialRecord },
        certificates: [...formData.certificates]
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
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Automatic Ward Assignment Logic
      if (field === 'room') {
        const roomVal = value as string;
        if (roomVal.startsWith('ICU')) {
          newData.ward = 'ICU';
        } else if (roomVal === '10O병동' || roomVal === '101병동') { // Handling potential typo
          if (newData.dept === 'OB' || newData.dept === 'OB산부인과') {
            newData.ward = '산과병동';
          }
        }
      } else if (field === 'dept') {
        const deptVal = value as string;
        if ((newData.room === '10O병동' || newData.room === '101병동') && (deptVal === 'OB' || deptVal === 'OB산부인과')) {
          newData.ward = '산과병동';
        }
      }
      
      return newData;
    });
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
      newBlocks[index] = { 
        ...newBlocks[index], 
        [field]: value,
        lastModified: {
          time: new Date().toLocaleString('ko-KR', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          name: ACCOUNTS[loginId]?.name || loginId
        }
      };
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
      const newBlock = { ...newBlocks[index] };
      newBlock.lastModified = {
        time: new Date().toLocaleString('ko-KR', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        name: ACCOUNTS[loginId]?.name || loginId
      };
      newBlocks.splice(index + 1, 0, newBlock);
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

  const [certTab, setCertTab] = useState<'all' | 'issued' | 'archived' | 'rejected'>('all');
  const [certSearchQuery, setCertSearchQuery] = useState('');
  const [certStatusFilter, setCertStatusFilter] = useState('전체');
  const [certTypeFilter, setCertTypeFilter] = useState('전체');
  const [certStartDate, setCertStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0]);
  const [certEndDate, setCertEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [showCertApplyModal, setShowCertApplyModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplateType, setEditingTemplateType] = useState<string | null>(null);
  const [previewTemplateType, setPreviewTemplateType] = useState<string | null>(null);
  const [templateContents, setTemplateContents] = useState<Record<string, string>>({
    '진단서': '진단서 표준 서식 내용입니다...\n\n환자성명: {{patient_name}}\n등록번호: {{chart_no}}\n진단명: {{diagnosis}}\n발급일: {{apply_date}}\n상세내용: {{content}}\n담당의사: {{doctor_name}}',
    '입퇴원확인서': '입퇴원 사실 확인서...\n\n환자성명: {{patient_name}}\n등록번호: {{chart_no}}\n입원일: {{admission_date}}\n퇴원일: {{discharge_date}}\n\n위와 같이 입퇴원 사실을 확인합니다.',
    '수술확인서': '수술 및 처치 확인서...\n\n환자성명: {{patient_name}}\n등록번호: {{chart_no}}\n수술명: {{surgery_name}}\n수술일: {{surgery_date}}\n\n위와 같이 수술 및 처치 사실을 확인합니다.',
    '소견서': '의사 소견서...\n\n환자성명: {{patient_name}}\n등록번호: {{chart_no}}\n소견: {{content}}\n\n담당의사: {{doctor_name}}',
    '통원확인서': '통원 치료 확인서...\n\n환자성명: {{patient_name}}\n등록번호: {{chart_no}}\n통원일: {{visit_date}}\n\n위와 같이 통원 치료 사실을 확인합니다.'
  });
  const [isActiveWindowOn, setIsActiveWindowOn] = useState(false);
  const [showActiveWindowMenu, setShowActiveWindowMenu] = useState(false);
  const [newCertData, setNewCertData] = useState({
    patientId: '',
    type: '진단서',
    purpose: '보험청구',
    applicant: '본인'
  });
  const [editingCert, setEditingCert] = useState<CertificateRecord | null>(null);
  const [showCertDetailModal, setShowCertDetailModal] = useState(false);

  const allCertificates = useMemo(() => {
    return patients.flatMap(p => (p.certificates || []).map(c => ({ ...c, patientId: p.id, patientName: p.name })));
  }, [patients]);

  const filteredCertificates = useMemo(() => {
    return allCertificates.filter(c => {
      const matchesTab = certTab === 'all' || 
        (certTab === 'issued' && c.status === '발급 완료') ||
        (certTab === 'rejected' && c.status === '반려/보안');
      
      const matchesSearch = c.patientName.includes(certSearchQuery) || c.id.includes(certSearchQuery);
      const matchesStatus = certStatusFilter === '전체' || c.status === certStatusFilter;
      const matchesType = certTypeFilter === '전체' || c.type === certTypeFilter;
      
      const certDate = c.applyDate.split(' ')[0];
      const matchesDate = (!certStartDate || certDate >= certStartDate) && (!certEndDate || certDate <= certEndDate);

      return matchesTab && matchesSearch && matchesStatus && matchesType && matchesDate;
    }).sort((a, b) => b.applyDate.localeCompare(a.applyDate));
  }, [allCertificates, certTab, certSearchQuery, certStatusFilter, certTypeFilter, certStartDate, certEndDate]);

  const certStats = useMemo(() => {
    const stats = {
      applying: 0,
      waiting: 0,
      issued: 0,
      rejected: 0,
      total: allCertificates.length
    };
    allCertificates.forEach(c => {
      if (c.status === '신청 중') stats.applying++;
      else if (c.status === '발급 대기') stats.waiting++;
      else if (c.status === '발급 완료') stats.issued++;
      else if (c.status === '반려/보안') stats.rejected++;
    });
    return stats;
  }, [allCertificates]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'APPLY_CERT') {
        const { patientId, type, purpose, applicant } = event.data.data;
        applyCertificateFromPopup(patientId, type, purpose, applicant);
      } else if (event.data.type === 'SAVE_CERT_CONTENT') {
        const { certId, content } = event.data.data;
        saveCertContentFromPopup(certId, content);
      } else if (event.data.type === 'SAVE_TEMPLATE') {
        const { type, content } = event.data.data;
        setTemplateContents(prev => ({ ...prev, [type]: content }));
        alert('템플릿이 저장되었습니다.');
      } else if (event.data.type === 'OPEN_POPUP') {
        const { type, data } = event.data.data;
        handleOpenPopup(type, data);
      } else if (event.data.type === 'SET_THEME') {
        const theme = THEME_COLORS.find(t => t.name === event.data.data);
        if (theme) setCurrentTheme(theme);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [patients, templateContents]);

  const saveCertContentFromPopup = async (certId: string, content: string) => {
    const patient = patients.find(p => (p.certificates || []).some(c => c.id === certId));
    if (!patient) return;

    const updatedCerts = (patient.certificates || []).map(c => {
      if (c.id === certId) return { ...c, content };
      return c;
    });

    try {
      await updateDoc(doc(db, 'patients', patient.id), {
        certificates: JSON.stringify(updatedCerts)
      });
      alert('상세 내용이 저장되었습니다.');
    } catch (error) {
      console.error('Error saving certificate content:', error);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  const applyCertificateFromPopup = async (patientId: string, type: string, purpose: string, applicant: string) => {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;

    const newCert: CertificateRecord = {
      id: `C${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      applyDate: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }).slice(0, 16),
      patientName: patient.name,
      type: type as any,
      purpose: purpose,
      applicant: applicant,
      status: '신청 중',
      expectedDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      issuedDate: '-'
    };

    const updatedCerts = [...(patient.certificates || []), newCert];
    
    try {
      await updateDoc(doc(db, 'patients', patient.id), {
        certificates: JSON.stringify(updatedCerts)
      });
      alert('제증명이 신청되었습니다.');
    } catch (error) {
      console.error('Error applying certificate:', error);
      alert('신청 중 오류가 발생했습니다.');
    }
  };

  const handleOpenPopup = (type: string, data?: any) => {
    if (!isActiveWindowOn) {
      if (type === 'calculator') setShowCalculator(true);
      if (type === 'certApply') setShowCertApplyModal(true);
      if (type === 'templateManagement') setShowTemplateModal(true);
      if (type === 'certDetail') {
        setEditingCert(data);
        setShowCertDetailModal(true);
      }
      return;
    }

    const popup = window.open('', type, 'width=600,height=800');
    if (!popup) {
      alert('팝업 차단이 설정되어 있을 수 있습니다. 팝업을 허용해 주세요.');
      return;
    }

    if (type === 'calculator') {
      popup.document.write(`
        <html>
          <head>
            <title>계산기</title>
            <style>
              body { font-family: sans-serif; display: flex; flex-direction: column; height: 100vh; margin: 0; background: #f0f0f0; padding: 20px; box-sizing: border-box; }
              .display { background: white; border: 4px solid black; padding: 20px; text-align: right; font-size: 2em; margin-bottom: 20px; font-family: monospace; height: 60px; display: flex; items-center; justify-content: flex-end; overflow: hidden; }
              .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; flex: 1; }
              button { border: 2px solid black; background: white; font-weight: bold; font-size: 1.2em; cursor: pointer; }
              button:hover { background: #eee; }
              .op { background: #ffe0b2; }
              .eq { background: #2196f3; color: white; grid-row: span 2; }
              .ac { background: #ffcdd2; grid-column: span 2; }
              .zero { grid-column: span 2; }
            </style>
          </head>
          <body>
            <div class="display" id="display">0</div>
            <div class="grid">
              <button class="ac" onclick="clearDisplay()">AC</button>
              <button class="op" onclick="setOp('/')">/</button>
              <button class="op" onclick="setOp('*')">*</button>
              <button onclick="addDigit('7')">7</button>
              <button onclick="addDigit('8')">8</button>
              <button onclick="addDigit('9')">9</button>
              <button class="op" onclick="setOp('-')">-</button>
              <button onclick="addDigit('4')">4</button>
              <button onclick="addDigit('5')">5</button>
              <button onclick="addDigit('6')">6</button>
              <button class="op" onclick="setOp('+')">+</button>
              <button onclick="addDigit('1')">1</button>
              <button onclick="addDigit('2')">2</button>
              <button onclick="addDigit('3')">3</button>
              <button class="eq" onclick="calculate()">=</button>
              <button class="zero" onclick="addDigit('0')">0</button>
              <button onclick="addDot()">.</button>
            </div>
            <script>
              let display = '0';
              let prev = null;
              let op = null;
              let reset = false;
              const el = document.getElementById('display');
              function update() { el.innerText = display; }
              function addDigit(d) { if(display === '0' || reset) { display = d; reset = false; } else { display += d; } update(); }
              function addDot() { if(!display.includes('.')) { display += '.'; update(); } }
              function clearDisplay() { display = '0'; prev = null; op = null; reset = false; update(); }
              function setOp(o) { prev = parseFloat(display); op = o; reset = true; }
              function calculate() {
                if(prev === null || op === null) return;
                let curr = parseFloat(display);
                let res = 0;
                if(op === '+') res = prev + curr;
                if(op === '-') res = prev - curr;
                if(op === '*') res = prev * curr;
                if(op === '/') res = prev / curr;
                display = String(res);
                prev = null;
                op = null;
                reset = true;
                update();
              }
            </script>
          </body>
        </html>
      `);
      popup.document.close();
    } else if (type === 'certApply') {
      const patientOptions = patients.map(p => `<option value="${p.id}">${p.name} (${p.chartNo})</option>`).join('');
      popup.document.write(`
        <html>
          <head>
            <title>제증명 신청</title>
            <style>
              body { font-family: sans-serif; padding: 20px; background: #f0f0f0; }
              .card { background: white; border: 4px solid black; padding: 20px; box-shadow: 8px 8px 0 0 rgba(0,0,0,1); }
              h2 { border-bottom: 4px solid black; padding-bottom: 10px; margin-top: 0; }
              .form-group { margin-bottom: 15px; }
              label { display: block; font-weight: bold; margin-bottom: 5px; }
              select, input { width: 100%; border: 2px solid black; padding: 10px; font-weight: bold; box-sizing: border-box; }
              button { width: 100%; background: #2196f3; color: white; border: 2px solid black; padding: 15px; font-weight: bold; cursor: pointer; margin-top: 20px; }
              button:hover { background: #1976d2; }
            </style>
          </head>
          <body>
            <div class="card">
              <h2>제증명 신청</h2>
              <div class="form-group">
                <label>환자 선택</label>
                <select id="patientId">${patientOptions}</select>
              </div>
              <div class="form-group">
                <label>제증명 종류</label>
                <select id="type">
                  <option>진단서</option>
                  <option>입퇴원확인서</option>
                  <option>수술확인서</option>
                  <option>소견서</option>
                  <option>통원확인서</option>
                  <option>제증명 통합 사본</option>
                </select>
              </div>
              <div class="form-group">
                <label>용도</label>
                <input type="text" id="purpose" value="보험청구">
              </div>
              <div class="form-group">
                <label>요청자</label>
                <input type="text" id="applicant" value="본인">
              </div>
              <button onclick="submit()">신청하기</button>
            </div>
            <script>
              function submit() {
                const data = {
                  patientId: document.getElementById('patientId').value,
                  type: document.getElementById('type').value,
                  purpose: document.getElementById('purpose').value,
                  applicant: document.getElementById('applicant').value
                };
                window.opener.postMessage({ type: 'APPLY_CERT', data }, '*');
                window.close();
              }

              document.addEventListener('keydown', (e) => {
                if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
                  const el = document.activeElement;
                  if (el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement) {
                    e.preventDefault();
                    const start = el.selectionStart;
                    const end = el.selectionEnd;
                    const text = el.value;
                    const selected = text.substring(start, end);
                    const before = text.substring(0, start);
                    const after = text.substring(end);
                    const isBold = selected.startsWith('<b>') && selected.endsWith('</b>');
                    let newText, newStart, newEnd;
                    if (isBold) {
                      const unwrapped = selected.substring(3, selected.length - 4);
                      newText = before + unwrapped + after;
                      newStart = start;
                      newEnd = start + unwrapped.length;
                    } else {
                      const wrapped = '<b>' + selected + '</b>';
                      newText = before + wrapped + after;
                      newStart = start;
                      newEnd = start + wrapped.length;
                    }
                    el.value = newText;
                    el.dispatchEvent(new Event('input', { bubbles: true }));
                    setTimeout(() => el.setSelectionRange(newStart, newEnd), 0);
                  }
                }
              });
            </script>
          </body>
        </html>
      `);
      popup.document.close();
    } else if (type === 'certDetail') {
      const cert = data as CertificateRecord;
      popup.document.write(`
        <html>
          <head>
            <title>${cert.type} 상세</title>
            <style>
              body { font-family: sans-serif; padding: 20px; background: #f0f0f0; }
              .card { background: white; border: 4px solid black; padding: 20px; box-shadow: 8px 8px 0 0 rgba(0,0,0,1); }
              h2 { border-bottom: 4px solid black; padding-bottom: 10px; margin-top: 0; }
              .info { margin-bottom: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
              .label { color: #666; font-size: 0.8em; font-weight: bold; }
              .value { font-weight: bold; }
              #content { width: 100%; border: 2px solid black; padding: 10px; font-weight: bold; min-height: 300px; box-sizing: border-box; background: white; overflow-y: auto; }
              button { width: 100%; background: black; color: white; border: 2px solid black; padding: 15px; font-weight: bold; cursor: pointer; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="card">
              <h2>${cert.type} 상세</h2>
              <div class="info">
                <div><div class="label">환자명</div><div class="value">${cert.patientName}</div></div>
                <div><div class="label">신청일</div><div class="value">${cert.applyDate}</div></div>
                <div><div class="label">용도</div><div class="value">${cert.purpose}</div></div>
                <div><div class="label">상태</div><div class="value">${cert.status}</div></div>
              </div>
              <div id="content" contenteditable="true" placeholder="상세 내용을 입력하세요...">${cert.content || ''}</div>
              <button onclick="save()">저장하기</button>
            </div>
            <script>
              function save() {
                const content = document.getElementById('content').innerHTML;
                window.opener.postMessage({ type: 'SAVE_CERT_CONTENT', data: { certId: '${cert.id}', content } }, '*');
                window.close();
              }

              document.addEventListener('keydown', (e) => {
                if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
                  e.preventDefault();
                  document.execCommand('bold', false, null);
                }
              });
            </script>
          </body>
        </html>
      `);
      popup.document.close();
    } else if (type === 'templateManagement') {
      const templateList = Object.entries(templateContents).map(([t, c]) => `
        <div style="border: 2px solid black; padding: 15px; margin-bottom: 10px; background: white;">
          <div style="font-weight: black; margin-bottom: 10px;">${t}</div>
          <div id="tpl-${t}" contenteditable="true" style="width: 100%; height: 150px; border: 1px solid #ccc; padding: 5px; background: white; overflow-y: auto;">${c}</div>
          <button onclick="saveTemplate('${t}')" style="margin-top: 10px; width: auto; padding: 5px 15px; background: #333; color: white; border: none; cursor: pointer;">저장</button>
        </div>
      `).join('');

      popup.document.write(`
        <html>
          <head>
            <title>템플릿 관리</title>
            <style>
              body { font-family: sans-serif; padding: 20px; background: #f0f0f0; }
              h2 { border-bottom: 4px solid black; padding-bottom: 10px; }
            </style>
          </head>
          <body>
            <h2>문서 템플릿 관리</h2>
            ${templateList}
            <script>
              function saveTemplate(type) {
                const content = document.getElementById('tpl-' + type).innerHTML;
                window.opener.postMessage({ type: 'SAVE_TEMPLATE', data: { type, content } }, '*');
              }

              document.addEventListener('keydown', (e) => {
                if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
                  e.preventDefault();
                  document.execCommand('bold', false, null);
                }
              });
            </script>
          </body>
        </html>
      `);
      popup.document.close();
    } else if (type === 'settings') {
      popup.document.write(`
        <html>
          <head>
            <title>환경설정</title>
            <style>
              body { font-family: sans-serif; padding: 20px; background: #f0f0f0; }
              .card { background: white; border: 2px solid black; padding: 20px; box-shadow: 4px 4px 0 0 rgba(0,0,0,1); }
              h2 { border-bottom: 4px solid black; padding-bottom: 10px; }
              .theme-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
              .theme-btn { border: 2px solid black; padding: 10px; cursor: pointer; font-weight: bold; text-align: center; }
            </style>
          </head>
          <body>
            <div class="card">
              <h2>환경설정 (Popup Mode)</h2>
              <p>테마 선택</p>
              <div class="theme-grid">
                <div class="theme-btn" style="background: #000080; color: white;" onclick="window.opener.postMessage({type: 'SET_THEME', data: 'Blue'}, '*')">Blue</div>
                <div class="theme-btn" style="background: #800000; color: white;" onclick="window.opener.postMessage({type: 'SET_THEME', data: 'Red'}, '*')">Red</div>
                <div class="theme-btn" style="background: #004d40; color: white;" onclick="window.opener.postMessage({type: 'SET_THEME', data: 'Green'}, '*')">Green</div>
              </div>
            </div>
          </body>
        </html>
      `);
      popup.document.close();
    }
  };

  const handleApplyCertificate = async () => {
    if (!newCertData.patientId) {
      alert('환자를 선택해주세요.');
      return;
    }

    const patient = patients.find(p => p.id === newCertData.patientId);
    if (!patient) return;

    const newCert: CertificateRecord = {
      id: `C${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      applyDate: new Date().toLocaleString('ko-KR'),
      patientName: patient.name,
      type: newCertData.type,
      purpose: newCertData.purpose,
      applicant: newCertData.applicant,
      status: '신청 중',
      expectedDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      issuedDate: '-'
    };

    const updatedCerts = [...(patient.certificates || []), newCert];
    
    try {
      await updateDoc(doc(db, 'patients', patient.id), {
        certificates: JSON.stringify(updatedCerts)
      });
      setShowCertApplyModal(false);
      setNewCertData({
        patientId: '',
        type: '진단서',
        purpose: '보험청구',
        applicant: '본인'
      });
      alert('제증명이 신청되었습니다.');
    } catch (error) {
      console.error('Error applying certificate:', error);
      alert('신청 중 오류가 발생했습니다.');
    }
  };

  const handleUpdateCertStatus = async (certId: string, patientId: string, newStatus: CertificateRecord['status']) => {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;

    const updatedCerts = (patient.certificates || []).map(c => {
      if (c.id === certId) {
        return { 
          ...c, 
          status: newStatus,
          issuedDate: newStatus === '발급 완료' ? new Date().toISOString().slice(0, 10) : '-'
        };
      }
      return c;
    });

    try {
      await updateDoc(doc(db, 'patients', patient.id), {
        certificates: JSON.stringify(updatedCerts)
      });
    } catch (error) {
      console.error('Error updating certificate status:', error);
    }
  };

  const handleSaveCertContent = async () => {
    if (!editingCert) return;
    
    // Find patient for this cert
    const patient = patients.find(p => (p.certificates || []).some(c => c.id === editingCert.id));
    if (!patient) return;

    const updatedCerts = (patient.certificates || []).map(c => {
      if (c.id === editingCert.id) {
        return editingCert;
      }
      return c;
    });

    try {
      await updateDoc(doc(db, 'patients', patient.id), {
        certificates: JSON.stringify(updatedCerts)
      });
      setShowCertDetailModal(false);
      setEditingCert(null);
      alert('상세 내용이 저장되었습니다.');
    } catch (error) {
      console.error('Error saving certificate content:', error);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  const handlePrintCertificate = (cert: CertificateRecord) => {
    if (cert.status !== '발급 완료') {
      alert('발급 완료된 문서만 출력 가능합니다.');
      return;
    }
    // Simulate printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${cert.type} - ${cert.patientName}</title>
            <style>
              body { font-family: 'Gulim', sans-serif; padding: 40px; line-height: 1.6; }
              .header { text-align: center; border-bottom: 2px solid black; padding-bottom: 20px; margin-bottom: 30px; }
              .title { font-size: 24px; font-weight: bold; }
              .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px; }
              .info-item { font-size: 14px; }
              .label { font-weight: bold; color: #666; margin-right: 10px; }
              .content-box { border: 1px solid #ccc; padding: 20px; min-h: 400px; margin-bottom: 40px; white-space: pre-wrap; }
              .footer { text-align: center; margin-top: 50px; }
              .stamp { margin-top: 20px; font-weight: bold; font-size: 18px; }
              @media print { .no-print { display: none; } }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="title">${cert.type}</div>
            </div>
            <div class="info-grid">
              <div class="info-item"><span class="label">환자성명:</span> ${cert.patientName}</div>
              <div class="info-item"><span class="label">발급번호:</span> ${cert.id}</div>
              <div class="info-item"><span class="label">신청일자:</span> ${cert.applyDate}</div>
              <div class="info-item"><span class="label">발급일자:</span> ${cert.issuedDate}</div>
              <div class="info-item"><span class="label">용도:</span> ${cert.purpose}</div>
            </div>
            <div class="content-box">
              ${cert.content || '상세 내용이 없습니다.'}
            </div>
            <div class="footer">
              <p>위와 같이 증명함</p>
              <p>${new Date().toLocaleDateString()}</p>
              <div class="stamp">TOTAL 간호 병원장 (인)</div>
              <button class="no-print" onclick="window.print()" style="margin-top: 20px; padding: 10px 20px; cursor: pointer;">인쇄하기</button>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const renderTemplateModal = () => {
    const templates = [
      { type: '진단서', title: '표준 진단서 서식', lastUpdated: '2024-04-01' },
      { type: '입퇴원확인서', title: '입퇴원 사실 확인서', lastUpdated: '2024-03-15' },
      { type: '수술확인서', title: '수술 및 처치 확인서', lastUpdated: '2024-02-20' },
      { type: '소견서', title: '의사 소견서 (보험제출용)', lastUpdated: '2024-04-05' },
      { type: '통원확인서', title: '통원 치료 확인서', lastUpdated: '2024-01-10' },
    ];

    if (editingTemplateType) {
      return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[130] p-4">
          <div className="bg-white border-4 border-black p-6 w-full max-w-2xl shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center mb-6 border-b-4 border-black pb-2">
              <h2 className="text-xl font-black">{editingTemplateType} 템플릿 편집</h2>
              <button onClick={() => setEditingTemplateType(null)}><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4">
              <RichEditor 
                value={templateContents[editingTemplateType] || ''}
                onChange={(val) => setTemplateContents({ ...templateContents, [editingTemplateType]: val })}
                placeholder="템플릿 내용을 입력하세요..."
                height="400px"
              />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button 
                onClick={() => setEditingTemplateType(null)}
                className="px-8 py-2 border-2 border-black font-black hover:bg-gray-100 transition-all"
              >
                취소
              </button>
              <button 
                onClick={() => {
                  alert('템플릿이 저장되었습니다.');
                  setEditingTemplateType(null);
                }}
                className="px-8 py-2 bg-black text-white border-2 border-black font-black hover:bg-gray-800 transition-all"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (previewTemplateType) {
      const content = templateContents[previewTemplateType] || '';
      const previewContent = content
        .replace(/\{\{patient_name\}\}/g, '홍길동')
        .replace(/\{\{chart_no\}\}/g, 'P12345')
        .replace(/\{\{diagnosis\}\}/g, '상세불명의 급성 위염')
        .replace(/\{\{apply_date\}\}/g, new Date().toLocaleDateString())
        .replace(/\{\{content\}\}/g, '환자는 복통 및 구토 증상으로 내원하여 정밀 검사 결과 위염으로 진단됨.')
        .replace(/\{\{doctor_name\}\}/g, '김의사');

      return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[130] p-4">
          <div className="bg-white border-4 border-black p-6 w-full max-w-2xl shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center mb-6 border-b-4 border-black pb-2">
              <h2 className="text-xl font-black">{previewTemplateType} 미리보기</h2>
              <button onClick={() => setPreviewTemplateType(null)}><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto bg-gray-50 p-8 border-2 border-black whitespace-pre-wrap font-['Gulim','굴림',sans-serif]">
              {previewContent}
            </div>
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setPreviewTemplateType(null)}
                className="px-8 py-2 bg-black text-white border-2 border-black font-black hover:bg-gray-800 transition-all"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[120] p-4">
        <div className="bg-white border-4 border-black p-6 w-full max-w-3xl shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col max-h-[80vh]">
          <div className="flex justify-between items-center mb-6 border-b-4 border-black pb-2">
            <h2 className="text-xl font-black flex items-center gap-2">
              <Settings size={24} /> 문서 템플릿 관리
            </h2>
            <button onClick={() => setShowTemplateModal(false)}><X size={24} /></button>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            <p className="text-sm font-bold text-gray-500 mb-4">각 증명서별 출력 템플릿을 설정하고 관리합니다. 설정된 템플릿은 출력 시 자동으로 적용됩니다.</p>
            
            <div className="grid grid-cols-1 gap-3">
              {templates.map((tpl, idx) => (
                <div key={idx} className="border-2 border-black p-4 flex items-center justify-between hover:bg-gray-50 transition-all">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 font-black rounded">{tpl.type}</span>
                      <span className="text-[10px] font-bold text-gray-400">최종 수정: {tpl.lastUpdated}</span>
                    </div>
                    <div className="font-black text-gray-900">{tpl.title}</div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setEditingTemplateType(tpl.type)}
                      className="px-3 py-1 border-2 border-black text-xs font-black hover:bg-gray-100"
                    >
                      편집
                    </button>
                    <button 
                      onClick={() => setPreviewTemplateType(tpl.type)}
                      className="px-3 py-1 bg-black text-white border-2 border-black text-xs font-black hover:bg-gray-800"
                    >
                      미리보기
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg">
              <div className="flex items-center gap-2 mb-2 text-yellow-700 font-black">
                <Info size={18} /> 템플릿 변수 안내
              </div>
              <div className="text-xs text-yellow-800 font-bold space-y-1">
                <p>템플릿 작성 시 아래 변수를 사용하여 환자 정보를 자동으로 채울 수 있습니다:</p>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <code className="bg-white/50 p-1 rounded">{"{{patient_name}}"}</code>
                  <code className="bg-white/50 p-1 rounded">{"{{chart_no}}"}</code>
                  <code className="bg-white/50 p-1 rounded">{"{{diagnosis}}"}</code>
                  <code className="bg-white/50 p-1 rounded">{"{{apply_date}}"}</code>
                  <code className="bg-white/50 p-1 rounded">{"{{content}}"}</code>
                  <code className="bg-white/50 p-1 rounded">{"{{doctor_name}}"}</code>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button 
              onClick={() => setShowTemplateModal(false)}
              className="px-8 py-2 bg-black text-white border-2 border-black font-black hover:bg-gray-800 transition-all"
            >
              확인
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderCertificateManagement = () => {
    const stats = [
      { label: '신청 중', count: certStats.applying, icon: <Clock size={24} className="text-blue-500" />, bgColor: 'bg-blue-50' },
      { label: '발급 대기', count: certStats.waiting, icon: <FileText size={24} className="text-indigo-500" />, bgColor: 'bg-indigo-50' },
      { label: '발급 완료', count: certStats.issued, icon: <CheckCircle size={24} className="text-green-500" />, bgColor: 'bg-green-50' },
      { label: '반려/보안', count: certStats.rejected, icon: <AlertCircle size={24} className="text-red-500" />, bgColor: 'bg-red-50' },
    ];

    const mockCerts: CertificateRecord[] = [
      { id: 'C240424-001', applyDate: '2024-04-24 10:30', patientName: '홍길동', type: '진단서', purpose: '보험청구', applicant: '본인', status: '신청 중', expectedDate: '2024-04-26', issuedDate: '-' },
      { id: 'C240424-002', applyDate: '2024-04-24 09:15', patientName: '홍길동', type: '입퇴원확인서', purpose: '회사제출', applicant: '본인', status: '발급 대기', expectedDate: '2024-04-25', issuedDate: '-' },
      { id: 'C240423-015', applyDate: '2024-04-23 16:40', patientName: '홍길동', type: '수술확인서', purpose: '보험청구', applicant: '보호자(홍영희)', status: '발급 완료', expectedDate: '2024-04-24', issuedDate: '2024-04-24' },
      { id: 'C240423-014', applyDate: '2024-04-23 11:20', patientName: '홍길동', type: '소견서', purpose: '회사 복귀', applicant: '본인', status: '반려/보안', expectedDate: '-', issuedDate: '-' },
      { id: 'C240422-030', applyDate: '2024-04-22 15:50', patientName: '홍길동', type: '제증명 통합 사본', purpose: '개인 보관', applicant: '본인', status: '발급 완료', expectedDate: '2024-04-23', issuedDate: '2024-04-23' },
    ];

    return (
      <div className="flex-1 flex flex-col bg-[#F4F7FA] p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900 mb-1">제증명 관리</h1>
            <p className="text-sm text-gray-500 font-medium text-blue-600">환자가 요청한 각종 증명서를 신청, 발급, 조회 및 관리합니다.</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => handleOpenPopup('certApply')}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold shadow-sm hover:bg-blue-700 transition-all"
            >
              <Plus size={18} /> 제증명 신청
            </button>
            <button 
              onClick={() => handleOpenPopup('templateManagement')}
              className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-bold shadow-sm hover:bg-gray-50 transition-all"
            >
              <Settings size={18} /> 문서 템플릿 관리
            </button>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4 mb-8">
          {stats.map((stat, idx) => (
            <div key={idx} className={`${stat.bgColor} p-4 rounded-xl border border-white shadow-sm flex items-center gap-4`}>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                {stat.icon}
              </div>
              <div>
                <div className="text-xs font-bold text-gray-500 mb-1">{stat.label}</div>
                <div className="text-xl font-black text-gray-900">{stat.count} <span className="text-sm font-bold text-gray-400">건</span></div>
              </div>
            </div>
          ))}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <FileText size={24} className="text-blue-600" />
              </div>
              <div>
                <div className="text-xs font-bold text-gray-500 mb-1">총 발급</div>
                <div className="text-xl font-black text-blue-600">{certStats.total} <span className="text-sm font-bold text-gray-400">건</span></div>
              </div>
            </div>
            <div className="text-[10px] font-bold text-gray-400 text-right">(2024년 기준)</div>
          </div>
        </div>

        <div className="flex gap-6 flex-1 min-h-0">
          {/* Main List Area */}
          <div className="flex-1 flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex border-b border-gray-200 bg-gray-50">
              {['신청 목록', '발급 완료', '보관 문서', '반려/보안'].map((tab, idx) => (
                <button 
                  key={idx}
                  onClick={() => setCertTab(['all', 'issued', 'archived', 'rejected'][idx] as any)}
                  className={`px-8 py-3 text-sm font-bold transition-all border-r border-gray-200 ${
                    (idx === 0 && certTab === 'all') || 
                    (idx === 1 && certTab === 'issued') || 
                    (idx === 2 && certTab === 'archived') || 
                    (idx === 3 && certTab === 'rejected')
                    ? 'bg-white text-blue-600 border-t-2 border-t-blue-600' 
                    : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Filters */}
            <div className="p-4 border-b border-gray-100 flex flex-wrap items-center gap-4 bg-white">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500">기간</span>
                <div className="flex items-center gap-1 border border-gray-300 rounded px-2 py-1 bg-white">
                  <input 
                    type="date" 
                    value={certStartDate} 
                    onChange={(e) => setCertStartDate(e.target.value)}
                    className="text-xs outline-none font-bold bg-transparent" 
                  />
                  <span className="text-gray-400">~</span>
                  <input 
                    type="date" 
                    value={certEndDate} 
                    onChange={(e) => setCertEndDate(e.target.value)}
                    className="text-xs outline-none font-bold bg-transparent" 
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500">상태</span>
                <select 
                  value={certStatusFilter}
                  onChange={(e) => setCertStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-xs font-bold outline-none"
                >
                  <option>전체</option>
                  <option>신청 중</option>
                  <option>발급 대기</option>
                  <option>발급 완료</option>
                  <option>반려/보안</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500">제증명 종류</span>
                <select 
                  value={certTypeFilter}
                  onChange={(e) => setCertTypeFilter(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-xs font-bold outline-none"
                >
                  <option>전체</option>
                  <option>진단서</option>
                  <option>입퇴원확인서</option>
                  <option>수술확인서</option>
                  <option>소견서</option>
                  <option>통원확인서</option>
                </select>
              </div>
              <div className="flex-1"></div>
              <div className="relative w-64">
                <input 
                  type="text" 
                  value={certSearchQuery}
                  onChange={(e) => setCertSearchQuery(e.target.value)}
                  placeholder="환자/신청번호 검색" 
                  className="w-full border border-gray-300 rounded-lg pl-3 pr-10 py-1.5 text-xs font-bold outline-none focus:border-blue-500"
                />
                <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-gray-50 z-10 border-b border-gray-200">
                  <tr className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    <th className="px-4 py-3">신청번호</th>
                    <th className="px-4 py-3">신청일</th>
                    <th className="px-4 py-3">환자명</th>
                    <th className="px-4 py-3">제증명 종류</th>
                    <th className="px-4 py-3">용도</th>
                    <th className="px-4 py-3">요청자</th>
                    <th className="px-4 py-3">상태</th>
                    <th className="px-4 py-3">발급 예정일</th>
                    <th className="px-4 py-3">발급일</th>
                    <th className="px-4 py-3 text-center">작업</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCertificates.map((cert, idx) => (
                    <tr key={idx} className="hover:bg-blue-50/30 transition-colors text-xs font-bold text-gray-700">
                      <td className="px-4 py-4 text-gray-400">{cert.id}</td>
                      <td className="px-4 py-4">{cert.applyDate}</td>
                      <td className="px-4 py-4 text-gray-900">{cert.patientName}</td>
                      <td className="px-4 py-4">{cert.type}</td>
                      <td className="px-4 py-4">{cert.purpose}</td>
                      <td className="px-4 py-4">{cert.applicant}</td>
                      <td className="px-4 py-4">
                        <select 
                          value={cert.status}
                          onChange={(e) => handleUpdateCertStatus(cert.id, (cert as any).patientId, e.target.value as any)}
                          className={`px-2 py-1 rounded-full text-[10px] font-black outline-none border-none cursor-pointer ${
                            cert.status === '신청 중' ? 'bg-blue-100 text-blue-600' :
                            cert.status === '발급 대기' ? 'bg-indigo-100 text-indigo-600' :
                            cert.status === '발급 완료' ? 'bg-green-100 text-green-600' :
                            'bg-red-100 text-red-600'
                          }`}
                        >
                          <option value="신청 중">신청 중</option>
                          <option value="발급 대기">발급 대기</option>
                          <option value="발급 완료">발급 완료</option>
                          <option value="반려/보안">반려/보안</option>
                        </select>
                      </td>
                      <td className="px-4 py-4">{cert.expectedDate}</td>
                      <td className="px-4 py-4">{cert.issuedDate}</td>
                      <td className="px-4 py-4 text-center">
                        <button 
                          onClick={() => {
                            if (cert.status === '발급 완료') {
                              handlePrintCertificate(cert);
                            } else {
                              handleOpenPopup('certDetail', cert);
                            }
                          }}
                          onDoubleClick={() => {
                            handleOpenPopup('certDetail', cert);
                          }}
                          title={cert.status === '발급 완료' ? '클릭하여 출력 / 더블클릭하여 상세' : '클릭하여 상세'}
                          className={`px-4 py-1 rounded font-black text-[10px] border transition-all ${
                            cert.status === '발급 완료' 
                            ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' 
                            : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50'
                          }`}
                        >
                          {cert.status === '발급 완료' ? '출력' : '상세'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-3 bg-gray-50 text-center border-t border-gray-100">
              <button className="text-xs font-bold text-gray-400 hover:text-gray-600 flex items-center gap-1 mx-auto">
                더보기 <ChevronDown size={14} />
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-64 flex flex-col gap-4">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <h3 className="text-sm font-black text-gray-900 mb-4 border-b border-gray-100 pb-2">제증명 종류 안내</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wider">자주 신청하는 제증명</div>
                  <div className="grid grid-cols-2 gap-2">
                    {['진단서', '입퇴원확인서', '수술확인서', '소견서', '통원확인서', '제증명 통합 사본'].map((item, idx) => (
                      <button key={idx} className="text-[10px] font-bold text-gray-600 bg-gray-50 border border-gray-200 py-1.5 rounded hover:bg-white hover:border-blue-300 transition-all">
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wider">기타 제증명</div>
                  <div className="grid grid-cols-2 gap-2">
                    {['진료비 영수증', '진료비 세부내역서', '건강검진 결과서', '사망진단서', '의무기록 사본', '기타 증명서'].map((item, idx) => (
                      <button key={idx} className="text-[10px] font-bold text-gray-600 bg-gray-50 border border-gray-200 py-1.5 rounded hover:bg-white hover:border-blue-300 transition-all">
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Sections */}
        <div className="grid grid-cols-3 gap-6 mt-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <h3 className="text-sm font-black text-gray-900 mb-4">제증명 신청 절차</h3>
            <div className="flex items-center justify-between px-2">
              {[
                { step: '01 신청', desc: '제증명 종류 및 용도 선택', icon: <FileText size={20} /> },
                { step: '02 심사', desc: '의료진 검토 및 승인', icon: <CheckCircle size={20} /> },
                { step: '03 발급', desc: '원무팀에서 문서 발급', icon: <Printer size={20} /> },
                { step: '04 수령', desc: '환자/보호자 수령 또는 출력', icon: <Users size={20} /> },
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center text-center gap-2 relative">
                  <div className="bg-blue-50 text-blue-600 p-3 rounded-full shadow-sm">
                    {item.icon}
                  </div>
                  <div className="text-[10px] font-black text-gray-900">{item.step}</div>
                  <div className="text-[8px] font-bold text-gray-400 leading-tight w-16">{item.desc}</div>
                  {idx < 3 && <ChevronRight size={14} className="absolute -right-4 top-5 text-gray-300" />}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <h3 className="text-sm font-black text-gray-900 mb-4">알림</h3>
            <ul className="space-y-2">
              {[
                '진단서 발급 시 1~3일 소요됩니다.',
                '보험 청구용 진단서는 영문 발급이 가능합니다.',
                '의무기록 사본은 추가 비용이 발생할 수 있습니다.',
                '문의: 원무팀 02-123-4567 (평일 09:00~17:00)',
              ].map((text, idx) => (
                <li key={idx} className="flex items-start gap-2 text-[11px] font-bold text-gray-600">
                  <div className="w-1 h-1 rounded-full bg-blue-400 mt-1.5 shrink-0"></div>
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <h3 className="text-sm font-black text-gray-900 mb-4">최근 발급 문서</h3>
            <div className="space-y-2">
              {allCertificates.filter(c => c.status === '발급 완료').slice(0, 3).map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-100">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-gray-400">{doc.issuedDate}</span>
                    <span className="text-[11px] font-black text-gray-700">{doc.type} ({doc.patientName})</span>
                  </div>
                  <button className="text-[10px] font-black text-blue-600 border border-blue-200 px-3 py-1 rounded bg-white hover:bg-blue-50">출력</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Apply Modal */}
        {showCertApplyModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
            <div className="bg-white border-4 border-black p-6 w-full max-w-md shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex justify-between items-center mb-6 border-b-4 border-black pb-2">
                <h2 className="text-xl font-black">제증명 신청</h2>
                <button onClick={() => setShowCertApplyModal(false)}><X size={24} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-black mb-1">환자 선택</label>
                  <select 
                    value={newCertData.patientId}
                    onChange={(e) => setNewCertData({ ...newCertData, patientId: e.target.value })}
                    className="w-full border-2 border-black p-2 font-bold outline-none"
                  >
                    <option value="">환자를 선택하세요</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.chartNo})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-black mb-1">제증명 종류</label>
                  <select 
                    value={newCertData.type}
                    onChange={(e) => setNewCertData({ ...newCertData, type: e.target.value })}
                    className="w-full border-2 border-black p-2 font-bold outline-none"
                  >
                    <option>진단서</option>
                    <option>입퇴원확인서</option>
                    <option>수술확인서</option>
                    <option>소견서</option>
                    <option>통원확인서</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-black mb-1">용도</label>
                  <input 
                    type="text" 
                    value={newCertData.purpose}
                    onChange={(e) => setNewCertData({ ...newCertData, purpose: e.target.value })}
                    className="w-full border-2 border-black p-2 font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-black mb-1">요청자</label>
                  <input 
                    type="text" 
                    value={newCertData.applicant}
                    onChange={(e) => setNewCertData({ ...newCertData, applicant: e.target.value })}
                    className="w-full border-2 border-black p-2 font-bold outline-none"
                  />
                </div>
              </div>
              <div className="mt-8 flex gap-2">
                <button 
                  onClick={() => setShowCertApplyModal(false)}
                  className="flex-1 border-2 border-black py-2 font-black hover:bg-gray-100 transition-colors"
                >
                  취소
                </button>
                <button 
                  onClick={handleApplyCertificate}
                  className="flex-1 bg-blue-600 text-white border-2 border-black py-2 font-black hover:bg-blue-700 transition-colors"
                >
                  신청하기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {showCertDetailModal && editingCert && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[110] p-4">
            <div className="bg-white border-4 border-black p-6 w-full max-w-2xl shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col max-h-[90vh]">
              <div className="flex justify-between items-center mb-6 border-b-4 border-black pb-2">
                <h2 className="text-xl font-black">{editingCert.type} 상세 내용</h2>
                <button onClick={() => setShowCertDetailModal(false)}><X size={24} /></button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 border-2 border-black">
                  <div className="text-sm font-bold"><span className="text-gray-500 mr-2">환자명:</span> {editingCert.patientName}</div>
                  <div className="text-sm font-bold"><span className="text-gray-500 mr-2">신청일:</span> {editingCert.applyDate}</div>
                  <div className="text-sm font-bold"><span className="text-gray-500 mr-2">용도:</span> {editingCert.purpose}</div>
                  <div className="text-sm font-bold"><span className="text-gray-500 mr-2">상태:</span> {editingCert.status}</div>
                </div>
                <div>
                  <label className="block text-sm font-black mb-1">증명서 상세 내용</label>
                  <RichEditor 
                    value={editingCert.content || ''}
                    onChange={(val) => setEditingCert({ ...editingCert, content: val })}
                    placeholder="증명서에 기재될 상세 내용을 입력하세요..."
                    height="300px"
                  />
                </div>
              </div>
              <div className="mt-6 flex gap-2">
                <button 
                  onClick={() => setShowCertDetailModal(false)}
                  className="flex-1 border-2 border-black py-2 font-black hover:bg-gray-100 transition-colors"
                >
                  닫기
                </button>
                <button 
                  onClick={handleSaveCertContent}
                  className="flex-1 bg-white border-2 border-black py-2 font-black hover:bg-gray-100 transition-colors"
                >
                  저장하기
                </button>
                {editingCert.status === '발급 완료' && (
                  <button 
                    onClick={() => handlePrintCertificate(editingCert)}
                    className="flex-1 bg-black text-white border-2 border-black py-2 font-black hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <Printer size={18} /> 출력하기
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        {/* Template Modal */}
        {showTemplateModal && renderTemplateModal()}
      </div>
    );
  };

  const renderSoapSection = (blocks: SoapBlock[], noteValue: string, noteField: string, examValue?: string, examField?: string) => (
    <>
      <div className="border-2 border-black flex flex-col flex-1 min-h-0 overflow-y-auto bg-white">
        <div className="bg-[#999] text-white px-4 py-1 font-bold sticky top-0 z-10">
          SOAP
        </div>
        <div className="p-2 flex flex-col gap-4">
          {blocks.map((block, idx) => (
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
                          minHeight="30px"
                        />
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td className="w-32 bg-[#C0C0C0] border-r-2 border-black p-2 text-center font-bold text-gray-700">
                      관리
                    </td>
                    <td className="p-2 flex justify-between items-center gap-2">
                      {block.lastModified && (
                        <span className="text-xs text-gray-500 font-bold">
                          [저장됨: {block.lastModified.time} / {block.lastModified.name}]
                        </span>
                      )}
                      <div className="flex gap-2">
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
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))}
          <AutoHeightTextarea 
            value={noteValue}
            onChange={(e: any) => updateField(noteField as keyof Patient, e.target.value)}
            placeholder="여기에 자유롭게 기록하세요..."
            className="w-full p-2 focus:outline-none block" 
            minHeight="400px"
          />
        </div>
      </div>
      {examField !== undefined && (
        <div className="border-2 border-black flex flex-col flex-1 min-h-0 overflow-y-auto bg-white">
          <div className="bg-[#999] text-white px-4 py-1 font-bold sticky top-0 z-10">EXAM</div>
          <div className="p-2 flex flex-col">
            <AutoHeightTextarea 
              value={examValue}
              onChange={(e: any) => updateField(examField as keyof Patient, e.target.value)}
              className="w-full p-2 focus:outline-none block" 
              minHeight="200px"
            />
          </div>
        </div>
      )}
    </>
  );

  const renderRightSidebar = (showSoapAdd: boolean = true) => (
    <div className="w-[500px] border-2 border-black p-4 flex flex-col gap-8 shrink-0 overflow-y-auto bg-white font-gulim text-[14px]">
      <div className="mb-4">
        <div className="text-3xl font-bold text-center mb-1 tracking-[0.5em]">경 과 기 록 지</div>
      </div>

      <div className="flex flex-col gap-2">
        <SectionHeader label="환자정보" />
        <div className="flex flex-col gap-3 px-1">
          <UnderlineInputField label="차트번호" value={formData.chartNo} onChange={(v) => updateField('chartNo', v)} />
          <UnderlineInputField label="병실" value={formData.room} onChange={(v) => updateField('room', v)} />
          <UnderlineInputField label="전문의" value={formData.assignedProfessor} onChange={(v) => updateField('assignedProfessor', v)} />
          <UnderlineInputField label="이름" value={formData.name} onChange={(v) => updateField('name', v)} />
          
          <div className="flex items-center gap-2">
            <span className="w-24 font-bold shrink-0">생년월일</span>
            <div className="flex items-center gap-1">
              <select value={formData.dobYear} onChange={(e) => updateField('dobYear', e.target.value)} className="border border-black px-1 text-[12px] h-8 bg-transparent">
                {Array.from({ length: 2101 - 1900 }, (_, i) => 1900 + i).map(y => <option key={y} value={y}>{y}</option>)}
              </select><span>년</span>
              <select value={formData.dobMonth} onChange={(e) => updateField('dobMonth', e.target.value)} className="border border-black px-1 text-[12px] h-8 bg-transparent">
                {Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0')).map(m => <option key={m} value={m}>{m}</option>)}
              </select><span>월</span>
              <select value={formData.dobDay} onChange={(e) => updateField('dobDay', e.target.value)} className="border border-black px-1 text-[12px] h-8 bg-transparent">
                {Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0')).map(d => <option key={d} value={d}>{d}</option>)}
              </select><span>일</span>
            </div>
          </div>

          <div className="flex items-center gap-4 font-bold mt-1">
            <span className="w-24">성별</span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="gender" checked={formData.gender === 'M'} onChange={() => updateField('gender', 'M')} className="accent-blue-600 w-4 h-4" /> 남
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="gender" checked={formData.gender === 'F'} onChange={() => updateField('gender', 'F')} className="accent-blue-600 w-4 h-4" /> 여
            </label>
          </div>

          <UnderlineInputField label="나이" value={formData.age} onChange={(v) => updateField('age', v)} />
          <UnderlineInputField label="거주지" value={formData.address} onChange={(v) => updateField('address', v)} />
          <UnderlineInputField label="Dx" value={formData.dx} onChange={(v) => updateField('dx', v)} />
          <UnderlineInputField label="C.C" value={formData.cc} onChange={(v) => updateField('cc', v)} />
          
          <div className="flex items-center gap-2">
            <span className="w-24 font-bold shrink-0">On Set</span>
            <div className="flex items-center gap-1">
              <select value={formData.onsetYear} onChange={(e) => updateField('onsetYear', e.target.value)} className="border border-black px-1 text-[12px] h-8 bg-transparent">
                {Array.from({ length: 2101 - 1900 }, (_, i) => 1900 + i).map(y => <option key={y} value={y}>{y}</option>)}
              </select><span>년</span>
              <select value={formData.onsetMonth} onChange={(e) => updateField('onsetMonth', e.target.value)} className="border border-black px-1 text-[12px] h-8 bg-transparent">
                {Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0')).map(m => <option key={m} value={m}>{m}</option>)}
              </select><span>월</span>
              <select value={formData.onsetDay} onChange={(e) => updateField('onsetDay', e.target.value)} className="border border-black px-1 text-[12px] h-8 bg-transparent">
                {Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0')).map(d => <option key={d} value={d}>{d}</option>)}
              </select><span>일</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <SectionHeader label="SOAP" />
        <div className="flex flex-col gap-4 px-1">
          <div className="flex flex-col gap-1">
            <span className="text-[15px] font-bold">Subjective</span>
            <AutoHeightTextarea 
              value={formData.sidebarS || ''} 
              onChange={(e: any) => updateField('sidebarS', e.target.value)}
              className="w-full border-b border-black focus:outline-none bg-transparent py-1"
              minHeight="32px"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[15px] font-bold">Objective</span>
            <AutoHeightTextarea 
              value={formData.sidebarO || ''} 
              onChange={(e: any) => updateField('sidebarO', e.target.value)}
              className="w-full border-b border-black focus:outline-none bg-transparent py-1"
              minHeight="32px"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[15px] font-bold">Assessment</span>
            <AutoHeightTextarea 
              value={formData.sidebarA || ''} 
              onChange={(e: any) => updateField('sidebarA', e.target.value)}
              className="w-full border-b border-black focus:outline-none bg-transparent py-1"
              minHeight="32px"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[15px] font-bold">Plan</span>
            <AutoHeightTextarea 
              value={formData.sidebarP || ''} 
              onChange={(e: any) => updateField('sidebarP', e.target.value)}
              className="w-full border-b border-black focus:outline-none bg-transparent py-1"
              minHeight="32px"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <SectionHeader label="V / S" />
        <div className="flex flex-col gap-3 px-1">
          <UnderlineInputField label="HR" value={formData.hr} onChange={(v) => updateField('hr', v)} unit="bpm" />
          <UnderlineInputField label="RR" value={formData.rr} onChange={(v) => updateField('rr', v)} unit="회/min" />
          <div className="flex items-center gap-2">
            <span className="w-24 font-bold shrink-0">BP</span>
            <div className="flex-1 flex items-center gap-1 border-b border-black h-8">
              <input type="text" value={formData.bpSys} onChange={(e) => updateField('bpSys', e.target.value)} className="w-16 focus:outline-none text-center bg-transparent" />
              <span>/</span>
              <input type="text" value={formData.bpDia} onChange={(e) => updateField('bpDia', e.target.value)} className="w-16 focus:outline-none text-center bg-transparent" />
            </div>
            <span className="text-[12px] font-bold shrink-0 w-14">mmHg</span>
          </div>
          <UnderlineInputField label="BT" value={formData.bt} onChange={(v) => updateField('bt', v)} unit="°C" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <SectionHeader label="Day" />
        <div className="flex flex-col gap-3 px-1">
          <div className="flex items-center gap-2">
            <span className="w-20 font-bold shrink-0">HOD -</span>
            <input type="date" value={formData.admissionDate} onChange={(e) => updateField('admissionDate', e.target.value)} className="flex-1 border border-black px-2 h-8 focus:outline-none text-[12px] bg-transparent" />
            <span className="w-16 text-center font-bold">{calculateDays(formData.admissionDate, true)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-20 font-bold shrink-0">POD -</span>
            <input type="date" value={formData.surgeryDate} onChange={(e) => updateField('surgeryDate', e.target.value)} className="flex-1 border border-black px-2 h-8 focus:outline-none text-[12px] bg-transparent" />
            <span className="w-16 text-center font-bold">{calculateDays(formData.surgeryDate, false)}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <SectionHeader label="Diagnosis" />
        <div className="flex flex-col gap-3 px-1">
          <div className="flex items-center gap-2">
            <span className="w-28 font-bold shrink-0">주진단코드 -</span>
            <div className="flex-1 flex gap-1">
              <select 
                value={(formData.mainDxCode || '').charAt(0)} 
                onChange={(e) => {
                  const letter = e.target.value;
                  const number = (formData.mainDxCode || '').slice(1) || '01';
                  const newCode = letter + number;
                  updateField('mainDxCode', newCode);
                  const dx = DX_CODES.find(d => d.code === newCode);
                  if (dx) updateField('mainDxName', dx.name);
                }}
                className="flex-1 border border-black px-1 h-8 focus:outline-none text-[12px] bg-transparent"
              >
                <option value="">선택</option>
                {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <select 
                value={(formData.mainDxCode || '').slice(1)} 
                onChange={(e) => {
                  const letter = (formData.mainDxCode || '').charAt(0) || 'A';
                  const number = e.target.value;
                  const newCode = letter + number;
                  updateField('mainDxCode', newCode);
                  const dx = DX_CODES.find(d => d.code === newCode);
                  if (dx) updateField('mainDxName', dx.name);
                }}
                className="flex-1 border border-black px-1 h-8 focus:outline-none text-[12px] bg-transparent"
              >
                <option value="">선택</option>
                {Array.from({ length: 99 }, (_, i) => (i + 1).toString().padStart(2, '0')).map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-28 font-bold shrink-0">주진단명 -</span>
            <input type="text" value={formData.mainDxName} onChange={(e) => updateField('mainDxName', e.target.value)} className="flex-1 border border-black px-2 h-8 focus:outline-none bg-transparent" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-28 font-bold shrink-0">부진단코드 -</span>
            <div className="flex-1 flex gap-1">
              <select 
                value={(formData.subDxCode || '').charAt(0)} 
                onChange={(e) => {
                  const letter = e.target.value;
                  const number = (formData.subDxCode || '').slice(1) || '01';
                  const newCode = letter + number;
                  updateField('subDxCode', newCode);
                  const dx = DX_CODES.find(d => d.code === newCode);
                  if (dx) updateField('subDxName', dx.name);
                }}
                className="flex-1 border border-black px-1 h-8 focus:outline-none text-[12px] bg-transparent"
              >
                <option value="">선택</option>
                {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <select 
                value={(formData.subDxCode || '').slice(1)} 
                onChange={(e) => {
                  const letter = (formData.subDxCode || '').charAt(0) || 'A';
                  const number = e.target.value;
                  const newCode = letter + number;
                  updateField('subDxCode', newCode);
                  const dx = DX_CODES.find(d => d.code === newCode);
                  if (dx) updateField('subDxName', dx.name);
                }}
                className="flex-1 border border-black px-1 h-8 focus:outline-none text-[12px] bg-transparent"
              >
                <option value="">선택</option>
                {Array.from({ length: 99 }, (_, i) => (i + 1).toString().padStart(2, '0')).map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-28 font-bold shrink-0">부진단명 -</span>
            <input type="text" value={formData.subDxName} onChange={(e) => updateField('subDxName', e.target.value)} className="flex-1 border border-black px-2 h-8 focus:outline-none bg-transparent" />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <SectionHeader label="Progress" />
        <button 
          onClick={addSoapBlock}
          className="border-2 border-black bg-[#D9D9D9] h-32 flex items-center justify-center text-xl font-bold text-center p-4 hover:bg-gray-300 transition-colors"
        >
          SOAP 표<br />추가
        </button>
      </div>
    </div>
  );

  const renderModalContent = () => {
    switch (modalTab) {
      case 'admission_record':
        return (
          <div className="flex flex-col gap-6">
            {/* 기본 정보 */}
            <div className="border border-gray-300">
              <div className="bg-gray-100 px-4 py-2 font-bold text-sm border-b border-gray-300">기본 정보</div>
              <div className="p-4 grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <span className="w-20 font-bold text-gray-700">입원경로</span>
                    <div className="flex gap-4">
                      {['외래', '응급실', '기타'].map(path => (
                        <label key={path} className="flex items-center gap-1 cursor-pointer">
                          <input 
                            type="radio" 
                            name="admissionPath" 
                            checked={formData.admissionPath === path}
                            onChange={() => updateField('admissionPath', path)}
                            className="accent-blue-600" 
                          /> {path}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="w-20 font-bold text-gray-700">입원방법</span>
                    <div className="flex gap-4">
                      {['도보', '휠체어', '이동침대'].map(method => (
                        <label key={method} className="flex items-center gap-1 cursor-pointer">
                          <input 
                            type="radio" 
                            name="admissionMethod" 
                            checked={formData.admissionMethod === method}
                            onChange={() => updateField('admissionMethod', method)}
                            className="accent-blue-600" 
                          /> {method}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="w-20 font-bold text-gray-700">의식상태</span>
                    <div className="flex gap-4">
                      {['명료', '기면', '혼돈', '반혼수', '혼수'].map(status => (
                        <label key={status} className="flex items-center gap-1 cursor-pointer">
                          <input 
                            type="radio" 
                            name="mentalStatus" 
                            checked={formData.mentalStatus === status}
                            onChange={() => updateField('mentalStatus', status)}
                            className="accent-blue-600" 
                          /> {status}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="w-20 font-bold text-gray-700 mt-1">주호소</span>
                    <RichEditor 
                      value={formData.cc || ''}
                      onChange={(val) => updateField('cc', val)}
                      className="flex-1"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="w-20 font-bold text-gray-700">발병일자</span>
                    <input 
                      type="date" 
                      value={`${formData.onsetYear}-${formData.onsetMonth}-${formData.onsetDay}`}
                      onChange={(e) => {
                        const [y, m, d] = e.target.value.split('-');
                        updateField('onsetYear', y);
                        updateField('onsetMonth', m);
                        updateField('onsetDay', d);
                      }}
                      className="border border-gray-300 px-2 py-1 focus:outline-none"
                    />
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="w-20 font-bold text-gray-700 mt-1">입원동기</span>
                    <RichEditor 
                      value={formData.hpi || ''}
                      onChange={(val) => updateField('hpi', val)}
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <span className="w-20 font-bold text-gray-700">신체</span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">키</span>
                      <input type="text" value={formData.height || ''} onChange={(e) => updateField('height', e.target.value)} className="w-16 border border-gray-300 px-2 py-1 focus:outline-none text-right" />
                      <span className="text-gray-600">cm</span>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <span className="text-gray-600">몸무게</span>
                      <input type="text" value={formData.weight || ''} onChange={(e) => updateField('weight', e.target.value)} className="w-16 border border-gray-300 px-2 py-1 focus:outline-none text-right" />
                      <span className="text-gray-600">kg</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="font-bold text-gray-700">활력징후</span>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-10 text-gray-600">SBP</span>
                        <input type="text" value={formData.bpSys || ''} onChange={(e) => updateField('bpSys', e.target.value)} className="w-16 border border-gray-300 px-2 py-1 focus:outline-none text-right" />
                        <span className="text-gray-600 text-xs">mmHg</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-10 text-gray-600">DBP</span>
                        <input type="text" value={formData.bpDia || ''} onChange={(e) => updateField('bpDia', e.target.value)} className="w-16 border border-gray-300 px-2 py-1 focus:outline-none text-right" />
                        <span className="text-gray-600 text-xs">mmHg</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-10 text-gray-600">PR</span>
                        <input type="text" value={formData.hr || ''} onChange={(e) => updateField('hr', e.target.value)} className="w-16 border border-gray-300 px-2 py-1 focus:outline-none text-right" />
                        <span className="text-gray-600 text-xs">회/분</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-10 text-gray-600">RR</span>
                        <input type="text" value={formData.rr || ''} onChange={(e) => updateField('rr', e.target.value)} className="w-16 border border-gray-300 px-2 py-1 focus:outline-none text-right" />
                        <span className="text-gray-600 text-xs">회/분</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-10 text-gray-600">BT</span>
                        <input type="text" value={formData.bt || ''} onChange={(e) => updateField('bt', e.target.value)} className="w-16 border border-gray-300 px-2 py-1 focus:outline-none text-right" />
                        <span className="text-gray-600 text-xs">°C</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 병력 */}
            <div className="border border-gray-300">
              <div className="bg-gray-100 px-4 py-2 font-bold text-sm border-b border-gray-300">병력</div>
              <div className="p-4 grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                <div className="flex items-start gap-4">
                  <span className="w-20 font-bold text-gray-700 mt-1">과거력</span>
                  <RichEditor 
                    value={formData.pmh || ''}
                    onChange={(val) => updateField('pmh', val)}
                    className="flex-1"
                  />
                </div>
                <div className="flex items-start gap-4">
                  <span className="w-20 font-bold text-gray-700 mt-1">가족력</span>
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="flex gap-4">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input 
                          type="radio" 
                          name="familyHistory" 
                          checked={formData.familyHistory === '없음'}
                          onChange={() => updateField('familyHistory', '없음')}
                          className="accent-blue-600" 
                        /> 없음
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input 
                          type="radio" 
                          name="familyHistory" 
                          checked={formData.familyHistory === '있음'}
                          onChange={() => updateField('familyHistory', '있음')}
                          className="accent-blue-600" 
                        /> 있음
                      </label>
                    </div>
                    <input 
                      type="text" 
                      value={formData.familyHistoryNote || ''}
                      onChange={(e) => updateField('familyHistoryNote', e.target.value)}
                      placeholder="ex. 부-고혈압" 
                      className="border border-gray-300 px-2 py-1 focus:outline-none" 
                    />
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <span className="w-20 font-bold text-gray-700 mt-1">입원/수술력</span>
                  <RichEditor 
                    value={formData.psh || ''}
                    onChange={(val) => updateField('psh', val)}
                    className="flex-1"
                  />
                </div>
                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-4">
                    <span className="w-20 font-bold text-gray-700 mt-1">약물 알러지</span>
                    <div className="flex flex-col gap-2 flex-1">
                      <div className="flex gap-4">
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input 
                            type="radio" 
                            name="drugAllergyStatus" 
                            checked={formData.drugAllergyStatus === '없음'}
                            onChange={() => updateField('drugAllergyStatus', '없음')}
                            className="accent-blue-600" 
                          /> 없음
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input 
                            type="radio" 
                            name="drugAllergyStatus" 
                            checked={formData.drugAllergyStatus === '있음'}
                            onChange={() => updateField('drugAllergyStatus', '있음')}
                            className="accent-blue-600" 
                          /> 있음
                        </label>
                      </div>
                      <input 
                        type="text" 
                        value={formData.allergy || ''} 
                        onChange={(e) => updateField('allergy', e.target.value)} 
                        placeholder="직접 입력" 
                        className="border border-gray-300 px-2 py-1 focus:outline-none" 
                      />
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="w-20 font-bold text-gray-700 mt-1">조영제 알러지</span>
                    <div className="flex flex-col gap-2 flex-1">
                      <div className="flex gap-4">
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input 
                            type="radio" 
                            name="contrastAllergyStatus" 
                            checked={formData.contrastAllergyStatus === '없음'}
                            onChange={() => updateField('contrastAllergyStatus', '없음')}
                            className="accent-blue-600" 
                          /> 없음
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input 
                            type="radio" 
                            name="contrastAllergyStatus" 
                            checked={formData.contrastAllergyStatus === '있음'}
                            onChange={() => updateField('contrastAllergyStatus', '있음')}
                            className="accent-blue-600" 
                          /> 있음
                        </label>
                      </div>
                      <input 
                        type="text" 
                        value={formData.contrastAllergyNote || ''}
                        onChange={(e) => updateField('contrastAllergyNote', e.target.value)}
                        placeholder="직접 입력" 
                        className="border border-gray-300 px-2 py-1 focus:outline-none" 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'assessment_safety':
        return (
          <div className="flex flex-col gap-8">
            <PressureUlcerRiskAssessment />
            <div className="border-t-2 border-black pt-8">
              <FallRiskAssessment />
            </div>
          </div>
        );
      case 'pain_assessment':
        return <NRSPainAssessment />;
      case 'diet_nutrition':
        return <DietNutritionRecord />;
      default:
        return null;
    }
  };

  const PressureUlcerRiskAssessment = () => {
    const data = formData.pressureUlcerRisk || INITIAL_FORM_DATA.pressureUlcerRisk;
    
    const updateRisk = (field: string, score: number) => {
      const newData = { ...data, [field]: score };
      const total = (newData.sensoryPerception || 0) + 
                    (newData.moisture || 0) + 
                    (newData.activity || 0) + 
                    (newData.mobility || 0) + 
                    (newData.nutrition || 0) + 
                    (newData.friction || 0);
      
      let level = '저위험군';
      if (total <= 12) level = '고위험군';
      else if (total <= 14) level = '중위험군';
      else if (total <= 18) level = '저위험군';
      else level = '위험 없음';

      updateField('pressureUlcerRisk', { ...newData, totalScore: total, riskLevel: level });
    };

    const getCategoryName = (key: string) => {
      switch(key) {
        case 'sensoryPerception': return '감각인지정도';
        case 'moisture': return '습기';
        case 'activity': return '활동정도';
        case 'mobility': return '기동력';
        case 'nutrition': return '영양상태';
        case 'friction': return '마찰력과 엇갈림';
        default: return key;
      }
    };

    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between border-b-2 border-black pb-2">
          <h3 className="text-xl font-black">욕창위험도 평가 (Braden Scale)</h3>
          <div className="flex items-center gap-4">
            <div className="bg-black text-white px-4 py-1 font-bold">총점: {data.totalScore}점</div>
            <div className={`px-4 py-1 font-bold border-2 border-black ${
              data.riskLevel === '고위험군' ? 'bg-red-500 text-white' : 
              data.riskLevel === '중위험군' ? 'bg-orange-500 text-white' : 'bg-green-500 text-white'
            }`}>
              위험도: {data.riskLevel}
            </div>
          </div>
        </div>
        
        <table className="w-full border-collapse border border-gray-400 text-sm">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-400 p-2 w-32">구분</th>
              <th className="border border-gray-400 p-2">평가항목</th>
              <th className="border border-gray-400 p-2 w-20">점수</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(BRADEN_SCALE).map(([key, options]) => (
              <tr key={key}>
                <td className="border border-gray-400 p-2 font-bold text-center bg-gray-50">{getCategoryName(key)}</td>
                <td className="border border-gray-400 p-2">
                  <div className="flex flex-col gap-2">
                    {options.map((opt: any) => (
                      <label key={opt.score} className="flex items-start gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded">
                        <input 
                          type="radio" 
                          name={`braden-${key}`}
                          checked={data[key as keyof typeof data] === opt.score}
                          onChange={() => updateRisk(key, opt.score)}
                          className="mt-1 accent-blue-600"
                        />
                        <div>
                          <span className="font-bold">{opt.label}</span>
                          <span className="text-gray-600 ml-2 text-xs">{opt.description}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </td>
                <td className="border border-gray-400 p-2 text-center font-bold text-lg">
                  {data[key as keyof typeof data] || 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const FallRiskAssessment = () => {
    const data = formData.fallRisk || INITIAL_FORM_DATA.fallRisk;

    const updateRisk = (field: string, score: number) => {
      const newData = { ...data, [field]: score };
      const total = (newData.history || 0) + 
                    (newData.secondaryDiagnosis || 0) + 
                    (newData.ambulatoryAid || 0) + 
                    (newData.ivTherapy || 0) + 
                    (newData.gait || 0) + 
                    (newData.mentalStatus || 0);
      
      let level = '저위험군';
      if (total >= 45) level = '고위험군';
      else if (total >= 25) level = '중위험군';
      else level = '저위험군';

      updateField('fallRisk', { ...newData, totalScore: total, riskLevel: level });
    };

    const getCategoryName = (key: string) => {
      switch(key) {
        case 'history': return '낙상경험';
        case 'secondaryDiagnosis': return '이차진단';
        case 'ambulatoryAid': return '보행보조';
        case 'ivTherapy': return '정맥수액요법';
        case 'gait': return '보행';
        case 'mentalStatus': return '인지상태';
        default: return key;
      }
    };

    return (
      <div className="flex flex-col gap-4 mt-8">
        <div className="flex items-center justify-between border-b-2 border-black pb-2">
          <h3 className="text-xl font-black">낙상위험도 평가 (Morse Fall Scale)</h3>
          <div className="flex items-center gap-4">
            <div className="bg-black text-white px-4 py-1 font-bold">총점: {data.totalScore}점</div>
            <div className={`px-4 py-1 font-bold border-2 border-black ${
              data.riskLevel === '고위험군' ? 'bg-red-500 text-white' : 
              data.riskLevel === '중위험군' ? 'bg-orange-500 text-white' : 'bg-green-500 text-white'
            }`}>
              위험도: {data.riskLevel}
            </div>
          </div>
        </div>
        
        <table className="w-full border-collapse border border-gray-400 text-sm">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-400 p-2 w-32">구분</th>
              <th className="border border-gray-400 p-2">평가항목</th>
              <th className="border border-gray-400 p-2 w-20">점수</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(MORSE_FALL_SCALE).map(([key, options]) => (
              <tr key={key}>
                <td className="border border-gray-400 p-2 font-bold text-center bg-gray-50">{getCategoryName(key)}</td>
                <td className="border border-gray-400 p-2">
                  <div className="flex flex-col gap-2">
                    {options.map((opt: any) => (
                      <label key={opt.score} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded">
                        <input 
                          type="radio" 
                          name={`morse-${key}`}
                          checked={data[key as keyof typeof data] === opt.score}
                          onChange={() => updateRisk(key, opt.score)}
                          className="accent-blue-600"
                        />
                        <span className="font-bold">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </td>
                <td className="border border-gray-400 p-2 text-center font-bold text-lg">
                  {data[key as keyof typeof data] || 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const NRSPainAssessment = () => {
    const data = formData.nrsPain || INITIAL_FORM_DATA.nrsPain;

    const updatePain = (field: string, value: any) => {
      updateField('nrsPain', { ...data, [field]: value });
    };

    return (
      <div className="flex flex-col gap-6">
        <h3 className="text-xl font-black border-b-2 border-black pb-2">통증평가도구 (NRS)</h3>
        
        <div className="border border-gray-400 p-6 flex flex-col gap-8 bg-gray-50">
          <div className="flex flex-col gap-4">
            <div className="font-bold text-lg">NRS (Numeric Rating Scale)</div>
            <div className="flex items-center justify-between gap-1 max-w-3xl">
              {[...Array(11)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => updatePain('score', i)}
                  className={`w-12 h-12 font-bold text-lg border-2 border-black transition-all rounded-full ${
                    data.score === i ? 'bg-blue-600 text-white scale-110 shadow-lg' : 'bg-white hover:bg-gray-200'
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
            <div className="flex justify-between max-w-3xl mt-2 text-sm font-bold text-gray-600 px-2">
              <span className="w-12 text-center">0<br/>통증없음</span>
              <span className="w-36 text-center">1-3<br/>경도</span>
              <span className="w-36 text-center">4-6<br/>중등도</span>
              <span className="w-48 text-center">7-10<br/>중증</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-2">
              <span className="font-bold text-lg">통증부위</span>
              <input 
                type="text" 
                value={data.location || ''} 
                onChange={(e) => updatePain('location', e.target.value)}
                className="border border-gray-400 px-3 py-2 focus:outline-none focus:border-blue-500 w-full max-w-md"
                placeholder="예: 복부, 허리 등"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <span className="font-bold text-lg">통증빈도</span>
              <div className="flex gap-6 mt-2">
                {['간헐적', '지속적'].map(freq => (
                  <label key={freq} className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="painFrequency"
                      checked={data.frequency === freq}
                      onChange={() => updatePain('frequency', freq)}
                      className="w-4 h-4 accent-blue-600"
                    />
                    <span className="text-base">{freq}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <span className="font-bold text-lg">통증양상</span>
              <div className="flex flex-wrap gap-6 mt-2 items-center">
                {['쑤시는', '찌르는', '타는듯한', '뻐근한'].map(char => (
                  <label key={char} className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="painCharacter"
                      checked={data.character === char}
                      onChange={() => updatePain('character', char)}
                      className="w-4 h-4 accent-blue-600"
                    />
                    <span className="text-base">{char}</span>
                  </label>
                ))}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="painCharacter"
                    checked={data.character !== '쑤시는' && data.character !== '찌르는' && data.character !== '타는듯한' && data.character !== '뻐근한' && data.character !== undefined}
                    onChange={() => updatePain('character', '')}
                    className="w-4 h-4 accent-blue-600"
                  />
                  <span className="text-base">기타</span>
                </label>
                <input 
                  type="text" 
                  value={(data.character !== '쑤시는' && data.character !== '찌르는' && data.character !== '타는듯한' && data.character !== '뻐근한') ? data.character || '' : ''}
                  onChange={(e) => updatePain('character', e.target.value)}
                  className="border border-gray-400 px-3 py-1 focus:outline-none focus:border-blue-500 w-64"
                  placeholder="기타 양상 입력"
                  disabled={['쑤시는', '찌르는', '타는듯한', '뻐근한'].includes(data.character || '')}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const DietNutritionRecord = () => {
    const data = formData.dietNutrition || INITIAL_FORM_DATA.dietNutrition;

    const updateDiet = (field: string, value: string) => {
      updateField('dietNutrition', { ...data, [field]: value });
    };

    return (
      <div className="flex flex-col gap-6">
        <h3 className="text-xl font-black border-b-2 border-black pb-2">식이/영양 기록지</h3>
        
        <div className="border border-gray-400 p-6 flex flex-col gap-6 bg-gray-50">
          <div className="flex items-center gap-4">
            <span className="w-24 font-bold text-lg">식사종류</span>
            <div className="flex gap-6">
              {['일반식', '연식', '유동식', '금식', '기타'].map(type => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="dietType"
                    checked={data.dietType === type}
                    onChange={() => updateDiet('dietType', type)}
                    className="w-4 h-4 accent-blue-600"
                  />
                  <span className="text-base">{type}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="w-24 font-bold text-lg">식사량</span>
            <div className="flex gap-6">
              {['1/4', '1/2', '3/4', '전량', '기타'].map(amount => (
                <label key={amount} className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="intakeAmount"
                    checked={data.intakeAmount === amount}
                    onChange={() => updateDiet('intakeAmount', amount)}
                    className="w-4 h-4 accent-blue-600"
                  />
                  <span className="text-base">{amount}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="w-24 font-bold text-lg">수분섭취량</span>
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                value={data.fluidIntake || ''} 
                onChange={(e) => updateDiet('fluidIntake', e.target.value)}
                className="border border-gray-400 px-3 py-1 focus:outline-none focus:border-blue-500 w-32 text-right"
              />
              <span className="text-base">cc/day</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="w-24 font-bold text-lg">영양상태</span>
            <div className="flex gap-6">
              {['양호', '불량', '비만', '기타'].map(status => (
                <label key={status} className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="nutritionStatus"
                    checked={data.nutritionStatus === status}
                    onChange={() => updateDiet('nutritionStatus', status)}
                    className="w-4 h-4 accent-blue-600"
                  />
                  <span className="text-base">{status}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-start gap-4">
            <span className="w-24 font-bold text-lg mt-1">특이사항</span>
            <RichEditor 
              value={data.note || ''} 
              onChange={(val) => updateDiet('note', val)}
              className="flex-1"
              placeholder="식욕 부진, 연하 곤란, 오심/구토 등 기재"
              height="120px"
            />
          </div>
        </div>
      </div>
    );
  };

  const PatientDetailModal = () => {
    if (!showPatientModal || !selectedPatientId) return null;

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 font-['Gulim','굴림',sans-serif]">
        <div className="bg-[#f0f0f0] w-[95vw] h-[90vh] border-4 border-black shadow-[12px_12px_0_0_rgba(0,0,0,1)] flex flex-col overflow-hidden">
          {/* Modal Header */}
          <div style={{ backgroundColor: currentTheme.color }} className="text-white px-4 py-2 flex items-center justify-between border-b-4 border-black shrink-0">
            <div className="flex items-center gap-4">
              <span className="font-black text-xl">환자 정보 상세</span>
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded border border-white/30">
                <span className="font-bold text-sm">차트번호: {formData.chartNo}</span>
                <span className="font-bold text-sm">성명: {formData.name}</span>
                <span className="font-bold text-sm">성별/나이: {formData.gender}/{formData.age}</span>
              </div>
            </div>
            <button onClick={() => setShowPatientModal(false)} className="hover:bg-black/20 p-1 rounded transition-colors">
              <X size={24} strokeWidth={3} />
            </button>
          </div>

          {/* Patient Info Header (New Fields) */}
          <div className="bg-[#e8e8e8] p-4 border-b-2 border-black flex gap-6 shrink-0 text-sm">
            <div className="flex flex-col gap-2 border-r-2 border-gray-400 pr-6 min-w-[180px]">
              <div className="flex justify-between gap-4"><span className="text-gray-600">등록번호</span><span className="font-bold">{formData.chartNo}</span></div>
              <div className="flex justify-between gap-4"><span className="text-gray-600">이름</span><span className="font-bold">{formData.name}</span></div>
              <div className="flex justify-between gap-4"><span className="text-gray-600">나이</span><span className="font-bold">{formData.age}</span></div>
              <div className="flex justify-between gap-4"><span className="text-gray-600">성별</span><span className="font-bold">{formData.gender === 'M' ? '남자' : '여자'}</span></div>
              <div className="flex justify-between gap-4"><span className="text-gray-600">혈액형</span><span className="font-bold">{formData.bloodType}</span></div>
            </div>
            <div className="flex flex-col gap-2 border-r-2 border-gray-400 pr-6 min-w-[150px]">
              <div className="flex justify-between gap-4"><span className="text-gray-600">키</span><span className="font-bold">{formData.height}cm</span></div>
              <div className="flex justify-between gap-4"><span className="text-gray-600">체중</span><span className="font-bold">{formData.weight}kg</span></div>
              <div className="flex justify-between gap-4"><span className="text-gray-600">HOD</span><span className="font-bold">3</span></div>
              <div className="flex justify-between gap-4"><span className="text-gray-600">POD</span><span className="font-bold">0</span></div>
            </div>
            <div className="flex flex-col gap-2 border-r-2 border-gray-400 pr-6 min-w-[180px]">
              <div className="flex justify-between gap-4"><span className="text-gray-600">진료과</span><span className="font-bold">{formData.dept}</span></div>
              <div className="flex justify-between gap-4"><span className="text-gray-600">병동</span><span className="font-bold">일반병동</span></div>
              <div className="flex justify-between gap-4"><span className="text-gray-600">병실</span><span className="font-bold">{formData.room}</span></div>
            </div>
            <div className="flex flex-col gap-2 flex-1 min-w-[300px]">
              <div className="flex items-center gap-2">
                <span className="text-gray-600 w-28 font-bold">영역 Domain</span>
                <input 
                  type="text" 
                  value={formData.domain || ''} 
                  onChange={(e) => updateField('domain', e.target.value)}
                  className="flex-1 border border-gray-400 px-2 py-0.5 text-sm focus:outline-none bg-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 w-28 font-bold">분류 Class</span>
                <input 
                  type="text" 
                  value={formData.class || ''} 
                  onChange={(e) => updateField('class', e.target.value)}
                  className="flex-1 border border-gray-400 px-2 py-0.5 text-sm focus:outline-none bg-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 w-28 font-bold">진단명 Diagnosis</span>
                <input 
                  type="text" 
                  value={formData.diagnosis || ''} 
                  onChange={(e) => updateField('diagnosis', e.target.value)}
                  className="flex-1 border border-gray-400 px-2 py-0.5 text-sm focus:outline-none bg-white"
                />
              </div>
            </div>
            <div className="flex flex-col justify-end pl-4">
              <button 
                onClick={() => handleSave()}
                style={{ backgroundColor: currentTheme.color }}
                className="px-6 py-2 text-white font-bold border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all whitespace-nowrap"
              >
                저장
              </button>
            </div>
          </div>

          {/* Modal Content with Left Sidebar Tabs */}
          <div className="flex flex-1 overflow-hidden">
            {/* Left Sidebar Tabs */}
            <div className="w-48 bg-gray-200 border-r-2 border-black flex flex-col shrink-0">
              {[
                { id: 'admission_record', label: '입원간호기록지' },
                { id: 'assessment_safety', label: '환자평가/환자안전' },
                { id: 'pain_assessment', label: '통증평가도구(NRS)' },
                { id: 'diet_nutrition', label: '식이/영양 기록지' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setModalTab(tab.id)}
                  className={`px-4 py-3 font-bold text-sm text-left border-b-2 border-black transition-all ${
                    modalTab === tab.id ? 'bg-white border-r-4 border-r-white -mr-[2px]' : 'hover:bg-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Content Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-white">
              {renderModalContent()}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDoctorPrescriptionDashboard = () => {
    const items = [
      { id: 'general', title: 'General Order', icon: ClipboardList, color: 'bg-blue-500' },
      { id: 'medication', title: 'Medication Instruction', icon: Pill, color: 'bg-green-500' },
      { id: 'lab', title: 'Lab / Imaging Plan', icon: FlaskConical, color: 'bg-purple-500' },
      { id: 'treatment', title: 'Treatment Plan', icon: Stethoscope, color: 'bg-red-500' },
      { id: 'consult', title: 'Consult Order', icon: Users, color: 'bg-indigo-500' },
      { id: 'special', title: 'Special Order', icon: Star, color: 'bg-yellow-500' },
      { id: 'modification', title: 'Modification based on progress', icon: TrendingUp, color: 'bg-orange-500' },
      { id: 'history', title: 'Doctor\'s Order History', icon: History, color: 'bg-gray-500' },
    ];

    return (
      <div className="flex-1 p-8 bg-gray-100 overflow-y-auto font-['Gulim','굴림',sans-serif]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-black mb-8 border-b-4 border-black pb-2 flex items-center gap-2">
            <ClipboardList size={32} /> 의사처방 (Doctor's Prescription)
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item) => (
              <div key={item.id} className="bg-white border-4 border-black p-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div className={`${item.color} w-12 h-12 rounded-full flex items-center justify-center border-2 border-black`}>
                    <item.icon className="text-white" size={24} />
                  </div>
                  {item.id !== 'history' && (
                    <button 
                      onClick={() => setActiveOrderForm(item.id)}
                      className="bg-black text-white p-1 hover:bg-gray-800 transition-colors"
                    >
                      <Plus size={20} />
                    </button>
                  )}
                </div>
                <h3 className="font-black text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 font-bold mb-4 flex-1">처방 및 지시사항을 관리합니다.</p>
                
                {activeOrderForm === item.id && (
                  <div className="mt-4 pt-4 border-t-2 border-black space-y-3">
                    <RichEditor 
                      height="100px"
                      placeholder="처방 내용을 입력하세요..."
                      value={orderInputs[item.id] || ''}
                      onChange={(val) => setOrderInputs(prev => ({ ...prev, [item.id]: val }))}
                    />
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setActiveOrderForm(null)} className="text-[11px] font-bold underline">취소</button>
                      <button 
                        onClick={() => {
                          const content = orderInputs[item.id];
                          if (content && content.trim()) {
                            const newOrder = {
                              date: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
                              type: item.title,
                              content: content.trim(),
                              status: 'Active'
                            };
                            const newOrdersList = [newOrder, ...(formData.recentOrders || [])];
                            updateField('recentOrders', newOrdersList);
                            handleSave({ recentOrders: newOrdersList });
                            setOrderInputs(prev => ({ ...prev, [item.id]: '' }));
                            setActiveOrderForm(null);
                          }
                        }}
                        className="bg-black text-white px-3 py-1 text-[11px] font-bold"
                      >
                        처방 추가
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 bg-white border-4 border-black p-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
            <h3 className="font-black text-xl mb-4 border-b-2 border-black pb-2">최근 처방 내역 (Recent Orders)</h3>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-black">
                  <th className="p-2 text-left border-r-2 border-black">일시</th>
                  <th className="p-2 text-left border-r-2 border-black">구분</th>
                  <th className="p-2 text-left border-r-2 border-black">처방 내용</th>
                  <th className="p-2 text-left">상태</th>
                </tr>
              </thead>
              <tbody>
                {formData.recentOrders && formData.recentOrders.length > 0 ? (
                  formData.recentOrders.map((order, idx) => (
                    <tr key={idx} className="border-b border-gray-300">
                      <td className="p-2 border-r-2 border-black">{order.date}</td>
                      <td className="p-2 border-r-2 border-black">{order.type}</td>
                      <td className="p-2 border-r-2 border-black font-bold">{order.content}</td>
                      <td className="p-2">
                        <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-[11px] font-bold">{order.status}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-gray-500">최근 처방 내역이 없습니다.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderSupportDeptDashboard = () => {
    const items = [
      { id: 'nutrition', title: 'Nutrition Team', icon: Apple, color: 'bg-red-400' },
      { id: 'rehab', title: 'Rehabilitation Team', icon: Activity, color: 'bg-blue-400' },
      { id: 'pharmacy', title: 'Pharmacy', icon: Pill, color: 'bg-green-400' },
      { id: 'lab', title: 'Lab', icon: FlaskConical, color: 'bg-purple-400' },
      { id: 'blood', title: 'Blood Transfusion', icon: Droplet, color: 'bg-red-600' },
      { id: 'social', title: 'Social Work Team', icon: HeartHandshake, color: 'bg-pink-400' },
      { id: 'list', title: 'Support Request List', icon: List, color: 'bg-indigo-400' },
      { id: 'history', title: 'Support Request History', icon: History, color: 'bg-gray-400' },
    ];

    return (
      <div className="flex-1 p-8 bg-gray-100 overflow-y-auto font-['Gulim','굴림',sans-serif]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-black mb-8 border-b-4 border-black pb-2 flex items-center gap-2">
            <Users size={32} /> 지원부서 (Support Department)
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item) => (
              <div key={item.id} className="bg-white border-4 border-black p-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div className={`${item.color} w-12 h-12 rounded-full flex items-center justify-center border-2 border-black`}>
                    <item.icon className="text-white" size={24} />
                  </div>
                  {item.id !== 'list' && item.id !== 'history' && (
                    <button 
                      onClick={() => setActiveSupportRequestForm(item.id)}
                      className="bg-black text-white p-1 hover:bg-gray-800 transition-colors"
                    >
                      <Plus size={20} />
                    </button>
                  )}
                </div>
                <h3 className="font-black text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 font-bold mb-4 flex-1">부서별 지원 요청 및 협업을 관리합니다.</p>
                
                {activeSupportRequestForm === item.id && (
                  <div className="mt-4 pt-4 border-t-2 border-black space-y-3">
                    <RichEditor 
                      height="100px"
                      placeholder="요청 내용을 입력하세요..."
                      value={supportInputs[item.id] || ''}
                      onChange={(val) => setSupportInputs(prev => ({ ...prev, [item.id]: val }))}
                    />
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setActiveSupportRequestForm(null)} className="text-[11px] font-bold underline">취소</button>
                      <button 
                        onClick={() => {
                          const content = supportInputs[item.id];
                          if (content && content.trim()) {
                            const newReq = {
                              date: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
                              dept: item.title,
                              content: content.trim(),
                              status: 'Requested'
                            };
                            const newRequestsList = [newReq, ...(formData.supportRequests || [])];
                            updateField('supportRequests', newRequestsList);
                            handleSave({ supportRequests: newRequestsList });
                            setSupportInputs(prev => ({ ...prev, [item.id]: '' }));
                            setActiveSupportRequestForm(null);
                          }
                        }}
                        className="bg-black text-white px-3 py-1 text-[11px] font-bold"
                      >
                        요청 보내기
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 bg-white border-4 border-black p-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
            <h3 className="font-black text-xl mb-4 border-b-2 border-black pb-2">지원 요청 목록 (Request List)</h3>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-black">
                  <th className="p-2 text-left border-r-2 border-black">요청일시</th>
                  <th className="p-2 text-left border-r-2 border-black">부서</th>
                  <th className="p-2 text-left border-r-2 border-black">요청 내용</th>
                  <th className="p-2 text-left">진행상태</th>
                </tr>
              </thead>
              <tbody>
                {formData.supportRequests && formData.supportRequests.length > 0 ? (
                  formData.supportRequests.map((req, idx) => (
                    <tr key={idx} className="border-b border-gray-300">
                      <td className="p-2 border-r-2 border-black">{req.date}</td>
                      <td className="p-2 border-r-2 border-black">{req.dept}</td>
                      <td className="p-2 border-r-2 border-black font-bold">{req.content}</td>
                      <td className="p-2">
                        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-[11px] font-bold">{req.status}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-gray-500">지원 요청 내역이 없습니다.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (activeTab === 'none') {
      return (
        <div className="flex-1 flex items-center justify-center bg-white">
        </div>
      );
    }

    switch (activeTab) {
      case 'consent_form':
        return null;
      case 'doctor_prescription':
        return renderDoctorPrescriptionDashboard();
      case 'support_dept':
        return renderSupportDeptDashboard();
      case 'admission':
        return (
          <div className="flex-1 flex gap-10 p-4 bg-white overflow-hidden">
            <div className="flex-1 flex flex-col gap-4 overflow-hidden">
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

              {renderSoapSection(formData.soapBlocks, formData.soapNote, 'soapNote', formData.exam, 'exam')}
            </div>
            {renderRightSidebar(true)}
          </div>
        );
      case 'surgery':
        return (
          <div className="flex-1 flex gap-10 p-4 bg-white overflow-hidden">
            <div className="flex-1 flex flex-col gap-4 overflow-hidden">
              <div className="border-2 border-black p-2 bg-gray-100 grid grid-cols-2 gap-x-4 gap-y-2 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="w-24 font-bold text-sm">성명</span>
                  <input type="text" value={formData.name} onChange={(e) => updateField('name', e.target.value)} className="flex-1 border-2 border-black px-2 py-1 text-sm focus:outline-none" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-24 font-bold text-sm">환자번호</span>
                  <input type="text" value={formData.chartNo} onChange={(e) => updateField('chartNo', e.target.value)} className="flex-1 border-2 border-black px-2 py-1 text-sm focus:outline-none" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-24 font-bold text-sm">나이/성별</span>
                  <input type="text" value={`${formData.age}/${formData.gender}`} readOnly className="flex-1 border-2 border-black px-2 py-1 text-sm focus:outline-none bg-gray-200" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-24 font-bold text-sm">병실/주치의</span>
                  <input type="text" value={`${formData.room}/${formData.doctor}`} readOnly className="flex-1 border-2 border-black px-2 py-1 text-sm focus:outline-none bg-gray-200" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-24 font-bold text-sm">집도의</span>
                  <input type="text" value={formData.surgeryAttending} onChange={(e) => updateField('surgeryAttending', e.target.value)} className="flex-1 border-2 border-black px-2 py-1 text-sm focus:outline-none" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-24 font-bold text-sm">어시스트</span>
                  <input type="text" value={formData.surgeryAssistant} onChange={(e) => updateField('surgeryAssistant', e.target.value)} className="flex-1 border-2 border-black px-2 py-1 text-sm focus:outline-none" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-24 font-bold text-sm">마취과</span>
                  <input type="text" value={formData.surgeryAnesthesiaDept} onChange={(e) => updateField('surgeryAnesthesiaDept', e.target.value)} className="flex-1 border-2 border-black px-2 py-1 text-sm focus:outline-none" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-24 font-bold text-sm">수술명</span>
                  <input type="text" value={formData.surgeryName} onChange={(e) => updateField('surgeryName', e.target.value)} className="flex-1 border-2 border-black px-2 py-1 text-sm focus:outline-none" />
                </div>
              </div>

              <div className="border-2 border-black flex flex-col flex-1 min-h-0 overflow-y-auto bg-white">
                <div className="bg-[#999] text-white px-4 py-1 font-bold sticky top-0 z-10">
                  수술/마취기록
                </div>
                <div className="p-2 flex flex-col h-full">
                  <AutoHeightTextarea 
                    value={formData.surgeryOpLabNote}
                    onChange={(e: any) => updateField('surgeryOpLabNote', e.target.value)}
                    placeholder="수술/마취기록을 입력하세요..."
                    className="w-full p-2 focus:outline-none block flex-1" 
                    minHeight="200px"
                  />
                </div>
              </div>

              <div className="border-2 border-black flex flex-col flex-1 min-h-0 overflow-y-auto bg-white">
                <div className="bg-[#999] text-white px-4 py-1 font-bold sticky top-0 z-10">
                  특이사항
                </div>
                <div className="p-2 flex flex-col h-full">
                  <AutoHeightTextarea 
                    value={formData.surgerySpecialNote}
                    onChange={(e: any) => updateField('surgerySpecialNote', e.target.value)}
                    placeholder="특이사항을 입력하세요..."
                    className="w-full p-2 focus:outline-none block flex-1" 
                    minHeight="200px"
                  />
                </div>
              </div>
            </div>
            {renderRightSidebar(false)}
          </div>
        );
      case 'consult':
        return (
          <div className="flex-1 flex gap-10 p-4 bg-white overflow-hidden">
            <div className="flex-1 flex flex-col gap-4 overflow-hidden">
              <div className="border-2 border-black flex flex-col flex-1 min-h-0 overflow-y-auto bg-white">
                <div className="bg-[#999] text-white px-4 py-1 font-bold sticky top-0 z-10 flex justify-between items-center">
                  <span>협진기록</span>
                  <button 
                    onClick={() => {
                      const newRecord: ConsultRecordItem = {
                        id: Date.now().toString(),
                        patientName: formData.name,
                        patientNo: formData.chartNo,
                        ageGender: `${formData.age}/${formData.gender}`,
                        wardDoctor: `${formData.room}/${formData.doctor}`,
                        consultReason: '',
                        otherNote: ''
                      };
                      updateField('consultRecords', [...formData.consultRecords, newRecord]);
                    }}
                    className="bg-gray-200 text-black px-2 py-0.5 text-xs font-bold border border-black hover:bg-gray-300"
                  >
                    추가
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-gray-200 border-b-2 border-black">
                        <th className="border-r border-black p-1">성명</th>
                        <th className="border-r border-black p-1">환자번호</th>
                        <th className="border-r border-black p-1">나이/성별</th>
                        <th className="border-r border-black p-1">병실/주치의</th>
                        <th className="border-r border-black p-1">협진사유</th>
                        <th className="p-1">기타노트</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.consultRecords.map((record, idx) => (
                        <tr key={record.id} className="border-b border-black">
                          <td className="border-r border-black p-1 text-center">{record.patientName}</td>
                          <td className="border-r border-black p-1 text-center">{record.patientNo}</td>
                          <td className="border-r border-black p-1 text-center">{record.ageGender}</td>
                          <td className="border-r border-black p-1 text-center">{record.wardDoctor}</td>
                          <td className="border-r border-black p-0">
                            <input 
                              type="text" 
                              value={record.consultReason}
                              onChange={(e) => {
                                const newRecords = [...formData.consultRecords];
                                newRecords[idx].consultReason = e.target.value;
                                updateField('consultRecords', newRecords);
                              }}
                              className="w-full h-full p-1 focus:outline-none"
                            />
                          </td>
                          <td className="p-0">
                            <input 
                              type="text" 
                              value={record.otherNote}
                              onChange={(e) => {
                                const newRecords = [...formData.consultRecords];
                                newRecords[idx].otherNote = e.target.value;
                                updateField('consultRecords', newRecords);
                              }}
                              className="w-full h-full p-1 focus:outline-none"
                            />
                          </td>
                        </tr>
                      ))}
                      {formData.consultRecords.length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-4 text-center text-gray-500">
                            등록된 협진기록이 없습니다.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            {renderRightSidebar(false)}
          </div>
        );
      case 'discharge':
        return (
          <div className="flex-1 flex gap-10 p-4 bg-white overflow-hidden">
            <div className="flex-1 flex flex-col gap-4 overflow-hidden">
              <div className="border-2 border-black flex flex-col flex-1 min-h-0 overflow-y-auto bg-white">
                <div className="bg-[#999] text-white px-4 py-1 font-bold sticky top-0 z-10">
                  퇴원요약지
                </div>
                <div className="p-4 flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="입원일" value={formData.dischargeAdmissionDate} onChange={(v) => updateField('dischargeAdmissionDate', v)} />
                    <InputField label="퇴원일" value={formData.dischargeDate} onChange={(v) => updateField('dischargeDate', v)} />
                  </div>
                  <InputField label="주증상" value={formData.dischargeCC} onChange={(v) => updateField('dischargeCC', v)} />
                  <InputField label="주진단명" value={formData.dischargeMainDx} onChange={(v) => updateField('dischargeMainDx', v)} />
                  <InputField label="입원사유" value={formData.dischargeReason} onChange={(v) => updateField('dischargeReason', v)} />
                  <div className="flex flex-col">
                    <span className="font-bold text-sm mb-1">입원중 경과</span>
                    <AutoHeightTextarea value={formData.dischargeProgress} onChange={(e: any) => updateField('dischargeProgress', e.target.value)} className="border-2 border-black p-2 focus:outline-none" minHeight="100px" />
                  </div>
                  <InputField label="수술/시술명 및 결과" value={formData.dischargeSurgeryStatus} onChange={(v) => updateField('dischargeSurgeryStatus', v)} />
                  <InputField label="퇴원시 상태" value={formData.dischargeStatus} onChange={(v) => updateField('dischargeStatus', v)} />
                  <InputField label="퇴원 후 계획" value={formData.dischargePostPlan} onChange={(v) => updateField('dischargePostPlan', v)} />
                  <div className="flex flex-col">
                    <span className="font-bold text-sm mb-1">퇴원약</span>
                    <AutoHeightTextarea value={formData.dischargePlan} onChange={(e: any) => updateField('dischargePlan', e.target.value)} className="border-2 border-black p-2 focus:outline-none" minHeight="100px" />
                  </div>
                </div>
              </div>
            </div>
            {renderRightSidebar(false)}
          </div>
        );
      case 'other_record':
        return (
          <div className="flex-1 flex gap-10 p-4 bg-white overflow-hidden">
            <div className="flex-1 flex flex-col gap-4 overflow-hidden">
              <div className="border-2 border-black flex flex-col flex-1 min-h-0 overflow-y-auto bg-white">
                <div className="bg-[#999] text-white px-4 py-1 font-bold sticky top-0 z-10 flex justify-between items-center">
                  <span>기타기록</span>
                  <button 
                    onClick={() => {
                      const newRecord: OtherRecordItem = {
                        id: Date.now().toString(),
                        memo: '',
                        cp: '',
                        wardRoom: '',
                        patientName: '',
                        patientNo: '',
                        genderAge: '',
                        deptDoctorDx: '',
                        otherRecord: '',
                        color: '#ffffff'
                      };
                      setGlobalOtherRecords([...globalOtherRecords, newRecord]);
                    }}
                    className="bg-gray-200 text-black px-2 py-0.5 text-xs font-bold border border-black hover:bg-gray-300"
                  >
                    추가
                  </button>
                </div>
                <div className="p-2 border-b-2 border-black flex flex-wrap gap-2 bg-gray-100">
                  {['Set', 'P-Set', '슬립', 'Anti', 'CAP', 'T-A', 'T-P', '접종', '예약', '협진'].map(btn => (
                    <button key={btn} className="bg-gray-500 text-white px-4 py-1 text-sm hover:bg-gray-600">
                      {btn}
                    </button>
                  ))}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-gray-200 border-b-2 border-black">
                        <th className="border-r border-black p-1 w-12">메모</th>
                        <th className="border-r border-black p-1 w-16">CP</th>
                        <th className="border-r border-black p-1 w-24">병동/병실</th>
                        <th className="border-r border-black p-1 w-24">환자명</th>
                        <th className="border-r border-black p-1 w-28">환자번호</th>
                        <th className="border-r border-black p-1 w-24">성별/나이</th>
                        <th className="border-r border-black p-1 w-48">진료과/주치의/진단명</th>
                        <th className="border-r border-black p-1">기타기록</th>
                        <th className="p-1 w-12">색상</th>
                      </tr>
                    </thead>
                    <tbody>
                      {globalOtherRecords.map((record, idx) => {
                        const renderCell = (field: keyof OtherRecordItem, isTextarea: boolean = true) => {
                          const cellColor = record.cellColors?.[field as keyof typeof record.cellColors] || 'transparent';
                          return (
                            <td className="border-r border-black p-0 relative group align-top" style={{ backgroundColor: cellColor }}>
                              {isTextarea ? (
                                <div className="flex items-start w-full h-full">
                                  {field === 'memo' && (
                                    <div className="p-1 shrink-0">
                                      <input 
                                        type="checkbox" 
                                        checked={record.memoChecked || false}
                                        onChange={(e) => {
                                          const newRecords = [...globalOtherRecords];
                                          newRecords[idx].memoChecked = e.target.checked;
                                          setGlobalOtherRecords(newRecords);
                                        }}
                                        className="w-4 h-4 mt-1 border-2 border-black rounded-sm cursor-pointer accent-black"
                                      />
                                    </div>
                                  )}
                                  <AutoHeightTextarea 
                                    value={record[field] as string} 
                                    onChange={(e: any) => {
                                      const newRecords = [...globalOtherRecords];
                                      (newRecords[idx] as any)[field] = e.target.value;
                                      setGlobalOtherRecords(newRecords);
                                    }} 
                                    className="w-full h-full p-1 focus:outline-none bg-transparent" 
                                    minHeight="30px"
                                  />
                                </div>
                              ) : (
                                <div className="p-1 text-center h-full flex items-center justify-center min-h-[30px]">
                                  {record[field] as string}
                                </div>
                              )}
                              <div className="absolute top-0 right-0 hidden group-hover:flex bg-white border border-black shadow-md z-20">
                                {RECORD_COLORS.map(c => (
                                  <button
                                    key={c.color}
                                    className="w-4 h-4 border-r border-black last:border-r-0 hover:opacity-80"
                                    style={{ backgroundColor: c.color }}
                                    onClick={() => {
                                      const newRecords = [...globalOtherRecords];
                                      if (!newRecords[idx].cellColors) newRecords[idx].cellColors = {};
                                      newRecords[idx].cellColors![field as keyof typeof record.cellColors] = c.color;
                                      setGlobalOtherRecords(newRecords);
                                    }}
                                    title={c.label}
                                  />
                                ))}
                              </div>
                            </td>
                          );
                        };

                        return (
                          <tr key={record.id} className="border-b border-black" style={{ backgroundColor: record.color }}>
                            {renderCell('memo')}
                            {renderCell('cp')}
                            {renderCell('wardRoom')}
                            {renderCell('patientName')}
                            {renderCell('patientNo')}
                            {renderCell('genderAge')}
                            {renderCell('deptDoctorDx')}
                            {renderCell('otherRecord')}
                            <td className="p-0 text-center align-middle relative group">
                              <div className="w-full h-full min-h-[30px] flex items-center justify-center cursor-pointer">
                                <div className="w-4 h-4 border border-black" style={{ backgroundColor: record.color === '#ffffff' ? 'transparent' : record.color }}></div>
                              </div>
                              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden group-hover:flex bg-white border border-black shadow-md z-20">
                                {RECORD_COLORS.map(c => (
                                  <button
                                    key={c.color}
                                    className="w-5 h-5 border-r border-black last:border-r-0 hover:opacity-80"
                                    style={{ backgroundColor: c.color }}
                                    onClick={() => {
                                      const newRecords = [...globalOtherRecords];
                                      newRecords[idx].color = c.color;
                                      setGlobalOtherRecords(newRecords);
                                    }}
                                    title={c.label}
                                  />
                                ))}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {globalOtherRecords.length === 0 && (
                        <tr>
                          <td colSpan={9} className="p-4 text-center text-gray-500">
                            등록된 기타기록이 없습니다.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );
      case 'other_hospital':
        return (
          <div className="flex-1 flex gap-10 p-4 bg-white overflow-hidden">
            <div className="flex-1 flex flex-col gap-4 overflow-hidden">
              <div className="border-2 border-black flex flex-col flex-1 min-h-0 overflow-y-auto bg-white">
                <div className="bg-[#999] text-white px-4 py-1 font-bold sticky top-0 z-10">
                  타병원기록
                </div>
                <div className="p-4 flex flex-col gap-3">
                  <InputField label="타병원명" value={formData.otherHospitalName} onChange={(v) => updateField('otherHospitalName', v)} />
                  <InputField label="이전 병동/주치의" value={formData.otherHospitalPrevWardDoctor} onChange={(v) => updateField('otherHospitalPrevWardDoctor', v)} />
                  <InputField label="전원사유" value={formData.otherHospitalTransferReason} onChange={(v) => updateField('otherHospitalTransferReason', v)} />
                  <div className="flex flex-col">
                    <span className="font-bold text-sm mb-1">타병원기록 요약</span>
                    <AutoHeightTextarea value={formData.otherHospitalRecord} onChange={(e: any) => updateField('otherHospitalRecord', e.target.value)} className="border-2 border-black p-2 focus:outline-none" minHeight="200px" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm mb-1">기타</span>
                    <AutoHeightTextarea value={formData.otherHospitalNote} onChange={(e: any) => updateField('otherHospitalNote', e.target.value)} className="border-2 border-black p-2 focus:outline-none" minHeight="100px" />
                  </div>
                </div>
              </div>
            </div>
            {renderRightSidebar(false)}
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
                      <RichEditor 
                        value={formData.imagingNote || ''}
                        onChange={(val) => updateField('imagingNote', val)}
                        placeholder="영상검사 결과 및 판독 내용을 입력하세요..."
                        height="100px"
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
                      <RichEditor 
                        value={formData.diagnosticNote || ''}
                        onChange={(val) => updateField('diagnosticNote', val)}
                        placeholder="진단검사 결과 및 부가 설명을 입력하세요..."
                        height="100px"
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
                          onClick={() => handleOpenPopup('calculator')}
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
                          onClick={() => handleSave()}
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
          <div className="flex-1 flex gap-10 p-4 bg-white overflow-hidden">
            <div className="w-[450px] flex flex-col gap-4 shrink-0 overflow-y-auto pr-2">
              <div className="border-2 border-black flex flex-col">
                <div className="mb-4">
                  <div className="text-xl font-bold text-center mb-1">경과기록지</div>
                  <div className="border-b-2 border-black w-full"></div>
                </div>
                <div className="bg-[#5a9a9a] text-white font-bold p-2 text-lg">환자기본정보</div>
                <div className="p-4 flex flex-col gap-6">
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
                        <input type="text" value={formData.hr} onChange={(e) => updateField('hr', e.target.value)} className="flex-1 border-b border-black px-2 h-8 focus:outline-none" spellCheck={false} />
                        <span className="text-xs font-bold">bpm</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-12 font-bold">RR</span>
                        <input type="text" value={formData.rr} onChange={(e) => updateField('rr', e.target.value)} className="flex-1 border-b border-black px-2 h-8 focus:outline-none" spellCheck={false} />
                        <span className="text-xs font-bold">회/min</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-12 font-bold">BP</span>
                        <div className="flex-1 flex items-center gap-1">
                          <input type="text" value={formData.bpSys} onChange={(e) => updateField('bpSys', e.target.value)} className="w-12 border-b border-black px-1 h-8 focus:outline-none text-center" spellCheck={false} />
                          <span>/</span>
                          <input type="text" value={formData.bpDia} onChange={(e) => updateField('bpDia', e.target.value)} className="w-12 border-b border-black px-1 h-8 focus:outline-none text-center" spellCheck={false} />
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


                  {/* 진단관리 */}
                  <div className="mt-4">
                    <div className="bg-[#BDBDBD] text-white font-bold px-3 py-1 text-lg text-center">
                      진단관리
                    </div>
                    <div className="flex flex-col gap-2 mt-2 px-1">
                      <div className="flex items-center gap-2">
                        <span className="w-24 font-bold">주진단코드 -</span>
                        <div className="flex-1 flex gap-1">
                          <select 
                            value={(formData.mainDxCode || '').charAt(0)} 
                            onChange={(e) => {
                              const letter = e.target.value;
                              const number = (formData.mainDxCode || '').slice(1) || '01';
                              const newCode = letter + number;
                              updateField('mainDxCode', newCode);
                              const dx = DX_CODES.find(d => d.code === newCode);
                              if (dx) updateField('mainDxName', dx.name);
                            }}
                            className="flex-1 border-2 border-black px-1 h-8 focus:outline-none text-sm"
                          >
                            <option value="">선택</option>
                            {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(l => <option key={l} value={l}>{l}</option>)}
                          </select>
                          <select 
                            value={(formData.mainDxCode || '').slice(1)} 
                            onChange={(e) => {
                              const letter = (formData.mainDxCode || '').charAt(0) || 'A';
                              const number = e.target.value;
                              const newCode = letter + number;
                              updateField('mainDxCode', newCode);
                              const dx = DX_CODES.find(d => d.code === newCode);
                              if (dx) updateField('mainDxName', dx.name);
                            }}
                            className="flex-1 border-2 border-black px-1 h-8 focus:outline-none text-sm"
                          >
                            <option value="">선택</option>
                            {Array.from({ length: 99 }, (_, i) => (i + 1).toString().padStart(2, '0')).map(n => <option key={n} value={n}>{n}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-24 font-bold">주진단명 -</span>
                        <input type="text" value={formData.mainDxName} onChange={(e) => updateField('mainDxName', e.target.value)} className="flex-1 border-2 border-black px-2 h-8 focus:outline-none text-sm" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-24 font-bold">부진단코드 -</span>
                        <div className="flex-1 flex gap-1">
                          <select 
                            value={(formData.subDxCode || '').charAt(0)} 
                            onChange={(e) => {
                              const letter = e.target.value;
                              const number = (formData.subDxCode || '').slice(1) || '01';
                              const newCode = letter + number;
                              updateField('subDxCode', newCode);
                              const dx = DX_CODES.find(d => d.code === newCode);
                              if (dx) updateField('subDxName', dx.name);
                            }}
                            className="flex-1 border-2 border-black px-1 h-8 focus:outline-none text-sm"
                          >
                            <option value="">선택</option>
                            {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(l => <option key={l} value={l}>{l}</option>)}
                          </select>
                          <select 
                            value={(formData.subDxCode || '').slice(1)} 
                            onChange={(e) => {
                              const letter = (formData.subDxCode || '').charAt(0) || 'A';
                              const number = e.target.value;
                              const newCode = letter + number;
                              updateField('subDxCode', newCode);
                              const dx = DX_CODES.find(d => d.code === newCode);
                              if (dx) updateField('subDxName', dx.name);
                            }}
                            className="flex-1 border-2 border-black px-1 h-8 focus:outline-none text-sm"
                          >
                            <option value="">선택</option>
                            {Array.from({ length: 99 }, (_, i) => (i + 1).toString().padStart(2, '0')).map(n => <option key={n} value={n}>{n}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-24 font-bold">부진단명 -</span>
                        <input type="text" value={formData.subDxName} onChange={(e) => updateField('subDxName', e.target.value)} className="flex-1 border-2 border-black px-2 h-8 focus:outline-none text-sm" />
                      </div>
                    </div>
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
            <div className="flex-1 grid grid-cols-3 gap-4 overflow-hidden">
              {/* Column 1: 처치/시술기록, 최종결과 */}
              <div className="flex flex-col gap-4">
                <div className="flex-1 border-2 border-black flex flex-col">
                  <div className="bg-[#00C9B1] text-white font-bold p-2 text-center text-lg">처치/시술기록</div>
                  <div className="flex-1 p-2">
                    <RichEditor 
                      value={formData.erTreatmentRecord || ''}
                      onChange={(val) => updateField('erTreatmentRecord', val)}
                      height="100%"
                    />
                  </div>
                </div>
                <div className="h-32 border-2 border-black flex flex-col">
                  <div className="bg-[#00C9B1] text-white font-bold p-2 text-center text-lg">최종결과</div>
                  <div className="flex-1 p-2 flex items-center justify-center">
                    <select 
                      value={formData.erFinalResult}
                      onChange={(e) => updateField('erFinalResult', e.target.value)}
                      className="w-full border-2 border-black h-10 px-2 focus:outline-none font-bold text-center"
                    >
                      <option value="">-- 선택 --</option>
                      <option value="귀가">귀가</option>
                      <option value="입원">입원</option>
                      <option value="전원">전원</option>
                      <option value="사망">사망</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Column 2: Order, EXAM */}
              <div className="flex flex-col gap-4">
                <div className="flex-1 border-2 border-black flex flex-col">
                  <div className="bg-[#00C9B1] text-white font-bold p-2 text-center text-lg">Order</div>
                  <div className="flex-1 p-2">
                    <RichEditor 
                      value={formData.erOrder || ''}
                      onChange={(val) => updateField('erOrder', val)}
                      height="100%"
                    />
                  </div>
                </div>
                <div className="flex-1 border-2 border-black flex flex-col">
                  <div className="bg-[#00C9B1] text-white font-bold p-2 text-center text-lg">EXAM</div>
                  <div className="flex-1 p-2">
                    <RichEditor 
                      value={formData.erExam || ''}
                      onChange={(val) => updateField('erExam', val)}
                      height="100%"
                    />
                  </div>
                </div>
              </div>

              {/* Column 3: GCS, HPI/PMH, 기본병력 */}
              <div className="flex flex-col gap-4 overflow-y-auto">
                {/* GCS */}
                <div className="border-2 border-black flex flex-col">
                  <div className="bg-[#00C9B1] text-white font-bold p-2 text-center text-lg">GCS 의식상태</div>
                  <div className="p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold">Eye Opening</span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">-</span>
                        <input 
                          type="text" 
                          value={formData.gcsEye} 
                          onChange={(e) => updateField('gcsEye', e.target.value)}
                          className="w-24 border-b-2 border-black focus:outline-none text-center"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold">Verbal Response</span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">-</span>
                        <input 
                          type="text" 
                          value={formData.gcsVerbal} 
                          onChange={(e) => updateField('gcsVerbal', e.target.value)}
                          className="w-24 border-b-2 border-black focus:outline-none text-center"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold">Motor Response</span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">-</span>
                        <input 
                          type="text" 
                          value={formData.gcsMotor} 
                          onChange={(e) => updateField('gcsMotor', e.target.value)}
                          className="w-24 border-b-2 border-black focus:outline-none text-center"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                      <span className="font-bold">총점</span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">-</span>
                        <div className={`w-24 border-b-2 border-black text-center font-bold ${
                          (() => {
                            const total = parseInt(formData.gcsEye || '0') + parseInt(formData.gcsVerbal || '0') + parseInt(formData.gcsMotor || '0');
                            if (total >= 13) return 'text-green-600';
                            if (total >= 9) return 'text-yellow-600';
                            if (total > 0) return 'text-red-600';
                            return '';
                          })()
                        }`}>
                          {parseInt(formData.gcsEye || '0') + parseInt(formData.gcsVerbal || '0') + parseInt(formData.gcsMotor || '0')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* HPI / PMH */}
                <div className="border-2 border-black flex flex-col">
                  <div className="bg-[#00C9B1] text-white font-bold p-2 text-center text-lg">HPI / PMH</div>
                  <div className="p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold">HPI</span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">-</span>
                        <input 
                          type="text" 
                          value={formData.hpi} 
                          onChange={(e) => updateField('hpi', e.target.value)}
                          className="w-32 border-b-2 border-black focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold">PMH</span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">-</span>
                        <input 
                          type="text" 
                          value={formData.pmh} 
                          onChange={(e) => updateField('pmh', e.target.value)}
                          className="w-32 border-b-2 border-black focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 기본병력 */}
                <div className="border-2 border-black flex flex-col">
                  <div className="bg-[#00C9B1] text-white font-bold p-2 text-center text-lg">기본병력</div>
                  <div className="p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold">PSH</span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">-</span>
                        <input 
                          type="text" 
                          value={formData.psh} 
                          onChange={(e) => updateField('psh', e.target.value)}
                          className="w-32 border-b-2 border-black focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold">복용약물</span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">-</span>
                        <input 
                          type="text" 
                          value={formData.medication} 
                          onChange={(e) => updateField('medication', e.target.value)}
                          className="w-32 border-b-2 border-black focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold">알러지</span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">-</span>
                        <input 
                          type="text" 
                          value={formData.allergy} 
                          onChange={(e) => updateField('allergy', e.target.value)}
                          className="w-32 border-b-2 border-black focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
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
    const NURSING_SIDEBAR_ITEMS = [
      { id: 'admission-record', label: '입원간호 기록지', icon: '📝' },
      { id: 'nursing-record', label: '간호 기록지', icon: '✍️' },
      { id: 'medication-record', label: '투약 기록지', icon: '💉' },
      { id: 'imaging-record', label: '영상검사 기록지', icon: '🩻' },
      { id: 'clinical-pathology', label: '임상병리검사', icon: '🧪' },
      { 
        id: 'patient-assessment-record', 
        label: '환자평가 기록지', 
        icon: '📊', 
        hasSub: true, 
        subItems: [
          { 
            id: 'patient-safety', 
            label: '환자평가/환자안전', 
            icon: '🛡️', 
            hasSub: true, 
            subItems: [
              { id: 'pressure-ulcer', label: '욕창도평가도구', icon: '🩹' },
              { id: 'fall-risk', label: '낙상도평가도구', icon: '📉' }
            ]
          },
          { 
            id: 'pain-assessment', 
            label: '통증평가도구', 
            icon: '😫', 
            hasSub: true, 
            subItems: [
              { id: 'nrs', label: 'NRS', icon: '🔢' }
            ]
          },
        ]
      },
      { id: 'diet-nutrition', label: '식이/영양 기록지', icon: '🍎' },
      { id: 'discharge-record', label: '퇴원간호 기록지', icon: '📄' },
      { id: 'report-writing', label: '보고서 작성', icon: '📋' },
    ];

    const NURSING_BOTTOM_ITEMS: any[] = [];

    const calculateDays = (dateStr: string, isHod: boolean) => {
      if (!dateStr) return '0';
      try {
        const d = new Date(dateStr);
        const today = new Date();
        const diff = Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
        return diff >= 0 ? diff.toString() : '0';
      } catch (e) {
        return '0';
      }
    };

    const UnderlineInput = ({ label, value, onChange, width = "w-full", placeholder = "" }: any) => (
      <div className={`flex items-center gap-2 ${width}`}>
        {label && <span className="text-gray-600 shrink-0">{label}</span>}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 border-b border-gray-400 focus:border-blue-500 outline-none px-1 py-0.5 bg-transparent text-[13px]"
          spellCheck={false}
        />
      </div>
    );

    const renderAdmissionNursingRecord = () => {
      return (
        <div className="flex-1 flex flex-col overflow-y-auto p-8 bg-white font-['Gulim','굴림',sans-serif]">
          <div className="max-w-4xl mx-auto w-full space-y-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold border-b-2 border-black inline-block pb-1">입원간호 기록지</h2>
            </div>

            {/* Basic Info Section */}
            <div className="grid grid-cols-3 gap-6 border p-6 rounded-sm bg-gray-50/30">
              <UnderlineInput label="대상" value={formData.target || '환자 본인'} onChange={(v: string) => updateField('target', v)} />
              <UnderlineInput label="성명" value={formData.name} onChange={(v: string) => updateField('name', v)} />
              <UnderlineInput label="연령/성별" value={`${formData.age}/${formData.gender}`} onChange={() => {}} />
              <UnderlineInput label="진료과" value={formData.dept} onChange={(v: string) => updateField('dept', v)} />
              <UnderlineInput label="담당의" value={formData.assignedProfessor || '이영진'} onChange={(v: string) => updateField('assignedProfessor', v)} />
              <UnderlineInput label="기록자" value={formData.recorder} onChange={(v: string) => updateField('recorder', v)} />
              <UnderlineInput label="정보제공자" value={formData.infoProvider} onChange={(v: string) => updateField('infoProvider', v)} />
              <UnderlineInput label="입원일시" value={formData.admissionDate} onChange={(v: string) => updateField('admissionDate', v)} />
              <UnderlineInput label="입원시간" value={formData.admissionTime} onChange={(v: string) => updateField('admissionTime', v)} />
            </div>

            {/* Admission Info */}
            <div className="space-y-4 border p-6 rounded-sm">
              <h3 className="font-bold text-lg border-l-4 border-[#1a4d3c] pl-3 mb-4">1. 입원 관련 정보</h3>
              <div className="grid grid-cols-2 gap-6">
                <UnderlineInput label="입원경로" value={formData.admissionPath} onChange={(v: string) => updateField('admissionPath', v)} placeholder="예: 외래, 응급실" />
                <UnderlineInput label="입원방법" value={formData.admissionMethod} onChange={(v: string) => updateField('admissionMethod', v)} placeholder="예: 도보, 휠체어, 눕는차" />
                <UnderlineInput label="의식상태" value={formData.mentalStatus} onChange={(v: string) => updateField('mentalStatus', v)} placeholder="예: Alert, Drowsy" />
                <UnderlineInput label="입원 진단명" value={formData.admissionDiagnosis} onChange={(v: string) => updateField('admissionDiagnosis', v)} />
              </div>
              <div className="space-y-4 pt-2">
                <div className="flex flex-col gap-2">
                  <span className="text-gray-600 font-medium">주호소 (Chief Complaint)</span>
                  <RichEditor 
                    value={formData.chiefComplaint || ''}
                    onChange={(val) => updateField('chiefComplaint', val)}
                    height="60px"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-gray-600 font-medium">현병력 (Present Illness)</span>
                  <RichEditor 
                    value={formData.presentIllness || ''}
                    onChange={(val) => updateField('presentIllness', val)}
                    height="80px"
                  />
                </div>
              </div>
            </div>

            {/* Medical History */}
            <div className="space-y-4 border p-6 rounded-sm">
              <h3 className="font-bold text-lg border-l-4 border-[#1a4d3c] pl-3 mb-4">2. 과거력 및 가족력</h3>
              <div className="grid grid-cols-1 gap-4">
                <UnderlineInput label="과거병력" value={formData.pastMedicalHistory} onChange={(v: string) => updateField('pastMedicalHistory', v)} placeholder="예: 고혈압, 당뇨, 결핵, 간염 등" />
                <UnderlineInput label="과거수술력" value={formData.pastSurgicalHistory} onChange={(v: string) => updateField('pastSurgicalHistory', v)} />
                <UnderlineInput label="가족력" value={formData.familyHistory} onChange={(v: string) => updateField('familyHistory', v)} />
                <UnderlineInput label="알러지" value={formData.allergies} onChange={(v: string) => updateField('allergies', v)} placeholder="약물, 음식, 환경 등" />
              </div>
            </div>

            {/* Physical Assessment */}
            <div className="space-y-4 border p-6 rounded-sm">
              <h3 className="font-bold text-lg border-l-4 border-[#1a4d3c] pl-3 mb-4">3. 신체 검진 (입원 시)</h3>
              <div className="grid grid-cols-3 gap-6">
                <UnderlineInput label="혈압 (BP)" value={formData.admissionBP} onChange={(v: string) => updateField('admissionBP', v)} placeholder="mmHg" />
                <UnderlineInput label="체온 (BT)" value={formData.admissionBT} onChange={(v: string) => updateField('admissionBT', v)} placeholder="°C" />
                <UnderlineInput label="맥박 (HR)" value={formData.admissionHR} onChange={(v: string) => updateField('admissionHR', v)} placeholder="회/분" />
                <UnderlineInput label="호흡 (RR)" value={formData.admissionRR} onChange={(v: string) => updateField('admissionRR', v)} placeholder="회/분" />
                <UnderlineInput label="SpO2" value={formData.admissionSpO2} onChange={(v: string) => updateField('admissionSpO2', v)} placeholder="%" />
                <UnderlineInput label="신장/체중" value={`${formData.height}cm / ${formData.weight}kg`} onChange={() => {}} />
              </div>
            </div>

            {/* Social History */}
            <div className="space-y-4 border p-6 rounded-sm">
              <h3 className="font-bold text-lg border-l-4 border-[#1a4d3c] pl-3 mb-4">4. 사회력 및 생활습관</h3>
              <div className="grid grid-cols-2 gap-6">
                <UnderlineInput label="흡연" value={formData.smokingStatus} onChange={(v: string) => updateField('smokingStatus', v)} />
                <UnderlineInput label="음주" value={formData.drinkingStatus} onChange={(v: string) => updateField('drinkingStatus', v)} />
                <UnderlineInput label="종교" value={formData.religion} onChange={(v: string) => updateField('religion', v)} />
                <UnderlineInput label="직업" value={formData.occupation} onChange={(v: string) => updateField('occupation', v)} />
                <UnderlineInput label="교육" value={formData.education} onChange={(v: string) => updateField('education', v)} />
                <UnderlineInput label="결혼상태" value={formData.maritalStatus} onChange={(v: string) => updateField('maritalStatus', v)} />
              </div>
            </div>
          </div>
        </div>
      );
    };

    const renderPatientAssessment = () => {
      const isBraden = formData.nursingSubTab === '욕창도평가도구';
      const title = isBraden ? '욕창위험도 사정 (Braden Scale)' : '낙상위험도 사정 (Morse Fall Scale)';
      
      return (
        <div className="flex-1 flex flex-col overflow-y-auto p-8 bg-gray-50 font-['Gulim','굴림',sans-serif]">
          <div className="max-w-4xl mx-auto w-full space-y-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold border-b-2 border-black inline-block pb-1">{title}</h2>
            </div>

            <div className="bg-white p-6 border border-gray-300 rounded-sm shadow-sm">
              <table className="w-full border-collapse border border-gray-400 text-[13px]">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-400 p-2 w-1/4">항목</th>
                    <th className="border border-gray-400 p-2">평가 내용</th>
                    <th className="border border-gray-400 p-2 w-20">점수</th>
                  </tr>
                </thead>
                <tbody>
                  {isBraden ? (
                    [
                      { label: '감각지각', options: ['전혀 없음(1)', '매우 제한(2)', '약간 제한(3)', '제한 없음(4)'] },
                      { label: '습기', options: ['항상 젖어있음(1)', '자주 젖어있음(2)', '가끔 젖어있음(3)', '거의 젖지 않음(4)'] },
                      { label: '활동상태', options: ['침상에 누워있음(1)', '의자에 앉아있음(2)', '가끔 걸음(3)', '자주 걸음(4)'] },
                      { label: '기동력', options: ['전혀 움직이지 못함(1)', '매우 제한(2)', '약간 제한(3)', '제한 없음(4)'] },
                      { label: '영양상태', options: ['매우 불량(1)', '부족(2)', '적당(3)', '우수(4)'] },
                      { label: '마찰과 응전력', options: ['문제 있음(1)', '잠재적 문제(2)', '문제 없음(3)'] },
                    ].map((row, i) => (
                      <tr key={i}>
                        <td className="border border-gray-400 p-2 font-bold bg-gray-50">{row.label}</td>
                        <td className="border border-gray-400 p-2">
                          <select className="w-full outline-none bg-transparent">
                            {row.options.map(opt => <option key={opt}>{opt}</option>)}
                          </select>
                        </td>
                        <td className="border border-gray-400 p-2 text-center font-bold">1</td>
                      </tr>
                    ))
                  ) : (
                    [
                      { label: '낙상 과거력', options: ['없음(0)', '있음(25)'] },
                      { label: '이차 진단', options: ['없음(0)', '있음(15)'] },
                      { label: '보행 보조기구', options: ['없음/침상안정/휠체어(0)', '목발/지팡이/보행기(15)', '가구(30)'] },
                      { label: '정맥 수액 주입', options: ['없음(0)', '있음(20)'] },
                      { label: '걸음걸이', options: ['정상/침상안정/휠체어(0)', '허약함(10)', '장애가 있음(20)'] },
                      { label: '의식상태', options: ['자신의 능력을 잘 앎(0)', '자신의 능력을 과대평가하거나 잊음(15)'] },
                    ].map((row, i) => (
                      <tr key={i}>
                        <td className="border border-gray-400 p-2 font-bold bg-gray-50">{row.label}</td>
                        <td className="border border-gray-400 p-2">
                          <select className="w-full outline-none bg-transparent">
                            {row.options.map(opt => <option key={opt}>{opt}</option>)}
                          </select>
                        </td>
                        <td className="border border-gray-400 p-2 text-center font-bold">0</td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-blue-50 font-bold">
                    <td colSpan={2} className="border border-gray-400 p-3 text-right">총점</td>
                    <td className="border border-gray-400 p-3 text-center text-blue-700 text-lg">
                      {isBraden ? '6' : '0'}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="bg-blue-50 p-4 border border-blue-200 rounded-sm">
              <h4 className="font-bold text-blue-800 mb-2">평가 결과 및 간호 중재</h4>
              <p className="text-sm text-blue-700">
                {isBraden 
                  ? '현재 욕창 고위험군입니다. 2시간마다 체위변경을 시행하고 피부 상태를 면밀히 관찰하십시오.' 
                  : '현재 낙상 저위험군입니다. 사이드레일을 항상 올리고 호출벨 사용법을 다시 교육하십시오.'}
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button className="px-8 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 shadow-md">평가 저장</button>
            </div>
          </div>
        </div>
      );
    };

    const renderNRS = () => {
      return (
        <div className="flex-1 flex flex-col p-8 bg-white overflow-y-auto font-['Gulim','굴림',sans-serif]">
          <div className="max-w-4xl mx-auto w-full space-y-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold border-b-2 border-black inline-block pb-1">통증평가 도구 (NRS)</h2>
            </div>

            <div className="bg-gray-50 p-8 border border-gray-300 rounded-sm">
              <div className="flex justify-between items-end mb-4">
                <span className="text-sm font-bold">통증 없음 (0점)</span>
                <span className="text-sm font-bold">극심한 통증 (10점)</span>
              </div>
              <div className="relative h-12 flex items-center mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 rounded-full opacity-20"></div>
                <div className="w-full flex justify-between px-2 relative z-10">
                  {[0,1,2,3,4,5,6,7,8,9,10].map(score => (
                    <button 
                      key={score}
                      onClick={() => updateField('nrsPain', { ...formData.nrsPain, score })}
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all border-2 ${
                        formData.nrsPain.score === score 
                          ? 'bg-blue-600 text-white border-blue-800 scale-125 shadow-lg' 
                          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                      }`}
                    >
                      {score}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <UnderlineInput label="통증 부위" value={formData.nrsPain.location} onChange={(v: string) => updateField('nrsPain', { ...formData.nrsPain, location: v })} />
                  <div className="flex items-center gap-4 text-[13px]">
                    <span className="text-gray-600 w-24">통증 양상</span>
                    <select 
                      className="flex-1 border-b border-gray-400 focus:border-blue-500 outline-none bg-transparent py-1"
                      value={formData.nrsPain.character}
                      onChange={(e) => updateField('nrsPain', { ...formData.nrsPain, character: e.target.value })}
                    >
                      <option>쑤심</option>
                      <option>찌름</option>
                      <option>타는듯함</option>
                      <option>둔함</option>
                      <option>박동성</option>
                      <option>압박감</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-[13px]">
                    <span className="text-gray-600 w-24">통증 빈도</span>
                    <select 
                      className="flex-1 border-b border-gray-400 focus:border-blue-500 outline-none bg-transparent py-1"
                      value={formData.nrsPain.frequency}
                      onChange={(e) => updateField('nrsPain', { ...formData.nrsPain, frequency: e.target.value })}
                    >
                      <option>지속적</option>
                      <option>간헐적</option>
                      <option>돌발성</option>
                    </select>
                  </div>
                  <UnderlineInput label="조절 요인" value={formData.nrsPain.factors} onChange={(v: string) => updateField('nrsPain', { ...formData.nrsPain, factors: v })} />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button className="px-8 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 shadow-md">통증 평가 저장</button>
            </div>
          </div>
        </div>
      );
    };

    const renderSubTabContent = () => {
      switch (formData.nursingSubTab) {
        case '입원간호 기록지':
          return renderAdmissionNursingRecord();
        case '간호 기록지':
          return (
            <div className="flex-1 flex flex-col bg-white overflow-hidden font-['Gulim','굴림',sans-serif]">
              <div className="flex-1 flex overflow-hidden">
                {/* Left: Prescription Note (Integrated) */}
                <div className="w-1/4 border-r border-gray-300 flex flex-col overflow-hidden">
                  <div className="bg-[#eef2f5] px-3 py-1.5 border-b border-gray-300 font-bold text-sm">
                    <span>처방 내역</span>
                  </div>
                  <div className="flex-1 p-2">
                    <RichEditor 
                      value={formData.nursingPrescriptionNote || ''}
                      onChange={(val) => updateField('nursingPrescriptionNote', val)}
                      placeholder="처방 내역을 입력하세요."
                      height="100%"
                    />
                  </div>
                </div>

                {/* Right: Nursing Record List (Reverted to Narrative) */}
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="bg-[#eef2f5] px-3 py-1.5 border-b border-gray-300 font-bold text-sm flex justify-between items-center">
                    <span>간호기록 내역</span>
                    <button 
                      onClick={() => setNursingIsWriting(true)}
                      className="bg-blue-600 text-white px-3 py-0.5 rounded text-[12px] hover:bg-blue-700 flex items-center gap-1"
                    >
                      <Edit size={12} /> 기록작성
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {formData.nursingNarrativeNotes && formData.nursingNarrativeNotes.length > 0 ? (
                      formData.nursingNarrativeNotes.map((note: any, i: number) => (
                        <div key={i} className="border border-gray-300 rounded-sm bg-white shadow-sm overflow-hidden">
                          <div className="bg-gray-100 px-3 py-1 border-b border-gray-200 flex justify-between items-center text-[11px] font-bold">
                            <span className="text-blue-900">{note.date} {note.time}</span>
                            <span className="text-gray-600">작성자: {note.author || ACCOUNTS[loginId]?.name || loginId || '간호사'}</span>
                          </div>
                          <div className="p-3 text-[13px] leading-relaxed whitespace-pre-wrap">
                            {note.content}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-20 text-gray-400 italic">저장된 간호기록이 없습니다.</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Writing Modal/Overlay */}
              {nursingIsWriting && (
                <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-10">
                  <div className="w-full max-w-4xl h-[80vh] bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col">
                    <div className="bg-blue-900 text-white px-4 py-2 flex justify-between items-center">
                      <span className="font-bold">간호기록 작성</span>
                      <button onClick={() => setNursingIsWriting(false)} className="hover:bg-white/20 p-1 rounded">✕</button>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <NursingWriter onSave={(data: any) => {
                        const formatContent = () => {
                          const tab = data.activeTab;
                          if (tab === '서술기록') return `(${tab}) ${data.narrative}`;
                          if (tab === '특기사항') return `(${tab}) ${data.specialNotes}`;
                          if (tab === 'NANDA') return `(${tab}) 영역: ${data.nandaData.domain}, 진단명: ${data.nandaData.diagnosis}, 자료: ${data.nandaData.data}, 목표: ${data.nandaData.goal}, 계획: ${data.nandaData.plan}, 수행: ${data.nandaData.interventions}`;
                          if (tab === 'SOAPIE') return `(${tab}) S: ${data.soapieData.s}, O: ${data.soapieData.o}, A: ${data.soapieData.a}, P: ${data.soapieData.p}, I: ${data.soapieData.i}, E: ${data.soapieData.e}`;
                          if (tab === 'Focus DAR') return `(${tab}) Focus: ${data.darData.focus}, D: ${data.darData.d}, A: ${data.darData.a}, R: ${data.darData.r}`;
                          return `(${tab}) ${JSON.stringify(data)}`;
                        };
                        const newNote = {
                          date: new Date().toISOString().split('T')[0],
                          time: data.time,
                          content: formatContent(),
                          author: ACCOUNTS[loginId]?.name || loginId || '간호사'
                        };
                        const updatedNotes = [...(formData.nursingNarrativeNotes || []), newNote];
                        updateField('nursingNarrativeNotes', updatedNotes);
                        setNursingIsWriting(false);
                      }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        case '투약 기록지':
          return (
            <div className="flex-1 flex flex-col p-8 bg-white overflow-y-auto font-['Gulim','굴림',sans-serif]">
              <div className="max-w-6xl mx-auto w-full space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold border-b-2 border-black inline-block pb-1">투약 기록지</h2>
                </div>

                <div className="p-3 border border-gray-300 bg-gray-50 flex gap-2 items-end rounded-sm">
                  <div className="flex-1 space-y-1">
                    <label className="text-[11px] font-bold text-gray-600">투약일시</label>
                    <input 
                      type="text"
                      className="w-full border border-gray-300 p-1.5 text-sm focus:outline-none focus:border-blue-500"
                      placeholder="예: 2023-07-27 10:30"
                      value={newMedicationRecord.dateTime}
                      onChange={(e) => setNewMedicationRecord({...newMedicationRecord, dateTime: e.target.value})}
                    />
                  </div>
                  <div className="flex-[2] space-y-1">
                    <label className="text-[11px] font-bold text-gray-600">약품명</label>
                    <input 
                      type="text"
                      className="w-full border border-gray-300 p-1.5 text-sm focus:outline-none focus:border-blue-500"
                      placeholder="약품명 입력"
                      value={newMedicationRecord.name}
                      onChange={(e) => setNewMedicationRecord({...newMedicationRecord, name: e.target.value})}
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="text-[11px] font-bold text-gray-600">용량</label>
                    <input 
                      type="text"
                      className="w-full border border-gray-300 p-1.5 text-sm focus:outline-none focus:border-blue-500"
                      placeholder="용량"
                      value={newMedicationRecord.dosage}
                      onChange={(e) => setNewMedicationRecord({...newMedicationRecord, dosage: e.target.value})}
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="text-[11px] font-bold text-gray-600">경로</label>
                    <input 
                      type="text"
                      className="w-full border border-gray-300 p-1.5 text-sm focus:outline-none focus:border-blue-500"
                      placeholder="경로"
                      value={newMedicationRecord.route}
                      onChange={(e) => setNewMedicationRecord({...newMedicationRecord, route: e.target.value})}
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="text-[11px] font-bold text-gray-600">횟수</label>
                    <input 
                      type="text"
                      className="w-full border border-gray-300 p-1.5 text-sm focus:outline-none focus:border-blue-500"
                      placeholder="횟수"
                      value={newMedicationRecord.frequency}
                      onChange={(e) => setNewMedicationRecord({...newMedicationRecord, frequency: e.target.value})}
                    />
                  </div>
                  <button 
                    onClick={() => {
                      if (!newMedicationRecord.name) return;
                      const updatedRecords = [...(formData.medicationRecords || []), { ...newMedicationRecord }];
                      updateField('medicationRecords', updatedRecords);
                      setNewMedicationRecord({ dateTime: '', name: '', dosage: '', route: '', frequency: '', status: '투약완료' });
                    }}
                    className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm font-bold hover:bg-blue-700"
                  >
                    추가
                  </button>
                </div>

                <div className="border border-gray-300 rounded-sm overflow-hidden">
                  <table className="w-full border-collapse text-[13px]">
                    <thead>
                      <tr className="bg-gray-100 border-b border-gray-300">
                        <th className="border-r border-gray-300 p-2 w-32">투약일시</th>
                        <th className="border-r border-gray-300 p-2 w-48">약품명</th>
                        <th className="border-r border-gray-300 p-2 w-24">용량</th>
                        <th className="border-r border-gray-300 p-2 w-24">경로</th>
                        <th className="border-r border-gray-300 p-2 w-24">횟수</th>
                        <th className="border-r border-gray-300 p-2">상태</th>
                        <th className="p-2 w-24">서명</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.medicationRecords && formData.medicationRecords.length > 0 ? (
                        formData.medicationRecords.map((m: any, i: number) => (
                          <tr key={i} className="border-b border-gray-200">
                            <td className="border-r border-gray-300 p-2 text-center">{m.dateTime}</td>
                            <td className="border-r border-gray-300 p-2 font-bold text-blue-800">{m.name}</td>
                            <td className="border-r border-gray-300 p-2 text-center">{m.dosage}</td>
                            <td className="border-r border-gray-300 p-2 text-center">{m.route}</td>
                            <td className="border-r border-gray-300 p-2 text-center">{m.frequency}</td>
                            <td className="border-r border-gray-300 p-2 text-center">
                              <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-[11px]">{m.status}</span>
                            </td>
                            <td className="p-2 text-center italic text-gray-500">{ACCOUNTS[loginId]?.name || loginId || '간호사'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="p-10 text-center text-gray-400 italic">투약 기록이 없습니다.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        case '영상검사 기록지':
          return (
            <div className="flex-1 flex flex-col p-8 bg-white overflow-y-auto font-['Gulim','굴림',sans-serif]">
              <div className="max-w-6xl mx-auto w-full space-y-8">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold border-b-2 border-black inline-block pb-1">영상검사 기록지</h2>
                </div>

                <div className="border border-gray-300 rounded-sm overflow-hidden">
                  <table className="w-full border-collapse text-[13px]">
                    <thead>
                      <tr className="bg-gray-100 border-b border-gray-300">
                        <th className="border-r border-gray-300 p-2 w-32">검사일시</th>
                        <th className="border-r border-gray-300 p-2 w-48">검사명(국문)</th>
                        <th className="border-r border-gray-300 p-2 w-48">검사명(영문)</th>
                        <th className="border-r border-gray-300 p-2 w-24">결과</th>
                        <th className="border-r border-gray-300 p-2">비고</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.imagingRecordItems && formData.imagingRecordItems.length > 0 ? (
                        formData.imagingRecordItems.map((item: any, idx: number) => (
                          <tr key={idx} className="border-b border-gray-200">
                            <td className="border-r border-gray-300 p-2 text-center">{item.date}</td>
                            <td className="border-r border-gray-300 p-2">{item.nameKo}</td>
                            <td className="border-r border-gray-300 p-2">{item.nameEn}</td>
                            <td className="border-r border-gray-300 p-2 text-center">{item.result}</td>
                            <td className="p-2">{item.note}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="p-10 text-center text-gray-400 italic">검사 기록이 없습니다.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <label className="border-2 border-dashed border-gray-300 rounded-lg p-10 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group">
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const base64 = event.target?.result as string;
                          const newImages = [...(formData.imagingImages || []), base64];
                          updateField('imagingImages', newImages);
                        };
                        reader.readAsDataURL(file);
                      }
                    }} 
                  />
                  <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="text-gray-400" size={32} />
                  </div>
                  <span className="text-gray-500 font-medium">검사 영상 업로드</span>
                  <span className="text-xs text-gray-400 mt-1">JPG, PNG 파일 지원</span>
                </label>

                {/* Uploaded Images Display */}
                {formData.imagingImages && formData.imagingImages.length > 0 ? (
                  <div className="mt-10 space-y-4">
                    <h3 className="font-bold text-lg border-l-4 border-blue-600 pl-3">업로드된 검사 영상</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {formData.imagingImages.map((imgSrc, idx) => (
                        <div key={idx} className="bg-black rounded-lg overflow-hidden aspect-video flex items-center justify-center relative group">
                          <img 
                            src={imgSrc} 
                            alt={`Uploaded X-Ray ${idx + 1}`} 
                            className="max-w-full max-h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                            referrerPolicy="no-referrer"
                          />
                          <button 
                            className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => {
                              const newImages = formData.imagingImages.filter((_, i) => i !== idx);
                              updateField('imagingImages', newImages);
                            }}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-10 space-y-4">
                    <h3 className="font-bold text-lg border-l-4 border-blue-600 pl-3">검사 영상 확인 (샘플)</h3>
                    <div className="bg-black rounded-lg overflow-hidden aspect-video flex items-center justify-center relative group">
                      <img 
                        src="https://picsum.photos/seed/xray/1200/800" 
                        alt="X-Ray Sample" 
                        className="max-w-full max-h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-1 rounded text-xs backdrop-blur-sm">
                        Chest PA / 2023-07-27 10:30
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        case '임상병리검사':
          return (
            <div className="flex-1 flex flex-col p-8 bg-white overflow-y-auto font-['Gulim','굴림',sans-serif]">
              <div className="max-w-6xl mx-auto w-full space-y-8">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold border-b-2 border-black inline-block pb-1">임상병리검사</h2>
                </div>

                <div className="space-y-4">
                  <div className="bg-[#f5f5f5] px-4 py-2 font-bold text-sm border-l-4 border-gray-500">
                    검사 내역
                  </div>
                  
                  {/* Add Row */}
                  <div className="p-3 border border-gray-300 bg-gray-50 flex gap-2 items-end rounded-sm">
                    <div className="flex-1 space-y-1">
                      <label className="text-[11px] font-bold text-gray-600">검사시간</label>
                      <input 
                        type="text"
                        className="w-full border border-gray-300 p-1.5 text-sm focus:outline-none focus:border-blue-500"
                        placeholder="예: 09:00 AM"
                        value={newPathologyRecord.time}
                        onChange={(e) => setNewPathologyRecord({...newPathologyRecord, time: e.target.value})}
                      />
                    </div>
                    <div className="flex-[2] space-y-1">
                      <label className="text-[11px] font-bold text-gray-600">검사명(한글)</label>
                      <input 
                        type="text"
                        className="w-full border border-gray-300 p-1.5 text-sm focus:outline-none focus:border-blue-500"
                        placeholder="한글 검사명"
                        value={newPathologyRecord.nameKo}
                        onChange={(e) => setNewPathologyRecord({...newPathologyRecord, nameKo: e.target.value})}
                      />
                    </div>
                    <div className="flex-[2] space-y-1">
                      <label className="text-[11px] font-bold text-gray-600">검사명(영문)</label>
                      <input 
                        type="text"
                        className="w-full border border-gray-300 p-1.5 text-sm focus:outline-none focus:border-blue-500"
                        placeholder="영문 검사명"
                        value={newPathologyRecord.nameEn}
                        onChange={(e) => setNewPathologyRecord({...newPathologyRecord, nameEn: e.target.value})}
                      />
                    </div>
                    <button 
                      onClick={() => {
                        if (!newPathologyRecord.time || !newPathologyRecord.nameKo) return;
                        const newEntry = {
                          id: ((formData.clinicalPathologyRecords?.length || 0) + 1).toString(),
                          time: newPathologyRecord.time,
                          nameKo: newPathologyRecord.nameKo,
                          nameEn: newPathologyRecord.nameEn
                        };
                        const updatedRecords = [...(formData.clinicalPathologyRecords || []), newEntry];
                        updateField('clinicalPathologyRecords', updatedRecords);
                        setNewPathologyRecord({ time: '', nameKo: '', nameEn: '' });
                      }}
                      className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm font-bold hover:bg-blue-700"
                    >
                      추가
                    </button>
                  </div>

                  <div className="border border-gray-300 rounded-sm overflow-hidden">
                    <table className="w-full border-collapse text-[13px]">
                      <thead>
                        <tr className="bg-white border-b border-gray-300">
                          <th className="p-3 text-left w-24">검사번호</th>
                          <th className="p-3 text-left w-32">검사시간</th>
                          <th className="p-3 text-left w-64">검사명(한글)</th>
                          <th className="p-3 text-left">검사명(영문)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.clinicalPathologyRecords && formData.clinicalPathologyRecords.length > 0 ? (
                          formData.clinicalPathologyRecords.map((record: any, idx: number) => (
                            <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                              <td className="p-3">{record.id}</td>
                              <td className="p-3">{record.time}</td>
                              <td className="p-3">{record.nameKo}</td>
                              <td className="p-3">{record.nameEn}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="p-20 text-center text-gray-400 italic">검사 내역이 없습니다.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          );
        case '욕창도평가도구':
        case '낙상도평가도구':
          return renderPatientAssessment();
        case 'NRS':
          return renderNRS();
        case '퇴원간호 기록지':
          return (
            <div className="flex-1 flex flex-col p-8 bg-white overflow-y-auto font-['Gulim','굴림',sans-serif]">
              <div className="max-w-4xl mx-auto w-full space-y-8">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold border-b-2 border-black inline-block pb-1">퇴원간호 기록지</h2>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <UnderlineInput label="퇴원일시" value={formData.dischargeDate} onChange={(v: string) => updateField('dischargeDate', v)} />
                    <div className="flex items-center gap-4 text-[13px]">
                      <span className="text-gray-600 w-24">퇴원형태</span>
                      <select 
                        className="flex-1 border-b border-gray-400 focus:border-blue-500 outline-none bg-transparent py-1"
                        value={formData.dischargeType || '자택'}
                        onChange={(e) => updateField('dischargeType', e.target.value)}
                      >
                        <option>자택</option>
                        <option>타병원 전원</option>
                        <option>무단이탈</option>
                        <option>사망</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <UnderlineInput label="퇴원예약일" value={formData.dischargeFollowUpDate} onChange={(v: string) => updateField('dischargeFollowUpDate', v)} />
                    <UnderlineInput label="퇴원약" value={formData.dischargeMedication} onChange={(v: string) => updateField('dischargeMedication', v)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block font-bold text-sm border-l-4 border-blue-600 pl-2">퇴원 교육 내용</label>
                  <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded border border-gray-200">
                    {[
                      { label: '식이요법', key: 'dietEdu' as keyof Patient },
                      { label: '운동/활동', key: 'exerciseEdu' as keyof Patient },
                      { label: '투약안내', key: 'medEdu' as keyof Patient },
                      { label: '상처관리', key: 'woundEdu' as keyof Patient },
                      { label: '응급시 대처', key: 'emergencyEdu' as keyof Patient },
                      { label: '기타', key: 'otherEdu' as keyof Patient }
                    ].map(item => (
                      <label key={item.key} className="flex items-center gap-2 text-[13px] cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={formData[item.key] as boolean} 
                          onChange={(e) => updateField(item.key, e.target.checked)}
                          className="w-4 h-4"
                        />
                        {item.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block font-bold text-sm border-l-4 border-blue-600 pl-2">퇴원시 환자 상태 및 간호 경과</label>
                  <RichEditor 
                    value={formData.dischargeProgress || ''}
                    onChange={(val) => updateField('dischargeProgress', val)}
                    placeholder="퇴원 시점의 환자 상태를 상세히 기록하세요."
                    height="200px"
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button onClick={() => handleSave()} className="px-6 py-2 bg-gray-200 font-bold rounded hover:bg-gray-300 text-sm">임시저장</button>
                  <button onClick={() => handleSave()} className="px-6 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 text-sm">퇴원기록 저장</button>
                </div>
              </div>
            </div>
          );
        case '보고서 작성':
          return (
            <div className="flex-1 flex flex-col p-8 bg-white overflow-y-auto font-['Gulim','굴림',sans-serif]">
              <div className="max-w-4xl mx-auto w-full space-y-8">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold border-b-2 border-black inline-block pb-1">보고서 작성</h2>
                </div>

                <div className="grid grid-cols-3 gap-6 mb-6">
                  <div className="space-y-2">
                    <label className="block font-bold text-sm text-gray-700">보고서 종류</label>
                    <select 
                      className="w-full border-b border-gray-400 p-1 focus:outline-none focus:border-blue-500 text-[13px] bg-transparent"
                      value={newReport.type}
                      onChange={(e) => setNewReport({...newReport, type: e.target.value})}
                    >
                      <option value="낙상">낙상보고서</option>
                      <option value="도주">도주보고서</option>
                      <option value="욕창">욕창보고서</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block font-bold text-sm text-gray-700">작성일</label>
                    <input
                      type="text"
                      className="w-full border-b border-gray-400 p-1 focus:outline-none focus:border-blue-500 text-[13px] bg-transparent"
                      placeholder="YYYY-MM-DD"
                      value={newReport.reportDate}
                      onChange={(e) => setNewReport({...newReport, reportDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block font-bold text-sm text-gray-700">작성자</label>
                    <input
                      type="text"
                      className="w-full border-b border-gray-400 p-1 focus:outline-none focus:border-blue-500 text-[13px] bg-transparent"
                      placeholder="작성자 성명"
                      value={newReport.author || (ACCOUNTS[loginId]?.name || loginId || '')}
                      onChange={(e) => setNewReport({...newReport, author: e.target.value})}
                    />
                  </div>
                </div>

                <div className="p-6 border-2 border-black bg-gray-50 space-y-6">
                  <h3 className="text-lg font-black border-b-2 border-black pb-2">
                    {newReport.type} 보고서 작성
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <UnderlineInput label="발생일시" placeholder="YYYY-MM-DD HH:mm" value={newReport.date} onChange={(v: string) => setNewReport({...newReport, date: v})} />
                    <UnderlineInput label="발생장소" placeholder="예: 병실, 화장실, 복도" value={newReport.location} onChange={(v: string) => setNewReport({...newReport, location: v})} />
                  </div>
                  <div className="space-y-2">
                    <label className="block font-bold text-sm">작성내용</label>
                    <RichEditor 
                      value={newReport.content || ''}
                      onChange={(val) => setNewReport({...newReport, content: val})}
                      placeholder="보고서 작성 내용을 입력하세요."
                      height="150px"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block font-bold text-sm">상세 경위</label>
                    <RichEditor 
                      value={newReport.details || ''}
                      onChange={(val) => setNewReport({...newReport, details: val})}
                      placeholder="사건의 상세 내용을 입력하세요."
                      height="150px"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block font-bold text-sm">조치 사항</label>
                    <RichEditor 
                      value={newReport.actions || ''}
                      onChange={(val) => setNewReport({...newReport, actions: val})}
                      placeholder="사건 발생 후 취해진 조치를 입력하세요."
                      height="100px"
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <button 
                      onClick={() => {
                        if (!newReport.date || !newReport.details || !newReport.content) return;
                        const report = {
                          ...newReport,
                          author: newReport.author || (ACCOUNTS[loginId]?.name || loginId || '간호사')
                        };
                        const newReportsList = [report, ...(formData.reports || [])];
                        updateField('reports', newReportsList);
                        handleSave({ reports: newReportsList });
                        setNewReport({ type: '낙상', reportDate: '', author: '', date: '', location: '', details: '', actions: '', content: '' });
                        alert('보고서가 제출되었습니다.');
                      }}
                      className="px-6 py-2 bg-black text-white font-bold hover:bg-gray-800 transition-colors"
                    >
                      보고서 제출
                    </button>
                  </div>
                </div>

                {/* Display submitted reports */}
                {formData.reports && formData.reports.length > 0 && (
                  <div className="mt-8 space-y-4">
                    <h3 className="text-lg font-black border-b-2 border-black pb-2">제출된 보고서 내역</h3>
                    <div className="grid grid-cols-1 gap-4">
                      {formData.reports.map((report, idx) => (
                        <div key={idx} className="border border-gray-300 p-4 rounded bg-gray-50">
                          <div className="flex justify-between items-center mb-2 border-b border-gray-200 pb-2">
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-blue-800">[{report.type}보고서]</span>
                              <span className="text-xs text-gray-500">작성일: {report.reportDate || '미상'} | 작성자: {report.author || '미상'}</span>
                            </div>
                            <span className="text-sm text-gray-600">발생일시: {report.date}</span>
                          </div>
                          <div className="text-sm space-y-1">
                            <p><span className="font-bold">발생장소:</span> {report.location}</p>
                            <p><span className="font-bold">작성내용:</span> {report.content}</p>
                            <p><span className="font-bold">상세경위:</span> {report.details}</p>
                            <p><span className="font-bold">조치사항:</span> {report.actions}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        case '식이/영양 기록지':
          return (
            <div className="flex-1 flex flex-col p-8 bg-white overflow-y-auto font-['Gulim','굴림',sans-serif]">
              <div className="max-w-5xl mx-auto w-full space-y-8">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold border-b-2 border-black inline-block pb-1">식이/영양 기록지</h2>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div className="bg-blue-50 p-4 rounded border border-blue-100 flex flex-col items-center justify-center">
                    <span className="text-xs text-blue-600 font-bold mb-1">현재 식이</span>
                    <span className="text-xl font-black text-blue-900">{formData.currentDiet || '일반식'}</span>
                  </div>
                  <div className="bg-green-50 p-4 rounded border border-green-100 flex flex-col items-center justify-center">
                    <span className="text-xs text-green-600 font-bold mb-1">금식 여부</span>
                    <span className="text-xl font-black text-green-900">{formData.isFasting ? '금식중 (NPO)' : '식사 가능'}</span>
                  </div>
                  <div className="bg-orange-50 p-4 rounded border border-orange-100 flex flex-col items-center justify-center">
                    <span className="text-xs text-orange-600 font-bold mb-1">특이사항</span>
                    <span className="text-sm font-bold text-orange-900">{formData.dietNote || '없음'}</span>
                  </div>
                </div>

                <div className="p-3 border border-gray-300 bg-gray-50 flex gap-2 items-end rounded-sm">
                  <div className="flex-1 space-y-1">
                    <label className="text-[11px] font-bold text-gray-600">날짜</label>
                    <input 
                      type="text"
                      className="w-full border border-gray-300 p-1.5 text-sm focus:outline-none focus:border-blue-500"
                      placeholder="예: 2023-07-27"
                      value={newDietRecord.date}
                      onChange={(e) => setNewDietRecord({...newDietRecord, date: e.target.value})}
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="text-[11px] font-bold text-gray-600">구분</label>
                    <select 
                      className="w-full border border-gray-300 p-1.5 text-sm focus:outline-none focus:border-blue-500"
                      value={newDietRecord.type}
                      onChange={(e) => setNewDietRecord({...newDietRecord, type: e.target.value})}
                    >
                      <option value="아침">아침</option>
                      <option value="점심">점심</option>
                      <option value="저녁">저녁</option>
                      <option value="간식">간식</option>
                    </select>
                  </div>
                  <div className="flex-[2] space-y-1">
                    <label className="text-[11px] font-bold text-gray-600">식이 종류</label>
                    <input 
                      type="text"
                      className="w-full border border-gray-300 p-1.5 text-sm focus:outline-none focus:border-blue-500"
                      placeholder="식이 종류 입력"
                      value={newDietRecord.dietName}
                      onChange={(e) => setNewDietRecord({...newDietRecord, dietName: e.target.value})}
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="text-[11px] font-bold text-gray-600">섭취량</label>
                    <select 
                      className="w-full border border-gray-300 p-1.5 text-sm focus:outline-none focus:border-blue-500"
                      value={newDietRecord.amount}
                      onChange={(e) => setNewDietRecord({...newDietRecord, amount: e.target.value})}
                    >
                      <option value="Full">Full</option>
                      <option value="1/2">1/2</option>
                      <option value="None">None</option>
                    </select>
                  </div>
                  <button 
                    onClick={() => {
                      if (!newDietRecord.dietName) return;
                      const updatedRecords = [...(formData.dietRecords || []), { ...newDietRecord }];
                      updateField('dietRecords', updatedRecords);
                      setNewDietRecord({ date: '', type: '아침', dietName: '', amount: 'Full', note: '' });
                    }}
                    className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm font-bold hover:bg-blue-700"
                  >
                    추가
                  </button>
                </div>

                <div className="border border-gray-300 rounded-sm overflow-hidden">
                  <table className="w-full border-collapse text-[13px]">
                    <thead>
                      <tr className="bg-gray-100 border-b border-gray-300">
                        <th className="border-r border-gray-300 p-3 w-32">날짜</th>
                        <th className="border-r border-gray-300 p-3 w-32">구분</th>
                        <th className="border-r border-gray-300 p-3 w-48">식이 종류</th>
                        <th className="border-r border-gray-300 p-3 w-32">섭취량</th>
                        <th className="p-3">비고</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.dietRecords && formData.dietRecords.length > 0 ? (
                        formData.dietRecords.map((record: any, idx: number) => (
                          <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="border-r border-gray-300 p-3 text-center">{record.date}</td>
                            <td className="border-r border-gray-300 p-3 text-center font-bold">{record.type}</td>
                            <td className="border-r border-gray-300 p-3">{record.dietName}</td>
                            <td className="border-r border-gray-300 p-3 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                record.amount === 'Full' ? 'bg-green-100 text-green-800' : 
                                record.amount === '1/2' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {record.amount}
                              </span>
                            </td>
                            <td className="p-3 text-gray-600">{record.note}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="p-10 text-center text-gray-400 italic">식이 기록이 없습니다.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
                    신규 식이 기록 입력
                  </h3>
                  <div className="grid grid-cols-4 gap-4 items-end">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500">구분</label>
                      <select className="w-full border border-gray-300 p-2 rounded bg-white text-sm">
                        <option>아침</option>
                        <option>점심</option>
                        <option>저녁</option>
                        <option>간식</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500">섭취량</label>
                      <select className="w-full border border-gray-300 p-2 rounded bg-white text-sm">
                        <option>Full</option>
                        <option>3/4</option>
                        <option>1/2</option>
                        <option>1/4</option>
                        <option>NPO</option>
                      </select>
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className="text-xs font-bold text-gray-500">비고</label>
                      <input type="text" className="w-full border border-gray-300 p-2 rounded bg-white text-sm" placeholder="특이사항 입력" />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button className="bg-blue-600 text-white px-6 py-2 rounded font-bold text-sm hover:bg-blue-700 transition-colors">기록 추가</button>
                  </div>
                </div>
              </div>
            </div>
          );
        default:
          return (
            <div className="flex-1 flex items-center justify-center text-gray-400 bg-gray-50">
              <div className="text-center">
                <div className="text-4xl mb-2">🚧</div>
                <div className="text-sm font-medium">{formData.nursingSubTab} 컨텐츠 준비 중입니다.</div>
              </div>
            </div>
          );
      }
    };

    return (
      <div className="flex-1 flex bg-[#D0D0D0] overflow-hidden font-['Gulim','굴림',sans-serif]">
        {/* Left Sidebar */}
        <div className="w-[220px] flex flex-col shrink-0 overflow-y-auto" style={{ backgroundColor: currentTheme.color }}>
          <div className="flex flex-col py-2">
            {NURSING_SIDEBAR_ITEMS.map(item => (
              <div key={item.id}>
                <button
                  className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/10 transition-colors text-[13px] text-left ${currentTheme.name === 'Pink' ? 'text-black' : 'text-white'} ${formData.nursingSubTab === item.label ? 'bg-white/20 font-bold' : ''}`}
                  onClick={() => {
                    if (item.hasSub) {
                      setNursingSidebarOpen(prev => ({ ...prev, [item.id]: !prev[item.id] }));
                    } else {
                      updateField('nursingSubTab', item.label);
                      setNursingIsWriting(false);
                    }
                  }}
                >
                  <span className="text-base w-5 text-center">{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {item.hasSub && (
                    <ChevronDown 
                      size={14} 
                      className={`opacity-50 transition-transform ${nursingSidebarOpen[item.id] ? 'rotate-180' : ''}`} 
                    />
                  )}
                </button>
                {item.hasSub && nursingSidebarOpen[item.id] && item.subItems && (
                  <div className="bg-black/10 py-1">
                    {item.subItems.map(sub => (
                      <div key={sub.id}>
                        <button
                          className={`w-full flex items-center gap-3 pl-10 pr-4 py-2 hover:bg-white/10 transition-colors text-[12px] text-left ${currentTheme.name === 'Pink' ? (formData.nursingSubTab === sub.label ? 'bg-white/20 font-bold text-black' : 'text-black/80') : (formData.nursingSubTab === sub.label ? 'bg-white/20 font-bold text-white' : 'text-white/80')}`}
                          onClick={() => {
                            if (sub.hasSub) {
                              setNursingSidebarOpen(prev => ({ ...prev, [sub.id]: !prev[sub.id] }));
                            } else {
                              updateField('nursingSubTab', sub.label);
                              setNursingIsWriting(false);
                            }
                          }}
                        >
                          <span className="text-sm w-4 text-center">{sub.icon}</span>
                          <span className="flex-1">{sub.label}</span>
                          {sub.hasSub && (
                            <ChevronDown 
                              size={12} 
                              className={`opacity-50 transition-transform ${nursingSidebarOpen[sub.id] ? 'rotate-180' : ''}`} 
                            />
                          )}
                        </button>
                        {sub.hasSub && nursingSidebarOpen[sub.id] && sub.subItems && (
                          <div className="bg-black/5 py-1">
                            {sub.subItems.map(ss => (
                              <button
                                key={ss.id}
                                className={`w-full flex items-center gap-3 pl-14 pr-4 py-1.5 hover:bg-white/10 transition-colors text-[11px] text-left ${currentTheme.name === 'Pink' ? (formData.nursingSubTab === ss.label ? 'bg-white/20 font-bold text-black' : 'text-black/60') : (formData.nursingSubTab === ss.label ? 'bg-white/20 font-bold text-white' : 'text-white/60')}`}
                                onClick={() => {
                                  updateField('nursingSubTab', ss.label);
                                  setNursingIsWriting(false);
                                }}
                              >
                                <span className="text-xs w-4 text-center">{ss.icon}</span>
                                <span className="flex-1">{ss.label}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-auto border-t border-white/10 pt-4 pb-6 flex flex-col">
             {NURSING_BOTTOM_ITEMS.map(item => (
               <button
                 key={item.id}
                 className="flex items-center gap-3 px-4 py-2 text-white/80 hover:bg-white/10 transition-colors text-[12px] text-left"
               >
                 <span className="text-sm w-5 text-center">{item.icon}</span>
                 <span>{item.label}</span>
               </button>
             ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          {/* Top Patient Info Header */}
          <div className="bg-[#f2f7f7] p-4 border-b border-gray-300 grid grid-cols-4 gap-x-12 gap-y-2 text-[13px]">
             <UnderlineInput label="등록번호" value={formData.chartNo} onChange={(v: string) => updateField('chartNo', v)} />
             <UnderlineInput label="키" value={formData.height} onChange={(v: string) => updateField('height', v)} />
             <UnderlineInput label="진료과" value={formData.dept} onChange={(v: string) => updateField('dept', v)} />
             <UnderlineInput label="주진단코드" value={formData.mainDxCode} onChange={(v: string) => updateField('mainDxCode', v)} />
             
             <div className="flex items-start gap-4">
               <span className="text-gray-600 w-16">이름</span>
               <div className="flex flex-col flex-1">
                 <input 
                   type="text" 
                   value={formData.name} 
                   onChange={(e) => updateField('name', e.target.value)}
                   className="font-bold border-b border-gray-400 focus:border-blue-500 outline-none bg-transparent"
                   spellCheck={false}
                 />

               </div>
             </div>
             <UnderlineInput label="체중" value={formData.weight} onChange={(v: string) => updateField('weight', v)} />
             <UnderlineInput label="병동" value={formData.ward} onChange={(v: string) => updateField('ward', v)} />
             <UnderlineInput label="주진단명" value={formData.mainDxName} onChange={(v: string) => updateField('mainDxName', v)} />

             <UnderlineInput label="나이" value={formData.age} onChange={(v: string) => updateField('age', v)} />
             <div className="flex items-center gap-4">
               <span className="text-gray-600 w-16">HOD</span>
               <span className="font-bold">{calculateDays(formData.admissionDate, true)}</span>
             </div>
             <UnderlineInput label="병실" value={formData.room} onChange={(v: string) => updateField('room', v)} />
             <UnderlineInput label="부진단코드" value={formData.subDxCode} onChange={(v: string) => updateField('subDxCode', v)} />

             <div className="flex items-center gap-4">
               <span className="text-gray-600 w-16">성별</span>
               <span className="font-bold">{formData.gender === 'M' ? '남자' : '여자'}</span>
             </div>
             <div className="flex items-center gap-4">
               <span className="text-gray-600 w-16">POD</span>
               <span className="font-bold">{calculateDays(formData.surgeryDate, false)}</span>
             </div>
             <UnderlineInput label="담당교수" value={formData.assignedProfessor} onChange={(v: string) => updateField('assignedProfessor', v)} />
             <UnderlineInput label="부진단명" value={formData.subDxName} onChange={(v: string) => updateField('subDxName', v)} />

             <UnderlineInput label="혈액형" value={formData.bloodType} onChange={(v: string) => updateField('bloodType', v)} />
             <div className="flex items-center gap-4"></div>
             <div className="flex items-center gap-4"></div>
             <div className="flex items-center gap-4"></div>
          </div>

          {/* Two Column Content */}
          {renderSubTabContent()}
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
    <ErrorBoundary>
      <div 
        style={{ backgroundColor: currentTheme.bg }}
        className="flex flex-col h-screen min-w-[1200px] font-sans overflow-hidden"
      >
      <div className="flex flex-col border-b-2 border-gray-400 shrink-0 font-['Gulim','굴림',sans-serif]" style={{ backgroundColor: currentTheme.bg }}>
        {/* New Top Row */}
        <div className="flex items-center justify-start gap-2 px-4 py-1.5 border-b border-gray-300 bg-[#f0f0f0]">
          <button 
            onClick={() => {
              setActiveTopMenu('의사처방');
              setActiveTab('doctor_prescription');
            }}
            className={`font-bold text-[14px] px-3 py-0.5 rounded transition-all ${activeTopMenu === '의사처방' ? 'bg-[#555555] text-white' : 'text-black hover:bg-gray-300'}`}
          >
            의사처방
          </button>
          <button 
            onClick={() => {
              setActiveTopMenu('E.M.R');
              setActiveTab('admission');
            }}
            className={`font-bold text-[14px] px-3 py-0.5 rounded transition-all ${activeTopMenu === 'E.M.R' ? 'bg-[#555555] text-white' : 'text-black hover:bg-gray-300'}`}
          >
            E.M.R
          </button>
          <button 
            onClick={() => {
              setActiveTopMenu('간호');
              setActiveTab('nursing');
            }}
            className={`font-bold text-[14px] px-3 py-0.5 rounded transition-all ${activeTopMenu === '간호' ? 'bg-[#555555] text-white' : 'text-black hover:bg-gray-300'}`}
          >
            간호
          </button>
          <button 
            onClick={() => {
              setActiveTopMenu('지원부서');
              setActiveTab('support_dept');
            }}
            className={`font-bold text-[14px] px-3 py-0.5 rounded transition-all ${activeTopMenu === '지원부서' ? 'bg-[#555555] text-white' : 'text-black hover:bg-gray-300'}`}
          >
            지원부서
          </button>
          <button 
            onClick={() => {
              setActiveTopMenu('제증명 관리');
            }}
            className={`font-bold text-[14px] px-3 py-0.5 rounded transition-all ${activeTopMenu === '제증명 관리' ? 'bg-[#555555] text-white' : 'text-black hover:bg-gray-300'}`}
          >
            제증명 관리
          </button>
          <button 
            onClick={() => {
              if (isActiveWindowOn) {
                handleOpenPopup('settings');
              } else {
                setActiveTopMenu('환경설정');
                setShowSettings(true);
              }
            }}
            className={`font-bold text-[14px] px-3 py-0.5 rounded transition-all ${activeTopMenu === '환경설정' ? 'bg-[#555555] text-white' : 'text-black hover:bg-gray-300'}`}
          >
            환경설정
          </button>
          <div className="relative">
            <button 
              onClick={() => setShowActiveWindowMenu(!showActiveWindowMenu)}
              className={`font-bold text-[14px] px-3 py-0.5 rounded transition-all flex items-center gap-1 ${isActiveWindowOn ? 'bg-blue-600 text-white' : 'text-black hover:bg-gray-300'}`}
            >
              활성창
              <ChevronDown size={14} />
            </button>
            {showActiveWindowMenu && (
              <div className="absolute top-full left-0 mt-1 bg-white border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] z-[150] w-32 py-1">
                <button 
                  onClick={() => {
                    setIsActiveWindowOn(true);
                    setShowActiveWindowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 font-bold text-sm flex items-center justify-between"
                >
                  켜기 {isActiveWindowOn && <Check size={14} className="text-green-600" />}
                </button>
                <button 
                  onClick={() => {
                    setIsActiveWindowOn(false);
                    setShowActiveWindowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 font-bold text-sm flex items-center justify-between"
                >
                  끄기 {!isActiveWindowOn && <Check size={14} className="text-red-600" />}
                </button>
              </div>
            )}
          </div>
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
        {!['의사처방', '간호', '지원부서', '활성창'].includes(activeTopMenu) && (
          <div className="flex items-center justify-between px-4 py-2.5">
            <div className="flex items-center gap-2">
              <HeaderButton 
                icon={Save} 
                label={isSaving ? "저장 중..." : "저장"} 
                onClick={() => handleSave()} 
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
              <TabButton label="응급기록" count={tabCounts.er} active={activeTab === 'er'} onClick={() => setActiveTab('er')} theme={currentTheme} />
              <TabButton label="입원결과" count={tabCounts.admission} active={activeTab === 'admission'} onClick={() => setActiveTab('admission')} theme={currentTheme} />
              <TabButton label="수술처치" count={tabCounts.surgery} active={activeTab === 'surgery'} onClick={() => setActiveTab('surgery')} theme={currentTheme} />
              <TabButton label="협진기록" count={tabCounts.consult} active={activeTab === 'consult'} onClick={() => setActiveTab('consult')} theme={currentTheme} />
              <TabButton label="퇴원요약" count={tabCounts.discharge} active={activeTab === 'discharge'} onClick={() => setActiveTab('discharge')} theme={currentTheme} />
              <TabButton label="검사결과" count={tabCounts.lab} active={activeTab === 'lab'} onClick={() => setActiveTab('lab')} theme={currentTheme} />
              <TabButton label="기타기록" count={tabCounts.other_record} active={activeTab === 'other_record'} onClick={() => setActiveTab('other_record')} theme={currentTheme} />
              <TabButton label="타병원기록" count={tabCounts.other_hospital} active={activeTab === 'other_hospital'} onClick={() => setActiveTab('other_hospital')} theme={currentTheme} />
              <TabButton label="처방" count={tabCounts.prescription} active={activeTab === 'prescription'} onClick={() => setActiveTab('prescription')} theme={currentTheme} />
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
                onClick={() => setActiveTopMenu('제증명 관리')} 
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
        )}
    </div>

      <div className="flex flex-1 overflow-hidden">
        <div 
          style={{ width: isPatientListCollapsed ? '30px' : `${patientListWidth}px` }}
          className="bg-white border-r-2 border-black flex flex-col transition-all duration-300 relative shrink-0 font-gulim"
        >
          <div 
            style={{ backgroundColor: currentTheme.color }}
            className="text-white px-2 py-1 flex items-center justify-between font-bold border-b-2 border-black h-[30px] text-sm shrink-0"
          >
            {!isPatientListCollapsed && (
              <div className="flex items-center gap-1 overflow-hidden whitespace-nowrap">
                <FileText size={16} />
                <span>환자리스트</span>
              </div>
            )}
            <button 
              onClick={() => setIsPatientListCollapsed(!isPatientListCollapsed)}
              className="hover:bg-black/20 p-0.5 rounded transition-colors"
            >
              {isPatientListCollapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
            </button>
          </div>
          
          {!isPatientListCollapsed && (
            <>
              <div className="bg-[#E5F0FA] border-b-2 border-black shrink-0">
                {/* Department Box */}
                <div className="flex items-center gap-1 p-1">
                  <div className="border border-[#A0C0E0] bg-white px-2 py-0.5 text-[11px] font-bold text-[#333] h-[22px] flex items-center">
                    병동
                  </div>
                  <select 
                    value={selectedDeptFilter}
                    onChange={(e) => setSelectedDeptFilter(e.target.value)}
                    className="flex-1 border border-[#A0C0E0] p-0.5 text-[11px] focus:outline-none h-[22px] font-bold"
                  >
                    {DEPARTMENTS.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  <button className="flex items-center gap-1 border border-[#A0C0E0] bg-white px-2 py-0.5 text-[11px] font-bold text-[#333] hover:bg-[#F0F0F0] h-[22px]">
                    <RefreshCw size={10} className="text-blue-600" />
                    새로고침
                  </button>
                </div>

                {/* Search */}
                <div className="flex items-center gap-2 p-1">
                  <div className="flex items-center gap-2 text-xs text-[#333] font-bold whitespace-nowrap">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input type="checkbox" checked={filterByAll} onChange={(e) => setFilterByAll(e.target.checked)} className="accent-black w-3 h-3" /> 전체
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input type="checkbox" checked={filterByName} onChange={(e) => setFilterByName(e.target.checked)} className="accent-black w-3 h-3" /> 이름
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input type="checkbox" checked={filterByDept} onChange={(e) => setFilterByDept(e.target.checked)} className="accent-black w-3 h-3" /> 과
                    </label>
                  </div>
                  <div className="flex-1 relative flex items-center">
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      spellCheck="false"
                      className="w-full border border-[#A0C0E0] pl-1 pr-6 py-0.5 text-xs focus:outline-none h-[24px]"
                    />
                    <Search className="absolute right-1 text-[#555]" size={14} />
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex font-gulim">
                  <button 
                    onClick={() => setPatientTab('all')}
                    className={`flex-1 py-1 text-[11px] font-bold ${patientTab === 'all' ? 'bg-white border-b-2 border-x border-[#A0C0E0] text-black' : 'bg-[#D0E0F0] text-[#555]'}`}
                  >
                    전체환자
                  </button>
                  <button 
                    onClick={() => setPatientTab('er')}
                    className={`flex-1 py-1 text-[11px] font-bold ${patientTab === 'er' ? 'bg-white border-b-2 border-x border-[#A0C0E0] text-black' : 'bg-[#D0E0F0] text-[#555]'}`}
                  >
                    응급실환자
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto font-gulim">
                {(() => {
                  const wards = ['ICU', '101병동', 'PED101병동', 'OB101병동', 'OB산후병동', 'PACU', 'EM응급실', '퇴원완료'];
                  const grouped: Record<string, Patient[]> = {
                    'ICU': [],
                    '101병동': [],
                    'PED101병동': [],
                    'OB101병동': [],
                    'OB산후병동': [],
                    'PACU': [],
                    'EM응급실': [],
                    '퇴원완료': [],
                    '기타': []
                  };

                  filteredPatients.forEach(p => {
                    const room = p.room || '';
                    const dept = p.dept || '';
                    const chartNo = p.chartNo || '';
                    const isDischarged = p.dischargeNote || p.dischargeReason || p.dischargeDiagnosis || p.dischargeCC || p.dischargeMainDx || p.dischargeDate || p.dischargeProgress || p.dischargeStatus || p.dischargePlan || (p.dischargeSoapBlocks && p.dischargeSoapBlocks.length > 0);
                    
                    if (isDischarged) grouped['퇴원완료'].push(p);
                    else if (chartNo.startsWith('ER')) grouped['EM응급실'].push(p);
                    else if (room.includes('ICU')) grouped['ICU'].push(p);
                    else if (room.includes('PACU')) grouped['PACU'].push(p);
                    else if (room.includes('101')) {
                      if (dept === 'PED') grouped['PED101병동'].push(p);
                      else if (dept === 'OB') grouped['OB101병동'].push(p);
                      else grouped['101병동'].push(p);
                    }
                    else if (dept === 'OB' && room.includes('산후')) grouped['OB산후병동'].push(p);
                    else grouped['기타'].push(p);
                  });

                  const displayWards = patientTab === 'er' ? ['EM응급실', '퇴원완료'] : [...wards, '기타'];

                  return displayWards.map(ward => {
                    const patients = grouped[ward];
                    if (!patients) return null;
                    if (patients.length === 0 && ward === '기타') return null;
                    
                    const capacities: Record<string, number> = {
                      'ICU': 6,
                      '101병동': 4,
                      'PED101병동': 4,
                      'OB101병동': 2,
                      'OB산후병동': 2,
                      'PACU': 3,
                      'EM응급실': 6,
                      '퇴원완료': patients.length
                    };
                    const capacity = capacities[ward] || patients.length;
                    const isExpanded = expandedWards[ward] !== false;

                    return (
                      <div key={ward} className="mb-3">
                        <button 
                          onClick={() => setExpandedWards(prev => ({ ...prev, [ward]: !isExpanded }))}
                          className="w-full px-2 py-1 text-[11px] font-bold flex items-center gap-1 text-[#555] hover:bg-gray-100 transition-colors"
                        >
                          {isExpanded ? <ChevronDown size={12} className="shrink-0" /> : <ChevronRight size={12} className="shrink-0" />}
                          <span className="text-orange-500 text-[10px] shrink-0">●</span>
                          <span>{ward} [{patients.length}/{capacity}명]</span>
                        </button>
                        {isExpanded && (
                          <div className="flex flex-col gap-1 mt-1 pl-6 pr-2">
                            {patients.map(patient => (
                              <button 
                                key={patient.id}
                                onClick={() => {
                                  if (activeTab === 'other_record') return;
                                  setSelectedPatientId(patient.id);
                                  
                                  if (patient.chartNo.startsWith('ER')) {
                                    setActiveTab('er');
                                  } else {
                                    if (activeTopMenu === '간호') setActiveTab('nursing');
                                    else if (activeTopMenu === '의사처방') setActiveTab('doctor_prescription');
                                    else if (activeTopMenu === '지원부서') setActiveTab('support_dept');
                                    else if (activeTopMenu === '활성창') setActiveTab('consent_form');
                                    else if (activeTopMenu === 'E.M.R') setActiveTab('admission');
                                    else setActiveTab('admission');
                                  }

                                  if (activeTopMenu !== 'E.M.R' && activeTopMenu !== '의사처방' && activeTopMenu !== '지원부서' && activeTopMenu !== '활성창' && activeTopMenu !== '간호') {
                                    setShowPatientModal(true);
                                  }
                                }}
                                disabled={activeTab === 'other_record'}
                                onContextMenu={(e) => {
                                  e.preventDefault();
                                  setContextMenu({
                                    x: e.clientX,
                                    y: e.clientY,
                                    patientId: patient.id
                                  });
                                }}
                                className={`w-full text-left transition-colors overflow-hidden rounded-sm ${
                                  activeTab === 'other_record' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'
                                } ${
                                  selectedPatientId === patient.id ? 'bg-[#4FC3F7]' : 'bg-transparent'
                                }`}
                              >
                                <div className={`px-2 py-1.5 text-[11px] font-bold flex items-center gap-2 ${
                                  selectedPatientId === patient.id ? 'text-white' : 'text-gray-700'
                                }`}>
                                  <span className="text-green-500 text-[10px] shrink-0">●</span>
                                  <span className="shrink-0">{patient.name}</span>
                                  <span className="shrink-0">{patient.chartNo}</span>
                                  <span className="shrink-0">{patient.gender} / {patient.dept} /</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
                {filteredPatients.length === 0 && (
                  <div className="p-4 text-center text-gray-500 text-sm">환자가 없습니다.</div>
                )}
              </div>
              
              {/* Color Legend */}
              {activeTab === 'other_record' && (
                <div className="p-2 border-t-2 border-black bg-white text-xs shrink-0">
                  <div className="grid grid-cols-2 gap-y-2 gap-x-1">
                    {RECORD_COLORS.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-1">
                        <div className="w-4 h-4 border border-black" style={{ backgroundColor: item.color }}></div>
                        <span>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Left Resize Handle */}
        {!isPatientListCollapsed && (
          <div 
            className="w-1 bg-gray-300 hover:bg-blue-400 cursor-col-resize transition-colors shrink-0"
            onMouseDown={() => setIsResizingLeft(true)}
          />
        )}

        <div className="flex-1 flex flex-col bg-[#D0D0D0] overflow-hidden">
          {activeTopMenu === '제증명 관리' ? renderCertificateManagement() : renderContent()}
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
            onClick={() => handleSave()}
            className="flex items-center gap-1 bg-[#E0E0E0] border border-[#707070] px-3 py-2 text-[13px] font-bold hover:bg-[#F0F0F0] active:bg-[#D0D0D0]"
          >
            <Save size={16} /> 저장
          </button>
          <button 
            onClick={() => handleSave()}
            className="flex items-center gap-1 bg-[#E0E0E0] border border-[#707070] px-3 py-2 text-[13px] font-bold hover:bg-[#F0F0F0] active:bg-[#D0D0D0]"
          >
            <Edit size={16} /> 수정
          </button>
          <a 
            href="https://kcdcode.kr"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 bg-[#E0E0E0] border border-[#707070] px-3 py-2 text-[13px] font-bold hover:bg-[#F0F0F0] active:bg-[#D0D0D0] no-underline text-black"
          >
            <ExternalLink size={16} /> 진단코드
          </a>
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
              <div className="flex justify-between items-center mb-2">
                <p className="font-bold text-xs text-gray-500">사용자 정보</p>
                <a 
                  href="https://docs.google.com/document/d/1kOBFq4SKzBeLYG_QGgTMxX4fK5IyV9yZDW7n85OJZH8/edit?usp=sharing" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 font-bold text-xs hover:underline"
                >
                  사용법
                </a>
              </div>
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

      {showPatientModal && (
        <PatientDetailModal />
      )}

      {showCalculator && (
        <Calculator onClose={() => setShowCalculator(false)} />
      )}
    </div>
    </ErrorBoundary>
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
              ['On Set', `${patient.onsetYear}-${patient.onsetMonth}-${patient.onsetDay}`],
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
          {type === 'er' ? (
            <div className="grid grid-cols-3 gap-4">
              {/* Column 1: 처치/시술기록, 최종결과 */}
              <div className="flex flex-col gap-4">
                <div className="border-2 border-black flex flex-col min-h-[300px]">
                  <div className="bg-[#00C9B1] text-white font-bold p-2 text-center">처치/시술기록</div>
                  <div className="flex-1 p-2 text-sm whitespace-pre-wrap">{patient.erTreatmentRecord}</div>
                </div>
                <div className="border-2 border-black flex flex-col h-40">
                  <div className="bg-[#00C9B1] text-white font-bold p-2 text-center">최종결과</div>
                  <div className="flex-1 p-2 flex items-center justify-center text-xl font-bold">{patient.erFinalResult}</div>
                </div>
              </div>

              {/* Column 2: Order, EXAM */}
              <div className="flex flex-col gap-4">
                <div className="border-2 border-black flex flex-col min-h-[300px]">
                  <div className="bg-[#00C9B1] text-white font-bold p-2 text-center">Order</div>
                  <div className="flex-1 p-2 text-sm whitespace-pre-wrap">{patient.erOrder}</div>
                </div>
                <div className="border-2 border-black flex flex-col min-h-[200px]">
                  <div className="bg-[#00C9B1] text-white font-bold p-2 text-center">EXAM</div>
                  <div className="flex-1 p-2 text-sm whitespace-pre-wrap">{patient.erExam}</div>
                </div>
              </div>

              {/* Column 3: GCS, HPI/PMH, 기본병력 */}
              <div className="flex flex-col gap-4">
                <div className="border-2 border-black flex flex-col">
                  <div className="bg-[#00C9B1] text-white font-bold p-2 text-center">GCS 의식상태</div>
                  <div className="p-4 flex flex-col gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-bold">Eye Opening</span>
                      <span>- {patient.gcsEye || ''}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold">Verbal Response</span>
                      <span>- {patient.gcsVerbal || ''}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold">Motor Response</span>
                      <span>- {patient.gcsMotor || ''}</span>
                    </div>
                    <div className="flex justify-between mt-2 pt-2 border-t border-gray-300">
                      <span className="font-bold">총점</span>
                      <span className={`font-bold ${
                        (() => {
                          const total = parseInt(patient.gcsEye || '0') + parseInt(patient.gcsVerbal || '0') + parseInt(patient.gcsMotor || '0');
                          if (total >= 13) return 'text-green-600';
                          if (total >= 9) return 'text-yellow-600';
                          if (total > 0) return 'text-red-600';
                          return '';
                        })()
                      }`}>
                        - {parseInt(patient.gcsEye || '0') + parseInt(patient.gcsVerbal || '0') + parseInt(patient.gcsMotor || '0')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-2 border-black flex flex-col">
                  <div className="bg-[#00C9B1] text-white font-bold p-2 text-center">HPI / PMH</div>
                  <div className="p-4 flex flex-col gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-bold">HPI</span>
                      <span>- {patient.hpi || ''}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold">PMH</span>
                      <span>- {patient.pmh || ''}</span>
                    </div>
                  </div>
                </div>

                <div className="border-2 border-black flex flex-col">
                  <div className="bg-[#00C9B1] text-white font-bold p-2 text-center">기본병력</div>
                  <div className="p-4 flex flex-col gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-bold">PSH</span>
                      <span>- {patient.psh || ''}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold">복용약물</span>
                      <span>- {patient.medication || ''}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold">알러지</span>
                      <span>- {patient.allergy || ''}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
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

              <div className="border-2 border-black p-4 mt-4">
                <div className="font-bold text-lg mb-2">GCS 의식상태</div>
                <div className="text-sm">
                  <div>Eye Opening: {patient.gcsEye}</div>
                  <div>Verbal Response: {patient.gcsVerbal}</div>
                  <div>Motor Response: {patient.gcsMotor}</div>
                  <div>총점: {parseInt(patient.gcsEye || '0') + parseInt(patient.gcsVerbal || '0') + parseInt(patient.gcsMotor || '0')}</div>
                </div>
              </div>

              <div className="border-2 border-black p-4 mt-4">
                <div className="font-bold text-lg mb-2">History</div>
                <div className="text-sm">
                  <div>HPI: {patient.hpi}</div>
                  <div>PMH: {patient.pmh}</div>
                  <div>PSH: {patient.psh}</div>
                  <div>복용약물: {patient.medication}</div>
                  <div>알러지: {patient.allergy}</div>
                </div>
              </div>
            </>
          )}
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
