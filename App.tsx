
import React, { useState, useEffect } from 'react';
import type { OutlineSection, ScriptPart } from './types';
import { ApiProvider } from './types';
import { generateOutline, parseOutline, generateScriptPart } from './services/geminiService';
import Header from './components/Header';
import ScriptForm from './components/ScriptForm';
import ScriptDisplay from './components/ScriptDisplay';
import Loader from './components/Loader';
// Fix: Import openAIModels which is now exported from ApiKeyForm.
import ApiKeyForm, { openRouterModels, openAIModels } from './components/ApiKeyForm';

const App: React.FC = () => {
  const [hasApiKey, setHasApiKey] = useState<boolean>(() => !!localStorage.getItem('llm-api-keys-list'));
  const [title, setTitle] = useState<string>('');
  const [outline, setOutline] = useState<OutlineSection[] | null>(null);
  const [scriptParts, setScriptParts] = useState<ScriptPart[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGeneratingPart, setIsGeneratingPart] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for outline generation
  const [apiProvider, setApiProvider] = useState<ApiProvider>(ApiProvider.GEMINI);
  const [openRouterModel, setOpenRouterModel] = useState<string>(openRouterModels[0].id);

  // State for script part generation
  const [scriptApiProvider, setScriptApiProvider] = useState<ApiProvider>(apiProvider);
  const [scriptOpenRouterModel, setScriptOpenRouterModel] = useState<string>(openRouterModel);
  const [scriptOpenAIModel, setScriptOpenAIModel] = useState<string>(openAIModels[0].id);


  // Sync script generation provider with outline provider when an outline is created
  useEffect(() => {
    if (outline) {
      setScriptApiProvider(apiProvider);
      setScriptOpenRouterModel(openRouterModel);
      // We don't need to set a specific openAI model here as it has its own state
    }
  }, [outline, apiProvider, openRouterModel]);

  const handleApiKeySaved = () => {
    setHasApiKey(true);
  };

  const handleGoToSettings = () => {
    setHasApiKey(false);
  };

  const handleGenerateOutline = async (newTitle: string) => {
    if (!newTitle.trim()) {
      setError('Vui lòng nhập tiêu đề cho kịch bản của bạn.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setOutline(null);
    setScriptParts([]);
    setTitle(newTitle);

    try {
      const modelToUse = apiProvider === ApiProvider.OPENROUTER ? openRouterModel : undefined;
      const outlineText = await generateOutline(newTitle, apiProvider, modelToUse);
      const parsedOutline = parseOutline(outlineText);
      if (parsedOutline.length === 0) {
        throw new Error("AI không thể tạo dàn ý hợp lệ. Vui lòng thử một chủ đề khác hoặc thử lại.");
      }
      setOutline(parsedOutline);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định khi tạo dàn ý.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateOutline = async () => {
    await handleGenerateOutline(title);
  }

  const handleGenerateNextPart = async () => {
    if (!outline) return;

    setIsGeneratingPart(true);
    setError(null);
    try {
      const nextPartIndex = scriptParts.length;
      let modelToUse: string | undefined;
      if (scriptApiProvider === ApiProvider.OPENROUTER) {
        modelToUse = scriptOpenRouterModel;
      } else if (scriptApiProvider === ApiProvider.OPENAI) {
        modelToUse = scriptOpenAIModel;
      }

      const partContent = await generateScriptPart(title, outline, scriptParts, nextPartIndex, scriptApiProvider, modelToUse);
      const newPart: ScriptPart = {
        content: partContent,
      };
      setScriptParts(prevParts => [...prevParts, newPart]);
    } catch (err) {
      setError(err instanceof Error ? `Lỗi tạo phần ${scriptParts.length + 1}: ${err.message}` : 'Đã xảy ra lỗi không xác định khi tạo phần kịch bản.');
      console.error(err);
    } finally {
      setIsGeneratingPart(false);
    }
  };
  
  const handleDownloadScript = () => {
    const fullScript = scriptParts.map(part => part.content).join('\n\n---\n\n');
    const blob = new Blob([fullScript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/ /g, '_')}_script.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setTitle('');
    setOutline(null);
    setScriptParts([]);
    setError(null);
    setIsLoading(false);
    setIsGeneratingPart(false);
  };
  
  const isComplete = outline ? scriptParts.length === outline.length : false;

  if (!hasApiKey) {
    return <ApiKeyForm onKeySaved={handleApiKeySaved} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <Header onGoToSettings={handleGoToSettings} />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {!outline && !isLoading && (
            <>
              <p className="text-center text-lg text-gray-400 mb-8">
                Nhập chủ đề cho phim tài liệu của bạn. AI sẽ tạo một dàn ý chi tiết, sau đó bạn có thể tạo kịch bản hoàn chỉnh từng bước một.
              </p>
               <div className="mb-6 bg-gray-800/30 p-4 rounded-lg border border-gray-700 space-y-4">
                  <div>
                    <label htmlFor="provider-select" className="block text-sm font-medium text-cyan-300 mb-2">Chọn nhà cung cấp AI</label>
                    <select
                        id="provider-select"
                        value={apiProvider}
                        onChange={(e) => setApiProvider(e.target.value as ApiProvider)}
                        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-200"
                    >
                        <option value={ApiProvider.GEMINI}>Google Gemini</option>
                        <option value={ApiProvider.OPENAI}>OpenAI</option>
                        <option value={ApiProvider.OPENROUTER}>OpenRouter</option>
                    </select>
                  </div>
                  {apiProvider === ApiProvider.OPENROUTER && (
                    <div style={{ transition: 'opacity 0.5s ease-in-out', opacity: 1 }}>
                        <label htmlFor="openrouter-model-select" className="block text-sm font-medium text-cyan-300 mb-2">Chọn Model OpenRouter</label>
                        <select
                          id="openrouter-model-select"
                          value={openRouterModel}
                          onChange={(e) => setOpenRouterModel(e.target.value)}
                          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-200"
                        >
                           {openRouterModels.map(model => (
                            <option key={model.id} value={model.id}>{model.name}</option>
                          ))}
                        </select>
                    </div>
                  )}
              </div>
              <ScriptForm onSubmit={handleGenerateOutline} isLoading={isLoading} />
            </>
          )}

          {error && (
            <div className="mt-8 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg" role="alert">
              <strong className="font-bold">Lỗi! </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {isLoading && <Loader />}

          {outline && !isLoading && (
            <ScriptDisplay
              title={title}
              outline={outline}
              scriptParts={scriptParts}
              onReset={handleReset}
              onDownload={handleDownloadScript}
              onGenerateNext={handleGenerateNextPart}
              onRegenerateOutline={handleRegenerateOutline}
              isGeneratingPart={isGeneratingPart}
              isComplete={isComplete}
              scriptApiProvider={scriptApiProvider}
              setScriptApiProvider={setScriptApiProvider}
              scriptOpenRouterModel={scriptOpenRouterModel}
              setScriptOpenRouterModel={setScriptOpenRouterModel}
              scriptOpenAIModel={scriptOpenAIModel}
              setScriptOpenAIModel={setScriptOpenAIModel}
            />
          )}
        </div>
      </main>
      <footer className="text-center py-4 text-gray-600 text-sm">
        <p>Được cung cấp bởi Gemini, OpenAI, and OpenRouter</p>
      </footer>
    </div>
  );
};

export default App;