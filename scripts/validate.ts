/** npm run validate — zod schema check + referential integrity over data/*.json */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CarSchema, MetaSchema, RecommendationSchema } from "../src/types";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, "..", "data");

function readJson(file: string): unknown {
  return JSON.parse(readFileSync(path.join(dataDir, file), "utf-8"));
}

function main() {
  const errors: string[] = [];

  const carsRaw = readJson("cars.json");
  const recsRaw = readJson("recommendations.json");
  const metaRaw = readJson("meta.json");

  if (!Array.isArray(carsRaw)) throw new Error("cars.json must be an array");
  if (!Array.isArray(recsRaw)) throw new Error("recommendations.json must be an array");

  const cars = carsRaw.flatMap((c, i) => {
    const r = CarSchema.safeParse(c);
    if (!r.success) {
      errors.push(`cars.json[${i}]: ${r.error.message}`);
      return [];
    }
    return [r.data];
  });

  const recommendations = recsRaw.flatMap((rec, i) => {
    const r = RecommendationSchema.safeParse(rec);
    if (!r.success) {
      errors.push(`recommendations.json[${i}]: ${r.error.message}`);
      return [];
    }
    return [r.data];
  });

  const metaResult = MetaSchema.safeParse(metaRaw);
  if (!metaResult.success) {
    errors.push(`meta.json: ${metaResult.error.message}`);
  }

  const carIds = new Set(cars.map((c) => c.id));
  for (const rec of recommendations) {
    if (!carIds.has(rec.carId)) {
      errors.push(
        `recommendations.json: ${rec.discipline}/${rec.class}/rank${rec.rank} references unknown carId "${rec.carId}"`,
      );
    }
  }

  if (errors.length > 0) {
    console.error(`validate: ${errors.length} error(s)\n`);
    for (const e of errors) console.error(" -", e);
    process.exit(1);
  }

  console.log(`validate: OK — ${cars.length} cars, ${recommendations.length} recommendations`);
}

main();
