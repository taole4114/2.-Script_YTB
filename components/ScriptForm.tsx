import React, { useState } from 'react';

interface ScriptFormProps {
  onSubmit: (title: string) => void;
  isLoading: boolean;
}

const ScriptForm: React.FC<ScriptFormProps> = ({ onSubmit, isLoading }) => {
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(title);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800/50 p-6 rounded-xl border border-gray-700">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-cyan-300 mb-2">Chủ đề phim tài liệu</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ví dụ: Sự biến mất của thuộc địa Roanoke"
          required
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200"
        />
      </div>

      <div className="pt-4 border-t border-gray-700">
        <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:from-cyan-600 hover:to-blue-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
          {isLoading ? 'Đang tạo dàn ý...' : 'Tạo dàn ý'}
        </button>
      </div>
    </form>
  );
};

export default ScriptForm;