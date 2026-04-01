import React, { useState } from 'react';
import { Patient } from '../App';

interface FallRiskAssessmentProps {
  patient: Patient;
}

const FallRiskAssessment: React.FC<FallRiskAssessmentProps> = ({ patient }) => {
  const [evaluationDate, setEvaluationDate] = useState('2022-11-24');
  const [scores, setScores] = useState<Record<string, number>>({});

  const categories = [
    { 
      id: 'history', 
      label: '낙상 경험', 
      options: [
        { label: '없음 (0점)', points: 0 },
        { label: '있음 (25점)', points: 25 }
      ] 
    },
    { 
      id: 'diagnosis', 
      label: '이차적 진단', 
      options: [
        { label: '없음 (0점)', points: 0 },
        { label: '있음 (15점)', points: 15 }
      ] 
    },
    { 
      id: 'aids', 
      label: '보행보조기구', 
      options: [
        { label: '없음/침상안정/간호보조 (0점)', points: 0 },
        { label: '목발/지팡이/보행기 (15점)', points: 15 },
        { label: '기구를 잡고 이동 (30점)', points: 30 }
      ] 
    },
    { 
      id: 'iv', 
      label: '정맥주사라인', 
      options: [
        { label: '없음 (0점)', points: 0 },
        { label: '있음 (20점)', points: 20 }
      ] 
    },
    { 
      id: 'gait', 
      label: '걸음걸이', 
      options: [
        { label: '정상/침상안정/부동 (0점)', points: 0 },
        { label: '허약 (10점)', points: 10 },
        { label: '장애 (20점)', points: 20 }
      ] 
    },
    { 
      id: 'mental', 
      label: '의식상태', 
      options: [
        { label: '없음 (0점)', points: 0 },
        { label: '있음 (15점)', points: 15 }
      ] 
    },
  ];

  const totalScore = Object.values(scores).reduce((a: number, b: number) => a + b, 0);

  return (
    <div className="flex flex-col h-full bg-white p-6 overflow-y-auto font-sans">
      <div className="flex items-center justify-between border-b pb-4 mb-6">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <span className="text-gray-400 cursor-pointer">✕</span> 낙상위험도 평가도구
        </h1>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8 bg-gray-50 p-4 rounded border">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-600 w-20">환자명</span>
          <input type="text" value={patient.name} readOnly className="flex-1 border p-1 bg-white" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-600 w-24">환자등록번호</span>
          <input type="text" value={patient.chartNo} readOnly className="flex-1 border p-1 bg-white" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-600 w-12">성별</span>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1 cursor-pointer">
              <input type="radio" checked={patient.gender === '여'} readOnly /> 여자
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input type="radio" checked={patient.gender === '남'} readOnly /> 남자
            </label>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-600 w-12">나이</span>
          <input type="text" value={patient.age} readOnly className="w-16 border p-1 bg-white text-center" />
        </div>
        <div className="flex items-center gap-2 col-span-1">
          <span className="text-sm font-bold text-gray-600 w-20">평가일</span>
          <input 
            type="date" 
            value={evaluationDate} 
            onChange={(e) => setEvaluationDate(e.target.value)}
            className="flex-1 border p-1 bg-white" 
          />
        </div>
      </div>

      <div className="border border-gray-300">
        <div className="bg-gray-100 p-2 font-bold border-b border-gray-300">낙상위험도평가</div>
        <table className="w-full border-collapse">
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                <td className="p-4 text-sm font-bold text-gray-700 w-40 border-r">{cat.label}</td>
                <td className="p-4 flex gap-8 flex-wrap">
                  {cat.options.map((option, idx) => (
                    <label key={idx} className="flex items-center gap-2 cursor-pointer text-xs group">
                      <input 
                        type="radio" 
                        name={cat.id} 
                        checked={scores[cat.id] === option.points}
                        onChange={() => setScores(prev => ({ ...prev, [cat.id]: option.points }))}
                        className="w-4 h-4 accent-blue-600"
                      />
                      <span className="group-hover:text-blue-600">{option.label}</span>
                    </label>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-end items-center gap-4">
        <div className="text-lg font-bold">
          총점: <span className="text-blue-600">{totalScore}</span> 점
        </div>
        <button className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700 transition-colors">
          저장하기
        </button>
      </div>
    </div>
  );
};

export default FallRiskAssessment;
