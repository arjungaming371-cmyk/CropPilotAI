import { supabaseAdmin } from '../lib/supabaseAdmin.js';
import { z } from 'zod';

// In-memory fallback database for local dev / sandbox mode
const memoryStore = {
  farms: [
    {
      id: 'f1010101-0000-0000-0000-000000000001',
      user_id: '00000000-0000-0000-0000-000000000000',
      name: 'Sunridge Organic Farm',
      location_description: 'Central Valley Plot A',
      climate_zone: 'Semi-Arid Subtropical',
      total_area: 12.5,
      area_unit: 'hectares',
      created_at: new Date().toISOString(),
      fields: [
        {
          id: 'f2020202-0000-0000-0000-000000000001',
          farm_id: 'f1010101-0000-0000-0000-000000000001',
          name: 'North Acre - Greenhouse 1',
          soil_type: 'Loamy',
          soil_ph: 6.4,
          irrigation_system: 'drip',
          area: 2.5,
          crops: [
            {
              id: 'c3030303-0000-0000-0000-000000000001',
              field_id: 'f2020202-0000-0000-0000-000000000001',
              crop_name: 'Tomatoes',
              variety: 'Roma VF',
              planting_date: '2026-08-15',
              estimated_harvest_date: '2026-11-20',
              growth_stage: 'flowering',
              status: 'active'
            }
          ]
        }
      ]
    }
  ]
};

const FarmSchema = z.object({
  name: z.string().min(2, 'Farm name is required'),
  location_description: z.string().optional(),
  climate_zone: z.string().optional(),
  total_area: z.number().positive().optional(),
  area_unit: z.enum(['hectares', 'acres']).default('hectares')
});

const FieldSchema = z.object({
  farm_id: z.string().uuid(),
  name: z.string().min(2, 'Field name is required'),
  soil_type: z.string().min(2, 'Soil type is required'),
  soil_ph: z.number().min(3).max(10).optional(),
  irrigation_system: z.enum(['drip', 'sprinkler', 'rainfed', 'flood', 'subsurface']).default('rainfed'),
  area: z.number().positive().optional()
});

const CropSchema = z.object({
  field_id: z.string().uuid(),
  crop_name: z.string().min(2, 'Crop name is required'),
  variety: z.string().optional(),
  planting_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid YYYY-MM-DD date required'),
  estimated_harvest_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  growth_stage: z.enum(['seedling', 'vegetative', 'flowering', 'fruiting', 'maturity', 'harvested'])
});

export const getFarms = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { data: farms, error } = await supabaseAdmin
        .from('farms')
        .select(`
          *,
          fields:fields (
            *,
            crops:crops (*)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return res.json({ success: true, data: farms });
    }

    // Fallback in-memory
    const userFarms = memoryStore.farms.filter(f => f.user_id === userId || userId === '00000000-0000-0000-0000-000000000000');
    return res.json({ success: true, data: userFarms });
  } catch (err) {
    next(err);
  }
};

export const createFarm = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const validated = FarmSchema.parse(req.body);

    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { data, error } = await supabaseAdmin
        .from('farms')
        .insert([{ ...validated, user_id: userId }])
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json({ success: true, data });
    }

    // Fallback
    const newFarm = {
      id: crypto.randomUUID(),
      user_id: userId || '00000000-0000-0000-0000-000000000000',
      ...validated,
      fields: [],
      created_at: new Date().toISOString()
    };
    memoryStore.farms.unshift(newFarm);
    return res.status(201).json({ success: true, data: newFarm });
  } catch (err) {
    next(err);
  }
};

export const createField = async (req, res, next) => {
  try {
    const validated = FieldSchema.parse(req.body);

    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { data, error } = await supabaseAdmin
        .from('fields')
        .insert([validated])
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json({ success: true, data });
    }

    // Fallback
    const newField = {
      id: crypto.randomUUID(),
      ...validated,
      crops: [],
      created_at: new Date().toISOString()
    };

    const targetFarm = memoryStore.farms.find(f => f.id === validated.farm_id);
    if (targetFarm) {
      targetFarm.fields = targetFarm.fields || [];
      targetFarm.fields.push(newField);
    }
    return res.status(201).json({ success: true, data: newField });
  } catch (err) {
    next(err);
  }
};

export const createCrop = async (req, res, next) => {
  try {
    const validated = CropSchema.parse(req.body);

    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { data, error } = await supabaseAdmin
        .from('crops')
        .insert([validated])
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json({ success: true, data });
    }

    // Fallback
    const newCrop = {
      id: crypto.randomUUID(),
      ...validated,
      status: 'active',
      created_at: new Date().toISOString()
    };

    for (const farm of memoryStore.farms) {
      const field = farm.fields?.find(f => f.id === validated.field_id);
      if (field) {
        field.crops = field.crops || [];
        field.crops.push(newCrop);
        break;
      }
    }

    return res.status(201).json({ success: true, data: newCrop });
  } catch (err) {
    next(err);
  }
};
