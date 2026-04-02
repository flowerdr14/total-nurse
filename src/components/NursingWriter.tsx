
import React, { useState } from 'react';

interface NursingWriterProps {
  onSave?: (data: any) => void;
}

const NursingWriter: React.FC<NursingWriterProps> = ({ onSave }) => {
  const [activeTab, setActiveTab] = useState('NANDA');
  const [nandaData, setNandaData] = useState({
    domain: '',
    class: '',
    diagnosis: '',
    data: '',
    goal: '',
    plan: '',
    interventions: ''
  });
  const [soapieData, setSoapieData] = useState({ s: '', o: '', a: '', p: '', i: '', e: '' });
  const [darData, setDarData] = useState({ focus: '', d: '', a: '', r: '' });
  const [narrative, setNarrative] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');
  const [time, setTime] = useState('19:45');

  const tabs = ['NANDA', 'SOAPIE', 'Focus DAR', '서술기록', '특기사항'];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'NANDA':
        return (
          <div className="space-y-3">
            {['영역 Domain', '분류 Class', '진단명 Diagnosis'].map(label => (
              <div key={label} className="grid grid-cols-3 gap-2 items-center">
                <label className="text-xs font-bold">{label}</label>
                <input 
                  type="text"
                  className="col-span-2 border border-gray-300 p-1 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="입력"
                  value={nandaData[label === '영역 Domain' ? 'domain' : label === '분류 Class' ? 'class' : 'diagnosis']}
                  onChange={(e) => setNandaData({...nandaData, [label === '영역 Domain' ? 'domain' : label === '분류 Class' ? 'class' : 'diagnosis']: e.target.value})}
                />
              </div>
            ))}
            {[
              { label: '자료 수집 주관적 / 객관적', key: 'data' },
              { label: '간호목표 단기/장기 Goal', key: 'goal' },
              { label: '간호계획 Plan', key: 'plan' },
              { label: '간호수행/중재/이론적 근거 Interventions', key: 'interventions' }
            ].map(field => (
              <div key={field.key}>
                <label className="block text-xs font-bold mb-1">{field.label}</label>
                <textarea 
                  className="w-full h-16 border border-gray-300 p-2 text-sm" 
                  value={(nandaData as any)[field.key]}
                  onChange={(e) => setNandaData({...nandaData, [field.key]: e.target.value})}
                />
              </div>
            ))}
          </div>
        );
      case 'SOAPIE':
        return (
          <div className="space-y-3">
            {[
              { label: 'S (Subjective Data)', key: 's' },
              { label: 'O (Objective Data)', key: 'o' },
              { label: 'A (Assessment)', key: 'a' },
              { label: 'P (Plan)', key: 'p' },
              { label: 'I (Intervention)', key: 'i' },
              { label: 'E (Evaluation)', key: 'e' }
            ].map(field => (
              <div key={field.key}>
                <label className="block text-xs font-bold mb-1">{field.label}</label>
                <textarea 
                  className="w-full h-16 border border-gray-300 p-2 text-sm" 
                  value={(soapieData as any)[field.key]}
                  onChange={(e) => setSoapieData({...soapieData, [field.key]: e.target.value})}
                />
              </div>
            ))}
          </div>
        );
      case 'Focus DAR':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold mb-1">Focus</label>
              <input 
                type="text"
                className="w-full border border-gray-300 p-2 text-sm" 
                value={darData.focus}
                onChange={(e) => setDarData({...darData, focus: e.target.value})}
              />
            </div>
            {[
              { label: 'D (Data)', key: 'd' },
              { label: 'A (Action)', key: 'a' },
              { label: 'R (Response)', key: 'r' }
            ].map(field => (
              <div key={field.key}>
                <label className="block text-xs font-bold mb-1">{field.label}</label>
                <textarea 
                  className="w-full h-20 border border-gray-300 p-2 text-sm" 
                  value={(darData as any)[field.key]}
                  onChange={(e) => setDarData({...darData, [field.key]: e.target.value})}
                />
              </div>
            ))}
          </div>
        );
      case '서술기록':
        return (
          <div>
            <label className="block text-xs font-bold mb-1">서술기록 내용</label>
            <textarea 
              className="w-full h-64 border border-gray-300 p-2 text-sm" 
              value={narrative}
              onChange={(e) => setNarrative(e.target.value)}
              placeholder="기록 내용을 입력하세요."
            />
          </div>
        );
      case '특기사항':
        return (
          <div>
            <label className="block text-xs font-bold mb-1">특기사항 내용</label>
            <textarea 
              className="w-full h-64 border border-gray-300 p-2 text-sm" 
              value={specialNotes}
              onChange={(e) => setSpecialNotes(e.target.value)}
              placeholder="특기사항을 입력하세요."
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-t-2 border-black">
      <div className="bg-[#999] text-white px-3 py-1 font-bold text-lg flex justify-between items-center">
        <span>간호기록 작성</span>
        <input 
          type="time" 
          className="text-black font-normal text-sm p-0.5 rounded" 
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
      </div>
      
      <div className="flex border-b border-gray-300 bg-gray-50 overflow-x-auto">
        {tabs.map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-2 text-xs font-bold whitespace-nowrap transition-colors ${
              activeTab === tab 
                ? 'bg-blue-900 text-white' 
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        {renderTabContent()}
      </div>

      <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-2">
        <button className="px-4 py-2 bg-gray-200 text-sm font-bold rounded hover:bg-gray-300">취소</button>
        <button 
          onClick={() => onSave?.({ activeTab, nandaData, soapieData, darData, narrative, specialNotes, time })}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded hover:bg-blue-700"
        >
          저장
        </button>
      </div>
    </div>
  );
};

export default NursingWriter;
