import React, { useState } from 'react';
import { motion } from 'motion/react';

const PainAssessmentNRS: React.FC = () => {
  const [score, setScore] = useState(0);

  const faces = [
    { score: 0, label: 'No Pain', img: 'https://cdn-icons-png.flaticon.com/512/1933/1933691.png' }, // Happy
    { score: 2, label: 'Mild Pain', img: 'https://cdn-icons-png.flaticon.com/512/1933/1933511.png' }, // Neutral
    { score: 4, label: 'Moderate Pain', img: 'https://cdn-icons-png.flaticon.com/512/1933/1933151.png' }, // Worried
    { score: 6, label: 'Severe Pain', img: 'https://cdn-icons-png.flaticon.com/512/1933/1933161.png' }, // Sad
    { score: 8, label: 'Very Severe Pain', img: 'https://cdn-icons-png.flaticon.com/512/1933/1933171.png' }, // Crying
    { score: 10, label: 'Extreme Pain', img: 'https://cdn-icons-png.flaticon.com/512/1933/1933181.png' }, // Very Crying
  ];

  const getFaceForScore = (s: number) => {
    if (s <= 1) return faces[0];
    if (s <= 3) return faces[1];
    if (s <= 5) return faces[2];
    if (s <= 7) return faces[3];
    if (s <= 9) return faces[4];
    return faces[5];
  };

  const currentFace = getFaceForScore(score);

  return (
    <div className="flex flex-col items-center justify-center h-full bg-white p-12 font-sans">
      <div className="text-center mb-12">
        <h2 className="text-xl font-bold mb-1">NRS (테스트 중)</h2>
        <h1 className="text-2xl font-black">PAIN SCORE 0-10 NUMERICAL RATING</h1>
      </div>

      <div className="flex justify-between w-full max-w-4xl mb-12">
        {faces.map((face, idx) => (
          <div key={idx} className="flex flex-col items-center gap-4 opacity-80 hover:opacity-100 transition-opacity">
            <img src={face.img} alt={face.label} className="w-24 h-24 grayscale-0" referrerPolicy="no-referrer" />
            <div className={`px-4 py-1 border rounded text-sm font-bold ${score === face.score ? 'bg-blue-50 border-blue-600 text-blue-600' : 'bg-white border-gray-300 text-gray-500'}`}>
              {face.label}
            </div>
          </div>
        ))}
      </div>

      <div className="w-full max-w-4xl relative h-2 bg-gray-200 rounded-full mb-12">
        <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 flex justify-between px-1">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
            <div key={n} className="flex flex-col items-center gap-2">
              <div 
                onClick={() => setScore(n)}
                className={`w-4 h-4 rounded-full cursor-pointer transition-all ${score === n ? 'bg-blue-600 scale-125' : 'bg-gray-400 hover:bg-gray-500'}`}
              ></div>
              <span className={`text-sm font-bold ${score === n ? 'text-blue-600' : 'text-gray-500'}`}>{n}</span>
            </div>
          ))}
        </div>
        <motion.div 
          className="absolute top-0 left-0 h-full bg-blue-600 rounded-full"
          initial={false}
          animate={{ width: `${(score / 10) * 100}%` }}
        />
      </div>

      <div className="mt-8 bg-blue-50 border-2 border-blue-200 p-6 rounded-2xl text-center shadow-lg">
        <div className="text-sm text-blue-600 font-bold mb-1 uppercase tracking-widest">Selected Pain Level</div>
        <div className="text-6xl font-black text-blue-900">{score}</div>
        <div className="text-xl font-bold text-blue-700 mt-2">{currentFace.label}</div>
      </div>

      <button className="mt-12 bg-blue-600 text-white px-12 py-4 rounded-full font-black text-xl hover:bg-blue-700 shadow-xl hover:shadow-2xl transition-all active:scale-95">
        평가 저장
      </button>
    </div>
  );
};

export default PainAssessmentNRS;
