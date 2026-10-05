import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import {
  ClipboardList,
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle
} from 'lucide-react';

export default function HistoryPage() {
  const [advisories, setAdvisories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadAdvisories();
  }, [severityFilter, statusFilter]);

  const loadAdvisories = async () => {
    try {
      setLoading(true);
      const params = {};
      if (severityFilter) params.severity = severityFilter;
      if (statusFilter) params.status = statusFilter;
      const res = await api.getAdvisories(params);
      setAdvisories(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityBadge = (severity) => {
    const map = {
      critical: 'bg-red-100 text-red-800 border-red-200',
      severe: 'bg-amber-100 text-amber-800 border-amber-200',
      moderate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-emerald-100 text-emerald-800 border-emerald-200'
    };
    return (
      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase border ${map[severity] || map.moderate}`}>
        {severity}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Crop Advisory History</h1>
          <p className="text-sm text-stone-500 mt-1">
            Archived record of all AI pathology evaluations and field treatment updates.
          </p>
        </div>
        <Link
          to="/advisor/new"
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-xl shadow-sm transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          New Diagnostic
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-stone-500 font-semibold mr-2">
          <Filter className="w-4 h-4" /> Filter:
        </div>

        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-700"
        >
          <option value="">All Severities</option>
          <option value="critical">Critical</option>
          <option value="severe">Severe</option>
          <option value="moderate">Moderate</option>
          <option value="low">Low</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-700"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>

        {(severityFilter || statusFilter) && (
          <button
            onClick={() => {
              setSeverityFilter('');
              setStatusFilter('');
            }}
            className="text-stone-500 hover:text-stone-800 underline text-xs ml-auto"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Advisories List */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-stone-400">Loading historical advisories...</div>
        ) : advisories.length === 0 ? (
          <div className="p-12 text-center">
            <ClipboardList className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-stone-800">No advisory records found</h3>
            <p className="text-xs text-stone-500 mt-1 mb-4">
              Try adjusting your filter or diagnose an active crop.
            </p>
            <Link
              to="/advisor/new"
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
            >
              Run Diagnostic
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {advisories.map((advisory) => (
              <Link
                key={advisory.id}
                to={`/advisor/${advisory.id}`}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-stone-50 transition group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-sm text-stone-900 group-hover:text-emerald-700 transition">
                      {advisory.diagnosis_title}
                    </span>
                    {getSeverityBadge(advisory.severity)}
                  </div>
                  <p className="text-xs text-stone-500 line-clamp-1 max-w-xl">
                    {advisory.analysis_summary}
                  </p>
                  <p className="text-[11px] text-stone-400">
                    Recorded {new Date(advisory.created_at).toLocaleDateString()} • Cause: {advisory.pathogen_or_cause}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      advisory.resolution_status === 'resolved'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : advisory.resolution_status === 'in_progress'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-stone-100 text-stone-600 border border-stone-200'
                    }`}
                  >
                    {advisory.resolution_status}
                  </span>
                  <ArrowRight className="w-4 h-4 text-stone-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
