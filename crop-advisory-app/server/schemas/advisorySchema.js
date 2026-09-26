import { Type } from '@google/genai';
import { z } from 'zod';

// Gemini SDK Response Schema definition
export const advisoryGeminiSchema = {
  type: Type.OBJECT,
  properties: {
    primaryDiagnosis: { 
      type: Type.STRING, 
      description: "Specific botanical/pathological name of the plant disease, deficiency, or pest (e.g. 'Late Blight', 'Nitrogen Chlorosis', 'Spider Mite Infestation')." 
    },
    confidenceScore: { 
      type: Type.NUMBER, 
      description: "Confidence percentage of the diagnosis between 0 and 100." 
    },
    urgency: { 
      type: Type.STRING, 
      enum: ["low", "moderate", "high", "critical"],
      description: "Urgency level reflecting threat to crop health and intervention timeline."
    },
    symptomAnalysis: { 
      type: Type.STRING, 
      description: "Rigorous agronomic breakdown of observed symptoms against typical pathology." 
    },
    treatmentPlan: {
      type: Type.OBJECT,
      properties: {
        organic: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING },
          description: "Eco-friendly, bio-rational, and organic remedies suitable for certified farms."
        },
        chemical: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING },
          description: "Approved targeted chemical treatments, active ingredients, and rotational strategies."
        },
        preventativeMeasures: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING },
          description: "Long-term cultural and mechanical controls (e.g. soil drainage, rotation, pruning)."
        }
      },
      required: ["organic", "chemical", "preventativeMeasures"]
    },
    yieldImpactForecast: { 
      type: Type.STRING, 
      description: "Expected percentage loss or harvest consequence if no action is taken." 
    }
  },
  required: [
    "primaryDiagnosis", 
    "confidenceScore", 
    "urgency", 
    "symptomAnalysis", 
    "treatmentPlan", 
    "yieldImpactForecast"
  ]
};

// Zod Runtime Validation Schema for AI Output
export const advisoryResponseSchema = z.object({
  primaryDiagnosis: z.string().min(1, "Primary diagnosis is required"),
  confidenceScore: z.number().min(0).max(100),
  urgency: z.enum(["low", "moderate", "high", "critical"]),
  symptomAnalysis: z.string().min(1, "Symptom analysis is required"),
  treatmentPlan: z.object({
    organic: z.array(z.string()).min(1, "At least one organic remedy is required"),
    chemical: z.array(z.string()).min(1, "At least one chemical treatment is required"),
    preventativeMeasures: z.array(z.string()).min(1, "At least one preventative measure is required")
  }),
  yieldImpactForecast: z.string().min(1, "Yield impact forecast is required")
});

// Zod Input Validation Schema for Advisory Creation Request
export const createAdvisoryInputSchema = z.object({
  farm_id: z.string().min(1, "Farm selection is required"),
  crop_type: z.string().min(1, "Crop type is required"),
  growth_stage: z.enum(["Seedling", "Vegetative", "Flowering", "Fruiting", "Harvesting"]),
  symptom_description: z.string().min(5, "Please provide at least 5 characters describing observed symptoms")
});

// Zod Farm Input Schema
export const farmInputSchema = z.object({
  name: z.string().min(2, "Farm name must be at least 2 characters"),
  location: z.string().min(2, "Location is required"),
  size_acres: z.number().positive("Size must be positive").or(z.string().regex(/^\d+(\.\d+)?$/).transform(Number)),
  soil_type: z.string().min(2, "Soil type is required")
});
