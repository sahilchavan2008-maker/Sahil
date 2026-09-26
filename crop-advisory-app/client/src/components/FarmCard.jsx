import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Layers, Trees, ArrowRight, Trash2 } from 'lucide-react';

export const FarmCard = ({ farm, onDelete }) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
      <div>
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Trees className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                {farm.name}
              </h3>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {farm.location}
              </p>
            </div>
          </div>
          {onDelete && (
            <button
              onClick={() => onDelete(farm.id)}
              title="Delete plot"
              className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 my-4 py-3 px-3.5 bg-slate-50 rounded-xl text-xs">
          <div>
            <span className="text-slate-400 font-medium block">Plot Area</span>
            <span className="font-semibold text-slate-800 text-sm">{farm.size_acres ? `${farm.size_acres} Acres` : 'Unspecified'}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Soil Profile</span>
            <span className="font-semibold text-slate-800 truncate block text-sm" title={farm.soil_type}>
              {farm.soil_type || 'Standard Loam'}
            </span>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[11px] text-slate-400">
          Registered {new Date(farm.created_at).toLocaleDateString()}
        </span>
        <Link
          to={`/advisory/new?farmId=${farm.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
        >
          <span>Run Diagnosis</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
