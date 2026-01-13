import Link from "next/link";
import { Sparkles, Brain, Image as ImageIcon, Volume2 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-lg">WordFactory</span>
        </div>
        <Link
          href="/login"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Sign in
        </Link>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
          <Brain className="w-8 h-8 text-blue-600" />
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 max-w-md">
          Learn Words That Stick
        </h1>
        
        <p className="text-gray-500 mb-8 max-w-sm">
          Create powerful mnemonic flashcards using AI-generated visual associations and phonetic anchors.
        </p>

        <Link
          href="/register"
          className="w-full max-w-xs bg-blue-600 text-white font-medium py-3.5 px-6 rounded-xl hover:bg-blue-700 transition-colors mb-4"
        >
          Get Started Free
        </Link>
        
        <Link
          href="/login"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Already have an account? Sign in
        </Link>

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-2xl">
          <div className="flex flex-col items-center p-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-3">
              <Sparkles className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">AI-Powered</h3>
            <p className="text-sm text-gray-500 text-center">
              Smart phonetic anchors in your native language
            </p>
          </div>
          
          <div className="flex flex-col items-center p-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-3">
              <ImageIcon className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">Visual Memory</h3>
            <p className="text-sm text-gray-500 text-center">
              Unique images for each word
            </p>
          </div>
          
          <div className="flex flex-col items-center p-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
              <Volume2 className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">Audio Support</h3>
            <p className="text-sm text-gray-500 text-center">
              Native speaker pronunciation
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-gray-400">
        Built with care for language learners
      </footer>
    </div>
  );
}
