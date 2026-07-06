import { z } from "zod";

export const ClassSchema = z.enum(["D", "C", "B", "A", "S1", "S2", "R", "X"]);
export type Class = z.infer<typeof ClassSchema>;

export const DisciplineSchema = z.enum([
  "road",
  "street",
  "dirt",
  "xc",
  "touge",
  "drag",
  "drift",
]);
export type Discipline = z.infer<typeof DisciplineSchema>;

export const ConfidenceSchema = z.enum(["Strong", "Moderate", "Tentative"]);
export type Confidence = z.infer<typeof ConfidenceSchema>;

export const SourceRefSchema = z.object({
  name: z.string().min(1),
  url: z.string().url().optional(),
});
export type SourceRef = z.infer<typeof SourceRefSchema>;

export const DerivedInfoSchema = z.object({
  reason: z.enum(["road-street-merged"]),
  note: z.string().min(1),
});
export type DerivedInfo = z.infer<typeof DerivedInfoSchema>;

export const CarSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  year: z.number().int().optional(),
  classes: z.array(ClassSchema).min(1),
  notes: z.string().optional(),
});
export type Car = z.infer<typeof CarSchema>;

export const RecommendationSchema = z.object({
  discipline: DisciplineSchema,
  class: ClassSchema,
  rank: z.number().int().positive(),
  carId: z.string().min(1),
  tuneCode: z.string().optional(),
  tuneSearchHint: z.string().optional(),
  seasonNotes: z.string().optional(),
  source: z.array(SourceRefSchema).min(1),
  updatedAt: z.string(),
  confidence: ConfidenceSchema.optional(),
  acquisition: z.string().optional(),
  priceCr: z.number().nonnegative().optional(),
  strengths: z.array(z.string()).optional(),
  weaknesses: z.array(z.string()).optional(),
  derived: DerivedInfoSchema.optional(),
});
export type Recommendation = z.infer<typeof RecommendationSchema>;

export const MetaSchema = z.object({
  version: z.string().min(1),
  updatedAt: z.string(),
  sourceRepo: z.string().url(),
  license: z.string().min(1),
  sources: z.array(z.string()).min(1),
});
export type Meta = z.infer<typeof MetaSchema>;
