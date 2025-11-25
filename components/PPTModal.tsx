import React, { useState } from 'react';
import { PPTConfig, PPTStyle, PPTOutlineItem, GeneratedActivity } from '../types';
import { CloseIcon, PPTIcon, UploadIcon, PlusIcon, TrashIcon } from './Icons';
import { generatePPTOutline } from '../services/geminiService';

interface PPTModalProps {
  activity: GeneratedActivity | null;
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (config: PPTConfig) => void;
}

type Step = 'CONFIG' | 'LOADING_OUTLINE' | 'EDIT_OUTLINE';

const PPTModal: React.FC<PPTModalProps> = ({ activity, isOpen, onClose, onGenerate }) => {
  const [step, setStep] = useState<Step>('CONFIG');
  const [title, setTitle] = useState("");
  const [style, setStyle] = useState<PPTStyle>('INK_WASH');
  const [requirements, setRequirements] = useState(""); // User request for the outline
  const [customBg, setCustomBg] = useState<string | undefined>(undefined);
  const [outline, setOutline] = useState<PPTOutlineItem[]>([]);

  // Initialize title when modal opens with an activity
  React.useEffect(() => {
    if (activity && isOpen) {
      setTitle(activity.title);
      setStep('CONFIG');
      setOutline([]);
      setCustomBg(undefined);
    }
  }, [activity, isOpen]);

  if (!isOpen || !activity) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomBg(reader.result as string);
        setStyle('CUSTOM_UPLOAD');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateOutline = async () => {
    if (!title) return;
    setStep('LOADING_OUTLINE');
    try {
      const generatedOutline = await generatePPTOutline(activity, requirements);
      setOutline(generatedOutline);
      setStep('EDIT_OUTLINE');
    } catch (e) {
      alert("生成大纲失败 (Failed to generate outline)");
      setStep('CONFIG');
    }
  };

  const handleOutlineChange = (index: number, field: keyof PPTOutlineItem, value: string) => {
    const newOutline = [...outline];
    newOutline[index] = { ...newOutline[index], [field]: value };
    setOutline(newOutline);
  };

  const addSlide = () => {
    setOutline([...outline, { title: "New Slide", note: "Content description" }]);
  };

  const removeSlide = (index: number) => {
    setOutline(outline.filter((_, i) => i !== index));
  };

  const handleFinalGenerate = () => {
    onGenerate({
      title,
      style,
      customBackground: customBg,
      outline
    });
  };

  const inputClass = "w-full bg-antique-paper-dark border-b-2 border-wood-border/30 focus:border-cinnabar px-3 py-2 outline-none font-serif text-ink-black";
  const labelClass = "block text-wood-border font-bold mb-1 mt-4 text-sm font-calligraphy tracking-widest";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#f5efe4] rounded-lg shadow-2xl border border-wood-border w-full max-w-2xl relative max-h-[90vh] flex flex-col">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-500 hover:text-cinnabar transition-colors z-10"
        >
          <CloseIcon className="w-6 h-6" />
        </button>

        <div className="p-6 border-b border-wood-border/20 flex items-center space-x-3">
          <div className="bg-wood-border text-antique-paper p-2 rounded">
            <PPTIcon className="w-6 h-6" />
          </div>
          <div>
             <h2 className="text-2xl font-calligraphy text-ink-black">生成课件 (Generate PPT)</h2>
             <p className="text-xs text-gray-500">Step {step === 'EDIT_OUTLINE' ? '2/2: Confirm Outline' : '1/2: Configuration'}</p>
          </div>
        </div>

        <div className="p-8 overflow-y-auto flex-grow custom-scrollbar">
          {step === 'CONFIG' && (
            <div className="space-y-4">
              <div>
                <label className={labelClass}>课件标题 (Title)</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>风格主题 (Style)</label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                   <button 
                     type="button"
                     onClick={() => setStyle('INK_WASH')}
                     className={`p-3 border rounded text-center transition-all ${style === 'INK_WASH' ? 'border-cinnabar bg-cinnabar/10 text-cinnabar font-bold' : 'border-gray-300'}`}
                   >
                     水墨雅韵 (Ink Wash)
                   </button>
                   <button 
                     type="button"
                     onClick={() => setStyle('FESTIVE_RED')}
                     className={`p-3 border rounded text-center transition-all ${style === 'FESTIVE_RED' ? 'border-cinnabar bg-cinnabar/10 text-cinnabar font-bold' : 'border-gray-300'}`}
                   >
                     喜庆剪纸 (Festive)
                   </button>
                   <button 
                     type="button"
                     onClick={() => setStyle('MINIMALIST_ZEN')}
                     className={`p-3 border rounded text-center transition-all ${style === 'MINIMALIST_ZEN' ? 'border-cinnabar bg-cinnabar/10 text-cinnabar font-bold' : 'border-gray-300'}`}
                   >
                     极简禅意 (Zen)
                   </button>
                   <label className={`cursor-pointer p-3 border rounded text-center transition-all flex flex-col items-center justify-center ${style === 'CUSTOM_UPLOAD' ? 'border-cinnabar bg-cinnabar/10 text-cinnabar font-bold' : 'border-gray-300 hover:bg-gray-50'}`}>
                      <span className="flex items-center text-sm"><UploadIcon className="w-4 h-4 mr-1"/> 上传模板 (Upload)</span>
                      <span className="text-[10px] opacity-70">Background Image</span>
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                   </label>
                </div>
                {customBg && (
                  <div className="mt-2 text-xs text-green-600 flex items-center">
                    ✓ Custom background image loaded
                    <button onClick={() => setCustomBg(undefined)} className="ml-2 underline text-red-500">Remove</button>
                  </div>
                )}
              </div>

              <div>
                <label className={labelClass}>大纲生成要求 (Outline Requirements)</label>
                <textarea
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  className={`${inputClass} h-20 resize-none`}
                  placeholder="e.g. Include a game section, Focus on grammar drills..."
                />
              </div>

              <div className="mt-8">
                <button
                  onClick={handleGenerateOutline}
                  disabled={!title}
                  className="w-full bg-wood-border text-antique-paper font-bold py-3 rounded hover:bg-[#4a3b2a] transition-colors flex items-center justify-center shadow-lg disabled:opacity-50"
                >
                  下一步：生成大纲 (Next: Generate Outline)
                </button>
              </div>
            </div>
          )}

          {step === 'LOADING_OUTLINE' && (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="w-12 h-12 border-4 border-wood-border border-t-cinnabar rounded-full animate-spin mb-4"></div>
              <p className="font-calligraphy text-xl">规划大纲中...</p>
              <p className="text-sm text-gray-500">Drafting structure...</p>
            </div>
          )}

          {step === 'EDIT_OUTLINE' && (
             <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-wood-border font-bold font-calligraphy">编辑大纲 (Edit Outline)</label>
                  <button onClick={addSlide} className="text-xs flex items-center bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200">
                    <PlusIcon className="w-3 h-3 mr-1" /> Add Slide
                  </button>
                </div>
                
                <div className="space-y-3">
                   {outline.map((item, idx) => (
                     <div key={idx} className="flex items-start space-x-2 bg-white/50 p-3 rounded border border-wood-border/10 group">
                        <span className="text-wood-border font-bold mt-2 w-6 text-center">{idx + 1}</span>
                        <div className="flex-grow space-y-2">
                           <input 
                              value={item.title}
                              onChange={(e) => handleOutlineChange(idx, 'title', e.target.value)}
                              className="w-full bg-transparent border-b border-wood-border/20 font-bold outline-none focus:border-cinnabar"
                              placeholder="Slide Title"
                           />
                           <input 
                              value={item.note}
                              onChange={(e) => handleOutlineChange(idx, 'note', e.target.value)}
                              className="w-full bg-transparent text-sm text-gray-500 outline-none"
                              placeholder="Description / Intent"
                           />
                        </div>
                        <button onClick={() => removeSlide(idx)} className="text-gray-300 hover:text-red-500 p-2">
                           <TrashIcon className="w-4 h-4" />
                        </button>
                     </div>
                   ))}
                </div>

                <div className="mt-8 flex space-x-4">
                  <button
                    onClick={() => setStep('CONFIG')}
                    className="flex-1 bg-transparent border border-wood-border text-wood-border font-bold py-3 rounded hover:bg-wood-border/10 transition-colors"
                  >
                    上一步 (Back)
                  </button>
                  <button
                    onClick={handleFinalGenerate}
                    className="flex-1 bg-cinnabar text-antique-paper font-bold py-3 rounded hover:bg-[#a0302a] transition-colors flex items-center justify-center shadow-lg"
                  >
                    <PPTIcon className="w-5 h-5 mr-2" />
                    生成最终 PPT (Export)
                  </button>
                </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PPTModal;