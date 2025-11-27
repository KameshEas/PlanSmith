import React, { useState, useEffect, useCallback } from 'react';
import { ChatInterface } from './components/ChatInterface';
import { PlanDisplay } from './components/PlanDisplay';
import { ChatMessage, ProjectPlan } from './types';
import { sendMessageToGemini, generateStructuredPlan, initializeChat } from './services/geminiService';
import { Menu, X } from 'lucide-react';

const STORAGE_KEY_MESSAGES = 'plansmith_chat_history';
const STORAGE_KEY_PLAN = 'plansmith_project_plan';

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [projectPlan, setProjectPlan] = useState<ProjectPlan | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [showChatMobile, setShowChatMobile] = useState(true);

  // Initialize chat and load from local storage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem(STORAGE_KEY_MESSAGES);
    const savedPlan = localStorage.getItem(STORAGE_KEY_PLAN);

    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        // Rehydrate Date objects
        const hydratedMessages = parsedMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(hydratedMessages);
        // Initialize chat with restored history
        initializeChat(hydratedMessages);
      } catch (e) {
        console.error("Failed to parse saved messages", e);
        initDefaultChat();
      }
    } else {
      initDefaultChat();
    }

    if (savedPlan) {
      try {
        const parsedPlan = JSON.parse(savedPlan);
        setProjectPlan(parsedPlan);
      } catch (e) {
        console.error("Failed to parse saved plan", e);
      }
    }
  }, []);

  const initDefaultChat = () => {
    initializeChat();
    setMessages([{
      role: 'model',
      text: "Hello! I'm PlanSmith. I'm here to help you build a comprehensive project plan. What kind of project do you have in mind? Give me a brief overview, and we'll start building it together.",
      timestamp: new Date()
    }]);
  };

  // Persist messages on change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages));
    }
  }, [messages]);

  // Persist plan on change
  useEffect(() => {
    if (projectPlan) {
      localStorage.setItem(STORAGE_KEY_PLAN, JSON.stringify(projectPlan));
    }
  }, [projectPlan]);

  const handleClearSession = () => {
    if (window.confirm("Are you sure you want to start a new project? This will clear your current plan and chat history.")) {
      localStorage.removeItem(STORAGE_KEY_MESSAGES);
      localStorage.removeItem(STORAGE_KEY_PLAN);
      setProjectPlan(null);
      initDefaultChat();
    }
  };

  const updatePlanFromHistory = useCallback(async (currentHistory: ChatMessage[]) => {
    // Only generate plan if we have enough context (e.g., > 2 messages)
    if (currentHistory.length < 3) return;

    setIsGeneratingPlan(true);
    const plan = await generateStructuredPlan(currentHistory);
    if (plan) {
      setProjectPlan(plan);
    }
    setIsGeneratingPlan(false);
  }, []);

  const handleSendMessage = async (text: string) => {
    const newUserMsg: ChatMessage = { role: 'user', text, timestamp: new Date() };
    const updatedHistory = [...messages, newUserMsg];
    setMessages(updatedHistory);
    setIsSending(true);

    // Get AI response
    const aiResponseText = await sendMessageToGemini(text);
    
    const newAiMsg: ChatMessage = { role: 'model', text: aiResponseText, timestamp: new Date() };
    const finalHistory = [...updatedHistory, newAiMsg];
    setMessages(finalHistory);
    setIsSending(false);

    // Trigger plan update in background
    updatePlanFromHistory(finalHistory);
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden relative">
      
      {/* Mobile Toggle Button */}
      <button 
        className="md:hidden fixed top-4 right-4 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        onClick={() => setShowChatMobile(!showChatMobile)}
        aria-label="Toggle Menu"
      >
        {showChatMobile ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Left Panel: Chat (Sidebar) */}
      <div className={`
        fixed md:relative inset-0 z-40 md:z-auto w-full md:w-[400px] lg:w-[450px] transition-transform duration-300 transform
        ${showChatMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <ChatInterface 
          messages={messages} 
          onSendMessage={handleSendMessage}
          isSending={isSending}
          onRefreshPlan={() => updatePlanFromHistory(messages)}
          isGeneratingPlan={isGeneratingPlan}
          onClearChat={handleClearSession}
        />
      </div>

      {/* Right Panel: Plan Display */}
      <div className="flex-1 h-full overflow-y-auto p-4 md:p-8 w-full">
        <div className="max-w-5xl mx-auto">
          <PlanDisplay 
            plan={projectPlan} 
            isLoading={isGeneratingPlan && !projectPlan} 
            onPlanUpdate={setProjectPlan}
          />
        </div>
      </div>
      
    </div>
  );
};

export default App;