import React, { useState, useEffect } from 'react';
import { advisoryService, farmService } from '../services/api';
import { AnalyticsCharts } from '../components/AnalyticsCharts';
import { Loader2, Filter, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AnalyticsPage = () => {
  const [advisories, setAdvisories] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [urgencyFilter, setUrgencyFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [advData, farmData] = await Promise.all([
          advisoryService.getAll(),
          farmService.getAll()
        ]);
        setAdvisories(advData || []);
        setFarms(farmData || []);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredAdvisories = advisories.filter((a) => {
    const u = (a.urgency || a.diagnosis_json?.urgency || '').toLowerCase();
    const s = (a.status || 'open').toLowerCase();
    if (urgencyFilter && u !== urgencyFilter) return false;
    if (statusFilter && s !== statusFilter) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <span className="text-sm font-semibold text-slate-600">Aggregating agronomic telemetry...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Farm Health & Pathology Analytics</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Holistic insights into disease frequencies, pest pressure, and treatment resolution rates
        </p>
      </div>

      {/* Analytics Charts Component */}
      <AnalyticsCharts advisories={advisories} farms={farms} />

      {/* Historical Advisory Timeline with Filters */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Historical Diagnostic Timeline</h2>
            <p className="text-xs text-slate-500">Filter and audit past diagnoses and prescribed remedies</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value)}
                className="bg-transparent text-slate-700 font-medium focus:outline-none"
              >
                <option value="">All Urgencies</option>
                <option value="low">Low</option>
                <option value="moderate">Moderate</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-slate-700 font-medium focus:outline-none"
              >
                <option value="">All Statuses</option>
                <option value="open">Open</option>
                <option value="monitoring">Monitoring</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>
        </div>

        {filteredAdvisories.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center text-xs text-slate-400">
            No advisory records match the selected filter criteria.
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4 sm:px-6">Crop</th>
                    <th className="py-3 px-4">Diagnosis</th>
                    <th className="py-3 px-4">Urgency</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Confidence</th>
                    <th className="py-3 px-4 sm:px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredAdvisories.map((adv) => {
                    const diagnosis = adv.diagnosis_json || {};
                    const urgency = (diagnosis.urgency || adv.urgency || 'low').toLowerCase();
                    return (
                      <tr key={adv.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-900">
                          {adv.crop_type}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-800">
                          {diagnosis.primaryDiagnosis || 'Case'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold capitalize ${
                            urgency === 'critical' ? 'bg-rose-100 text-rose-800' :
                            urgency === 'high' ? 'bg-orange-100 text-orange-800' :
                            urgency === 'moderate' ? 'bg-amber-100 text-amber-800' :
                            'bg-emerald-100 text-emerald-800'
                          }`}>
                            {urgency}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-semibold capitalize bg-slate-100 text-slate-700">
                            {adv.status || 'open'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-xs font-semibold text-slate-700">
                          {diagnosis.confidenceScore || 90}%
                        </td>
                        <td className="py-3.5 px-4 sm:px-6 text-right">
                          <Link
                            to={`/advisory/${adv.id}`}
                            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
                          >
                            <span>Details</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
