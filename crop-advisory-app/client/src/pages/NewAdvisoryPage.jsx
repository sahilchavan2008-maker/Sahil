import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { farmService } from '../services/api';
import { AdvisoryForm } from '../components/AdvisoryForm';
import { Loader2 } from 'lucide-react';

export const NewAdvisoryPage = () => {
  const [searchParams] = useSearchParams();
  const preselectedFarmId = searchParams.get('farmId') || '';
  const navigate = useNavigate();

  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFarms = async () => {
      try {
        const data = await farmService.getAll();
        setFarms(data || []);
      } catch (err) {
        console.error('Failed to load farms:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFarms();
  }, []);

  const handleSuccess = (advisory) => {
    navigate(`/advisory/${advisory.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <span className="text-sm font-semibold text-slate-600">Initializing diagnostic telemetry...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AdvisoryForm
        farms={farms}
        preselectedFarmId={preselectedFarmId}
        onSuccess={handleSuccess}
      />
    </div>
  );
};
