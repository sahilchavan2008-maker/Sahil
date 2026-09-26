import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { advisoryService } from '../services/api';
import { DiagnosisReport } from '../components/DiagnosisReport';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

export const AdvisoryDetailPage = () => {
  const { id } = useParams();
  const [advisory, setAdvisory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdvisory = async () => {
      try {
        setLoading(true);
        const data = await advisoryService.getById(id);
        setAdvisory(data);
      } catch (err) {
        console.error('Failed to load advisory:', err);
        setError('Could not retrieve this crop advisory report.');
      } finally {
        setLoading(false);
      }
    };
    fetchAdvisory();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <span className="text-sm font-semibold text-slate-600">Retrieving diagnostic report...</span>
      </div>
    );
  }

  if (error || !advisory) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-800">Report Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">{error || 'This report may have been archived or removed.'}</p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      <DiagnosisReport advisory={advisory} />
    </div>
  );
};
