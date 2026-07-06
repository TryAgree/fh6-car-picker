import carsJson from "../../data/cars.json";
import metaJson from "../../data/meta.json";
import recommendationsJson from "../../data/recommendations.json";
import { CarSchema, MetaSchema, RecommendationSchema } from "../types";

export const cars = CarSchema.array().parse(carsJson);
export const recommendations = RecommendationSchema.array().parse(recommendationsJson);
export const meta = MetaSchema.parse(metaJson);

const carsById = new Map(cars.map((c) => [c.id, c]));

export function getCar(carId: string) {
  return carsById.get(carId);
}
