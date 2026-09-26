import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Sprout, 
  ShieldCheck, 
  Sparkles, 
  Leaf, 
  Layers, 
  TrendingUp, 
  ArrowRight, 
  Camera, 
  CheckCircle2,
  Users
} from 'lucide-react';

export const LandingPage = () => {
  const { loginAsDemo, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleInstantDemo = () => {
    loginAsDemo();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/40 via-white to-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-bold mb-6 animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>Powered by Google Gemini 2.5 Flash & Supabase RLS</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              AI-Powered <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-green-700 bg-clip-text text-transparent">Crop Advisory</span> & Disease Diagnostics
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed font-normal">
              Empowering farmers, agronomists, and extension workers with instant multimodal disease diagnosis, customized soil-aligned treatment protocols, and yield-loss mitigation.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 text-base transition-all"
                >
                  <span>Go to My Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <button
                    onClick={handleInstantDemo}
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 text-base transition-all group"
                  >
                    <span>Instant Demo (1-Click)</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <Link
                    to="/register"
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold shadow-sm flex items-center justify-center gap-2 text-base transition-all"
                  >
                    Create Free Account
                  </Link>
                </>
              )}
            </div>

            {/* Micro Social Proof */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Multimodal Foliage & Soil Analysis
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Strict Zod-Validated JSON Schema
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Zero Chemical Bias / IPM Standard
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
              Intelligent Agronomy Stack
            </h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              From Visual Foliage Symptoms to Prescriptive Action
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 hover:shadow-lg transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Camera className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Multimodal Leaf Diagnostics</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Take a photo of diseased foliage or soil disfigurement. Gemini 2.5 Flash analyzes lesions, fungal halos, and insect frass with sub-millimeter precision.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 hover:shadow-lg transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Leaf className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Integrated Pest Management</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Balanced treatment protocols featuring certified organic biologicals, compliant chemical active ingredients, and cultural crop rotation safeguards.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 hover:shadow-lg transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Layers className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Soil & Plot Contextualization</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Connect advisories directly to registered farm plots. The AI considers your local soil type, pH, growth stage, and acreage to tailor exact application rates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Target Crops Banner */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl">
            <div className="max-w-3xl">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Broad Botanical Coverage
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold mt-2">
                Engineered for All Major Commercial Crops & Smallholder Staples
              </h3>
              <p className="text-slate-300 text-sm sm:text-base mt-4 leading-relaxed">
                Cereal Grains (Wheat, Rice, Maize), Legumes (Soybeans, Chickpeas), Solanaceae (Tomatoes, Potatoes, Peppers), Cash Crops (Cotton, Sugarcane, Coffee), and Orchards.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {['Fungal Blights', 'Bacterial Wilts', 'Viral Pathogens', 'Nutrient Deficiencies', 'Stem Borers', 'Drought Stress'].map((tag) => (
                  <span key={tag} className="text-xs px-3 py-1.5 rounded-xl bg-white/10 text-emerald-200 border border-white/10 font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
