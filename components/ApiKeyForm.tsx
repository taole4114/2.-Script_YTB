
import React, { useState, useEffect } from 'react';
import { ApiProvider, type ApiKey } from '../types';

interface ApiKeyFormProps {
  onKeySaved: () => void;
}

export const openRouterModels = [
  { id: 'anthropic/claude-3.5-sonnet', name: 'Anthropic: Claude 3.5 Sonnet' },
  { id: 'openai/gpt-4o', name: 'OpenAI: GPT-4o' },
  { id: 'google/gemini-1.5-pro', name: 'Google: Gemini 1.5 Pro' },
  { id: 'meta-llama/llama-3.1-70b-instruct', name: 'Meta: Llama 3.1 70B' },
  { id: 'deepseek/deepseek-v2-chat', name: 'DeepSeek: DeepSeek V2 Chat' },
  { id: 'mistralai/mistral-large', name: 'Mistral: Mistral Large' },
  { id: 'anthropic/claude-3-haiku', name: 'Anthropic: Claude 3 Haiku' },
  { id: 'google/gemini-1.5-flash', name: 'Google: Gemini 1.5 Flash' },
  { id: 'openai/gpt-4o-mini', name: 'OpenAI: GPT-4o-mini' },
];

// Fix: Export openAIModels to be used in other components.
export const openAIModels = [
  { id: 'gpt-4o', name: 'OpenAI: GPT-4o' },
  { id: 'gpt-4-turbo', name: 'OpenAI: GPT-4 Turbo (Tương tự 4.1)' },
  { id: 'gpt-4o-mini', name: 'OpenAI: GPT-4o mini' },
];


