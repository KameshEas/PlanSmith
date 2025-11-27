import React, { useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { Send, Bot, User, RefreshCw, Trash2 } from 'lucide-react';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isSending: boolean;
  onRefreshPlan: () => void;
  isGeneratingPlan: boolean;
  onClearChat: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  onSendMessage, 
  isSending,
  onRefreshPlan,
  isGeneratingPlan,
  onClearChat
}) => {
  const [input, setInput] = React.useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 shadow-xl z-10 relative">
      {/* Header */}
      <div className="p-4 pr-16 md:pr-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 flex-shrink-0">
        <div>
          <h2 className="font-bold text-gray-800">PlanSmith AI</h2>
          <p className="text-xs text-gray-500">Project Planning Assistant</p>
        </div>
        <div className="flex gap-1">
          <button 
            onClick={onClearChat}
            className="p-2 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
            title="New Project (Reset Chat)"
          >
            <Trash2 size={18} />
          </button>
          <button 
            onClick={onRefreshPlan}
            disabled={isGeneratingPlan || isSending || messages.length < 2}
            className={`p-2 rounded-full transition-all ${
              isGeneratingPlan 
                ? 'bg-blue-100 text-blue-400 cursor-not-allowed' 
                : 'hover:bg-blue-100 text-blue-600'
            }`}
            title="Force update project plan"
          >
            <RefreshCw size={18} className={isGeneratingPlan ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-10">
            <Bot className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p className="text-sm">Say "Hello" to start planning your project.</p>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-blue-100 text-blue-600'
            }`}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-gray-100 text-gray-800 rounded-tl-none border border-gray-200'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        
        {isSending && (
          <div className="flex gap-3 animate-pulse">
             <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
               <Bot size={16} className="text-blue-600" />
             </div>
             <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-none border border-gray-200 flex items-center gap-1">
               <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
               <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
               <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100 flex-shrink-0">
        <form onSubmit={handleSubmit} className="flex gap-2 items-end">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your project idea..."
            className="flex-1 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-3 outline-none transition-all"
            disabled={isSending}
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isSending}
            className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};