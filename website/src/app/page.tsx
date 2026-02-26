'use client';

import Newsletter from '@/components/Newsletter';
import SocialLinks from '@/components/SocialLinks';

export default function Home() {
  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
      {/* Video Background (optional - uncomment when you have a video) */}
      {/* <video 
        className="video-background" 
        autoPlay 
        muted 
        loop 
        playsInline
        src="/demo.mp4"
      /> */}
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black" />

      {/* Content */}
      <div className="content w-full px-4 py-20">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          {/* Logo/Brand */}
          <div className="space-y-2">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              Emmaline
            </h1>
            <p className="text-white/60 text-lg md:text-xl">
              Your AI Phone Call Buddy
            </p>
          </div>

          {/* Hero Description */}
          <div className="space-y-4">
            <p className="text-xl md:text-2xl text-white/90 leading-relaxed max-w-2xl mx-auto">
              Get instant answers, practice conversations, or just chat with an AI that actually listens.
            </p>
            <p className="text-white/60 md:text-lg">
              Call any time, get smarter every conversation.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12 max-w-2xl mx-auto">
            <div className="space-y-2">
              <p className="font-semibold">AI Powered</p>
              <p className="text-white/60 text-sm">Smart conversations powered by advanced AI</p>
            </div>
            <div className="space-y-2">
              <p className="font-semibold">Voice First</p>
              <p className="text-white/60 text-sm">Natural conversations, no typing required</p>
            </div>
            <div className="space-y-2">
              <p className="font-semibold">Private</p>
              <p className="text-white/60 text-sm">Your conversations stay private & secure</p>
            </div>
          </div>

          {/* Newsletter Signup */}
          <div className="space-y-4 my-12">
            <div>
              <h2 className="text-2xl font-bold mb-2">Join the Waitlist</h2>
              <p className="text-white/60">Be the first to know when we launch</p>
            </div>
            <Newsletter />
          </div>

          {/* App Download Links (when ready) */}
          <div className="space-y-3 my-12">
            <p className="text-white/60 text-sm">Available Soon</p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <button 
                disabled
                className="px-6 py-2 border border-white/30 rounded-lg text-white/50 cursor-not-allowed disabled:opacity-50"
              >
                App Store
              </button>
              <button 
                disabled
                className="px-6 py-2 border border-white/30 rounded-lg text-white/50 cursor-not-allowed disabled:opacity-50"
              >
                Google Play
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-2 my-12 text-white/60 text-sm">
            <p>Coming soon</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-white/10 mt-20">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            {/* Social Links */}
            <SocialLinks />

            {/* Links */}
            <div className="flex gap-6 text-white/60 text-sm">
              <a href="#" className="hover:text-white transition">Privacy</a>
              <a href="#" className="hover:text-white transition">Terms</a>
              <a href="mailto:contact@emmaline.app" className="hover:text-white transition">Contact</a>
            </div>

            {/* Copyright */}
            <p className="text-white/40 text-sm">© 2026 Emmaline. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
