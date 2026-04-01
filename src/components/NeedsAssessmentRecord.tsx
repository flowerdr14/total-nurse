import React, { useState } from 'react';

const NeedsAssessmentRecord: React.FC = () => {
  const [formData, setFormData] = useState({
    physical: {
      pain: '',
      sleep: '',
      meal: '',
      excretion: '',
      activity: '',
      skin: '',
    },
    mental: {
      consciousness: '',
      orientation: '',
      memory: '',
      anxiety: '',
      behavior: '',
    },
    social: {
      guardian: '',
      familySupport: '',
      economic: '',
      environment: '',
    }
  });

  const updateField = (category: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...(prev[category as keyof typeof prev] as any),
        [field]: value
      }
    }));
  };

  return (
    <div className="flex-1 flex flex-col bg-white border-2 border-black overflow-y-auto p-6 font-sans">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-black border-b-4 border-black inline-block pb-1">욕구평가 기록지</h1>
      </div>

      <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto w-full">
        {/* Physical Needs */}
        <section className="border-2 border-black p-6 bg-gray-50 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
          <h2 className="text-xl font-black mb-6 flex items-center gap-2">
            <span className="text-2xl">🧠</span> 신체적 욕구 (Physical Needs)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm">통증 여부 (NRS 점수)</label>
              <input 
                type="text" 
                value={formData.physical.pain}
                onChange={(e) => updateField('physical', 'pain', e.target.value)}
                className="border-2 border-black p-2 focus:outline-none bg-white"
                placeholder="0-10 점수 입력"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm">수면 상태</label>
              <select 
                value={formData.physical.sleep}
                onChange={(e) => updateField('physical', 'sleep', e.target.value)}
                className="border-2 border-black p-2 focus:outline-none bg-white"
              >
                <option value="">선택</option>
                <option value="불면">불면</option>
                <option value="정상">정상</option>
                <option value="과다수면">과다수면</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm">식사 상태 (섭취량, 식욕)</label>
              <input 
                type="text" 
                value={formData.physical.meal}
                onChange={(e) => updateField('physical', 'meal', e.target.value)}
                className="border-2 border-black p-2 focus:outline-none bg-white"
                placeholder="예: 섭취량 양호, 식욕 보통"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm">배설 상태 (소변, 대변, 실금 여부)</label>
              <input 
                type="text" 
                value={formData.physical.excretion}
                onChange={(e) => updateField('physical', 'excretion', e.target.value)}
                className="border-2 border-black p-2 focus:outline-none bg-white"
                placeholder="예: 소변 정상, 대변 1회/일"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm">활동 정도</label>
              <select 
                value={formData.physical.activity}
                onChange={(e) => updateField('physical', 'activity', e.target.value)}
                className="border-2 border-black p-2 focus:outline-none bg-white"
              >
                <option value="">선택</option>
                <option value="보행 가능">보행 가능</option>
                <option value="침상 안정">침상 안정</option>
                <option value="보조 필요">보조 필요</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm">피부 상태 (욕창 위험, 상처)</label>
              <input 
                type="text" 
                value={formData.physical.skin}
                onChange={(e) => updateField('physical', 'skin', e.target.value)}
                className="border-2 border-black p-2 focus:outline-none bg-white"
                placeholder="예: 욕창 없음, 수술 부위 상처"
              />
            </div>
          </div>
        </section>

        {/* Mental/Cognitive Needs */}
        <section className="border-2 border-black p-6 bg-gray-50 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
          <h2 className="text-xl font-black mb-6 flex items-center gap-2">
            <span className="text-2xl">🧠</span> 정신·인지 상태 (Mental / Cognitive)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm">의식 상태</label>
              <select 
                value={formData.mental.consciousness}
                onChange={(e) => updateField('mental', 'consciousness', e.target.value)}
                className="border-2 border-black p-2 focus:outline-none bg-white"
              >
                <option value="">선택</option>
                <option value="Alert">Alert</option>
                <option value="Drowsy">Drowsy</option>
                <option value="Stupor">Stupor</option>
                <option value="Semi-coma">Semi-coma</option>
                <option value="Coma">Coma</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm">지남력 (시간, 장소, 사람)</label>
              <input 
                type="text" 
                value={formData.mental.orientation}
                onChange={(e) => updateField('mental', 'orientation', e.target.value)}
                className="border-2 border-black p-2 focus:outline-none bg-white"
                placeholder="예: 시간(+), 장소(+), 사람(+)"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm">기억력 / 판단력</label>
              <input 
                type="text" 
                value={formData.mental.memory}
                onChange={(e) => updateField('mental', 'memory', e.target.value)}
                className="border-2 border-black p-2 focus:outline-none bg-white"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm">불안 / 우울 여부</label>
              <input 
                type="text" 
                value={formData.mental.anxiety}
                onChange={(e) => updateField('mental', 'anxiety', e.target.value)}
                className="border-2 border-black p-2 focus:outline-none bg-white"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm">행동 문제 (초조, 공격성 등)</label>
              <input 
                type="text" 
                value={formData.mental.behavior}
                onChange={(e) => updateField('mental', 'behavior', e.target.value)}
                className="border-2 border-black p-2 focus:outline-none bg-white"
              />
            </div>
          </div>
        </section>

        {/* Social Needs */}
        <section className="border-2 border-black p-6 bg-gray-50 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
          <h2 className="text-xl font-black mb-6 flex items-center gap-2">
            <span className="text-2xl">👨‍👩‍👧</span> 사회적 욕구 (Social Needs)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm">보호자 유무</label>
              <select 
                value={formData.social.guardian}
                onChange={(e) => updateField('social', 'guardian', e.target.value)}
                className="border-2 border-black p-2 focus:outline-none bg-white"
              >
                <option value="">선택</option>
                <option value="유">유</option>
                <option value="무">무</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm">가족 지지 정도</label>
              <input 
                type="text" 
                value={formData.social.familySupport}
                onChange={(e) => updateField('social', 'familySupport', e.target.value)}
                className="border-2 border-black p-2 focus:outline-none bg-white"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm">경제 상태 (보험, 지원 필요 여부)</label>
              <input 
                type="text" 
                value={formData.social.economic}
                onChange={(e) => updateField('social', 'economic', e.target.value)}
                className="border-2 border-black p-2 focus:outline-none bg-white"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm">주거 환경 (혼자 거주, 시설 등)</label>
              <input 
                type="text" 
                value={formData.social.environment}
                onChange={(e) => updateField('social', 'environment', e.target.value)}
                className="border-2 border-black p-2 focus:outline-none bg-white"
              />
            </div>
          </div>
        </section>

        <div className="flex justify-center mt-4 mb-8">
          <button className="bg-black text-white font-black px-12 py-4 border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all">
            평가 저장
          </button>
        </div>
      </div>
    </div>
  );
};

export default NeedsAssessmentRecord;
