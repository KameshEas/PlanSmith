import React, { useState, useEffect } from 'react';
import { ProjectPlan, Milestone, Task } from '../types';
import { 
  Target, 
  ListTodo, 
  ShieldAlert, 
  CalendarClock, 
  Wrench, 
  Maximize, 
  CheckCircle2, 
  XCircle,
  Lightbulb,
  ArrowRightCircle,
  Edit2,
  Save,
  X,
  Plus,
  Trash2
} from 'lucide-react';

interface PlanDisplayProps {
  plan: ProjectPlan | null;
  isLoading: boolean;
  onPlanUpdate: (plan: ProjectPlan) => void;
}

// --- Helper Components for Edit Mode ---

const EditableList: React.FC<{
  items: string[];
  onUpdate: (items: string[]) => void;
  isEditing: boolean;
  placeholder?: string;
  renderItem?: (item: string, index: number) => React.ReactNode;
  containerClass?: string;
}> = ({ items = [], onUpdate, isEditing, placeholder = "New item...", renderItem, containerClass = "space-y-2" }) => {
  if (!isEditing) {
    return (
      <ul className={containerClass}>
        {items.length === 0 && <li className="text-gray-400 italic text-sm">None listed.</li>}
        {items.map((item, i) => (renderItem ? renderItem(item, i) : <li key={i} className="text-gray-700">{item}</li>))}
      </ul>
    );
  }

  const handleChange = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    onUpdate(newItems);
  };

  const handleAdd = () => onUpdate([...items, ""]);
  const handleRemove = (index: number) => onUpdate(items.filter((_, i) => i !== index));

  return (
    <div className="space-y-2 w-full">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2 items-start animate-fade-in">
          <div className="flex-1">
             <input
              type="text"
              value={item}
              onChange={(e) => handleChange(i, e.target.value)}
              className="w-full p-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder={placeholder}
              autoFocus={item === ""}
            />
          </div>
          <button onClick={() => handleRemove(i)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Remove">
            <Trash2 size={16} />
          </button>
        </div>
      ))}
      <button onClick={handleAdd} className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50 transition-colors mt-1">
        <Plus size={14} /> Add Item
      </button>
    </div>
  );
};

