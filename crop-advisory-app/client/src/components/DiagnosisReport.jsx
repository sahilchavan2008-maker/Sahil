import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Leaf, 
  FlaskConical, 
  RotateCcw, 
  Printer, 
  Download, 
  Calendar, 
  TrendingDown, 
  Clock,
  CheckCircle,
  Eye,
  Building
} from 'lucide-react';
import { advisoryService } from '../services/api';

const URGENCY_CONFIG = {
  low: {
    label: 'Low Urgency',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    bar: 'bg-emerald-500',
    icon: ShieldCheck
  },
  moderate: {
    label: 'Moderate Urgency',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    bar: 'bg-amber-500',
    icon: Clock
  },
  high: {
    label: 'High Urgency',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-700',
    bar: 'bg-orange-500',
    icon: ShieldAlert
  },
  critical: {
    label: 'Critical - Immediate Action Required',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    text: 'text-rose-700',
    bar: 'bg-rose-600',
    icon: ShieldAlert
  }
};

export const DiagnosisReport = ({ advisory, onStatusChange }) => {
  const [activeTab, setActiveTab] = useState('organic');
  const [currentStatus, setCurrentStatus] = useState(advisory.status || 'open');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const diagnosis = advisory.diagnosis_json || {};
  const urgency = (diagnosis.urgency || advisory.urgency || 'moderate').toLowerCase();
  const urgencyStyle = URGENCY_CONFIG[urgency] || URGENCY_CONFIG.moderate;
  const UrgencyIcon = urgencyStyle.icon;

  const handleStatusUpdate = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      await advisoryService.updateStatus(advisory.id, newStatus);
      setCurrentStatus(newStatus);
      if (onStatusChange) onStatusChange(newStatus);
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Field,Value\n" +
      `"Report ID","${advisory.id}"\n` +
      `"Crop","${advisory.crop_type}"\n` +
      `"Growth Stage","${advisory.growth_stage}"\n` +
      `"Primary Diagnosis","${diagnosis.primaryDiagnosis || 'N/A'}"\n` +
      `"Confidence Score","${diagnosis.confidenceScore || 0}%"\n` +
      `"Urgency","${diagnosis.urgency || 'N/A'}"\n` +
      `"Symptoms","${(diagnosis.symptomAnalysis || '').replace(/"/g, '""')}"\n` +
      `"Yield Impact","${(diagnosis.yieldImpactForecast || '').replace(/"/g, '""')}"\n` +
      `"Date","${new Date(advisory.created_at).toISOString()}"\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Crop_Advisory_${advisory.id.slice(0, 8)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden print:border-none print:shadow-none">
      {/* Top Banner Header */}
      <div className="bg-slate-900 text-white p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Official Agronomic Advisory
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-xs text-slate-300">
                ID: {advisory.id ? advisory.id.slice(0, 8) : 'NEW'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {diagnosis.primaryDiagnosis || 'Crop Health Assessment'}
            </h1>
            <p className="text-sm text-slate-300 mt-1 flex items-center gap-2">
              <span>{advisory.crop_type}</span>
              <span>•</span>
              <span>{advisory.growth_stage} Stage</span>
              {advisory.farms?.name && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-emerald-400" />
                    {advisory.farms.name}
                  </span>
                </>
              )}
            </p>
          </div>

          {/* Quick Actions (Print / CSV) */}
          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handlePrint}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-2 text-xs font-semibold"
              title="Print PDF report"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print Report</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-2 text-xs font-semibold"
              title="Download CSV"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          </div>
        </div>

        {/* Status Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Status:</span>
            <div className="inline-flex rounded-lg bg-slate-800 p-0.5 print:hidden">
              {['open', 'monitoring', 'resolved'].map((s) => (
                <button
                  key={s}
                  disabled={updatingStatus}
                  onClick={() => handleStatusUpdate(s)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold capitalize transition-all ${
                    currentStatus === s
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <span className="hidden print:inline font-bold uppercase">{currentStatus}</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>Diagnosed on {new Date(advisory.created_at || Date.now()).toLocaleDateString('en-US', { dateStyle: 'long' })}</span>
          </div>
        </div>
      </div>

      {/* Primary Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 sm:p-8 bg-slate-50/50 border-b border-slate-200">
        {/* Urgency Badge */}
        <div className={`p-5 rounded-2xl border ${urgencyStyle.bg} ${urgencyStyle.border} flex items-center gap-4`}>
          <div className={`p-3 rounded-xl bg-white shadow-sm ${urgencyStyle.text}`}>
            <UrgencyIcon className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Urgency Tier</span>
            <span className={`text-base font-extrabold ${urgencyStyle.text}`}>
              {urgencyStyle.label}
            </span>
          </div>
        </div>

        {/* Confidence Score */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Confidence</span>
            <span className="text-lg font-black text-slate-900">{diagnosis.confidenceScore || 90}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${urgencyStyle.bar} transition-all duration-1000`}
              style={{ width: `${diagnosis.confidenceScore || 90}%` }}
            />
          </div>
        </div>

        {/* Model Engine */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Diagnostic Engine</span>
            <span className="text-sm font-bold text-slate-800">
              Gemini 2.5 Flash Multimodal
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="p-6 sm:p-8 space-y-8">
        {/* Multimodal Image Preview if available */}
        {advisory.image_url && (
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-emerald-600" />
              Attached Plant Visual Evidence
            </h4>
            <div className="rounded-xl overflow-hidden max-h-80 bg-slate-900 flex justify-center items-center">
              <img
                src={advisory.image_url}
                alt="Analyzed crop foliage"
                className="max-h-80 w-auto object-contain"
              />
            </div>
          </div>
        )}

        {/* Symptom Analysis */}
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
            Agronomic Symptom Analysis
          </h3>
          <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
            {diagnosis.symptomAnalysis || advisory.symptom_description}
          </p>
        </div>

        {/* Treatment Protocol Tabs */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900">
              Prescribed Treatment Protocols
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              Integrated Pest Management (IPM) Standard
            </span>
          </div>

          <div className="flex gap-2 border-b border-slate-200 pb-3">
            <button
              onClick={() => setActiveTab('organic')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'organic'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Leaf className="w-4 h-4" />
              Organic & Biological ({diagnosis.treatmentPlan?.organic?.length || 0})
            </button>

            <button
              onClick={() => setActiveTab('chemical')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'chemical'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <FlaskConical className="w-4 h-4" />
              Chemical Interventions ({diagnosis.treatmentPlan?.chemical?.length || 0})
            </button>

            <button
              onClick={() => setActiveTab('preventative')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'preventative'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              Preventative & Cultural ({diagnosis.treatmentPlan?.preventativeMeasures?.length || 0})
            </button>
          </div>

          <div className="mt-4">
            {activeTab === 'organic' && (
              <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-5 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Organic & Eco-Friendly Remedies
                </h4>
                <ul className="space-y-2.5">
                  {(diagnosis.treatmentPlan?.organic || []).map((step, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-slate-800">
                      <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-800 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 'chemical' && (
              <div className="bg-indigo-50/50 border border-indigo-200 rounded-2xl p-5 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-800">
                  Targeted Chemical & Fungicidal Controls
                </h4>
                <ul className="space-y-2.5">
                  {(diagnosis.treatmentPlan?.chemical || []).map((step, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-slate-800">
                      <span className="w-5 h-5 rounded-full bg-indigo-200 text-indigo-800 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 'preventative' && (
              <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-5 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800">
                  Long-Term Cultural & Rotation Safeguards
                </h4>
                <ul className="space-y-2.5">
                  {(diagnosis.treatmentPlan?.preventativeMeasures || []).map((step, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-slate-800">
                      <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-800 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Yield Impact Forecast Callout */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-200/80 flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-rose-100 text-rose-700 flex-shrink-0 mt-0.5">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-rose-900">Yield Impact Forecast (Untreated Scenario)</h4>
            <p className="text-xs sm:text-sm text-rose-800 mt-1 leading-relaxed">
              {diagnosis.yieldImpactForecast || 'Failure to intervene promptly may result in substantial loss of harvestable biomass and reduced crop quality.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
