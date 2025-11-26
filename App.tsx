
import React, { useState, useEffect } from 'react';
import { Mode, UserInput, GeneratedActivity, View, Collection, PPTConfig, ExerciseConfig } from './types';
import InputForm from './components/InputForm';
import ResultCard from './components/ResultCard';
import Library from './components/Library';
import PPTModal from './components/PPTModal';
import ExerciseModal from './components/ExerciseModal';
import ImageBatchModal from './components/ImageBatchModal';
import { generateActivityPlan, generateActivityImage, generatePPTSchema, generateExercises } from './services/geminiService';
import { createAndDownloadPPT } from './services/pptExportService';
import { createAndDownloadDoc } from './services/docExportService';
import { CloudPattern, PlumFlower, LibraryIcon } from './components/Icons';
import { getApiKey } from './utils/envUtils';

const App: React.FC = () => {
  const [view, setView] = useState<View>('CREATOR');
  const [mode, setMode] = useState<Mode>(Mode.RECORD);
  
  // Data States
  const [result, setResult] = useState<GeneratedActivity | null>(null);
  const [savedActivities, setSavedActivities] = useState<GeneratedActivity[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  
  // UI States
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingImage, setLoadingImage] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // PPT Generation State
  const [pptModalOpen, setPptModalOpen] = useState(false);
  const [activeActivityForPPT, setActiveActivityForPPT] = useState<GeneratedActivity | null>(null);
  const [generatingPPT, setGeneratingPPT] = useState(false);

  // Exercise Generation State
  const [exerciseModalOpen, setExerciseModalOpen] = useState(false);
  const [activeActivityForEx, setActiveActivityForEx] = useState<GeneratedActivity | null>(null);
  const [generatingEx, setGeneratingEx] = useState(false);

  // Image Batch Generation State
  const [imgBatchModalOpen, setImgBatchModalOpen] = useState(false);
  const [activeActivityForImgBatch, setActiveActivityForImgBatch] = useState<GeneratedActivity | null>(null);

  // Initialization Check
  useEffect(() => {
    const key = getApiKey();
    if (!key) {
      console.warn("API Key is missing! Check your environment configuration.");
      setError("API Key not found. Please ensure it is configured in Vercel.");
    }
  }, []);

  // Load from LocalStorage on Mount
  useEffect(() => {
    const saved = localStorage.getItem('hanyun_activities');
    const savedColls = localStorage.getItem('hanyun_collections');
    if (saved) {
      try {
        setSavedActivities(JSON.parse(saved));
      } catch (e) { console.error(e); }
    }
    if (savedColls) {
      try {
        setCollections(JSON.parse(savedColls));
      } catch (e) { console.error(e); }
    }
  }, []);

  // Persist to LocalStorage
  useEffect(() => {
    localStorage.setItem('hanyun_activities', JSON.stringify(savedActivities));
  }, [savedActivities]);

  useEffect(() => {
    localStorage.setItem('hanyun_collections', JSON.stringify(collections));
  }, [collections]);

  const handleModeSwitch = (newMode: Mode) => {
    setMode(newMode);
    setView('CREATOR');
    setResult(null);
    setError(null);
  };

  const handleViewSwitch = (newView: View) => {
    setView(newView);
    setError(null);
  };

  const handleFormSubmit = async (data: UserInput) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Step 1: Generate Text Content
      const activityData = await generateActivityPlan(data, mode);
      
      // Inject metadata from input into the result object for Library use
      const enrichedActivity: GeneratedActivity = {
        ...activityData,
        theme: data.theme,
        level: data.level
      };

      setResult(enrichedActivity);
      setLoading(false);

      // Step 2: Generate Image (asynchronous update)
      if (activityData.imagePromptDescription) {
        setLoadingImage(true);
        const imageUrl = await generateActivityImage(activityData.imagePromptDescription);
        if (imageUrl) {
          setResult(prev => prev ? { ...prev, imageUrl } : null);
        }
        setLoadingImage(false);
      }
    } catch (err: any) {
      console.error(err);
      setError("AI 连接失败，请检查网络或配置 (Failed to connect to AI): " + (err.message || String(err)));
      setLoading(false);
      setLoadingImage(false);
    }
  };

  // --- Collection Actions ---
  const handleCreateCollection = (name: string, description: string) => {
    const newColl: Collection = {
      id: Date.now().toString(),
      name,
      description,
      createdAt: Date.now()
    };
    setCollections(prev => [...prev, newColl]);
  };

  const handleMoveToCollection = (activityId: string, collectionId: string) => {
    setSavedActivities(prev => prev.map(a => 
      a.id === activityId ? { ...a, collectionId: collectionId || undefined } : a
    ));
    // If current result matches, update it too
    if (result && result.id === activityId) {
      setResult(prev => prev ? { ...prev, collectionId: collectionId || undefined } : null);
    }
  };

  // --- Library Actions ---

  const handleSaveActivity = (activity: GeneratedActivity) => {
    // Generate simple ID if not exists
    const newActivity = { 
      ...activity, 
      id: activity.id || Date.now().toString(), 
      createdAt: activity.createdAt || Date.now() 
    };

    setSavedActivities(prev => {
      // Check if already exists, update if so
      const exists = prev.find(a => a.id === newActivity.id);
      if (exists) {
        return prev.map(a => a.id === newActivity.id ? newActivity : a);
      }
      return [newActivity, ...prev];
    });

    // Update current view if we are looking at it
    if (result && (!result.id || result.id === newActivity.id)) {
      setResult(newActivity);
    }
  };

  const handleDeleteActivity = (id: string) => {
    if (window.confirm("确定要删除这个灵感吗？ (Are you sure you want to delete?)")) {
      setSavedActivities(prev => prev.filter(a => a.id !== id));
    }
  };

  const handleUpdateActivity = (updatedActivity: GeneratedActivity) => {
    // If it's in the library (has ID), update the library
    if (updatedActivity.id) {
        setSavedActivities(prev => prev.map(a => a.id === updatedActivity.id ? updatedActivity : a));
    }
    // Always update the current view
    if (result) {
        setResult(updatedActivity);
    }
  };

  // --- PPT Logic ---
  const openPPTModal = (activity: GeneratedActivity) => {
    setActiveActivityForPPT(activity);
    setPptModalOpen(true);
  };

  const handleGeneratePPT = async (config: PPTConfig) => {
    if (!activeActivityForPPT) return;
    
    setGeneratingPPT(true);
    try {
      // 1. Generate Schema (Content for each slide in outline)
      const schema = await generatePPTSchema(activeActivityForPPT, config);
      // 2. Create File
      await createAndDownloadPPT(schema, config);
      setPptModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("生成PPT失败 (Failed to generate PPT)");
    } finally {
      setGeneratingPPT(false);
    }
  };

  // --- Exercise Logic ---
  const openExerciseModal = (activity: GeneratedActivity) => {
    setActiveActivityForEx(activity);
    setExerciseModalOpen(true);
  };

  const handleGenerateExercises = async (config: ExerciseConfig) => {
    if (!activeActivityForEx) return;

    setGeneratingEx(true);
    try {
      const schema = await generateExercises(activeActivityForEx, config);
      createAndDownloadDoc(schema, config, activeActivityForEx.title + "_Exercises");
      setExerciseModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("生成练习题失败 (Failed to generate exercises)");
    } finally {
      setGeneratingEx(false);
    }
  };

  // --- Image Batch Logic ---
  const openImgBatchModal = (activity: GeneratedActivity) => {
    setActiveActivityForImgBatch(activity);
    setImgBatchModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-antique-paper bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')] text-ink-black flex flex-col font-serif">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#2c2c2c] to-[#4a4a4a] text-antique-paper py-6 shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
           <CloudPattern className="w-full h-full text-white transform scale-150 opacity-20" />
        </div>
        <div className="container mx-auto px-4 flex items-center justify-between relative z-10">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleViewSwitch('CREATOR')}>
            <div className="w-10 h-10 bg-cinnabar rounded-full flex items-center justify-center border-2 border-yellow-600 shadow-md transition-transform hover:scale-110">
              <span className="font-calligraphy text-2xl mt-1">汉</span>
            </div>
            <div>
               <h1 className="text-2xl md:text-3xl font-calligraphy tracking-widest">汉韵灵感</h1>
               <p className="text-xs md:text-sm text-gray-400 tracking-wider uppercase">TCFL Activity Generator</p>
            </div>
          </div>
          
          <button 
            onClick={() => handleViewSwitch(view === 'LIBRARY' ? 'CREATOR' : 'LIBRARY')}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-full border transition-all duration-300
              ${view === 'LIBRARY' 
                ? 'bg-antique-paper text-ink-black border-antique-paper shadow-inner' 
                : 'bg-transparent text-antique-paper border-antique-paper/30 hover:bg-white/10'}
            `}
          >
            <LibraryIcon className="w-5 h-5" />
            <span className="font-bold">{view === 'LIBRARY' ? '返回创作 (Create)' : '灵感库 (Library)'}</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12 relative">
        {/* Global Loading Overlay for PPT/Exercises */}
        {(generatingPPT || generatingEx) && (
          <div className="fixed inset-0 bg-black/50 z-[60] flex flex-col items-center justify-center backdrop-blur-sm">
             <div className="w-16 h-16 border-4 border-white border-t-cinnabar rounded-full animate-spin mb-4"></div>
             <p className="text-white font-calligraphy text-2xl">
               {generatingPPT ? '课件生成中...' : '练习题生成中...'}
             </p>
             <p className="text-white/70 text-sm">Processing request...</p>
          </div>
        )}

        {view === 'LIBRARY' ? (
          <div>
            <div className="mb-8 flex items-center justify-center relative">
               <div className="h-[1px] bg-wood-border/30 flex-grow max-w-xs"></div>
               <h2 className="text-3xl font-calligraphy text-wood-border mx-6">我的灵感锦囊</h2>
               <div className="h-[1px] bg-wood-border/30 flex-grow max-w-xs"></div>
            </div>
            <Library 
              activities={savedActivities} 
              collections={collections}
              onDeleteActivity={handleDeleteActivity}
              onUpdateActivity={handleUpdateActivity}
              onGeneratePPT={openPPTModal}
              onGenerateExercises={openExerciseModal}
              onCreateCollection={handleCreateCollection}
              onMoveToCollection={handleMoveToCollection}
            />
          </div>
        ) : (
          <>
            {/* Mode Tabs */}
            <div className="flex justify-center mb-10">
              <div className="bg-[#e3d6c0] p-1 rounded-full shadow-inner flex items-center space-x-1">
                <button
                  onClick={() => handleModeSwitch(Mode.RECORD)}
                  className={`px-6 py-2 rounded-full transition-all duration-300 flex items-center font-bold ${
                    mode === Mode.RECORD
                      ? 'bg-wood-border text-antique-paper shadow-md'
                      : 'text-wood-border hover:bg-wood-border/10'
                  }`}
                >
                  <PlumFlower className={`w-4 h-4 mr-2 ${mode === Mode.RECORD ? 'text-cinnabar' : 'text-gray-400'}`} />
                  记录灵感 (Record)
                </button>
                <button
                  onClick={() => handleModeSwitch(Mode.GENERATE)}
                  className={`px-6 py-2 rounded-full transition-all duration-300 flex items-center font-bold ${
                    mode === Mode.GENERATE
                      ? 'bg-wood-border text-antique-paper shadow-md'
                      : 'text-wood-border hover:bg-wood-border/10'
                  }`}
                >
                  <PlumFlower className={`w-4 h-4 mr-2 ${mode === Mode.GENERATE ? 'text-cinnabar' : 'text-gray-400'}`} />
                  生成灵感 (Generate)
                </button>
              </div>
            </div>

            {/* Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
              
              {/* Input Section */}
              <div className="lg:col-span-2 sticky top-8 z-10">
                <InputForm mode={mode} onSubmit={handleFormSubmit} isLoading={loading} />
                
                <div className="mt-6 p-4 border border-jade-green/30 rounded bg-[#f4f7f4] text-sm text-jade-green">
                  <p className="font-bold mb-1 flex items-center"><span className="text-xl mr-2">🍃</span> 小贴士</p>
                  <p className="opacity-80">点击右侧生成结果的“收藏灵感”按钮，可将其保存至灵感库。保存后可以分配到不同的合集。</p>
                </div>
              </div>

              {/* Result Section */}
              <div className="lg:col-span-3">
                 {error && (
                   <div className="bg-red-50 border-l-4 border-cinnabar text-cinnabar p-4 rounded shadow mb-6">
                     <p className="font-bold">Error</p>
                     <p>{error}</p>
                   </div>
                 )}

                 {loading && !result && (
                   <div className="flex flex-col items-center justify-center py-20">
                     <div className="w-16 h-16 border-4 border-wood-border border-b-cinnabar rounded-full animate-spin"></div>
                     <p className="mt-4 font-calligraphy text-xl text-wood-border animate-pulse">研墨构思中...</p>
                     <p className="text-sm text-gray-500">AI正在为您设计教学方案</p>
                   </div>
                 )}

                 {result && (
                   <ResultCard 
                     activity={result} 
                     loadingImage={loadingImage} 
                     onSave={handleSaveActivity}
                     onUpdate={handleUpdateActivity}
                     isSaved={savedActivities.some(a => a.id === result.id)}
                     onGeneratePPT={openPPTModal}
                     onGenerateExercises={openExerciseModal}
                     onGenerateImageBatch={openImgBatchModal}
                     collections={collections}
                     onMoveToCollection={handleMoveToCollection}
                   />
                 )}

                 {!result && !loading && !error && (
                   <div className="h-64 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-wood-border/20 rounded-lg bg-white/30">
                     <PlumFlower className="w-12 h-12 mb-4 opacity-20" />
                     <p className="font-serif">请在左侧输入信息以开始</p>
                     <p className="text-sm opacity-60">Please input details on the left to start</p>
                   </div>
                 )}
              </div>

            </div>
          </>
        )}

        {/* Modal Logic */}
        <PPTModal 
          activity={activeActivityForPPT}
          isOpen={pptModalOpen} 
          onClose={() => setPptModalOpen(false)}
          onGenerate={handleGeneratePPT}
        />

        <ExerciseModal
          activity={activeActivityForEx}
          isOpen={exerciseModalOpen}
          onClose={() => setExerciseModalOpen(false)}
          onGenerate={handleGenerateExercises}
        />
        
        <ImageBatchModal
           activity={activeActivityForImgBatch}
           isOpen={imgBatchModalOpen}
           onClose={() => setImgBatchModalOpen(false)}
        />

      </main>

      {/* Footer */}
      <footer className="bg-[#3e342b] text-[#a89f91] py-6 text-center text-sm font-serif border-t-4 border-cinnabar mt-auto">
        <p>&copy; {new Date().getFullYear()} 汉韵灵感 (HanYun Inspiration). All Rights Reserved.</p>
        <p className="mt-1 text-xs opacity-60">Powered by Gemini 2.5 Flash & Tailwind CSS</p>
      </footer>
    </div>
  );
};

export default App;