const EditableText: React.FC<{
  value: string;
  onChange: (val: string) => void;
  isEditing: boolean;
  className?: string;
  inputClassName?: string;
  placeholder?: string;
}> = ({ value, onChange, isEditing, className, inputClassName, placeholder }) => {
  if (!isEditing) return <p className={className}>{value}</p>;
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full border border-gray-300 rounded p-1 focus:ring-2 focus:ring-blue-500 outline-none ${inputClassName || ''}`}
      placeholder={placeholder}
    />
  );
};

const EditableTextArea: React.FC<{
  value: string;
  onChange: (val: string) => void;
  isEditing: boolean;
  className?: string;
  rows?: number;
}> = ({ value, onChange, isEditing, className, rows = 3 }) => {
  if (!isEditing) return <p className={className}>{value}</p>;
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-y"
      rows={rows}
    />
  );
};

const SectionCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 transition-all hover:shadow-md">
    <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-3">
      <div className="text-blue-600">{icon}</div>
      <h3 className="text-lg font-bold text-gray-800 uppercase tracking-wide">{title}</h3>
    </div>
    {children}
  </div>
);

// --- Main Component ---

export const PlanDisplay: React.FC<PlanDisplayProps> = ({ plan, isLoading, onPlanUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPlan, setEditedPlan] = useState<ProjectPlan | null>(null);

  // Sync editedPlan when plan changes (if not editing)
  useEffect(() => {
    if (!isEditing && plan) {
      setEditedPlan(JSON.parse(JSON.stringify(plan)));
    }
  }, [plan, isEditing]);

  const handleStartEditing = () => {
    if (plan) {
      setEditedPlan(JSON.parse(JSON.stringify(plan)));
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    if (editedPlan) {
      onPlanUpdate(editedPlan);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (plan) setEditedPlan(JSON.parse(JSON.stringify(plan)));
  };

  const updateDeep = (updater: (p: ProjectPlan) => void) => {
    setEditedPlan((prev) => {
      if (!prev) return null;
      const clone = JSON.parse(JSON.stringify(prev));
      updater(clone);
      return clone;
    });
  };

  // Loading State
  if (isLoading && !plan) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <p>Analyzing conversation and structuring your plan...</p>
      </div>
    );
  }

  // Empty State
  if (!plan && !editedPlan) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center">
        <Lightbulb className="w-16 h-16 mb-4 text-gray-200" />
        <h2 className="text-xl font-semibold text-gray-600">No Plan Generated Yet</h2>
        <p className="mt-2 max-w-md">Start chatting with the assistant on the left. As you provide details, your structured project plan will appear here automatically.</p>
      </div>
    );
  }

  const currentPlan = isEditing ? editedPlan! : plan!;

  return (
    <div className="space-y-6 animate-fade-in pb-10 relative">
      
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-gray-200 pb-4">
        <div className="flex-1 w-full">
          <EditableText 
            isEditing={isEditing}
            value={currentPlan.title || "Untitled Project"}
            onChange={(val) => updateDeep(p => p.title = val)}
            className="text-3xl font-extrabold text-gray-900"
            inputClassName="text-2xl font-bold p-2"
            placeholder="Project Title"
          />
          <p className="text-gray-500 mt-1 text-sm">Project Plan Document</p>
        </div>
        
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button onClick={handleCancel} className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm">
                <X size={18} /> Cancel
              </button>
              <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all shadow-sm">
                <Save size={18} /> Save Changes
              </button>
            </>
          ) : (
            <button onClick={handleStartEditing} className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm group">
              <Edit2 size={18} className="group-hover:scale-110 transition-transform" /> Edit Plan
            </button>
          )}
        </div>
      </div>

      {/* Overview */}
      <SectionCard title="Project Overview" icon={<Target className="w-6 h-6" />}>
        <div className="mb-6">
           <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Summary</label>
           <EditableTextArea 
             isEditing={isEditing}
             value={currentPlan.overview?.summary || ""}
             onChange={(val) => updateDeep(p => p.overview.summary = val)}
             className="text-gray-700 leading-relaxed italic"
             rows={4}
           />
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h4 className="font-semibold text-blue-800 mb-2 text-sm">Objectives</h4>
            <EditableList 
              isEditing={isEditing}
              items={currentPlan.overview?.objectives || []}
              onUpdate={(items) => updateDeep(p => p.overview.objectives = items)}
              renderItem={(item, i) => (
                <li key={i} className="text-sm text-gray-700 list-disc list-inside">{item}</li>
              )}
            />
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <h4 className="font-semibold text-green-800 mb-2 text-sm">Success Criteria</h4>
            <EditableList 
              isEditing={isEditing}
              items={currentPlan.overview?.successCriteria || []}
              onUpdate={(items) => updateDeep(p => p.overview.successCriteria = items)}
              renderItem={(item, i) => (
                 <li key={i} className="text-sm text-gray-700 list-disc list-inside">{item}</li>
              )}
            />
          </div>
        </div>
      </SectionCard>

      {/* Scope */}
      <SectionCard title="Scope Definition" icon={<Maximize className="w-6 h-6" />}>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2 text-green-700 font-medium">
              <CheckCircle2 size={18} /> <span>In Scope</span>
            </div>
            <EditableList 
              isEditing={isEditing}
              items={currentPlan.scope?.included || []}
              onUpdate={(items) => updateDeep(p => p.scope.included = items)}
              renderItem={(item, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded mb-1">
                  <span className="mt-1.5 w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></span>
                  {item}
                </div>
              )}
            />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2 text-red-700 font-medium">
              <XCircle size={18} /> <span>Out of Scope</span>
            </div>
            <EditableList 
              isEditing={isEditing}
              items={currentPlan.scope?.excluded || []}
              onUpdate={(items) => updateDeep(p => p.scope.excluded = items)}
              renderItem={(item, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded mb-1">
                  <span className="mt-1.5 w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0"></span>
                  {item}
                </div>
              )}
            />
          </div>
        </div>
      </SectionCard>

      {/* Features */}
      <SectionCard title="Key Features & Ideas" icon={<Lightbulb className="w-6 h-6" />}>
        <div className="space-y-6">
          {(currentPlan.features || []).map((featureGroup, i) => (
            <div key={i} className={`transition-all ${isEditing ? 'p-4 border border-purple-200 rounded-lg bg-purple-50/30' : 'border-l-4 border-purple-500 pl-4 py-1'}`}>
              <div className="flex justify-between items-start mb-2">
                 <EditableText 
                   isEditing={isEditing}
                   value={featureGroup.category}
                   onChange={(val) => updateDeep(p => p.features[i].category = val)}
                   className="font-semibold text-gray-800"
                   inputClassName="font-semibold text-gray-800 mb-2"
                 />
                 {isEditing && (
                   <button 
                     onClick={() => updateDeep(p => p.features.splice(i, 1))} 
                     className="text-red-400 hover:text-red-600"
                   >
                     <Trash2 size={16} />
                   </button>
                 )}
              </div>
              
              <EditableList 
                isEditing={isEditing}
                items={featureGroup.items || []}
                onUpdate={(items) => updateDeep(p => p.features[i].items = items)}
                containerClass={isEditing ? "space-y-2" : "flex flex-wrap gap-2 mt-2"}
                renderItem={(item, j) => (
                  <span key={j} className="px-3 py-1 bg-purple-50 text-purple-700 text-xs rounded-full border border-purple-100">
                    {item}
                  </span>
                )}
              />
            </div>
          ))}
          {isEditing && (
             <button 
               onClick={() => updateDeep(p => p.features.push({ category: "New Feature Category", items: [] }))}
               className="w-full py-2 border-2 border-dashed border-purple-200 rounded-lg text-purple-400 hover:text-purple-600 hover:border-purple-300 hover:bg-purple-50 transition-all flex items-center justify-center gap-2 text-sm font-medium"
             >
               <Plus size={16} /> Add Feature Category
             </button>
          )}
        </div>
      </SectionCard>

      {/* Timeline */}
      <SectionCard title="Milestones & Timeline" icon={<CalendarClock className="w-6 h-6" />}>
        <div className={`space-y-6 py-2 ${!isEditing && "relative border-l-2 border-blue-200 ml-3"}`}>
          {(currentPlan.timeline?.milestones || []).map((milestone, i) => (
            <div key={i} className={`relative transition-all ${isEditing ? 'bg-gray-50 p-4 rounded-lg border border-gray-200' : 'ml-6'}`}>
              {!isEditing && (
                <span className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-blue-500 border-4 border-white shadow-sm"></span>
              )}
              
              {isEditing && (
                 <div className="absolute right-2 top-2">
                    <button onClick={() => updateDeep(p => p.timeline.milestones.splice(i, 1))} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                 </div>
              )}

              <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                <EditableText 
                  isEditing={isEditing}
                  value={milestone.name}
                  onChange={(val) => updateDeep(p => p.timeline.milestones[i].name = val)}
                  className="text-gray-900 font-medium"
                  inputClassName="font-medium flex-1"
                  placeholder="Milestone Name"
                />
                <EditableText 
                  isEditing={isEditing}
                  value={milestone.deadline || ""}
                  onChange={(val) => updateDeep(p => p.timeline.milestones[i].deadline = val)}
                  className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded w-fit"
                  inputClassName="text-xs font-mono w-32"
                  placeholder="Deadline"
                />
              </div>
              <EditableTextArea 
                isEditing={isEditing}
                value={milestone.description || ""}
                onChange={(val) => updateDeep(p => p.timeline.milestones[i].description = val)}
                className="text-sm text-gray-500 mt-1"
                rows={2}
              />
            </div>
          ))}
          {isEditing && (
             <button 
               onClick={() => updateDeep(p => p.timeline.milestones.push({ name: "New Milestone", deadline: "", description: "" }))}
               className="w-full py-2 border-2 border-dashed border-blue-200 rounded-lg text-blue-400 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 text-sm font-medium"
             >
               <Plus size={16} /> Add Milestone
             </button>
          )}
        </div>
      </SectionCard>

      {/* Action Plan / Tasks */}
      <SectionCard title="Action Plan" icon={<ListTodo className="w-6 h-6" />}>
        <div className="grid gap-4">
          {(currentPlan.tasks || []).map((phase, i) => (
            <div key={i} className="bg-gray-50 p-4 rounded-lg border border-gray-100 transition-all">
              <div className="flex justify-between items-start mb-2 border-b border-gray-200 pb-2">
                 <EditableText 
                   isEditing={isEditing}
                   value={phase.phase}
                   onChange={(val) => updateDeep(p => p.tasks[i].phase = val)}
                   className="font-bold text-gray-700"
                   inputClassName="font-bold text-gray-700"
                   placeholder="Phase Name"
                 />
                 {isEditing && (
                   <button onClick={() => updateDeep(p => p.tasks.splice(i, 1))} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                 )}
              </div>
              
              <EditableList 
                isEditing={isEditing}
                items={phase.items || []}
                onUpdate={(items) => updateDeep(p => p.tasks[i].items = items)}
                renderItem={(item, j) => (
                  <li key={j} className="text-sm text-gray-600 flex items-start gap-2 py-0.5">
                    <input type="checkbox" className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500" readOnly disabled />
                    <span>{item}</span>
                  </li>
                )}
              />
            </div>
          ))}
          {isEditing && (
             <button 
               onClick={() => updateDeep(p => p.tasks.push({ phase: "New Phase", items: [] }))}
               className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:text-gray-600 hover:border-gray-400 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 text-sm font-medium"
             >
               <Plus size={16} /> Add Task Phase
             </button>
          )}
        </div>
      </SectionCard>

      {/* Resources & Risks */}
      <div className="grid lg:grid-cols-2 gap-6">
        <SectionCard title="Resources" icon={<Wrench className="w-6 h-6" />}>
          <div className="space-y-4">
             <div className="text-sm">
               <span className="font-semibold text-gray-700 block mb-1">Tools:</span> 
               <EditableList 
                 isEditing={isEditing}
                 items={currentPlan.resources?.tools || []}
                 onUpdate={(items) => updateDeep(p => p.resources.tools = items)}
                 renderItem={(item, i) => <span key={i} className="inline-block bg-gray-100 px-2 py-1 rounded mr-1 mb-1 text-xs">{item}</span>}
               />
             </div>
             <div className="text-sm">
               <span className="font-semibold text-gray-700 block mb-1">People:</span> 
               <EditableList 
                 isEditing={isEditing}
                 items={currentPlan.resources?.people || []}
                 onUpdate={(items) => updateDeep(p => p.resources.people = items)}
                 renderItem={(item, i) => <span key={i} className="inline-block bg-gray-100 px-2 py-1 rounded mr-1 mb-1 text-xs">{item}</span>}
               />
             </div>
             <div className="text-sm">
               <span className="font-semibold text-gray-700 block mb-1">Materials:</span> 
               <EditableList 
                 isEditing={isEditing}
                 items={currentPlan.resources?.materials || []}
                 onUpdate={(items) => updateDeep(p => p.resources.materials = items)}
                 renderItem={(item, i) => <span key={i} className="inline-block bg-gray-100 px-2 py-1 rounded mr-1 mb-1 text-xs">{item}</span>}
               />
             </div>
          </div>
        </SectionCard>

        <SectionCard title="Risks & Mitigation" icon={<ShieldAlert className="w-6 h-6" />}>
          <div className="space-y-3">
            {(currentPlan.risks || []).map((risk, i) => (
              <div key={i} className={`rounded-md ${isEditing ? 'p-3 bg-red-50 border border-red-100' : 'bg-red-50 p-3 border border-red-100'}`}>
                {isEditing && (
                   <div className="flex justify-end mb-1">
                      <button onClick={() => updateDeep(p => p.risks.splice(i, 1))} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                   </div>
                )}
                <EditableText 
                  isEditing={isEditing}
                  value={risk.risk}
                  onChange={(val) => updateDeep(p => p.risks[i].risk = val)}
                  className="text-sm font-medium text-red-800"
                  inputClassName="text-sm font-medium text-red-800 mb-1"
                  placeholder="Risk Description"
                />
                <div className="flex gap-1 items-start mt-1">
                   <span className="text-xs font-bold text-red-600 mt-1">Mitigation:</span>
                   <EditableTextArea 
                      isEditing={isEditing}
                      value={risk.mitigation || ""}
                      onChange={(val) => updateDeep(p => p.risks[i].mitigation = val)}
                      className="text-xs text-red-600 flex-1"
                      rows={2}
                   />
                </div>
              </div>
            ))}
            {isEditing && (
               <button 
                 onClick={() => updateDeep(p => p.risks.push({ risk: "", mitigation: "" }))}
                 className="w-full py-2 border-2 border-dashed border-red-200 rounded-lg text-red-400 hover:text-red-600 hover:border-red-300 hover:bg-red-50 transition-all flex items-center justify-center gap-2 text-sm font-medium"
               >
                 <Plus size={16} /> Add Risk
               </button>
            )}
          </div>
        </SectionCard>
      </div>

      {/* Next Steps */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <ArrowRightCircle className="w-6 h-6" />
          <h3 className="text-xl font-bold">Immediate Next Steps</h3>
        </div>
        <EditableList 
          isEditing={isEditing}
          items={currentPlan.nextSteps || []}
          onUpdate={(items) => updateDeep(p => p.nextSteps = items)}
          containerClass="grid gap-3"
          renderItem={(item, i) => (
            <div key={i} className="flex items-center gap-3 bg-white/10 p-3 rounded-lg backdrop-blur-sm">
              <span className="flex items-center justify-center w-6 h-6 bg-white text-blue-600 font-bold rounded-full text-xs flex-shrink-0">{i + 1}</span>
              <span className="font-medium">{item}</span>
            </div>
          )}
        />
      </div>
    </div>
  );
};