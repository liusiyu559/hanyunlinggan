import React, { useState } from 'react';
import { GeneratedActivity, ImageGenerationItem } from '../types';
import { CloseIcon, PhotoIcon, DownloadIcon, CheckIcon } from './Icons';
import { generateImageBatchPrompts, generateActivityImage } from '../services/geminiService';
import JSZip from 'jszip';
import FileSaver from 'file-saver';

interface ImageBatchModalProps {
  activity: GeneratedActivity | null;
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'CONFIG' | 'REVIEW' | 'GENERATING' | 'RESULT';

const ImageBatchModal: React.FC<ImageBatchModalProps> = ({ activity, isOpen, onClose }) => {
  const [step, setStep] = useState<Step>('CONFIG');
  const [focusPoint, setFocusPoint] = useState("");
  const [count, setCount] = useState(3);
  const [items, setItems] = useState<ImageGenerationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Reset state when opening new activity
  React.useEffect(() => {
    if (isOpen) {
      setStep('CONFIG');
      setFocusPoint("");
      setCount(3);
      setItems([]);
      setIsLoading(false);
    }
  }, [isOpen, activity]);

  if (!isOpen || !activity) return null;

  const handleGenerateScenarios = async () => {
    if (!focusPoint.trim()) {
        alert("请输入教学重点 (Please enter a teaching focus)");
        return;
    }
    setIsLoading(true);
    try {
      const scenarios = await generateImageBatchPrompts(activity, { focusPoint, count });
      const initialItems: ImageGenerationItem[] = scenarios.map((s, idx) => ({
        id: `img_${Date.now()}_${idx}`,
        description: s.description,
        dialogue: s.dialogue,
        status: 'PENDING'
      }));
      setItems(initialItems);
      setStep('REVIEW');
    } catch (e) {
      alert("生成情景失败 (Failed to generate scenarios)");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateItem = (index: number, field: 'dialogue' | 'description', value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const startBatchGeneration = async () => {
    setStep('GENERATING');
    const newItems = [...items];
    
    // Process sequentially to avoid rate limits and show progress
    for (let i = 0; i < newItems.length; i++) {
        newItems[i].status = 'GENERATING';
        setItems([...newItems]);
        
        try {
            const imageUrl = await generateActivityImage(newItems[i].description);
            if (imageUrl) {
                newItems[i].imageUrl = imageUrl;
                newItems[i].status = 'COMPLETED';
            } else {
                newItems[i].status = 'FAILED';
            }
        } catch (e) {
            newItems[i].status = 'FAILED';
        }
        setItems([...newItems]);
    }
    setStep('RESULT');
  };

  const downloadAll = async () => {
    const zip = new JSZip();
    const folder = zip.folder(`Practice_Images_${activity.title}`);
    
    if (!folder) return;

    // Add Text File with Dialogues
    let textContent = `Activity: ${activity.title}\nTeaching Focus: ${focusPoint}\n\n`;
    items.forEach((item, idx) => {
        textContent += `Scene ${idx + 1}:\nDialogue: ${item.dialogue}\nDescription: ${item.description}\n\n`;
    });
    folder.file("Dialogues.txt", textContent);

    // Add Images
    for (let i = 0; i < items.length; i++) {
        if (items[i].imageUrl) {
            // Remove data:image/png;base64, header
            const data = items[i].imageUrl!.split(',')[1];
            folder.file(`Scene_${i+1}.png`, data, { base64: true });
        }
    }

    try {
        const content = await zip.generateAsync({ type: "blob" });
        // Use safe access for saveAs whether it is default export or named property
        // @ts-ignore
        const saveFunc = FileSaver.saveAs || FileSaver;
        saveFunc(content, `${activity.title}_Images.zip`);
    } catch (e) {
        console.error(e);
        alert("打包下载失败 (Failed to zip files)");
    }
  };

  const labelClass = "block text-wood-border font-bold mb-2 font-calligraphy tracking-widest";
  const inputClass = "w-full bg-antique-paper-dark border-b-2 border-wood-border/30 focus:border-cinnabar px-3 py-2 outline-none font-serif text-ink-black";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#f5efe4] rounded-lg shadow-2xl border border-wood-border w-full max-w-4xl relative max-h-[90vh] flex flex-col">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-cinnabar z-10">
          <CloseIcon className="w-6 h-6" />
        </button>

        <div className="p-6 border-b border-wood-border/20 flex items-center space-x-3">
          <div className="bg-wood-border text-antique-paper p-2 rounded">
            <PhotoIcon className="w-6 h-6" />
          </div>
          <div>
             <h2 className="text-2xl font-calligraphy text-ink-black">情景练习图片生成 (Scenario Image Batch)</h2>
             <p className="text-xs text-gray-500">Practice Focus: {focusPoint || "Not set"}</p>
          </div>
        </div>

        <div className="p-8 overflow-y-auto flex-grow custom-scrollbar">
            {step === 'CONFIG' && (
                <div className="space-y-6 max-w-lg mx-auto">
                    <div>
                        <label className={labelClass}>教学重点 (Teaching Focus)</label>
                        <textarea
                            value={focusPoint}
                            onChange={(e) => setFocusPoint(e.target.value)}
                            placeholder="例如：语法点'把'字句；疑问代词'怎么'；购物词汇..."
                            className={`${inputClass} h-24 resize-none`}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>生成数量 (Count): {count}</label>
                        <input 
                            type="range" min="1" max="5" 
                            value={count} onChange={(e) => setCount(parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cinnabar"
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>1</span><span>5</span>
                        </div>
                    </div>
                    <button 
                        onClick={handleGenerateScenarios}
                        disabled={isLoading}
                        className="w-full bg-wood-border text-antique-paper font-bold py-3 rounded hover:bg-[#4a3b2a] transition-colors shadow-lg flex justify-center items-center"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        ) : null}
                        下一步：设计情景 (Next: Design Scenarios)
                    </button>
                </div>
            )}

            {step === 'REVIEW' && (
                <div className="space-y-6">
                    <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded border border-yellow-200">
                        请确认以下情景描述和模拟对话。您可以直接修改文本。确认无误后点击生成图片。
                        <br/>Please review descriptions and dialogues. Edit if needed, then generate images.
                    </p>
                    <div className="grid grid-cols-1 gap-6">
                        {items.map((item, idx) => (
                            <div key={idx} className="bg-white/60 p-4 rounded border border-wood-border/10">
                                <div className="flex justify-between mb-2">
                                    <span className="font-bold text-wood-border">Scene {idx+1}</span>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500">Prompt Description (English for AI)</label>
                                        <textarea 
                                            value={item.description}
                                            onChange={(e) => handleUpdateItem(idx, 'description', e.target.value)}
                                            className="w-full text-sm p-2 border rounded bg-gray-50 h-20"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500">Dialogue (Chinese)</label>
                                        <textarea 
                                            value={item.dialogue}
                                            onChange={(e) => handleUpdateItem(idx, 'dialogue', e.target.value)}
                                            className="w-full text-sm p-2 border rounded bg-gray-50 h-20"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button 
                        onClick={startBatchGeneration}
                        className="w-full bg-cinnabar text-antique-paper font-bold py-3 rounded hover:bg-[#a0302a] transition-colors shadow-lg"
                    >
                        确认并生成图片 (Confirm & Generate Images)
                    </button>
                </div>
            )}

            {(step === 'GENERATING' || step === 'RESULT') && (
                <div className="space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.map((item, idx) => (
                            <div key={idx} className="bg-white p-4 rounded shadow-md flex flex-col">
                                <div className="aspect-square bg-gray-100 rounded mb-4 overflow-hidden relative border border-gray-200 flex items-center justify-center">
                                    {item.status === 'COMPLETED' && item.imageUrl ? (
                                        <img src={item.imageUrl} alt={`Scene ${idx+1}`} className="w-full h-full object-cover" />
                                    ) : item.status === 'FAILED' ? (
                                        <div className="text-red-400 text-xs">生成失败 (Failed)</div>
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <div className={`w-8 h-8 border-4 border-cinnabar border-t-transparent rounded-full animate-spin mb-2 ${item.status === 'PENDING' ? 'opacity-0' : 'opacity-100'}`}></div>
                                            <span className="text-xs text-gray-400">{item.status === 'PENDING' ? 'Waiting...' : 'Generating...'}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-auto">
                                    <p className="text-sm font-serif whitespace-pre-wrap bg-gray-50 p-2 rounded border border-gray-100">{item.dialogue}</p>
                                </div>
                            </div>
                        ))}
                     </div>

                     {step === 'RESULT' && (
                        <div className="flex justify-center mt-8">
                            <button 
                                onClick={downloadAll}
                                className="bg-green-600 text-white font-bold py-3 px-8 rounded hover:bg-green-700 transition-colors shadow-lg flex items-center"
                            >
                                <DownloadIcon className="w-5 h-5 mr-2" />
                                打包下载 (Download All .zip)
                            </button>
                        </div>
                     )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ImageBatchModal;