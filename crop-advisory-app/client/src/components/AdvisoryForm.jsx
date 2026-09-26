import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X, AlertCircle, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { advisoryService } from '../services/api';

const CROP_PRESETS = [
  'Tomatoes', 'Maize (Corn)', 'Wheat', 'Rice', 'Soybeans', 
  'Potatoes', 'Cotton', 'Apples', 'Grapes', 'Chili Peppers'
];

const GROWTH_STAGES = [
  'Seedling', 'Vegetative', 'Flowering', 'Fruiting', 'Harvesting'
];

export const AdvisoryForm = ({ farms = [], preselectedFarmId = '', onSuccess }) => {
  const [farmId, setFarmId] = useState(preselectedFarmId || (farms[0]?.id || ''));
  const [cropType, setCropType] = useState('Tomatoes');
  const [growthStage, setGrowthStage] = useState('Vegetative');
  const [symptomDescription, setSymptomDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageChange = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPEG, PNG, WebP).');
      return;
    }
    setError(null);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageChange(e.dataTransfer.files[0]);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!farmId) {
      setError('Please select or register a farm plot.');
      return;
    }
    if (!cropType.trim()) {
      setError('Crop type is required.');
      return;
    }
    if (symptomDescription.trim().length < 5) {
      setError('Please provide at least 5 characters describing observed crop symptoms.');
      return;
    }

    try {
      setLoading(true);
      setLoadingStep('Uploading evidence & preparing multimodal telemetry...');

      const formData = new FormData();
      formData.append('farm_id', farmId);
      formData.append('crop_type', cropType.trim());
      formData.append('growth_stage', growthStage);
      formData.append('symptom_description', symptomDescription.trim());
      if (imageFile) {
        formData.append('image', imageFile);
      }

      setLoadingStep('Analyzing symptoms & lesions with Gemini 2.5 Flash...');
      
      const responseAdvisory = await advisoryService.create(formData);

      setLoadingStep('Diagnosis verified and IPM protocol generated!');
      setTimeout(() => {
        if (onSuccess) {
          onSuccess(responseAdvisory);
        }
      }, 600);
    } catch (err) {
      console.error('Diagnosis failed:', err);
      const apiErr = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to complete crop diagnosis.';
      setError(apiErr);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
      <div className="flex items-center gap-3 pb-6 mb-6 border-b border-slate-100">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Multimodal Crop Diagnosis</h2>
          <p className="text-xs text-slate-500">Provide foliage/soil visuals and symptom notes for instant AI analysis</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600" />
          <div>
            <span className="font-semibold">Submission Error:</span> {error}
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Farm & Crop Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Target Farm Plot *
            </label>
            <select
              value={farmId}
              onChange={(e) => setFarmId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              required
            >
              {farms.length === 0 ? (
                <option value="">No farms found - please create a farm first</option>
              ) : (
                farms.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.location})
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Growth Stage *
            </label>
            <select
              value={growthStage}
              onChange={(e) => setGrowthStage(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            >
              {GROWTH_STAGES.map((stage) => (
                <option key={stage} value={stage}>
                  {stage} Stage
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Crop Type with Quick Chips */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Crop Type / Variety *
          </label>
          <input
            type="text"
            value={cropType}
            onChange={(e) => setCropType(e.target.value)}
            placeholder="e.g. San Marzano Tomato, Basmati Rice, Cavendish Banana..."
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            required
          />
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className="text-[11px] text-slate-400 font-medium mr-1">Quick Select:</span>
            {CROP_PRESETS.map((preset) => (
              <button
                type="button"
                key={preset}
                onClick={() => setCropType(preset)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  cropType === preset
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-500 hover:text-emerald-700'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Image Dropzone */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex justify-between items-center">
            <span>Crop Leaf / Soil Photo (Optional but Recommended)</span>
            <span className="text-[11px] text-emerald-700 font-semibold">Gemini Multimodal Vision</span>
          </label>

          {!imagePreview ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-emerald-500 bg-emerald-50/50'
                  : 'border-slate-300 hover:border-emerald-500 hover:bg-slate-50/80 bg-slate-50/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => handleImageChange(e.target.files[0])}
              />
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-800">
                Click to upload foliage photo or drag & drop here
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Supports JPG, PNG, WebP up to 10MB (Clear close-ups of lesions/pests produce highest accuracy)
              </p>
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 group">
              <img
                src={imagePreview}
                alt="Crop preview"
                className="w-full h-56 object-contain bg-slate-950"
              />
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <span className="text-xs bg-slate-900/80 backdrop-blur-md text-emerald-400 px-3 py-1 rounded-full font-medium flex items-center gap-1.5 border border-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Image Attached
                </span>
                <button
                  type="button"
                  onClick={clearImage}
                  className="p-1.5 bg-slate-900/80 hover:bg-rose-600 text-white rounded-full backdrop-blur-md transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Symptoms Description */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Observed Symptoms & Environmental Context *
          </label>
          <textarea
            rows={4}
            value={symptomDescription}
            onChange={(e) => setSymptomDescription(e.target.value)}
            placeholder="Describe discoloration, wilting, leaf spots, insect sightings, irrigation schedule, or recent weather anomalies (e.g. excessive rainfall, heatwave)..."
            className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || farms.length === 0}
          className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-3 text-base transition-all group"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{loadingStep || 'Processing with Gemini AI...'}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span>Generate AI Diagnosis & Treatment Plan</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
