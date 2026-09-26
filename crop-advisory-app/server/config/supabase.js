import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

export const isLiveSupabase = Boolean(
  supabaseUrl && 
  supabaseKey && 
  supabaseUrl !== 'https://your-supabase-project.supabase.co' &&
  !supabaseUrl.includes('placeholder')
);

export const supabase = isLiveSupabase
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

if (isLiveSupabase) {
  console.log('✅ Supabase connected with Service Role access.');
} else {
  console.log('ℹ️ Running in Local In-Memory Demo Mode for Supabase data operations.');
}

// In-Memory Data Store for immediate zero-config execution
export const memoryStore = {
  profiles: new Map([
    ['demo-user-id', {
      id: 'demo-user-id',
      email: 'farmer@greenfields.org',
      full_name: 'Dr. Sarah Jenkins',
      role: 'farmer',
      created_at: new Date().toISOString()
    }]
  ]),
  farms: new Map([
    ['farm-1', {
      id: 'farm-1',
      user_id: 'demo-user-id',
      name: 'North Valley Orchard',
      location: 'Salinas Valley, CA',
      size_acres: 45.5,
      soil_type: 'Clay Loam (pH 6.5)',
      created_at: new Date(Date.now() - 86400000 * 5).toISOString()
    }],
    ['farm-2', {
      id: 'farm-2',
      user_id: 'demo-user-id',
      name: 'Highland Grain Terrace',
      location: 'Columbia Basin, WA',
      size_acres: 120.0,
      soil_type: 'Silt Loam (pH 7.0)',
      created_at: new Date(Date.now() - 86400000 * 12).toISOString()
    }]
  ]),
  advisories: new Map([
    ['adv-1', {
      id: 'adv-1',
      farm_id: 'farm-1',
      user_id: 'demo-user-id',
      crop_type: 'Tomatoes',
      growth_stage: 'Flowering',
      symptom_description: 'Dark water-soaked lesions appearing on lower leaves with pale white fungal halo underneath.',
      image_url: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985b?auto=format&fit=crop&w=600&q=80',
      diagnosis_json: {
        primaryDiagnosis: 'Late Blight (Phytophthora infestans)',
        confidenceScore: 94.5,
        urgency: 'high',
        symptomAnalysis: 'Water-soaked irregular dark spots rapidly expanding from lower foliage margin. Abaxial sporangiophores visible.',
        treatmentPlan: {
          organic: [
            'Immediate removal and sanitization of heavily infested lower leaves.',
            'Apply bio-fungicide containing Bacillus subtilis strain QST 713 every 5 days.',
            'Spray copper hydroxide solution during dry morning hours.'
          ],
          chemical: [
            'Apply systemic fungicide (e.g. Mandipropamid or Cymoxanil tank-mix).',
            'Rotate FRAC group 40 and group 11 fungicides to prevent pathogen resistance.'
          ],
          preventativeMeasures: [
            'Transition from overhead sprinklers to drip irrigation to keep canopy dry.',
            'Increase plant spacing to 36 inches to improve internal airflow.'
          ]
        },
        yieldImpactForecast: 'Untreated progression could cause 60-80% total fruit loss within 10-14 days under high humidity conditions.'
      },
      urgency: 'high',
      status: 'monitoring',
      created_at: new Date(Date.now() - 86400000 * 2).toISOString()
    }]
  ])
};
