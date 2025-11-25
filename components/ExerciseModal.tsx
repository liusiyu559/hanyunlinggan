
import React, { useState } from 'react';
import { ExerciseConfig, ExerciseType, GeneratedActivity } from '../types';
import { CloseIcon, ExamIcon } from './Icons';

interface ExerciseModalProps {
  activity: GeneratedActivity | null;
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (config: ExerciseConfig) => void;
}

const ExerciseModal: React.FC<ExerciseModalProps> = ({ activity, isOpen, onClose, onGenerate }) => {
  const [types, setTypes] = useState<ExerciseType[]>(['MULTIPLE_CHOICE', 'FILL_IN_BLANK']);
  const [count, setCount] = useState(3);
  const [includeAnswerKey, setIncludeAnswerKey] = useState(true);
  const [includePinyin, setIncludePinyin] = useState(false);

  if (!isOpen || !activity) return null;

  const toggleType = (type: ExerciseType) => {
    setTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleGenerate = () => {
    if (types.length === 0) {
      alert("请至少选择一种题型 (Please select at least one exercise type)");
      return;
    }
    onGenerate({
      types,
      count,
      includeAnswerKey,
      includePinyin
    });
  };

  const checkboxClass = "w-4 h-4 text-cinnabar border-gray-300 rounded focus:ring-cinnabar";
  const labelClass = "ml-2 text-ink-black font-serif";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#f5efe4] rounded-lg shadow-2xl border border-wood-border w-full max-w-lg relative flex flex-col">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-500 hover:text-cinnabar transition-colors z-10"
        >
          <CloseIcon className="w-6 h-6" />
        </button>

        <div className="p-6 border-b border-wood-border/20 flex items-center space-x-3">
          <div className="bg-wood-border text-antique-paper p-2 rounded">
            <ExamIcon className="w-6 h-6" />
          </div>
          <div>
             <h2 className="text-2xl font-calligraphy text-ink-black">生成练习题 (Generate Exercises)</h2>
             <p className="text-xs text-gray-500">Based on: {activity.title}</p>
          </div>
        </div>

        <div className="p-8 space-y-6">
          
          <div>
            <label className="block text-wood-border font-bold mb-3 font-calligraphy">选择题型 (Question Types)</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="flex items-center cursor-pointer p-2 hover:bg-white/30 rounded">
                <input type="checkbox" checked={types.includes('MULTIPLE_CHOICE')} onChange={() => toggleType('MULTIPLE_CHOICE')} className={checkboxClass} />
                <span className={labelClass}>选择题 (Multiple Choice)</span>
              </label>
              <label className="flex items-center cursor-pointer p-2 hover:bg-white/30 rounded">
                <input type="checkbox" checked={types.includes('FILL_IN_BLANK')} onChange={() => toggleType('FILL_IN_BLANK')} className={checkboxClass} />
                <span className={labelClass}>填空题 (Fill in Blanks)</span>
              </label>
              <label className="flex items-center cursor-pointer p-2 hover:bg-white/30 rounded">
                <input type="checkbox" checked={types.includes('MATCHING')} onChange={() => toggleType('MATCHING')} className={checkboxClass} />
                <span className={labelClass}>连线题 (Matching)</span>
              </label>
              <label className="flex items-center cursor-pointer p-2 hover:bg-white/30 rounded">
                <input type="checkbox" checked={types.includes('TRANSLATION')} onChange={() => toggleType('TRANSLATION')} className={checkboxClass} />
                <span className={labelClass}>翻译题 (Translation)</span>
              </label>
              <label className="flex items-center cursor-pointer p-2 hover:bg-white/30 rounded">
                <input type="checkbox" checked={types.includes('OPEN_ENDED')} onChange={() => toggleType('OPEN_ENDED')} className={checkboxClass} />
                <span className={labelClass}>问答题 (Open Answer)</span>
              </label>
            </div>
          </div>

          <div>
             <label className="block text-wood-border font-bold mb-2 font-calligraphy">设置 (Settings)</label>
             <div className="space-y-3">
                <div className="flex items-center justify-between bg-white/30 p-3 rounded">
                  <span className={labelClass}>题目数量 (Count): {count}</span>
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    value={count} 
                    onChange={(e) => setCount(parseInt(e.target.value))}
                    className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cinnabar"
                  />
                </div>
                <label className="flex items-center cursor-pointer bg-white/30 p-3 rounded hover:bg-white/50">
                   <input type="checkbox" checked={includeAnswerKey} onChange={(e) => setIncludeAnswerKey(e.target.checked)} className={checkboxClass} />
                   <span className={labelClass}>包含答案页 (Include Answer Key)</span>
                </label>
                <label className="flex items-center cursor-pointer bg-white/30 p-3 rounded hover:bg-white/50">
                   <input type="checkbox" checked={includePinyin} onChange={(e) => setIncludePinyin(e.target.checked)} className={checkboxClass} />
                   <span className={labelClass}>汉字带拼音 (Include Pinyin)</span>
                </label>
             </div>
          </div>

          <div className="pt-4">
             <button
                onClick={handleGenerate}
                className="w-full bg-cinnabar text-antique-paper font-bold py-3 rounded hover:bg-[#a0302a] transition-colors flex items-center justify-center shadow-lg"
              >
                <ExamIcon className="w-5 h-5 mr-2" />
                生成练习文档 (.doc)
              </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ExerciseModal;