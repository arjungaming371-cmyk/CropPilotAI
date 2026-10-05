import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import {
  Tractor,
  Layers,
  Sprout,
  Plus,
  X,
  Droplet,
  Compass,
  Check,
  AlertCircle
} from 'lucide-react';

export default function FarmsPage() {
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal controls
  const [showFarmModal, setShowFarmModal] = useState(false);
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);

  // Targets for child additions
  const [selectedFarmId, setSelectedFarmId] = useState('');
  const [selectedFieldId, setSelectedFieldId] = useState('');

  // Form states
  const [farmForm, setFarmForm] = useState({ name: '', location_description: '', climate_zone: 'Subtropical', total_area: 10, area_unit: 'hectares' });
  const [fieldForm, setFieldForm] = useState({ name: '', soil_type: 'Loamy', soil_ph: 6.5, irrigation_system: 'drip', area: 2.5 });
  const [cropForm, setCropForm] = useState({
    crop_name: '',
    variety: '',
    planting_date: new Date().toISOString().split('T')[0],
    growth_stage: 'flowering'
  });

  useEffect(() => {
    loadFarms();
  }, []);

  const loadFarms = async () => {
    try {
      setLoading(true);
      const res = await api.getFarms();
      setFarms(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load farms');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFarm = async (e) => {
    e.preventDefault();
    try {
      await api.createFarm({ ...farmForm, total_area: Number(farmForm.total_area) });
      setShowFarmModal(false);
      setFarmForm({ name: '', location_description: '', climate_zone: 'Subtropical', total_area: 10, area_unit: 'hectares' });
      loadFarms();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateField = async (e) => {
    e.preventDefault();
    try {
      await api.createField({
        farm_id: selectedFarmId,
        ...fieldForm,
        soil_ph: Number(fieldForm.soil_ph),
        area: Number(fieldForm.area)
      });
      setShowFieldModal(false);
      loadFarms();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateCrop = async (e) => {
    e.preventDefault();
    try {
      await api.createCrop({
        field_id: selectedFieldId,
        ...cropForm
      });
      setShowCropModal(false);
      loadFarms();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Farm & Crop Registry</h1>
          <p className="text-sm text-stone-500 mt-1">
            Configure your farms, subdivide fields, and monitor ongoing crop cycles.
          </p>
        </div>
        <button
          onClick={() => setShowFarmModal(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-xl shadow-sm transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add New Farm
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-sm text-stone-400">Loading farm configurations...</div>
      ) : farms.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
          <Tractor className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-800">No farms registered yet</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 mb-6">
            Get started by adding your first agricultural property and field plots.
          </p>
          <button
            onClick={() => setShowFarmModal(true)}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Farm
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {farms.map((farm) => (
            <div key={farm.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
              <div className="p-6 bg-stone-50/70 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <Tractor className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-stone-900">{farm.name}</h2>
                    <p className="text-xs text-stone-500">
                      {farm.location_description || 'No location given'} • {farm.total_area} {farm.area_unit}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedFarmId(farm.id);
                    setShowFieldModal(true);
                  }}
                  className="px-3.5 py-1.5 bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-medium rounded-lg transition flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-600" />
                  Add Field Plot
                </button>
              </div>

              {/* Nested Fields */}
              <div className="p-6">
                {!farm.fields || farm.fields.length === 0 ? (
                  <p className="text-xs text-stone-400 italic py-2">
                    No fields configured in this farm yet. Click "Add Field Plot" above.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {farm.fields.map((field) => (
                      <div
                        key={field.id}
                        className="border border-stone-200 rounded-xl p-4 bg-stone-50/30 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                              <Layers className="w-4 h-4 text-stone-500" />
                              {field.name}
                            </h3>
                            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-stone-200/70 text-stone-700">
                              {field.irrigation_system}
                            </span>
                          </div>
                          <p className="text-xs text-stone-500 mb-3">
                            Soil: <span className="font-medium text-stone-700">{field.soil_type}</span> (pH {field.soil_ph || '6.5'}) • {field.area} ha
                          </p>

                          {/* Crops under field */}
                          <div className="space-y-2 mb-3">
                            <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Crops</p>
                            {!field.crops || field.crops.length === 0 ? (
                              <p className="text-[11px] text-stone-400 italic">No crop planted</p>
                            ) : (
                              field.crops.map((crop) => (
                                <div
                                  key={crop.id}
                                  className="flex items-center justify-between p-2 rounded-lg bg-white border border-stone-200/80 text-xs"
                                >
                                  <div className="flex items-center gap-2">
                                    <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                                    <span className="font-semibold text-stone-800">{crop.crop_name}</span>
                                    {crop.variety && <span className="text-stone-400 text-[11px]">({crop.variety})</span>}
                                  </div>
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                                    {crop.growth_stage}
                                  </span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedFieldId(field.id);
                            setShowCropModal(true);
                          }}
                          className="mt-2 text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 self-start"
                        >
                          <Plus className="w-3.5 h-3.5" /> Plant New Crop
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add Farm */}
      {showFarmModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-stone-900">Add New Farm</h3>
              <button onClick={() => setShowFarmModal(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateFarm} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Farm Name *</label>
                <input
                  required
                  value={farmForm.name}
                  onChange={(e) => setFarmForm({ ...farmForm, name: e.target.value })}
                  placeholder="e.g., CropPilot Homestead"
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Location / District</label>
                <input
                  value={farmForm.location_description}
                  onChange={(e) => setFarmForm({ ...farmForm, location_description: e.target.value })}
                  placeholder="e.g., North Valley Sector 4"
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Total Area</label>
                  <input
                    type="number"
                    step="0.1"
                    value={farmForm.total_area}
                    onChange={(e) => setFarmForm({ ...farmForm, total_area: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Unit</label>
                  <select
                    value={farmForm.area_unit}
                    onChange={(e) => setFarmForm({ ...farmForm, area_unit: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg"
                  >
                    <option value="hectares">Hectares</option>
                    <option value="acres">Acres</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowFarmModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                  Save Farm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Field */}
      {showFieldModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-stone-900">Add Field Plot</h3>
              <button onClick={() => setShowFieldModal(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateField} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Field Plot Name *</label>
                <input
                  required
                  value={fieldForm.name}
                  onChange={(e) => setFieldForm({ ...fieldForm, name: e.target.value })}
                  placeholder="e.g., East Sector - Drip Bed 1"
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Soil Type</label>
                  <select
                    value={fieldForm.soil_type}
                    onChange={(e) => setFieldForm({ ...fieldForm, soil_type: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg"
                  >
                    <option value="Loamy">Loamy</option>
                    <option value="Clay">Clay</option>
                    <option value="Sandy">Sandy</option>
                    <option value="Silt">Silt</option>
                    <option value="Peaty">Peaty</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Soil pH</label>
                  <input
                    type="number"
                    step="0.1"
                    value={fieldForm.soil_ph}
                    onChange={(e) => setFieldForm({ ...fieldForm, soil_ph: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Irrigation System</label>
                <select
                  value={fieldForm.irrigation_system}
                  onChange={(e) => setFieldForm({ ...fieldForm, irrigation_system: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg"
                >
                  <option value="drip">Drip Irrigation</option>
                  <option value="sprinkler">Sprinkler System</option>
                  <option value="rainfed">Rainfed</option>
                  <option value="flood">Flood / Furrow</option>
                  <option value="subsurface">Subsurface Drip</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowFieldModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                  Save Field
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Crop */}
      {showCropModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-stone-900">Plant / Register Crop</h3>
              <button onClick={() => setShowCropModal(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateCrop} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Crop Name *</label>
                <input
                  required
                  value={cropForm.crop_name}
                  onChange={(e) => setCropForm({ ...cropForm, crop_name: e.target.value })}
                  placeholder="e.g., Tomato, Wheat, Maize, Cotton"
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Variety / Cultivar</label>
                <input
                  value={cropForm.variety}
                  onChange={(e) => setCropForm({ ...cropForm, variety: e.target.value })}
                  placeholder="e.g., Roma VF, HD-2967"
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Planting Date</label>
                  <input
                    type="date"
                    required
                    value={cropForm.planting_date}
                    onChange={(e) => setCropForm({ ...cropForm, planting_date: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Growth Stage</label>
                  <select
                    value={cropForm.growth_stage}
                    onChange={(e) => setCropForm({ ...cropForm, growth_stage: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg"
                  >
                    <option value="seedling">Seedling</option>
                    <option value="vegetative">Vegetative</option>
                    <option value="flowering">Flowering</option>
                    <option value="fruiting">Fruiting</option>
                    <option value="maturity">Maturity</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCropModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                  Register Crop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
