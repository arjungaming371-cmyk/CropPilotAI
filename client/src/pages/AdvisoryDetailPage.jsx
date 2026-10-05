import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import DisclaimerBox from '../components/DisclaimerBox';
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  FlaskConical,
  Leaf,
  Printer,
  Calendar,
  Layers,
  Sparkles,
  Save
} from 'lucide-react';

export default function AdvisoryDetailPage() {
  const { id } = useParams();
  const [advisory, setAdvisory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('pending');
  const [notes, setNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    loadAdvisory();
  }, [id]);

  const loadAdvisory = async () => {
    try {
      setLoading(true);
      const res = await api.getAdvisoryById(id);
      if (res.data) {
        setAdvisory(res.data);
        setStatus(res.data.resolution_status || 'pending');
        setNotes(res.data.resolution_notes || '');
      } else {
        throw new Error('Advisory record not found');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setSavedSuccess(false);
    try {
      await api.updateAdvisoryStatus(id, { status, resolutionNotes: notes });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const printReport = () => {
    window.print();
  };

  if (loading) {
    return <div className="py-16 text-center text-sm text-stone-500">Retrieving diagnostic report...</div>;
  }

  if (error || !advisory) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold text-stone-900">Advisory Not Found</h2>
        <p className="text-xs text-stone-500">{error || 'Could not load record'}</p>
        <Link to="/history" className="inline-block px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold">
          Return to History
        </Link>
      </div>
    );
  }

  const severityTheme = {
    critical: 'bg-red-500 text-white border-red-600',
    severe: 'bg-amber-500 text-white border-amber-600',
    moderate: 'bg-yellow-500 text-stone-900 border-yellow-600',
    low: 'bg-emerald-600 text-white border-emerald-700'
  }[advisory.severity] || 'bg-stone-700 text-white border-stone-800';

  return (
    <div className="max-w-4xl mx-auto space-y-6 print:m-0 print:p-0">
      {/* Top back & actions */}
      <div className="flex items-center justify-between print:hidden">
        <Link
          to="/history"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900"
        >
          <ArrowLeft className="w-4 h-4" /> Back to History
        </Link>
        <button
          onClick={printReport}
          className="px-3 py-1.5 bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition shadow-sm"
        >
          <Printer className="w-3.5 h-3.5" />
          Print / Save PDF
        </button>
      </div>

      {/* Main Diagnostic Header Card */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
        <div className={`p-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${severityTheme}`}>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider bg-black/25 px-2.5 py-0.5 rounded-full">
                {advisory.severity} Severity
              </span>
              <span className="text-[11px] font-semibold opacity-90">
                Confidence: {Math.round((advisory.confidence_score || 0.9) * 100)}%
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black mt-2 leading-tight">
              {advisory.diagnosis_title}
            </h1>
            <p className="text-xs opacity-90 mt-1 flex items-center gap-2 font-mono">
              <span>Pathogen/Cause: {advisory.pathogen_or_cause}</span>
              <span>•</span>
              <span className="capitalize">{advisory.category} Category</span>
            </p>
          </div>
          <div className="text-right text-xs opacity-80 shrink-0">
            <p>Diagnosed on: {new Date(advisory.created_at).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Diagnostic Narrative */}
        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Agronomic Pathology Analysis</h3>
            <p className="text-sm text-stone-800 leading-relaxed bg-stone-50 p-4 rounded-xl border border-stone-200">
              {advisory.analysis_summary}
            </p>
          </div>

          {/* Observed Context */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-stone-50/50 p-4 rounded-xl border border-stone-200">
            <div>
              <p className="text-stone-500 font-semibold mb-1">Symptom Description Reported:</p>
              <p className="text-stone-800 italic">"{advisory.symptom_description}"</p>
            </div>
            <div>
              <p className="text-stone-500 font-semibold mb-1">Affected Anatomy & Spread:</p>
              <p className="text-stone-800">
                Parts: <span className="font-medium">{advisory.affected_parts?.join(', ')}</span> | Pattern: <span className="font-medium capitalize">{advisory.spread_pattern}</span>
              </p>
            </div>
          </div>

          {/* Immediate Action Checklist */}
          {advisory.immediate_actions && advisory.immediate_actions.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                Immediate Containment Actions (Next 24-48 Hours)
              </h3>
              <div className="space-y-2">
                {advisory.immediate_actions.map((action, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/50 border border-amber-100 text-xs text-amber-950">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{action}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dual Treatment Protocols: Organic & Chemical */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Organic Controls */}
            <div className="border border-emerald-200 bg-emerald-50/30 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Leaf className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-950">Organic / Biological Interventions</h4>
                  <p className="text-[11px] text-emerald-700">Residue-free and eco-friendly solutions</p>
                </div>
              </div>

              <div className="space-y-3">
                {advisory.organic_treatments?.map((org, i) => (
                  <div key={i} className="p-3 bg-white rounded-xl border border-emerald-100 text-xs shadow-2xs space-y-1">
                    <p className="font-bold text-emerald-900">{org.treatmentName}</p>
                    <p className="text-stone-600"><span className="font-semibold text-stone-700">Method:</span> {org.applicationMethod}</p>
                    <p className="text-stone-500 text-[11px]"><span className="font-semibold text-stone-600">Timing:</span> {org.timing}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Chemical Controls */}
            <div className="border border-stone-200 bg-stone-50/30 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <FlaskConical className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-900">Controlled Chemical Controls</h4>
                  <p className="text-[11px] text-stone-500">Requires adherence to safety label & PPE</p>
                </div>
              </div>

              <div className="space-y-3">
                {advisory.chemical_treatments?.map((chem, i) => (
                  <div key={i} className="p-3 bg-white rounded-xl border border-stone-200 text-xs shadow-2xs space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-stone-900">{chem.activeIngredient}</p>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-100 text-stone-700 border border-stone-200">
                        PHI: {chem.preHarvestIntervalDays} Days
                      </span>
                    </div>
                    <p className="text-stone-600"><span className="font-semibold text-stone-700">Dosage:</span> {chem.recommendedDosage}</p>
                    <p className="text-amber-800 text-[11px] leading-tight bg-amber-50/60 p-2 rounded border border-amber-100/60 mt-1">
                      <span className="font-semibold">Safety:</span> {chem.safetyPrecautions}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Long term prevention */}
          {advisory.preventative_measures && advisory.preventative_measures.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2">Preventative Management & Cultural Controls</h3>
              <ul className="list-disc list-inside space-y-1 text-xs text-stone-600">
                {advisory.preventative_measures.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          )}

          <DisclaimerBox text={advisory.safety_disclaimer} />
        </div>
      </div>

      {/* Treatment Progress Tracking Card */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm print:hidden">
        <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Field Treatment Status & Farmer Notes
        </h3>

        {savedSuccess && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Advisory resolution record updated successfully!
          </div>
        )}

        <form onSubmit={handleStatusUpdate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Current Resolution Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg"
              >
                <option value="pending">Pending Evaluation</option>
                <option value="in_progress">Treatment In Progress</option>
                <option value="resolved">Issue Resolved Successfully</option>
                <option value="dismissed">Dismissed / Monitoring</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Field Follow-up Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Applied copper spray on Monday, foliage showing recovery."
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={updating}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold transition flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {updating ? 'Saving...' : 'Update Status & Notes'}
          </button>
        </form>
      </div>
    </div>
  );
}
