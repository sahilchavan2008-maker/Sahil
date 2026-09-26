import React from 'react';
import { useSearchParams } from 'react-router-dom';
import AIGeneratorModal from '../components/AIGeneratorModal';

export default function GeneratorPage() {
  const [searchParams] = useSearchParams();
  const theme = searchParams.get('theme');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {theme && (
        <div className="mb-6 p-4 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-300 text-sm flex items-center justify-between">
          <span>Targeting today's theme: <strong className="text-white">{theme}</strong></span>
          <span className="text-xs text-teal-400">Gemini will tailor ingredients to this theme</span>
        </div>
      )}
      <AIGeneratorModal isOpen={true} />
    </div>
  );
}
