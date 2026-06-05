import React from 'react';
import { DeathCertificateData } from '../App';

interface DeathCertificateFormProps {
  data: DeathCertificateData;
  onChange: (data: DeathCertificateData) => void;
}

const DeathCertificateForm: React.FC<DeathCertificateFormProps> = ({ data, onChange }) => {
  const handleChange = (field: keyof DeathCertificateData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-8 p-4 bg-white border-2 border-black">
      <div className="bg-[#FF99FF] p-2 border-b-2 border-black">
        <h2 className="text-white text-xl font-bold">사망기록지 작성</h2>
      </div>

      {/* Deceased Section */}
      <div className="space-y-4">
        <h3 className="font-bold text-lg">- 사망자</h3>
        <div className="grid grid-cols-[120px_1fr] gap-y-4 items-center">
          <label className="font-bold">성명</label>
          <input 
            type="text" 
            value={data.deceasedName} 
            onChange={(e) => handleChange('deceasedName', e.target.value)}
            className="border-b border-black outline-none px-2 py-1"
          />
          
          <label className="font-bold">성별</label>
          <div className="flex gap-4">
            {['남', '여'].map(g => (
              <label key={g} className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="gender" 
                  checked={data.deceasedGender === g}
                  onChange={() => handleChange('deceasedGender', g)}
                />
                {g}
              </label>
            ))}
          </div>

          <label className="font-bold">주민등록번호</label>
          <input 
            type="text" 
            value={data.deceasedResidentId} 
            onChange={(e) => handleChange('deceasedResidentId', e.target.value)}
            className="border-b border-black outline-none px-2 py-1"
          />

          <label className="font-bold">등록기준지</label>
          <input 
            type="text" 
            value={data.deceasedDomicile} 
            onChange={(e) => handleChange('deceasedDomicile', e.target.value)}
            className="border-b border-black outline-none px-2 py-1"
          />

          <label className="font-bold">주소</label>
          <input 
            type="text" 
            value={data.deceasedAddress} 
            onChange={(e) => handleChange('deceasedAddress', e.target.value)}
            className="border-b border-black outline-none px-2 py-1"
          />

          <label className="font-bold">사망일시</label>
          <input 
            type="datetime-local" 
            value={data.deathDateTime} 
            onChange={(e) => handleChange('deathDateTime', e.target.value)}
            className="border-b border-black outline-none px-2 py-1"
          />

          <label className="font-bold">사망장소</label>
          <div className="flex flex-col">
            <input 
              type="text" 
              value={data.deathPlace} 
              onChange={(e) => handleChange('deathPlace', e.target.value)}
              className="border-b border-black outline-none px-2 py-1"
              placeholder="예) 경기도 용인시 기흥구 동백죽전대로 363 용인세브란스병원"
            />
            <span className="text-[10px] text-gray-400 mt-1">예) 경기도 용인시 기흥구 동백죽전대로 363 용인세브란스병원</span>
          </div>
        </div>
      </div>

      {/* Reporter Section */}
      <div className="space-y-4">
        <h3 className="font-bold text-lg">- 신고인</h3>
        <div className="grid grid-cols-[120px_1fr] gap-y-4 items-center">
          <label className="font-bold">성명</label>
          <input 
            type="text" 
            value={data.reporterName} 
            onChange={(e) => handleChange('reporterName', e.target.value)}
            className="border-b border-black outline-none px-2 py-1"
          />

          <label className="font-bold">주민등록번호</label>
          <input 
            type="text" 
            value={data.reporterResidentId} 
            onChange={(e) => handleChange('reporterResidentId', e.target.value)}
            className="border-b border-black outline-none px-2 py-1"
          />

          <label className="font-bold">자격</label>
          <div className="flex gap-4">
            {['의사', '간호사'].map(q => (
              <label key={q} className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="reporterQual" 
                  checked={data.reporterQualification === q}
                  onChange={() => handleChange('reporterQualification', q)}
                />
                {q}
              </label>
            ))}
          </div>

          <label className="font-bold">연락처</label>
          <input 
            type="text" 
            value={data.reporterContact} 
            onChange={(e) => handleChange('reporterContact', e.target.value)}
            className="border-b border-black outline-none px-2 py-1"
          />
        </div>
      </div>

      {/* Death Type Section */}
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="font-bold text-lg">- 사망종류</h3>
          <div className="space-y-2">
            {['병사', '사고사', '기타'].map((t, i) => (
              <label key={t} className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="deathType" 
                  checked={data.deathType === t}
                  onChange={() => handleChange('deathType', t)}
                />
                [{i + 1}] {t}
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-lg">- 사고</h3>
          <div className="border border-black">
            <div className="grid grid-cols-[80px_1fr] border-b border-black">
              <div className="bg-gray-100 p-2 font-bold border-r border-black flex items-center justify-center">종류</div>
              <div className="p-2 text-[11px]">
                <div className="grid grid-cols-3 gap-1">
                  {['교통사고', '자살', '추락사', '익사', '타살', '기타'].map((t, i) => (
                    <label key={t} className="flex items-center gap-1 cursor-pointer">
                      <input 
                        type="radio" 
                        name="accidentType" 
                        checked={data.accidentType === t}
                        onChange={() => handleChange('accidentType', t)}
                      />
                      [{i + 1}] {t}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-[80px_1fr] border-b border-black">
              <div className="bg-gray-100 p-2 font-bold border-r border-black flex items-center justify-center">발생지역</div>
              <input 
                type="text" 
                value={data.accidentLocation} 
                onChange={(e) => handleChange('accidentLocation', e.target.value)}
                className="p-2 outline-none"
              />
            </div>
            <div className="grid grid-cols-[80px_1fr]">
              <div className="bg-gray-100 p-2 font-bold border-r border-black flex items-center justify-center">발생장소</div>
              <input 
                type="text" 
                value={data.accidentPlace} 
                onChange={(e) => handleChange('accidentPlace', e.target.value)}
                className="p-2 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Cause of Death Section */}
      <div className="space-y-4">
        <h3 className="font-bold text-lg">- 사망원인</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-[120px_1fr] items-center">
            <label className="font-bold">[가] 직접 사인</label>
            <input 
              type="text" 
              value={data.causeA} 
              onChange={(e) => handleChange('causeA', e.target.value)}
              className="border-b border-black outline-none px-2 py-1"
            />
          </div>
          <div className="grid grid-cols-[120px_1fr] items-center">
            <label className="font-bold">[나] [가]의 원인</label>
            <input 
              type="text" 
              value={data.causeB} 
              onChange={(e) => handleChange('causeB', e.target.value)}
              className="border-b border-black outline-none px-2 py-1"
            />
          </div>
          <div className="grid grid-cols-[120px_1fr] items-center">
            <label className="font-bold">[다] [나]의 원인</label>
            <input 
              type="text" 
              value={data.causeC} 
              onChange={(e) => handleChange('causeC', e.target.value)}
              className="border-b border-black outline-none px-2 py-1"
            />
          </div>
          <div className="grid grid-cols-[120px_1fr] items-center">
            <label className="font-bold">[라] [다]의 원인</label>
            <input 
              type="text" 
              value={data.causeD} 
              onChange={(e) => handleChange('causeD', e.target.value)}
              className="border-b border-black outline-none px-2 py-1"
            />
          </div>
          <div className="grid grid-cols-[120px_1fr] items-center">
            <label className="font-bold">기타의 신체상황</label>
            <input 
              type="text" 
              value={data.otherPhysicalCondition} 
              onChange={(e) => handleChange('otherPhysicalCondition', e.target.value)}
              className="border-b border-black outline-none px-2 py-1"
            />
          </div>
          <div className="grid grid-cols-[120px_1fr] items-center">
            <label className="font-bold">진단자</label>
            <div className="flex gap-4">
              {['의사', '간호사', '기타 의료진'].map(d => (
                <label key={d} className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="diagnostician" 
                    checked={data.diagnostician === d}
                    onChange={() => handleChange('diagnostician', d)}
                  />
                  {d}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Deceased Info Section */}
      <div className="space-y-4">
        <h3 className="font-bold text-lg">- 사망자 (추가 정보)</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-[120px_1fr] items-center">
            <label className="font-bold">국적</label>
            <div className="flex gap-4">
              {['한국인', '귀화한 한국인'].map((n, i) => (
                <label key={n} className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="nationality" 
                    checked={data.nationality === n}
                    onChange={() => handleChange('nationality', n)}
                  />
                  [{i + 1}] {n}
                </label>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-[120px_1fr] items-start">
            <label className="font-bold">최종 졸업학교</label>
            <div className="grid grid-cols-3 gap-2">
              {['무학', '초등학교', '중학교', '고등학교', '대학교'].map((s, i) => (
                <label key={s} className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="education" 
                    checked={data.education === s}
                    onChange={() => handleChange('education', s)}
                  />
                  [{i + 1}] {s}
                </label>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-[120px_1fr] items-center">
            <label className="font-bold">발병 당시 직업</label>
            <input 
              type="text" 
              value={data.occupation} 
              onChange={(e) => handleChange('occupation', e.target.value)}
              className="border-b border-black outline-none px-2 py-1"
            />
          </div>
          <div className="grid grid-cols-[120px_1fr] items-start">
            <label className="font-bold">혼인 상태</label>
            <div className="grid grid-cols-2 gap-2">
              {['미혼', '배우자 있음', '이혼', '사별'].map((m, i) => (
                <label key={m} className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="maritalStatus" 
                    checked={data.maritalStatus === m}
                    onChange={() => handleChange('maritalStatus', m)}
                  />
                  [{i + 1}] {m}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Other Matters Section */}
      <div className="space-y-4">
        <h3 className="font-bold text-lg">- 기타사항</h3>
        <textarea 
          value={data.otherMatters} 
          onChange={(e) => handleChange('otherMatters', e.target.value)}
          className="w-full border border-black p-2 min-h-[100px] outline-none"
        />
      </div>
    </div>
  );
};

export default DeathCertificateForm;
