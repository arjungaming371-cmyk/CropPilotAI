-- CropPilotAI - Initial Supabase Cloud PostgreSQL Schema
-- Migration: 001_initial_schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (Farmers/Users linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL DEFAULT 'Farmer',
    organization_name TEXT,
    phone_number TEXT,
    preferred_language TEXT DEFAULT 'en',
    unit_system TEXT DEFAULT 'metric' CHECK (unit_system IN ('metric', 'imperial')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. FARMS
CREATE TABLE IF NOT EXISTS public.farms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    location_description TEXT,
    climate_zone TEXT,
    total_area NUMERIC(10, 2),
    area_unit TEXT DEFAULT 'hectares' CHECK (area_unit IN ('hectares', 'acres')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. FIELDS
CREATE TABLE IF NOT EXISTS public.fields (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    soil_type TEXT NOT NULL,
    soil_ph NUMERIC(3, 1),
    irrigation_system TEXT DEFAULT 'rainfed' CHECK (irrigation_system IN ('drip', 'sprinkler', 'rainfed', 'flood', 'subsurface')),
    area NUMERIC(10, 2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CROPS
CREATE TABLE IF NOT EXISTS public.crops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE CASCADE,
    crop_name TEXT NOT NULL,
    variety TEXT,
    planting_date DATE NOT NULL,
    estimated_harvest_date DATE,
    growth_stage TEXT NOT NULL CHECK (growth_stage IN ('seedling', 'vegetative', 'flowering', 'fruiting', 'maturity', 'harvested')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'harvested', 'failed', 'fallow')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ADVISORIES (AI Diagnoses & Recommendations)
CREATE TABLE IF NOT EXISTS public.advisories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    crop_id UUID NOT NULL REFERENCES public.crops(id) ON DELETE CASCADE,
    field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE CASCADE,
    symptom_description TEXT NOT NULL,
    affected_parts TEXT[] NOT NULL,
    spread_pattern TEXT,
    weather_context TEXT,
    
    -- AI Generated Structured Insights
    diagnosis_title TEXT NOT NULL,
    pathogen_or_cause TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('fungal', 'bacterial', 'viral', 'pest', 'nutrient_deficiency', 'abiotic_stress', 'unknown')),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'moderate', 'severe', 'critical')),
    confidence_score NUMERIC(3, 2),
    analysis_summary TEXT NOT NULL,
    immediate_actions JSONB NOT NULL DEFAULT '[]'::jsonb,
    organic_treatments JSONB NOT NULL DEFAULT '[]'::jsonb,
    chemical_treatments JSONB NOT NULL DEFAULT '[]'::jsonb,
    preventative_measures JSONB NOT NULL DEFAULT '[]'::jsonb,
    safety_disclaimer TEXT NOT NULL,
    
    -- Status & Resolution Tracking
    resolution_status TEXT DEFAULT 'pending' CHECK (resolution_status IN ('pending', 'in_progress', 'resolved', 'dismissed')),
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Automatic profile trigger on Supabase Auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name)
    VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', 'Farmer'))
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advisories ENABLE ROW LEVEL SECURITY;

-- 1. Profiles RLS
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Farms RLS
DROP POLICY IF EXISTS "Users manage own farms" ON public.farms;
CREATE POLICY "Users manage own farms" ON public.farms
    FOR ALL USING (auth.uid() = user_id);

-- 3. Fields RLS
DROP POLICY IF EXISTS "Users manage own fields" ON public.fields;
CREATE POLICY "Users manage own fields" ON public.fields
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.farms 
            WHERE farms.id = fields.farm_id 
              AND farms.user_id = auth.uid()
        )
    );

-- 4. Crops RLS
DROP POLICY IF EXISTS "Users manage own crops" ON public.crops;
CREATE POLICY "Users manage own crops" ON public.crops
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.fields 
            JOIN public.farms ON farms.id = fields.farm_id 
            WHERE fields.id = crops.field_id 
              AND farms.user_id = auth.uid()
        )
    );

-- 5. Advisories RLS
DROP POLICY IF EXISTS "Users manage own advisories" ON public.advisories;
CREATE POLICY "Users manage own advisories" ON public.advisories
    FOR ALL USING (auth.uid() = user_id);
