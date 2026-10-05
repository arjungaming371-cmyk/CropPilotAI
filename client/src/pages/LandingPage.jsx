import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, ShieldCheck, Sparkles, Cpu, ArrowRight, CheckCircle2, CloudRain } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 bg-gradient-to-b from-emerald-50/70 via-stone-50 to-stone-50 border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-6 border border-emerald-200 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            Next-Gen Agricultural Intelligence Powered by Gemini
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-black text-stone-900 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none mb-6">
            Intelligent Crop Care & Instant Disease Diagnosis
          </h1>
          
          <p className="text-lg sm:text-xl text-stone-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Diagnose plant pathologies, generate precision organic & chemical protocols, and track field health in real-time.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/dashboard"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-base transition shadow-md flex items-center justify-center gap-2"
            >
              Open Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/advisor/new"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white hover:bg-stone-100 text-stone-800 font-semibold text-base transition border border-stone-300 shadow-sm flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Try Crop Advisor
            </Link>
          </div>

          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 text-left max-w-4xl mx-auto">
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
              <Sprout className="w-6 h-6 text-emerald-600 mb-2" />
              <h3 className="font-semibold text-stone-900 text-sm">Farm & Crop Mapping</h3>
              <p className="text-xs text-stone-500 mt-1">Manage multiple plots, soil pH, and irrigation types.</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
              <Cpu className="w-6 h-6 text-emerald-600 mb-2" />
              <h3 className="font-semibold text-stone-900 text-sm">Gemini AI Diagnostics</h3>
              <p className="text-xs text-stone-500 mt-1">Sub-second pathology analysis with scientific reasoning.</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
              <ShieldCheck className="w-6 h-6 text-emerald-600 mb-2" />
              <h3 className="font-semibold text-stone-900 text-sm">Dual Treatments</h3>
              <p className="text-xs text-stone-500 mt-1">Organic controls paired with measured chemical options.</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
              <CloudRain className="w-6 h-6 text-emerald-600 mb-2" />
              <h3 className="font-semibold text-stone-900 text-sm">Climate Adaptive</h3>
              <p className="text-xs text-stone-500 mt-1">Contextualized for drought, humidity, and rainfall.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 bg-white border-t border-stone-200 text-center text-xs text-stone-500">
        <p>CropPilotAI — Built for Google Antigravity & Supabase Cloud PostgreSQL</p>
      </footer>
    </div>
  );
}
