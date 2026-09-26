import React from 'react';
import { 
  BarChart3, 
  ShieldCheck, 
  AlertTriangle, 
  Activity, 
  Sprout, 
  PieChart as PieIcon,
  TrendingUp
} from 'lucide-react';

export const AnalyticsCharts = ({ advisories = [], farms = [] }) => {
  const totalAdvisories = advisories.length;
  const resolvedCount = advisories.filter(a => a.status === 'resolved').length;
  const monitoringCount = advisories.filter(a => a.status === 'monitoring').length;
  const openCount = advisories.filter(a => a.status === 'open').length;

  const urgencyCounts = {
    critical: advisories.filter(a => (a.urgency || a.diagnosis_json?.urgency) === 'critical').length,
    high: advisories.filter(a => (a.urgency || a.diagnosis_json?.urgency) === 'high').length,
    moderate: advisories.filter(a => (a.urgency || a.diagnosis_json?.urgency) === 'moderate').length,
    low: advisories.filter(a => (a.urgency || a.diagnosis_json?.urgency) === 'low').length,
  };

  const cropCounts = advisories.reduce((acc, curr) => {
    const crop = curr.crop_type || 'Unknown';
    acc[crop] = (acc[crop] || 0) + 1;
    return acc;
  }, {});

  const avgConfidence = totalAdvisories > 0
    ? (advisories.reduce((sum, a) => sum + (a.diagnosis_json?.confidenceScore || 85), 0) / totalAdvisories).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Advisories</span>
            <span className="text-2xl font-black text-slate-900">{totalAdvisories}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Resolved Cases</span>
            <span className="text-2xl font-black text-slate-900">{resolvedCount}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Active Monitoring</span>
            <span className="text-2xl font-black text-slate-900">{monitoringCount + openCount}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Avg AI Confidence</span>
            <span className="text-2xl font-black text-slate-900">{avgConfidence}%</span>
          </div>
        </div>
      </div>

      {/* Breakdown Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgency Spectrum */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900">Urgency Severity Distribution</h3>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Critical (Immediate Action)', count: urgencyCounts.critical, color: 'bg-rose-500' },
              { label: 'High Urgency', count: urgencyCounts.high, color: 'bg-orange-500' },
              { label: 'Moderate Urgency', count: urgencyCounts.moderate, color: 'bg-amber-500' },
              { label: 'Low Urgency', count: urgencyCounts.low, color: 'bg-emerald-500' }
            ].map((item) => {
              const pct = totalAdvisories > 0 ? ((item.count / totalAdvisories) * 100).toFixed(0) : 0;
              return (
                <div key={item.label} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{item.label}</span>
                    <span>{item.count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Crops Under Management */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Sprout className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900">Crop Health Incidents by Variety</h3>
          </div>
          {Object.keys(cropCounts).length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">No crop diagnosis records yet.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(cropCounts).map(([crop, count]) => {
                const pct = totalAdvisories > 0 ? ((count / totalAdvisories) * 100).toFixed(0) : 0;
                return (
                  <div key={crop} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="text-sm font-semibold text-slate-800">{crop}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500">{count} reports</span>
                      <span className="text-xs font-medium text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-md">
                        {pct}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
