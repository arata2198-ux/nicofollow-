import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="text-lg font-bold tracking-tight text-white flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <span className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black shadow-md shadow-cyan-500/20 text-xs">
              N
            </span>
            <span>NicoFollow</span>
          </a>
          <span className="text-xs text-slate-500 font-mono border-l border-slate-800 pl-3">
            ニコニコ相互フォローチェッカー
          </span>
        </div>
      </div>
    </header>
  );
};
