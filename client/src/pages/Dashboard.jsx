import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import StatCard from '../components/StatCard';
import DisclaimerBox from '../components/DisclaimerBox';
import {
  Tractor,
  Layers,
  Sprout,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  CloudSun,
  Droplets,
  Calendar,
  CheckCircle2,
  Clock
} from 'lucide-react';

export default function Dashboard() {
  const [farms, setFarms] = useState([]);
  const [advisories, setAdvisories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [farmsRes, advisoriesRes] = await Promise.allSettled([
        api.getFarms(),
        api.getAdvisories()
      ]);

      if (farmsRes.status === 'fulfilled') setFarms(farmsRes.value.data || []);
      if (advisoriesRes.status === 'fulfilled') setAdvisories(advisoriesRes.value.data || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalFields = farms.reduce((acc, f) => acc + (f.fields?.length || 0), 0);
  const totalCrops = farms.reduce(
    (acc, f) => acc + (f.fields?.reduce((cAcc, fld) => cAcc + (fld.crops?.length || 0), 0) || 0),
    0
  );
  const pendingAdvisories = advisories.filter((a) => a.resolution_status === 'pending');

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
      {/* Top Welcome & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Farm Overview & Intelligence</h1>
          <p className="text-sm text-stone-500 mt-1">
            Real-time crop monitoring, predictive health diagnostics, and agronomic management.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/farms"
            className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium text-sm rounded-xl transition"
          >
            Manage Farms
          </Link>
          <Link
            to="/advisor/new"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-xl shadow-sm transition flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            New Diagnostic
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Farms" value={farms.length} subtitle="Managed locations" icon={Tractor} color="emerald" />
        <StatCard title="Cultivated Fields" value={totalFields} subtitle="Active acreage" icon={Layers} color="blue" />
        <StatCard title="Registered Crops" value={totalCrops} subtitle="Monitored lifecycles" icon={Sprout} color="emerald" />
        <StatCard
          title="Open Advisories"
          value={pendingAdvisories.length}
          subtitle="Issues needing review"
          icon={AlertTriangle}
          color={pendingAdvisories.length > 0 ? 'amber' : 'emerald'}
        />
      </div>

      {/* Weather & Field Context Simulation */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-5 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
            <CloudSun className="w-8 h-8 text-emerald-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">Local Microclimate</span>
              <span className="text-xs bg-emerald-700/60 px-2 py-0.5 rounded text-emerald-200">Optimal Field Conditions</span>
            </div>
            <p className="text-xl font-bold mt-0.5">27°C • 62% Humidity • Light Breeze (8 km/h)</p>
            <p className="text-xs text-emerald-100/80 mt-0.5">
              Ideal timing for foliar spraying: Early morning (06:00 - 08:30) or late afternoon.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 bg-black/20 px-3 py-2 rounded-lg">
            <Droplets className="w-4 h-4 text-emerald-300" />
            <span>Evapotranspiration: 4.2mm/day</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Advisories & Quick Crops */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Diagnoses */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-stone-900">Recent Crop Diagnoses</h2>
              <p className="text-xs text-stone-500">AI-powered treatment reports and disease alerts</p>
            </div>
            <Link to="/history" className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-stone-400">Loading diagnostic records...</div>
          ) : advisories.length === 0 ? (
            <div className="py-12 text-center">
              <Sprout className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-stone-700">No crop diagnoses yet</p>
              <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 mb-4">
                Encountering leaf spots, pests, or wilting? Run a diagnostic now to receive treatment protocols.
              </p>
              <Link
                to="/advisor/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Diagnose First Crop
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {advisories.slice(0, 4).map((advisory) => (
                <Link
                  key={advisory.id}
                  to={`/advisor/${advisory.id}`}
                  className="py-3.5 flex items-center justify-between hover:bg-stone-50 rounded-xl px-2 transition group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-stone-900 group-hover:text-emerald-700 transition">
                        {advisory.diagnosis_title}
                      </span>
                      {getSeverityBadge(advisory.severity)}
                    </div>
                    <p className="text-xs text-stone-500 line-clamp-1 max-w-md">
                      {advisory.analysis_summary}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        advisory.resolution_status === 'resolved'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {advisory.resolution_status}
                    </span>
                    <ArrowRight className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Farm & Crop Summary */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-stone-900">Active Crops</h2>
              <Link to="/farms" className="text-xs font-semibold text-emerald-600 hover:underline">
                View Farms
              </Link>
            </div>

            <div className="space-y-3">
              {farms.flatMap((f) =>
                f.fields?.flatMap((fld) =>
                  fld.crops?.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-xl border border-stone-150 bg-stone-50/60 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-bold text-stone-900">{c.crop_name} {c.variety ? `(${c.variety})` : ''}</p>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          {f.name} • {fld.name}
                        </p>
                      </div>
                      <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {c.growth_stage}
                      </span>
                    </div>
                  ))
                )
              ).slice(0, 4)}

              {totalCrops === 0 && (
                <p className="text-xs text-stone-400 py-6 text-center">No crops registered yet.</p>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-stone-100">
            <DisclaimerBox />
          </div>
        </div>
      </div>
    </div>
  );
}
