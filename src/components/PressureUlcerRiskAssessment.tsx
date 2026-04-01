import React, { useState } from 'react';
import { Patient } from '../App';

interface PressureUlcerRiskAssessmentProps {
  patient: Patient;
}

const PressureUlcerRiskAssessment: React.FC<PressureUlcerRiskAssessmentProps> = ({ patient }) => {
  const [evaluationDate, setEvaluationDate] = useState(new Date().toISOString().split('T')[0]);
  const [scores, setScores] = useState<Record<string, number>>({});

  const categories = [
    { id: 'sensory', label: '감각지각', options: ['완전 제한', '매우 제한', '약간 제한', '제한 없음'] },
    { id: 'moisture', label: '습기', options: ['항상 촉촉함', '촉촉함', '가끔 촉촉함', '거의 촉촉하지 않음'] },
    { id: 'activity', label: '활동', options: ['침대에만 있음', '주로 앉아 있음', '가끔 보행함', '자주 보행함'] },
    { id: 'mobility', label: '기동성', options: ['완전 부동', '매우 제한', '약간 제한', '제한 없음'] },
    { id: 'nutrition', label: '영양', options: ['매우 불량', '불량함', '적절함', '우수함'] },
    { id: 'friction', label: '마찰/전단력', options: ['문제가 있음', '잠재적 문제', '문제 없음'] },
  ];

  const totalScore = Object.values(scores).reduce((a: number, b: number) => a + b, 0);

  return (
    <div className="flex flex-col h-full bg-white p-6 overflow-y-auto font-sans">
      <div className="flex items-center justify-between border-b pb-4 mb-6">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <span className="text-gray-400 cursor-pointer">✕</span> 욕창위험도 평가도구
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
        <div className="bg-gray-100 p-2 font-bold border-b border-gray-300">욕창위험도평가</div>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 text-xs text-gray-600 border-b border-gray-300">
              <th className="p-3 text-left w-40">평가항목</th>
              <th className="p-3 text-left">1점</th>
              <th className="p-3 text-left">2점</th>
              <th className="p-3 text-left">3점</th>
              <th className="p-3 text-left">4점</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                <td className="p-3 text-sm font-bold text-gray-700">{cat.label}</td>
                {cat.options.map((option, idx) => (
                  <td key={idx} className="p-3">
                    <label className="flex items-center gap-2 cursor-pointer text-xs group">
                      <input 
                        type="radio" 
                        name={cat.id} 
                        checked={scores[cat.id] === idx + 1}
                        onChange={() => setScores(prev => ({ ...prev, [cat.id]: idx + 1 }))}
                        className="w-4 h-4 accent-blue-600"
                      />
                      <span className="group-hover:text-blue-600">{option}</span>
                    </label>
                  </td>
                ))}
                {cat.options.length < 4 && <td className="p-3"></td>}
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

export default PressureUlcerRiskAssessment;
