import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        
        <div className="text-center sm:text-left">
          <h1 className="text-3xl font-bold mb-4">FemTracker Agent</h1>
          <p className="text-lg text-gray-600 mb-8">
            您的智能女性健康助手 - 9个专业AI助手为您提供全方位健康指导
          </p>
        </div>

        {/* 健康仪表盘入口 */}
        <div className="w-full max-w-4xl">
          <Link
            href="/dashboard"
            className="w-full rounded-2xl border border-solid border-transparent transition-colors flex items-center justify-center bg-gradient-to-r from-purple-600 via-pink-500 to-red-400 text-white gap-3 hover:from-purple-700 hover:via-pink-600 hover:to-red-500 font-semibold text-lg h-16 px-8 shadow-lg"
          >
            📊 健康仪表盘 - 查看全面健康状况
          </Link>
        </div>

        {/* 专业Agent导航 */}
        <div className="w-full max-w-6xl">
          <h2 className="text-xl font-semibold mb-6 text-center">🤖 专业健康助手</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href="/cycle-tracker"
              className="group rounded-xl border border-solid border-gray-200 transition-all flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 to-red-50 text-gray-800 gap-2 hover:from-pink-100 hover:to-red-100 hover:shadow-md font-medium text-sm p-6 h-32"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">🩸</span>
              <span className="font-semibold">周期追踪</span>
              <span className="text-xs text-gray-600 text-center">月经周期记录与预测</span>
            </Link>
            
            <Link
              href="/symptom-mood"
              className="group rounded-xl border border-solid border-gray-200 transition-all flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 text-gray-800 gap-2 hover:from-blue-100 hover:to-purple-100 hover:shadow-md font-medium text-sm p-6 h-32"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">😰</span>
              <span className="font-semibold">症状情绪</span>
              <span className="text-xs text-gray-600 text-center">症状追踪与情绪管理</span>
            </Link>

            <Link
              href="/fertility"
              className="group rounded-xl border border-solid border-gray-200 transition-all flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 text-gray-800 gap-2 hover:from-green-100 hover:to-emerald-100 hover:shadow-md font-medium text-sm p-6 h-32"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">🤰</span>
              <span className="font-semibold">生育健康</span>
              <span className="text-xs text-gray-600 text-center">排卵预测与备孕指导</span>
            </Link>

            <Link
              href="/nutrition"
              className="group rounded-xl border border-solid border-gray-200 transition-all flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-yellow-50 text-gray-800 gap-2 hover:from-orange-100 hover:to-yellow-100 hover:shadow-md font-medium text-sm p-6 h-32"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">🥗</span>
              <span className="font-semibold">营养指导</span>
              <span className="text-xs text-gray-600 text-center">营养补充与饮食建议</span>
            </Link>

            <Link
              href="/exercise"
              className="group rounded-xl border border-solid border-gray-200 transition-all flex flex-col items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-50 text-gray-800 gap-2 hover:from-teal-100 hover:to-cyan-100 hover:shadow-md font-medium text-sm p-6 h-32"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">🏃‍♀️</span>
              <span className="font-semibold">运动健康</span>
              <span className="text-xs text-gray-600 text-center">运动追踪与健身建议</span>
            </Link>

            <Link
              href="/lifestyle"
              className="group rounded-xl border border-solid border-gray-200 transition-all flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 text-gray-800 gap-2 hover:from-indigo-100 hover:to-purple-100 hover:shadow-md font-medium text-sm p-6 h-32"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">😴</span>
              <span className="font-semibold">生活方式</span>
              <span className="text-xs text-gray-600 text-center">睡眠与压力管理</span>
            </Link>
          </div>
        </div>

        {/* 传统功能保留 */}
        <div className="w-full max-w-4xl">
          <h2 className="text-lg font-medium mb-4 text-center text-gray-600">🔧 更多功能</h2>
          <div className="flex gap-4 items-center flex-col sm:flex-row justify-center">
            <Link
              href="/recipe"
              className="rounded-full border border-solid border-gray-300 transition-colors flex items-center justify-center bg-white text-gray-800 gap-2 hover:bg-gray-50 font-medium text-sm h-10 px-5"
            >
              🍳 智能食谱
            </Link>
            <Link
              href="/insights"
              className="rounded-full border border-solid border-purple-300 transition-colors flex items-center justify-center bg-purple-50 text-purple-800 gap-2 hover:bg-purple-100 font-medium text-sm h-10 px-5"
            >
              📊 健康洞察
            </Link>
            <a
              className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm h-10 px-5"
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              💻 源代码
            </a>
          </div>
        </div>

        <div className="text-sm text-gray-500 text-center sm:text-left max-w-4xl">
          <p className="font-medium mb-3">🌟 系统功能特色:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
            <div className="flex items-start gap-2">
              <span className="text-purple-500">🤖</span>
              <span>9个专业AI健康助手</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-pink-500">🩸</span>
              <span>智能月经周期追踪</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-500">📊</span>
              <span>综合健康数据分析</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-500">🤰</span>
              <span>备孕与生育健康指导</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-orange-500">🥗</span>
              <span>个性化营养与运动建议</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-indigo-500">😴</span>
              <span>睡眠与情绪健康管理</span>
            </div>
          </div>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
