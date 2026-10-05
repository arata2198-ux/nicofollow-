import React from 'react';
import { LegalModalType } from './LegalModals';
import { ShieldCheck, FileText, AlertCircle, Mail, ExternalLink } from 'lucide-react';

interface FooterProps {
  onOpenModal: (type: LegalModalType) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenModal }) => {
  return (
    <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-8 text-xs text-slate-500">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Navigation / Policy Links */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-medium">
          <button
            onClick={() => onOpenModal('privacy')}
            className="flex items-center gap-1.5 text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            プライバシーポリシー
          </button>
          <span className="text-slate-800">|</span>
          <button
            onClick={() => onOpenModal('terms')}
            className="flex items-center gap-1.5 text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            利用規約
          </button>
          <span className="text-slate-800">|</span>
          <button
            onClick={() => onOpenModal('disclaimer')}
            className="flex items-center gap-1.5 text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            免責事項
          </button>
          <span className="text-slate-800">|</span>
          <button
            onClick={() => onOpenModal('contact')}
            className="flex items-center gap-1.5 text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <Mail className="w-3.5 h-3.5" />
            お問い合わせ
          </button>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="text-center space-y-2 max-w-2xl mx-auto text-[11px] text-slate-600 leading-relaxed">
          <p>
            ※当サイト（NicoFollow）は個人によって運営される非公式ファンツールであり、株式会社ドワンゴ様およびニコニコ動画公式とは一切関係ありません。
          </p>
          <p className="font-sans text-slate-500">
            © 2026 NicoFollow (nicofollow.com). All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
