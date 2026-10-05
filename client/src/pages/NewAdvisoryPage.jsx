import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import DisclaimerBox from '../components/DisclaimerBox';
import {
  Sparkles,
  Sprout,
  AlertCircle,
  HelpCircle,
  Check,
  Layers,
  CloudSun,
  Loader2
} from 'lucide-react';

const PLANT_PARTS = [
  'Leaves',
  'Stem / Vine',
  'Flower / Bud',
  'Fruit / Pod',
  'Root / Crown',
  'Whole Canopy'
];

export default function NewAdvisoryPage() {
  const navigate = useNavigate();
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form Fields
  const [selectedFarmId, setSelectedFarmId] = useState('');
  const [selectedFieldId, setSelectedFieldId] = useState('');
  const [selectedCropId, setSelectedCropId] = useState('');

  const [symptomDescription, setSymptomDescription] = useState('');
  const [affectedParts, setAffectedParts] = useState(['Leaves']);
  const [spreadPattern, setSpreadPattern] = useState('patches');
  const [weatherContext, setWeatherContext] = useState('High daytime humidity with cool evening mist');
  const [soilMoisture, setSoilMoisture] = useState('optimal');

  useEffect(() => {
    loadFarms();
  }, []);

  const loadFarms = async () => {
    try {
      setLoading(true);
      const res = await api.getFarms();
      const loadedFarms = res.data || [];
      setFarms(loadedFarms);

      if (loadedFarms.length > 0) {
        setSelectedFarmId(loadedFarms[0].id);
        if (loadedFarms[0].fields?.length > 0) {
          setSelectedFieldId(loadedFarms[0].fields[0].id);
          if (loadedFarms[0].fields[0].crops?.length > 0) {
            setSelectedCropId(loadedFarms[0].fields[0].crops[0].id);
          }
        }
      }
    } catch (err) {
      console.error(err);
      setError('Could not load farm data');
    } finally {
      setLoading(false);
    }
  };

  const handleFarmChange = (e) => {
    const fId = e.target.value;
    setSelectedFarmId(fId);
    const farm = farms.find((f) => f.id === fId);
    if (farm?.fields?.length > 0) {
      setSelectedFieldId(farm.fields[0].id);
      setSelectedCropId(farm.fields[0].crops?.[0]?.id || '');
    } else {
      setSelectedFieldId('');
      setSelectedCropId('');
    }
  };

  const handleFieldChange = (e) => {
    const fldId = e.target.value;
    setSelectedFieldId(fldId);
    const farm = farms.find((f) => f.id === selectedFarmId);
    const field = farm?.fields?.find((f) => f.id === fldId);
    setSelectedCropId(field?.crops?.[0]?.id || '');
  };

  const togglePart = (part) => {
    if (affectedParts.includes(part)) {
      if (affectedParts.length > 1) {
        setAffectedParts(affectedParts.filter((p) => p !== part));
      }
    } else {
      setAffectedParts([...affectedParts, part]);
    }
  };

  // Workshop Preset Loader
  const loadWorkshopSample = () => {
    setSymptomDescription('Yellow leaf spots on flowering tomatoes with concentric dark rings, lower leaves showing chlorosis and leaf drop.');
    setAffectedParts(['Leaves', 'Stem / Vine']);
    setSpreadPattern('patches');
    setWeatherContext('High humidity and frequent morning dew');
    setSoilMoisture('optimal');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedCropId || !selectedFieldId) {
      setError('Please select or create an active crop and field before submitting diagnosis.');
      return;
    }

    if (symptomDescription.trim().length < 5) {
      setError('Please provide at least 5 characters describing the plant symptoms.');
      return;
    }

    const currentFarm = farms.find((f) => f.id === selectedFarmId);
    const currentField = currentFarm?.fields?.find((f) => f.id === selectedFieldId);
    const currentCrop = currentField?.crops?.find((c) => c.id === selectedCropId);

    setSubmitting(true);
    try {
      const payload = {
        cropId: selectedCropId,
        fieldId: selectedFieldId,
        symptomDescription,
        affectedParts,
        spreadPattern,
        weatherContext,
        soilMoisture,
        cropDetails: {
          cropName: currentCrop?.crop_name || 'Crop',
          variety: currentCrop?.variety || 'General',
          growthStage: currentCrop?.growth_stage || 'vegetative',
          plantingDate: currentCrop?.planting_date || '',
          soilType: currentField?.soil_type || 'Loam',
          soilPh: currentField?.soil_ph || 6.5,
          irrigationSystem: currentField?.irrigation_system || 'drip'
        }
      };

      const result = await api.analyzeCrop(payload);
      if (result.success && result.data?.id) {
        navigate(`/advisor/${result.data.id}`);
      } else {
        throw new Error('Failed to generate diagnostic report');
      }
    } catch (err) {
      setError(err.message || 'Diagnostic generation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const activeFarm = farms.find((f) => f.id === selectedFarmId);
  const activeField = activeFarm?.fields?.find((f) => f.id === selectedFieldId);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-stone-900">AI Crop Health Advisor</h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
              Gemini 2.5 Flash
            </span>
          </div>
          <p className="text-sm text-stone-500 mt-1">
            Submit observed plant symptoms to generate organic remediation & measured chemical protocols.
          </p>
        </div>

        <button
          type="button"
          onClick={loadWorkshopSample}
          className="self-start sm:self-auto px-3.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold hover:bg-emerald-100 transition flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Load Workshop Demo Sample
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
        {/* 1. Target Crop & Location */}
        <div>
          <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Sprout className="w-4 h-4 text-emerald-600" />
            1. Select Target Crop & Plot
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Target Farm</label>
              <select
                value={selectedFarmId}
                onChange={handleFarmChange}
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg"
              >
                {farms.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Field Plot</label>
              <select
                value={selectedFieldId}
                onChange={handleFieldChange}
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg"
              >
                {activeFarm?.fields?.map((fld) => (
                  <option key={fld.id} value={fld.id}>{fld.name} ({fld.soil_type})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Active Crop</label>
              <select
                value={selectedCropId}
                onChange={(e) => setSelectedCropId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg"
              >
                {activeField?.crops?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.crop_name} ({c.growth_stage})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 2. Symptom Observations */}
        <div>
          <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            2. Observed Symptoms & Morphological Signs
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Detailed Symptom Description *
              </label>
              <textarea
                required
                rows={3}
                value={symptomDescription}
                onChange={(e) => setSymptomDescription(e.target.value)}
                placeholder="e.g., Yellow leaf spots on flowering tomatoes with concentric rings on lower leaves..."
                className="w-full p-3 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
              <p className="text-[11px] text-stone-400 mt-1">
                Include lesion color, texture (powdery, water-soaked, necrotic), and whether older or younger leaves are affected.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-2">
                Affected Plant Anatomy (Select all that apply)
              </label>
              <div className="flex flex-wrap gap-2">
                {PLANT_PARTS.map((part) => {
                  const active = affectedParts.includes(part);
                  return (
                    <button
                      key={part}
                      type="button"
                      onClick={() => togglePart(part)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition flex items-center gap-1.5 ${
                        active
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {active && <Check className="w-3 h-3" />}
                      {part}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Field Microclimate & Spread */}
        <div>
          <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-3 flex items-center gap-2">
            <CloudSun className="w-4 h-4 text-emerald-600" />
            3. Environmental & Field Context
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Spread Pattern</label>
              <select
                value={spreadPattern}
                onChange={(e) => setSpreadPattern(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg"
              >
                <option value="isolated">Isolated (Few random plants)</option>
                <option value="patches">Patches (Clusters across rows)</option>
                <option value="uniform">Uniform (Widespread field infection)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Soil Moisture</label>
              <select
                value={soilMoisture}
                onChange={(e) => setSoilMoisture(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg"
              >
                <option value="optimal">Optimal / Balanced</option>
                <option value="dry">Dry / Soil Cracking</option>
                <option value="waterlogged">Waterlogged / Saturated</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Recent Weather Event</label>
              <input
                value={weatherContext}
                onChange={(e) => setWeatherContext(e.target.value)}
                placeholder="e.g. Heavy rainfall, high heat..."
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        <DisclaimerBox />

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Synthesizing Agronomic Protocol...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Run AI Diagnosis & Treatment Plan
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
