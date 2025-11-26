import React, { useState } from 'react';
import { GeneratedActivity, Collection } from '../types';
import ResultCard from './ResultCard';
import { KnotIcon, PlumFlower, TrashIcon, BrushIcon, FolderIcon, PlusIcon } from './Icons';

interface LibraryProps {
  activities: GeneratedActivity[];
  collections: Collection[];
  onDeleteActivity: (id: string) => void;
  onUpdateActivity: (activity: GeneratedActivity) => void;
  onGeneratePPT: (activity: GeneratedActivity) => void;
  onGenerateExercises: (activity: GeneratedActivity) => void;
  onCreateCollection: (name: string, description: string) => void;
  onMoveToCollection: (activityId: string, collectionId: string) => void;
}

const Library: React.FC<LibraryProps> = ({ 
  activities, 
  collections,
  onDeleteActivity, 
  onUpdateActivity,
  onGeneratePPT,
  onGenerateExercises,
  onCreateCollection,
  onMoveToCollection
}) => {
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [showCreateCollection, setShowCreateCollection] = useState(false);
  
  // Create Collection Form State
  const [newCollName, setNewCollName] = useState("");
  const [newCollDesc, setNewCollDesc] = useState("");

  const handleCreateCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCollName.trim()) {
      onCreateCollection(newCollName, newCollDesc);
      setNewCollName("");
      setNewCollDesc("");
      setShowCreateCollection(false);
    }
  };

  const selectedActivity = activities.find(a => a.id === selectedActivityId);

  // Filter activities based on selected collection
  const displayedActivities = selectedCollectionId 
    ? activities.filter(a => a.collectionId === selectedCollectionId)
    : activities;

  const currentCollectionName = selectedCollectionId 
    ? collections.find(c => c.id === selectedCollectionId)?.name 
    : "所有灵感 (All)";

  if (selectedActivity) {
    return (
      <div className="animate-fade-in-up">
        <button 
          onClick={() => setSelectedActivityId(null)}
          className="mb-4 text-wood-border hover:text-cinnabar transition-colors flex items-center font-bold"
        >
          ← 返回列表 (Back)
        </button>
        <ResultCard 
          activity={selectedActivity} 
          loadingImage={false} 
          onDelete={(id) => {
            onDeleteActivity(id);
            setSelectedActivityId(null);
          }}
          onUpdate={onUpdateActivity}
          onGeneratePPT={onGeneratePPT}
          onGenerateExercises={onGenerateExercises}
          isSaved={true}
          collections={collections}
          onMoveToCollection={onMoveToCollection}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Collections Section */}
      <div className="bg-[#fdfbf7] border border-wood-border/20 rounded-lg p-6 shadow-md">
         <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-calligraphy text-wood-border flex items-center">
              <FolderIcon className="w-6 h-6 mr-2" />
              灵感合集 (Collections)
            </h3>
            <button 
              onClick={() => setShowCreateCollection(!showCreateCollection)}
              className="text-sm bg-wood-border text-antique-paper px-3 py-1 rounded-full flex items-center hover:bg-wood-border/90"
            >
              <PlusIcon className="w-4 h-4 mr-1" /> 新建合集
            </button>
         </div>

         {/* Create Form */}
         {showCreateCollection && (
            <form onSubmit={handleCreateCollection} className="mb-6 bg-antique-paper p-4 rounded border border-wood-border/30">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <input 
                   placeholder="合集名称 (Name)" 
                   value={newCollName}
                   onChange={e => setNewCollName(e.target.value)}
                   className="bg-white/50 border border-wood-border/20 rounded px-2 py-1 outline-none focus:border-cinnabar"
                   required
                 />
                 <input 
                   placeholder="描述 (Description)" 
                   value={newCollDesc}
                   onChange={e => setNewCollDesc(e.target.value)}
                   className="bg-white/50 border border-wood-border/20 rounded px-2 py-1 outline-none focus:border-cinnabar"
                 />
                 <button type="submit" className="bg-cinnabar text-white rounded font-bold hover:bg-[#a0302a]">创建 (Create)</button>
               </div>
            </form>
         )}

         {/* Horizontal Scroll List of Collections */}
         <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
            {/* "All" Card */}
            <div 
               onClick={() => setSelectedCollectionId(null)}
               className={`flex-shrink-0 w-40 p-4 rounded cursor-pointer border transition-all ${
                 selectedCollectionId === null 
                 ? 'bg-wood-border text-antique-paper border-wood-border shadow-lg' 
                 : 'bg-white border-wood-border/20 hover:border-cinnabar text-gray-600'
               }`}
            >
               <FolderIcon className="w-8 h-8 mb-2 opacity-80" />
               <p className="font-bold truncate">所有灵感</p>
               <p className="text-xs opacity-60">{activities.length} items</p>
            </div>

            {collections.map(c => {
               const count = activities.filter(a => a.collectionId === c.id).length;
               return (
                <div 
                  key={c.id}
                  onClick={() => setSelectedCollectionId(c.id)}
                  className={`flex-shrink-0 w-40 p-4 rounded cursor-pointer border transition-all ${
                    selectedCollectionId === c.id 
                    ? 'bg-wood-border text-antique-paper border-wood-border shadow-lg' 
                    : 'bg-white border-wood-border/20 hover:border-cinnabar text-gray-600'
                  }`}
                >
                  <FolderIcon className="w-8 h-8 mb-2 opacity-80" />
                  <p className="font-bold truncate">{c.name}</p>
                  <p className="text-xs opacity-60">{count} items</p>
                </div>
               );
            })}
         </div>
      </div>

      {/* Activities Grid */}
      <div>
        <h3 className="text-lg font-bold text-wood-border mb-4 pl-2 border-l-4 border-cinnabar">
           {currentCollectionName}
        </h3>

        {displayedActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400 border-2 border-dashed border-wood-border/20 rounded-lg bg-white/30 p-8 text-center">
            <KnotIcon className="w-12 h-12 mb-4 text-wood-border/40" />
            <p className="font-serif">该合集暂无灵感</p>
            <p className="text-xs opacity-60 mt-1">No activities in this collection.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {displayedActivities.map((activity) => (
              <div 
                key={activity.id} 
                className="bg-[#fdfbf7] rounded-lg shadow-lg overflow-hidden border border-wood-border/20 group hover:shadow-2xl transition-all duration-300 flex flex-col h-full cursor-pointer relative"
                onClick={() => setSelectedActivityId(activity.id || null)}
              >
                {/* Top Border Decoration */}
                <div className="h-2 bg-[#8b5a2b] w-full"></div>
                
                <div className="p-6 flex-grow flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-calligraphy text-ink-black leading-tight line-clamp-2 flex-grow pr-2">
                      {activity.title}
                    </h3>
                    <PlumFlower className="w-6 h-6 text-cinnabar flex-shrink-0 opacity-80" />
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-4 flex-grow">
                    <div className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-jade-green rounded-full mr-2"></span>
                      <span className="truncate font-bold text-wood-border">{activity.theme || '未分类主题'}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-earth-brown rounded-full mr-2"></span>
                      <span className="truncate">{activity.level || '通用水平'}</span>
                    </div>
                    <p className="line-clamp-3 italic text-xs mt-3 opacity-80 bg-antique-paper/50 p-2 rounded">
                      "{activity.rationale}"
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-wood-border/10">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                      {activity.createdAt ? new Date(activity.createdAt).toLocaleDateString() : 'Unknown Date'}
                    </span>
                    <div className="flex space-x-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedActivityId(activity.id || null);
                        }}
                        className="p-2 text-wood-border hover:text-cinnabar hover:bg-wood-border/10 rounded-full transition-colors"
                        title="View/Edit"
                      >
                        <BrushIcon className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if(activity.id) onDeleteActivity(activity.id);
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        title="Delete"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Library;