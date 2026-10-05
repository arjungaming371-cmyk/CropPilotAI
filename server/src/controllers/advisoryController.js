import { supabaseAdmin } from '../lib/supabaseAdmin.js';
import { generateCropAdvisory } from '../services/geminiService.js';
import { z } from 'zod';

const memoryAdvisories = [];

const AnalyzeRequestSchema = z.object({
  cropId: z.string().uuid().or(z.string()),
  fieldId: z.string().uuid().or(z.string()),
  symptomDescription: z.string().min(5, 'Please provide more details on symptoms'),
  affectedParts: z.array(z.string()).min(1, 'Select at least one plant part'),
  spreadPattern: z.string().default('patches'),
  weatherContext: z.string().optional(),
  soilMoisture: z.string().optional(),
  cropDetails: z.object({
    cropName: z.string().optional(),
    variety: z.string().optional(),
    growthStage: z.string().optional(),
    plantingDate: z.string().optional(),
    soilType: z.string().optional(),
    soilPh: z.any().optional(),
    irrigationSystem: z.string().optional()
  }).optional()
});

const StatusUpdateSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'resolved', 'dismissed']),
  resolutionNotes: z.string().max(2000).optional()
});

export const analyzeSymptoms = async (req, res, next) => {
  try {
    const userId = req.user?.id || '00000000-0000-0000-0000-000000000000';
    const validated = AnalyzeRequestSchema.parse(req.body);

    const cropInfo = validated.cropDetails || {};

    // 1. Generate diagnosis with Gemini
    const aiResult = await generateCropAdvisory({
      cropName: cropInfo.cropName,
      variety: cropInfo.variety,
      growthStage: cropInfo.growthStage,
      plantingDate: cropInfo.plantingDate,
      soilType: cropInfo.soilType,
      soilPh: cropInfo.soilPh,
      irrigationSystem: cropInfo.irrigationSystem,
      weatherContext: validated.weatherContext,
      soilMoisture: validated.soilMoisture,
      symptomDescription: validated.symptomDescription,
      affectedParts: validated.affectedParts,
      spreadPattern: validated.spreadPattern
    });

    const advisoryPayload = {
      user_id: userId,
      crop_id: validated.cropId,
      field_id: validated.fieldId,
      symptom_description: validated.symptomDescription,
      affected_parts: validated.affectedParts,
      spread_pattern: validated.spreadPattern,
      weather_context: validated.weatherContext || '',
      diagnosis_title: aiResult.diagnosisTitle,
      pathogen_or_cause: aiResult.pathogenOrCause,
      category: aiResult.category || 'unknown',
      severity: aiResult.severity || 'moderate',
      confidence_score: aiResult.confidenceScore || 0.9,
      analysis_summary: aiResult.analysisSummary,
      immediate_actions: aiResult.immediateActions || [],
      organic_treatments: aiResult.organicTreatments || [],
      chemical_treatments: aiResult.chemicalTreatments || [],
      preventative_measures: aiResult.preventativeMeasures || [],
      safety_disclaimer: aiResult.safetyDisclaimer,
      resolution_status: 'pending',
      created_at: new Date().toISOString()
    };

    // 2. Persist to Supabase if configured
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { data, error } = await supabaseAdmin
        .from('advisories')
        .insert([advisoryPayload])
        .select()
        .single();

      if (!error && data) {
        return res.status(201).json({ success: true, data });
      }
      console.warn('Supabase advisory insert warning:', error?.message);
    }

    // Fallback store
    const fallbackRecord = {
      id: crypto.randomUUID(),
      ...advisoryPayload
    };
    memoryAdvisories.unshift(fallbackRecord);

    return res.status(201).json({ success: true, data: fallbackRecord });
  } catch (err) {
    next(err);
  }
};

export const getAdvisories = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      let query = supabaseAdmin
        .from('advisories')
        .select(`
          *,
          crop:crops (crop_name, variety, growth_stage),
          field:fields (name, soil_type)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (req.query.severity) {
        query = query.eq('severity', req.query.severity);
      }
      if (req.query.status) {
        query = query.eq('resolution_status', req.query.status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return res.json({ success: true, data });
    }

    // Fallback
    let list = memoryAdvisories.filter(a => a.user_id === userId || userId === '00000000-0000-0000-0000-000000000000');
    if (req.query.severity) {
      list = list.filter(a => a.severity === req.query.severity);
    }
    return res.json({ success: true, data: list });
  } catch (err) {
    next(err);
  }
};

export const getAdvisoryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { data, error } = await supabaseAdmin
        .from('advisories')
        .select(`
          *,
          crop:crops (*),
          field:fields (*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return res.json({ success: true, data });
    }

    const found = memoryAdvisories.find(a => a.id === id);
    if (!found) {
      return res.status(404).json({ success: false, error: 'Advisory not found' });
    }
    return res.json({ success: true, data: found });
  } catch (err) {
    next(err);
  }
};

export const updateAdvisoryStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const validated = StatusUpdateSchema.parse(req.body);

    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { data, error } = await supabaseAdmin
        .from('advisories')
        .update({
          resolution_status: validated.status,
          resolution_notes: validated.resolutionNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return res.json({ success: true, data });
    }

    const target = memoryAdvisories.find(a => a.id === id);
    if (!target) {
      return res.status(404).json({ success: false, error: 'Advisory record not found' });
    }
    target.resolution_status = validated.status;
    if (validated.resolutionNotes !== undefined) {
      target.resolution_notes = validated.resolutionNotes;
    }
    return res.json({ success: true, data: target });
  } catch (err) {
    next(err);
  }
};
