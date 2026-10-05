import React, { useState } from 'react';
import { X, ShieldCheck, FileText, AlertCircle, Mail, Send, CheckCircle2 } from 'lucide-react';

export type LegalModalType = 'privacy' | 'terms' | 'disclaimer' | 'contact' | null;

interface LegalModalsProps {
  activeModal: LegalModalType;
  onClose: () => void;
  onOpenModal: (type: LegalModalType) => void;
}

export const LegalModals: React.FC<LegalModalsProps> = ({
  activeModal,
  onClose,
  onOpenModal,
}) => {
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  if (!activeModal) return null;

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSent(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/60">
          <div className="flex items-center gap-2 overflow-x-auto text-sm font-medium">
            <button
              onClick={() => { onOpenModal('privacy'); setIsSent(false); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeModal === 'privacy'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              プライバシーポリシー
            </button>
            <button
              onClick={() => { onOpenModal('terms'); setIsSent(false); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeModal === 'terms'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <FileText className="w-4 h-4" />
              利用規約
            </button>
            <button
              onClick={() => { onOpenModal('disclaimer'); setIsSent(false); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeModal === 'disclaimer'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <AlertCircle className="w-4 h-4" />
              免責事項
            </button>
            <button
              onClick={() => { onOpenModal('contact'); setIsSent(false); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeModal === 'contact'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Mail className="w-4 h-4" />
              お問い合わせ
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-2"
            title="閉じる"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-slate-300 text-sm leading-relaxed">
          {activeModal === 'privacy' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white mb-2">プライバシーポリシー</h2>
              
              <section className="space-y-2">
                <h3 className="font-semibold text-slate-100 text-base">1. 個人情報の利用目的</h3>
                <p>
                  当サイト「NicoFollow」（以下、「当サイト」といいます）では、お問い合わせなどの際に、お名前（ハンドルネーム）やメールアドレス等の個人情報をご登録いただく場合がございます。これらの個人情報は、質問に対する回答や必要な情報を電子メールなどでご連絡する場合にのみ利用させていただくものであり、目的以外では利用いたしません。
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-semibold text-slate-100 text-base">2. 広告の配信について（Google AdSense）</h3>
                <p>
                  当サイトでは、第三者配信の広告サービス「Google AdSense（グーグルアドセンス）」を利用しています。
                </p>
                <p>
                  広告配信事業者は、利用者の興味に応じた広告を表示するためにCookie（クッキー）を使用することがあります。Cookieを使用することで当サイトはお客様のコンピュータを識別できるようになりますが、お客様個人を特定できるものではありません。
                </p>
                <p>
                  Cookieを無効にする設定およびGoogleアドセンスに関する詳細は「
                  <a
                    href="https://policies.google.com/technologies/ads?hl=ja"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:underline"
                  >
                    広告 – ポリシーと規約 – Google
                  </a>
                  」をご覧ください。
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-semibold text-slate-100 text-base">3. アクセス解析ツールについて</h3>
                <p>
                  当サイトでは、アクセス解析ツールを利用することがあります。この解析ツールはトラフィックデータの収集のためにCookieを使用しています。トラフィックデータは匿名で収集されており、個人を特定するものではありません。
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-semibold text-slate-100 text-base">4. プライバシーポリシーの変更</h3>
                <p>
                  当サイトは、法令の制定、改正等により、本ポリシーを予告なく変更する場合があります。本ポリシーの変更は、当サイトに掲載された時点で有効になるものとします。
                </p>
              </section>
            </div>
          )}

          {activeModal === 'terms' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white mb-2">利用規約</h2>

              <section className="space-y-2">
                <h3 className="font-semibold text-slate-100 text-base">第1条（適用）</h3>
                <p>
                  本利用規約は、当サイト「NicoFollow」（以下、「当サイト」）が提供するすべてのサービス（以下、「本サービス」）の利用条件を定めるものです。利用者の皆様は、本規約に同意の上で本サービスをご利用ください。
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-semibold text-slate-100 text-base">第2条（サービスの目的と制限）</h3>
                <p>
                  当サイトは、ニコニコ動画の公開APIを通じて自身および対象アカウントのフォロー・フォロワー情報を確認・整理するための分析支援ツールです。
                </p>
                <p>
                  公式サーバーへの過剰な負荷を防止するため、1日あたりのスキャン回数制限（最大3回まで）および再取得インターバル（60分）を設けています。制限を回避・改ざんする行為を固く禁止します。
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-semibold text-slate-100 text-base">第3条（禁止事項）</h3>
                <ul className="list-disc list-inside space-y-1 text-slate-300 pl-2">
                  <li>本サービスの運営を妨害する行為、過度なリクエスト送信行為（スクレイピング・DDoS等）</li>
                  <li>他の利用者または第三者に不利益、損害を与える行為</li>
                  <li>ニコニコ動画（株式会社ドワンゴ）の利用規約に反する行為</li>
                  <li>その他、当サイト管理者が不適切と判断する行為</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="font-semibold text-slate-100 text-base">第4条（サービスの停止・変更）</h3>
                <p>
                  当サイトは、利用者に事前通知することなく、本サービスの提供を中断、変更、または終了することができます。
                </p>
              </section>
            </div>
          )}

          {activeModal === 'disclaimer' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white mb-2">免責事項</h2>

              <section className="space-y-2">
                <h3 className="font-semibold text-slate-100 text-base">1. 非公式サービスに関する明記</h3>
                <p>
                  当サイト「NicoFollow」は、個人ファンによって開発・運営されている非公式のWebツールです。
                  <strong>株式会社ドワンゴ様、ニコニコ動画、およびその関連会社様とは一切関係ありません。</strong>
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-semibold text-slate-100 text-base">2. 情報の正確性および損害の補償</h3>
                <p>
                  当サイトで提供するフォロー・フォロワー状況等の解析情報については、正確性や完全性を保証するものではありません。
                </p>
                <p>
                  当サイトを利用したこと、または利用できなかったことによって生じたいかなる損害・不都合（アカウントの制限、誤操作によるフォロー解除など）についても、当サイト管理者は一切の責任を負いかねます。ご自身の責任においてご利用ください。
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-semibold text-slate-100 text-base">3. 著作権・知的財産権</h3>
                <p>
                  当サイトに掲載されているニコニコユーザー名、アイコン画像等の著作権・肖像権は各権利所有者に帰属します。権利の侵害を目的とするものではありません。
                </p>
              </section>
            </div>
          )}

          {activeModal === 'contact' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white mb-2">お問い合わせ</h2>
              <p className="text-slate-300">
                当サイトに関するご意見・不具合のご報告・ご質問は下記フォームよりお送りください。
              </p>

              {isSent ? (
                <div className="p-6 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-center space-y-2 animate-in fade-in">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <h4 className="text-base font-bold text-emerald-300">お問い合わせを送信しました</h4>
                  <p className="text-xs text-slate-300">
                    メッセージを受け付けました。貴重なご意見・ご報告ありがとうございます。
                  </p>
                  <button
                    onClick={() => setIsSent(false)}
                    className="mt-3 px-4 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg"
                  >
                    別のメッセージを送る
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4 mt-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      お名前 / ハンドルネーム <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="ニコニコ太郎"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      メールアドレス <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="your-email@example.com"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      お問い合わせ内容 <span className="text-rose-400">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="不具合の状況やご要望などをご記入ください"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 resize-none"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-xl transition-colors shadow-lg shadow-cyan-950/40"
                    >
                      <Send className="w-4 h-4" />
                      送信する
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="border-t border-slate-800 px-6 py-3 bg-slate-950/80 flex items-center justify-between text-xs text-slate-500">
          <span>NicoFollow 運営事務局</span>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
