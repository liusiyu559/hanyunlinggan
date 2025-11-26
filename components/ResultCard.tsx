
import React, { useState, useEffect } from 'react';
import { ActivityCardProps, GeneratedActivity } from '../types';
import { LatticeBorder, PlumFlower, BrushIcon, SealIcon, CheckIcon, CloseIcon, TrashIcon, PPTIcon, FolderIcon, ExamIcon, TargetIcon, BookIcon, PhotoIcon } from './Icons';

const ResultCard: React.FC<ActivityCardProps> = ({ 
  activity, 
  loadingImage, 
  onSave, 
  onUpdate, 
  onDelete, 
  isSaved = false,
  onGeneratePPT,
  onGenerateExercises,
  collections = [],
  onMoveToCollection,
  onGenerateImageBatch
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedActivity, setEditedActivity] = useState<GeneratedActivity>(activity);

  // Reset local state when activity prop changes
  useEffect(() => {
    setEditedActivity(activity);
    setIsEditing(false);
  }, [activity]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedActivity(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (name: 'props' | 'steps' | 'teachingGoals' | 'keyPoints', value: string) => {
    const arrayValue = value.split('\n').filter(line => line.trim() !== '');
    setEditedActivity(prev => ({ ...prev, [name]: arrayValue }));
  };
  
  const saveChanges = () => {
    if (onUpdate) {
      onUpdate(editedActivity);
    }
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setEditedActivity(activity);
    setIsEditing(false);
  };

  const triggerSaveToLibrary = () => {
    const activityToSave = isEditing ? editedActivity : activity;
    if (onSave) {
      onSave(activityToSave);
      if (isEditing && onUpdate) {
        onUpdate(activityToSave);
      }
      setIsEditing(false);
    }
  };

  const handleCollectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onMoveToCollection && activity.id) {
      onMoveToCollection(activity.id, e.target.value);
    }
  };

  const textareaClass = "w-full bg-transparent border border-wood-border/30 rounded p-2 focus:border-cinnabar outline-none font-serif text-ink-black transition-colors bg-white/40 leading-relaxed";

  return (
    <div className="w-full bg-[#fdfbf7] text-ink-black shadow-2xl relative overflow-hidden my-6 animate-fade-in-up transition-all duration-500">
      {/* Scroll decorative header */}
      <div className="h-12 bg-[#8b5a2b] flex items-center justify-between px-4 shadow-md relative z-10">
        <div className="w-full h-[1px] bg-[#d4c5a9] opacity-30"></div>
        
        {/* Title Editing */}
        <div className="absolute left-1/2 transform -translate-x-1/2 bg-[#8b5a2b] px-4 w-2/3 md:w-1/2 text-center">
          {isEditing ? (
            <input
              name="title"
              value={editedActivity.title}
              onChange={handleTextChange}
              className="w-full bg-[#7a4f25] text-[#f0e7d8] font-calligraphy text-xl text-center outline-none border-b border-[#f0e7d8]/30 focus:border-[#f0e7d8]"
            />
          ) : (
             <h2 className="text-[#f0e7d8] font-calligraphy text-xl truncate">
              {activity.title}
            </h2>
          )}
        </div>

        {/* Action Buttons Top Right */}
        <div className="absolute right-4 flex space-x-2 bg-[#8b5a2b] pl-2 items-center">
          {isEditing ? (
            <>
              <button onClick={saveChanges} className="text-green-400 hover:text-green-200 transition-colors" title="Confirm Edits">
                <CheckIcon className="w-5 h-5" />
              </button>
              <button onClick={cancelEdit} className="text-red-400 hover:text-red-200 transition-colors" title="Cancel">
                <CloseIcon className="w-5 h-5" />
              </button>
            </>
          ) : (
            <>
               <button onClick={() => setIsEditing(true)} className="text-[#d4c5a9] hover:text-white transition-colors" title="Edit Inspiration">
                <BrushIcon className="w-5 h-5" />
              </button>
              {onGenerateExercises && (
                <button onClick={() => onGenerateExercises(activity)} className="text-[#d4c5a9] hover:text-white transition-colors" title="Generate Exercises">
                  <ExamIcon className="w-5 h-5" />
                </button>
              )}
              {onGeneratePPT && (
                <button onClick={() => onGeneratePPT(activity)} className="text-[#d4c5a9] hover:text-white transition-colors" title="Generate PPT">
                  <PPTIcon className="w-5 h-5" />
                </button>
              )}
              {onGenerateImageBatch && (
                <button onClick={() => onGenerateImageBatch(activity)} className="text-[#d4c5a9] hover:text-white transition-colors" title="Batch Generate Images">
                  <PhotoIcon className="w-5 h-5" />
                </button>
              )}
              {onDelete && (
                <button onClick={() => onDelete(activity.id!)} className="text-[#d4c5a9] hover:text-red-400 transition-colors" title="Delete">
                  <TrashIcon className="w-5 h-5" />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-8 md:p-12 relative">
        <LatticeBorder />

        {/* Collection Selector */}
        {isSaved && onMoveToCollection && (
           <div className="relative z-10 mb-6 flex justify-end">
              <div className="flex items-center space-x-2 bg-antique-paper-dark/50 px-3 py-1 rounded-full border border-wood-border/20">
                <FolderIcon className="w-4 h-4 text-wood-border" />
                <select 
                  value={activity.collectionId || ""} 
                  onChange={handleCollectionChange}
                  className="bg-transparent text-sm text-wood-border outline-none font-bold cursor-pointer"
                >
                  <option value="">未分类 (Uncategorized)</option>
                  {collections.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
           </div>
        )}

        {/* Rationale Section */}
        <div className="mb-8 relative z-10">
          <h3 className="flex items-center text-lg font-bold text-wood-border border-b border-wood-border/30 pb-2 mb-3">
            <PlumFlower className="w-5 h-5 mr-2 text-cinnabar" />
            设计理念 (Rationale)
          </h3>
          {isEditing ? (
            <textarea
              name="rationale"
              value={editedActivity.rationale}
              onChange={handleTextChange}
              className={`${textareaClass} h-24`}
            />
          ) : (
            <p className="text-gray-700 leading-relaxed italic">
              {activity.rationale}
            </p>
          )}
        </div>

        {/* Goals & Key Points Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 relative z-10">
            {/* Teaching Goals */}
            <div className="bg-[#f5efe4] p-5 rounded border border-wood-border/20 shadow-sm">
                <h3 className="flex items-center font-bold text-wood-border mb-3">
                    <TargetIcon className="w-5 h-5 mr-2 text-cinnabar" />
                    教学目标 (Teaching Goals)
                </h3>
                {isEditing ? (
                    <textarea
                        value={editedActivity.teachingGoals?.join('\n') || ''}
                        onChange={(e) => handleArrayChange('teachingGoals', e.target.value)}
                        placeholder="每行一个目标 (One goal per line)"
                        className={`${textareaClass} h-32`}
                    />
                ) : (
                    <ul className="space-y-2 text-sm text-gray-700">
                        {activity.teachingGoals?.map((goal, idx) => (
                            <li key={idx} className="flex items-start">
                                <span className="text-cinnabar mr-2 font-bold">🎯</span>
                                <span>{goal}</span>
                            </li>
                        )) || <li className="text-gray-400 italic">暂无目标 (No goals provided)</li>}
                    </ul>
                )}
            </div>

            {/* Key Points */}
            <div className="bg-[#f5efe4] p-5 rounded border border-wood-border/20 shadow-sm">
                <h3 className="flex items-center font-bold text-wood-border mb-3">
                    <SealIcon className="w-5 h-5 mr-2 text-earth-brown" />
                    重难点分析 (Key Points)
                </h3>
                {isEditing ? (
                    <textarea
                        value={editedActivity.keyPoints?.join('\n') || ''}
                        onChange={(e) => handleArrayChange('keyPoints', e.target.value)}
                        placeholder="每行一个要点 (One point per line)"
                        className={`${textareaClass} h-32`}
                    />
                ) : (
                    <ul className="space-y-2 text-sm text-gray-700">
                        {activity.keyPoints?.map((point, idx) => (
                            <li key={idx} className="flex items-start">
                                <span className="text-earth-brown mr-2 font-bold">⚡</span>
                                <span>{point}</span>
                            </li>
                        )) || <li className="text-gray-400 italic">暂无重点 (No key points provided)</li>}
                    </ul>
                )}
            </div>
        </div>

        {/* Grammar Analysis Section */}
        <div className="mb-8 relative z-10">
            <h3 className="flex items-center text-lg font-bold text-wood-border border-b border-wood-border/30 pb-2 mb-4">
                <BookIcon className="w-5 h-5 mr-2 text-bamboo-green" />
                语法详解 (Grammar Analysis)
            </h3>
            
            <div className="grid grid-cols-1 gap-4">
                {activity.grammarAnalysis?.map((gram, idx) => (
                    <div key={idx} className="bg-white/60 p-5 rounded border-l-4 border-bamboo-green shadow-sm hover:shadow-md transition-shadow">
                         <div className="flex justify-between items-start mb-2">
                             <h4 className="font-calligraphy text-xl text-ink-black">{gram.point}</h4>
                             <span className="text-xs bg-bamboo-green/10 text-bamboo-green px-2 py-1 rounded">Grammar Point {idx + 1}</span>
                         </div>
                         
                         <div className="mb-2">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Structure (格式)</span>
                            <div className="font-serif text-lg text-cinnabar bg-cinnabar/5 p-2 rounded inline-block">
                                {gram.structure}
                            </div>
                         </div>

                         <div className="mb-3">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Usage (应用)</span>
                            <p className="text-sm text-gray-700">{gram.usage}</p>
                         </div>

                         <div>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Examples (句例)</span>
                            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                {gram.examples.map((ex, i) => (
                                    <li key={i}>{ex}</li>
                                ))}
                            </ul>
                         </div>
                    </div>
                )) || <p className="text-gray-400 italic text-center py-4">暂无语法解析 (No grammar analysis)</p>}
            </div>
        </div>

        {/* Props & Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 relative z-10">
          <div className="col-span-1 bg-[#f5efe4] p-4 rounded border border-wood-border/20">
            <h3 className="font-bold text-wood-border mb-3 flex items-center">
              <span className="w-2 h-2 bg-jade-green rotate-45 mr-2"></span>
              所需道具 (Props)
            </h3>
            {isEditing ? (
              <textarea
                value={editedActivity.props.join('\n')}
                onChange={(e) => handleArrayChange('props', e.target.value)}
                placeholder="Every line is a prop"
                className={`${textareaClass} h-40 text-sm`}
              />
            ) : (
              <ul className="space-y-2 text-sm">
                {activity.props.map((prop, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-cinnabar mr-2">•</span> {prop}
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="col-span-1 md:col-span-2">
            <h3 className="font-bold text-wood-border mb-3 flex items-center">
              <span className="w-2 h-2 bg-cinnabar rotate-45 mr-2"></span>
              教学步骤 (Steps)
            </h3>
            {isEditing ? (
               <textarea
                value={editedActivity.steps.join('\n')}
                onChange={(e) => handleArrayChange('steps', e.target.value)}
                placeholder="Every line is a step"
                className={`${textareaClass} h-64`}
              />
            ) : (
              <ol className="space-y-3">
                {activity.steps.map((step, idx) => (
                  <li key={idx} className="flex">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-wood-border text-antique-paper flex items-center justify-center text-xs mr-3 mt-0.5 font-serif">
                      {idx + 1}
                    </span>
                    <span className="text-gray-800 leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>

        {/* Simulation & Image */}
        <div className="relative z-10">
           <h3 className="font-bold text-wood-border mb-4 flex items-center">
              <span className="w-2 h-2 bg-earth-brown rotate-45 mr-2"></span>
              情景模拟 (Simulation)
            </h3>
          
          <div className="flex flex-col md:flex-row gap-6">
            <div className={`flex-1 bg-white/50 p-6 rounded border-l-4 border-jade-green shadow-inner ${isEditing ? 'p-0 bg-transparent border-0' : ''}`}>
               {isEditing ? (
                <>
                  <label className="text-xs text-gray-500 font-bold block mb-1">Context (梗概)</label>
                  <textarea
                    name="simulationContext"
                    value={editedActivity.simulationContext}
                    onChange={handleTextChange}
                    className={`${textareaClass} h-24 mb-4`}
                    placeholder="Dialogue Synopsis"
                  />
                  <label className="text-xs text-gray-500 font-bold block mb-1">Dialogue (对话)</label>
                  <textarea
                    name="simulation"
                    value={editedActivity.simulation}
                    onChange={handleTextChange}
                    className={`${textareaClass} h-[300px]`}
                    placeholder="The Dialogue Script"
                  />
                </>
               ) : (
                 <>
                    {/* Context Box */}
                    {activity.simulationContext && (
                        <div className="mb-4 p-3 bg-jade-green/10 rounded text-sm text-jade-green border border-jade-green/20">
                            <span className="font-bold mr-2">📖 情景梗概:</span>
                            {activity.simulationContext}
                        </div>
                    )}
                    
                    {/* Dialogue Text */}
                    <div className="italic text-gray-700 whitespace-pre-wrap leading-loose">
                        {activity.simulation}
                    </div>
                 </>
               )}
            </div>
            
            <div className="w-full md:w-1/3 flex-shrink-0">
               <div className="aspect-square bg-gray-100 rounded border-4 border-double border-wood-border relative overflow-hidden shadow-lg flex items-center justify-center group">
                  {loadingImage ? (
                    <div className="text-center p-4">
                      <div className="inline-block w-8 h-8 border-4 border-cinnabar border-t-transparent rounded-full animate-spin mb-2"></div>
                      <p className="text-xs text-gray-500 font-serif">丹青绘制中...</p>
                    </div>
                  ) : activity.imageUrl ? (
                    <img 
                      src={activity.imageUrl} 
                      alt="Classroom Simulation" 
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                  ) : (
                    <div className="text-gray-400 text-xs text-center p-4">
                      暂无图片<br/>(Image Unavailable)
                    </div>
                  )}
               </div>
               <p className="text-center text-[10px] text-gray-400 mt-2 font-serif">AI生成效果图 (AI Generated)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer / Save Button */}
      <div className="h-16 bg-[#8b5a2b] shadow-inner flex items-center justify-center relative">
         {onSave && !onDelete && (
           <button 
             onClick={triggerSaveToLibrary}
             className={`
               flex items-center space-x-2 px-8 py-2 rounded-full border-2 
               transition-all duration-300 transform hover:scale-105
               ${isSaved 
                 ? 'bg-[#5c5042] border-[#d4c5a9] text-[#d4c5a9] cursor-default' 
                 : 'bg-cinnabar border-yellow-600 text-antique-paper hover:bg-[#a0302a] shadow-lg'}
             `}
             disabled={isSaved}
           >
             <SealIcon className="w-5 h-5" />
             <span className="font-calligraphy tracking-widest text-lg">
               {isSaved ? '已收藏 (Saved)' : '收藏灵感 (Collect)'}
             </span>
           </button>
         )}
         {onDelete && (
           <p className="text-[#d4c5a9] text-sm font-serif italic opacity-60">
             修改后请点击右上角对勾保存 · Click checkmark to save edits
           </p>
         )}
      </div>
    </div>
  );
};

export default ResultCard;