const ApiKeyForm: React.FC<ApiKeyFormProps> = ({ onKeySaved }) => {
  const [activeTab, setActiveTab] = useState<ApiProvider>(ApiProvider.GEMINI);
  const [geminiKeys, setGeminiKeys] = useState('');
  const [openAIKeys, setOpenAIKeys] = useState('');
  const [openRouterKeys, setOpenRouterKeys] = useState('');
  const [openRouterModel, setOpenRouterModel] = useState(openRouterModels[0].id);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const encodedKeys = localStorage.getItem('llm-api-keys-list');
    if (encodedKeys) {
      try {
        const allKeys: ApiKey[] = JSON.parse(atob(encodedKeys));
        setGeminiKeys(allKeys.filter(k => k.provider === ApiProvider.GEMINI).map(k => k.key).join('\n'));
        setOpenAIKeys(allKeys.filter(k => k.provider === ApiProvider.OPENAI).map(k => k.key).join('\n'));
        setOpenRouterKeys(allKeys.filter(k => k.provider === ApiProvider.OPENROUTER).map(k => k.key).join('\n'));
        const lastOpenRouterKey = allKeys.find(k => k.provider === ApiProvider.OPENROUTER);
        if (lastOpenRouterKey && lastOpenRouterKey.model) {
          if (openRouterModels.some(m => m.id === lastOpenRouterKey.model)) {
            setOpenRouterModel(lastOpenRouterKey.model);
          }
        }
      } catch (e) {
        console.error("Failed to parse existing API keys.", e);
        localStorage.removeItem('llm-api-keys-list');
      }
    }
  }, []);

  const handleSaveClick = () => {
    setError(null);
    const allKeys: ApiKey[] = [];

    geminiKeys.split('\n').map(k => k.trim()).filter(Boolean).forEach(key => {
        allKeys.push({ key, provider: ApiProvider.GEMINI, lastUsed: 0 });
    });
    
    openAIKeys.split('\n').map(k => k.trim()).filter(Boolean).forEach(key => {
        allKeys.push({ key, provider: ApiProvider.OPENAI, model: 'gpt-4o', lastUsed: 0 });
    });

    const routerKeysList = openRouterKeys.split('\n').map(k => k.trim()).filter(Boolean);
    if (routerKeysList.length > 0 && !openRouterModel.trim()) {
      setError('Vui lòng nhập tên model cho OpenRouter.');
      setActiveTab(ApiProvider.OPENROUTER);
      return;
    }
    routerKeysList.forEach(key => {
        allKeys.push({ key, provider: ApiProvider.OPENROUTER, model: openRouterModel.trim(), lastUsed: 0 });
    });

    if (allKeys.length === 0) {
      setError('Vui lòng nhập ít nhất một API Key hợp lệ.');
      return;
    }
    
    const encodedKeys = btoa(JSON.stringify(allKeys));
    localStorage.setItem('llm-api-keys-list', encodedKeys);
    onKeySaved();
  };
  
  const TabButton: React.FC<{provider: ApiProvider, children: React.ReactNode}> = ({ provider, children }) => (
    <button
      onClick={() => setActiveTab(provider)}
      className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-200 w-full ${
        activeTab === provider
          ? 'bg-gray-700 text-cyan-300 border-b-2 border-cyan-400'
          : 'bg-gray-800 text-gray-400 hover:bg-gray-700/50'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex items-center justify-center font-sans p-4">
      <div className="w-full max-w-lg bg-gray-800/50 p-8 rounded-xl border border-gray-700 shadow-2xl shadow-cyan-500/10">
        <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 7h2a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V9a2 2 0 012-2h2m4-4h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5a2 2 0 012-2zM9 9a3 3 0 100-6 3 3 0 000 6z" />
            </svg>
            <h1 className="text-2xl font-bold text-white mt-4">Thiết lập API Keys</h1>
            <p className="text-gray-400 mt-2">Nhập API Keys của bạn từ các nhà cung cấp khác nhau.</p>
        </div>

        <div className="mt-8">
            <div className="grid grid-cols-3 border-b border-gray-700">
                <TabButton provider={ApiProvider.GEMINI}>Gemini</TabButton>
                <TabButton provider={ApiProvider.OPENAI}>OpenAI</TabButton>
                <TabButton provider={ApiProvider.OPENROUTER}>OpenRouter</TabButton>
            </div>
            <div className="bg-gray-800 p-4 rounded-b-lg">
                {activeTab === ApiProvider.GEMINI && (
                    <div className="space-y-4">
                        <label htmlFor="gemini-keys" className="block text-sm font-medium text-cyan-300">Google Gemini Keys (mỗi key một dòng)</label>
                        <textarea id="gemini-keys" rows={4} value={geminiKeys} onChange={(e) => setGeminiKeys(e.target.value)} placeholder="Dán các API Key Gemini của bạn tại đây" className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-sm" />
                        <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-400 hover:underline">Lấy Gemini API Key</a>
                    </div>
                )}
                {activeTab === ApiProvider.OPENAI && (
                    <div className="space-y-4">
                        <label htmlFor="openai-keys" className="block text-sm font-medium text-cyan-300">OpenAI Keys (mỗi key một dòng)</label>
                        <textarea id="openai-keys" rows={4} value={openAIKeys} onChange={(e) => setOpenAIKeys(e.target.value)} placeholder="Dán các API Key OpenAI của bạn tại đây" className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-sm" />
                        <p className="text-xs text-gray-500">Model mặc định: gpt-4o</p>
                        <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-400 hover:underline">Lấy OpenAI API Key</a>
                    </div>
                )}
                {activeTab === ApiProvider.OPENROUTER && (
                    <div className="space-y-4">
                         <label htmlFor="openrouter-keys" className="block text-sm font-medium text-cyan-300">OpenRouter Keys (mỗi key một dòng)</label>
                        <textarea id="openrouter-keys" rows={3} value={openRouterKeys} onChange={(e) => setOpenRouterKeys(e.target.value)} placeholder="Dán các API Key OpenRouter của bạn tại đây" className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-sm" />
                         <label htmlFor="openrouter-model" className="block text-sm font-medium text-cyan-300">Chọn Model OpenRouter</label>
                        <select 
                          id="openrouter-model" 
                          value={openRouterModel} 
                          onChange={(e) => setOpenRouterModel(e.target.value)} 
                          className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-sm"
                        >
                          {openRouterModels.map(model => (
                            <option key={model.id} value={model.id}>{model.name}</option>
                          ))}
                        </select>
                        <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-400 hover:underline">Lấy OpenRouter API Key</a>
                    </div>
                )}
            </div>
        </div>

        {error && <p className="mt-4 text-sm text-red-400 text-center">{error}</p>}
        <p className="text-xs text-gray-500 text-center mt-4">
            Các API key của bạn sẽ được lưu trữ an toàn trong trình duyệt của bạn và sẽ không được chia sẻ.
        </p>
        <div className="mt-6">
          <button onClick={handleSaveClick} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:from-cyan-600 hover:to-blue-700 transition duration-300">
            Lưu và Bắt đầu
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyForm;