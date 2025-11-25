import React, { useState } from 'react';
import { Mode, UserInput } from '../types';
import { KnotIcon } from './Icons';

interface InputFormProps {
  mode: Mode;
  onSubmit: (data: UserInput) => void;
  isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ mode, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<UserInput>({
    theme: '',
    targetAudience: '',
    level: '',
    nativeLanguage: '',
    activityIdea: '',
    requirements: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const inputClass = "w-full bg-antique-paper-dark border-b-2 border-wood-border/50 focus:border-cinnabar px-3 py-2 outline-none font-serif text-ink-black placeholder-gray-500 transition-colors";
  const labelClass = "block text-wood-border font-bold mb-1 mt-4 text-sm font-calligraphy tracking-widest";

  return (
    <form onSubmit={handleSubmit} className="relative p-6 md:p-8 bg-[#f5efe4] rounded-lg shadow-xl border border-[#d6cbb8]">
      {/* Decorative Corner Knots */}
      <div className="absolute -top-3 -left-3 text-cinnabar w-8 h-8"><KnotIcon /></div>
      <div className="absolute -top-3 -right-3 text-cinnabar w-8 h-8"><KnotIcon /></div>
      <div className="absolute -bottom-3 -left-3 text-cinnabar w-8 h-8"><KnotIcon /></div>
      <div className="absolute -bottom-3 -right-3 text-cinnabar w-8 h-8"><KnotIcon /></div>

      <h2 className="text-2xl font-calligraphy text-center text-ink-black mb-6">
        {mode === Mode.RECORD ? '记录灵感 · 细化方案' : '激发灵感 · 创意生成'}
      </h2>

      <div>
        <label className={labelClass}>教授主题 (Theme)</label>
        <input
          name="theme"
          value={formData.theme}
          onChange={handleChange}
          placeholder="例如：中国节日、购物砍价、家庭成员"
          className={inputClass}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>教学对象 (Audience)</label>
          <input
            name="targetAudience"
            value={formData.targetAudience}
            onChange={handleChange}
            placeholder="例如：6-12岁儿童、商务人士"
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className={labelClass}>汉语水平 (Level)</label>
          <input
            name="level"
            value={formData.level}
            onChange={handleChange}
            placeholder="例如：HSK 3, 零基础"
            className={inputClass}
            required
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>母语背景 (Native Language)</label>
        <input
          name="nativeLanguage"
          value={formData.nativeLanguage}
          onChange={handleChange}
          placeholder="例如：英语、日语、西班牙语"
          className={inputClass}
          required
        />
      </div>

      <div>
        <label className={labelClass}>生成/细化要求 (Special Requirements)</label>
        <textarea
          name="requirements"
          value={formData.requirements}
          onChange={handleChange}
          placeholder="例如：必须包含 TPR 教学法，侧重口语练习，使用游戏形式..."
          className={`${inputClass} h-20 resize-none`}
        />
      </div>

      {mode === Mode.RECORD && (
        <div>
          <label className={labelClass}>灵感雏形 (Your Idea)</label>
          <textarea
            name="activityIdea"
            value={formData.activityIdea}
            onChange={handleChange}
            placeholder="简述你想到的活动，例如：用大富翁游戏教城市名称..."
            className={`${inputClass} h-24 resize-none`}
            required
          />
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <button
          type="submit"
          disabled={isLoading}
          className={`
            relative group overflow-hidden px-8 py-3 rounded-full 
            border-2 border-cinnabar text-cinnabar font-bold tracking-widest font-calligraphy text-xl
            transition-all duration-300 hover:bg-cinnabar hover:text-antique-paper
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <span className="relative z-10">
            {isLoading ? '运笔构思中...' : (mode === Mode.RECORD ? '生成详案' : '获取灵感')}
          </span>
        </button>
      </div>
    </form>
  );
};

export default InputForm;