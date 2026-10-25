import React from 'react';
import {
  Users,
  UserCheck,
  UserX,
  ShieldCheck,
  Download,
  Clock,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Info,
} from 'lucide-react';

export const SiteGuideContent: React.FC = () => {
  return (
    <div className="space-y-12 pt-6 text-slate-300">
      {/* 1. What is NicoFollow? Hero Section */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Webブラウザで即座に使える完全無料ツール</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          NicoFollow（ニコニコ相互フォローチェッカー）とは？
        </h2>
        <p className="text-sm sm:text-base leading-relaxed text-slate-300">
          NicoFollowは、ニコニコ動画の公開APIを活用して、ご自身のアカウントが「誰をフォローしていて、誰にフォローバックされているのか」を瞬時に全件照合・可視化できる無料のWeb解析ユーティリティです。
        </p>
        <p className="text-sm leading-relaxed text-slate-400">
          ニコニコ公式のマイページでは、フォロー中やフォロワーが一覧で並んでいるだけで「自分だけが一方的にフォローしている相手（片思い）」や「相互フォローだったのに外されてしまった相手（リムられ）」を特定するのは困難でした。本ツールは、アカウントのログインやパスワード入力を一切必要とせず、誰でも安全・手軽にフォロー関係をきれいに整理・分析できます。
        </p>
      </section>

      {/* 2. Key Features (6 Cards) */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg sm:text-xl font-bold text-white">主な特徴と充実の機能</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-2.5">
            <div className="w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <UserX className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">片思い・片思われの瞬時判定</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              フォロー中とフォロワーのデータを照合し、「フォローバックされていない相手」と「相手だけがフォローしてくれている熱心なファン」を自動で別々のタブに仕分けします。
            </p>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-2.5">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">リムられ（解除差分）検知</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              前回のスキャン結果と最新データを自動比較。相互フォローだったのに解除されてしまったアカウントや、新しく増えたフォロワーを自動検出してアラート通知します。
            </p>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-2.5">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">「さらに表示」全件自動巡回</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              数百人〜数千人のフォロワーがいる人気アカウントでも問題ありません。サーバーがページ送りを自動で巡回取得し、1件も漏らさずに全件を精密にスキャンします。
            </p>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">ホワイトリスト保護機能</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              片思いであっても「ずっと応援したい大好きなクリエイター」や「公式チャンネル」をワンクリックで保護登録。フォロー整理の対象から安全に除外できます。
            </p>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Download className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">CSVデータ一括エクスポート</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              抽出した片思いリストや相互フォロー一覧を、ExcelやGoogleスプレッドシートで開けるCSVファイルとしてワンクリックでダウンロード保存できます。
            </p>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-2.5">
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">ログイン不要・完全安全</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              ニコニコのログインパスワードやAPIトークンは一切要求しません。公開情報のみを参照するため、アカウントの乗っ取りや流出のリスクはゼロです。
            </p>
          </div>
        </div>
      </section>

      {/* 3. How to Use (Step by Step Guide) */}
      <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg sm:text-xl font-bold text-white">ご利用手順（簡単3ステップ）</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="relative p-5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <span className="text-xs font-mono font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800">
              STEP 1
            </span>
            <h4 className="text-sm font-bold text-white">URLまたはIDを入力</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              ニコニコ動画のマイページURL（例: <code className="text-slate-300">https://www.nicovideo.jp/user/12345678</code>）またはユーザーIDの数字を入力します。
            </p>
          </div>

          <div className="relative p-5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <span className="text-xs font-mono font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800">
              STEP 2
            </span>
            <h4 className="text-sm font-bold text-white">全件スキャン開始</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              「全件スキャン開始」ボタンをクリックします。サーバーがフォロー一覧とフォロワー一覧を自動取得し、進捗バーでリアルタイムに進捗を表示します。
            </p>
          </div>

          <div className="relative p-5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <span className="text-xs font-mono font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800">
              STEP 3
            </span>
            <h4 className="text-sm font-bold text-white">結果の確認と整理</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              「片思い」「相互」「リムられ」などのタブを切り替えて結果を確認。各ユーザーのページへ直接ジャンプしたり、CSVで一括保存できます。
            </p>
          </div>
        </div>
      </section>

      {/* 4. Column: NicoNico Follow Etiquette & Tips */}
      <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2">
          <Info className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg sm:text-xl font-bold text-white">
            ニコニコ動画におけるフォロー整理・相互フォローのポイント
          </h3>
        </div>

        <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>
            ニコニコ動画では、一般会員は最大600人、プレミアム会員は最大1,000人程度までフォローできる上限が設けられています。長年アカウントを利用していると、「過去に相互フォローしたものの、すでに動画投稿や活動を休止してしまったアカウント」や「気付かないうちにフォローを外されてしまったアカウント」が蓄積し、新しいお気に入りのクリエイターをフォローできなくなるケースがあります。
          </p>
          <p>
            定期的にNicoFollowでフォロー状況をスキャンすることで、現在も互いに繋がり合っている大切なフォロワーを確認しつつ、フォロー上限枠を有効に保つことができます。また、当ツールのホワイトリスト機能を使えば、フォローバックされていない有名投稿者や憧れの配信者であっても「誤ってフォロー解除してしまう」心配を防ぐことができます。
          </p>
        </div>
      </section>

      {/* 5. FAQ Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg sm:text-xl font-bold text-white">よくあるご質問（FAQ）</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="text-cyan-400 font-mono">Q.</span>
              ニコニコのアカウントにログインする必要はありますか？
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              いいえ、ログインやパスワードの入力は一切不要です。当ツールはニコニコ動画が公開している公式APIから公開情報のみを取得するため、セキュリティ上のリスクはありません。
            </p>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="text-cyan-400 font-mono">Q.</span>
              相手にスキャンしたことが通知されますか？
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              いいえ、相手に通知されたり足跡がついたりすることは絶対にありません。誰にも知られずに安心してご利用いただけます。
            </p>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="text-cyan-400 font-mono">Q.</span>
              1日3回・60分の待ち時間制限があるのはなぜですか？
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              ニコニコ動画の公式サーバーに過度な連続アクセスによる負荷をかけず、常に安定してサービスを継続するための公平なルールとして設けております。
            </p>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="text-cyan-400 font-mono">Q.</span>
              スマートフォンやタブレットでも利用できますか？
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              はい、パソコンはもちろん、iPhone、Androidスマホ、iPadなどのタブレットブラウザでも快適に動作するレスポンシブデザインに対応しています。
            </p>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="text-cyan-400 font-mono">Q.</span>
              取得したデータはサーバーに保存されますか？
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              スキャン結果やホワイトリストなどのデータは、ご利用の端末（ブラウザのローカルストレージ）にのみ保存されます。運営者のサーバーに個人データが保存・蓄積されることはありません。
            </p>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="text-cyan-400 font-mono">Q.</span>
              利用料金はかかりますか？
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              完全無料でご利用いただけます。登録料や月額料金などの費用が発生することは一切ありません。
            </p>
          </div>
        </div>
      </section>

      {/* 6. Footer Disclaimer & Compliance Notice */}
      <section className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed space-y-1.5">
        <p className="font-semibold text-slate-300">免責事項・権利表記</p>
        <p>
          本ツールは個人開発の非公式ファンツールであり、株式会社ドワンゴおよびニコニコ動画とは一切関係ありません。
          本ツールは公式公開APIの利用規約およびレートリミットを遵守し、過度なサーバー負荷を与えない設計となっています。
          フォロー解除等の操作は、ニコニコ動画の各ユーザーページ上にて利用者ご自身の責任で行ってください。
        </p>
      </section>
    </div>
  );
};
