/**
 * One-time import: adolphin8/fh6-tier-list (MIT) forza/seed.py -> data/*.json
 *
 * Kept in the repo for traceability. Re-run after refreshing
 * scripts/vendor/fh6-tier-list-seed.py from upstream.
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CarSchema, RecommendationSchema, type Meta } from "../src/types";
import { buildCars, buildRecommendations, type SeedCarEntry, type SeedCodeSources, type SeedTuneCode } from "./lib/transform";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

interface DumpedSeed {
  meta: { last_updated: string };
  cars: SeedCarEntry[];
  tune_codes: SeedTuneCode[];
  code_sources: SeedCodeSources;
}

function dumpSeed(): DumpedSeed {
  const candidates = ["py", "python3", "python"];
  for (const cmd of candidates) {
    const result = spawnSync(cmd, [path.join(root, "scripts/vendor/dump_seed.py")], {
      cwd: root,
      encoding: "utf-8",
    });
    if (result.status === 0 && result.stdout.trim().length > 0) {
      return JSON.parse(result.stdout);
    }
  }
  throw new Error(
    `Could not run scripts/vendor/dump_seed.py with any of: ${candidates.join(", ")}. Is Python 3 installed and on PATH?`,
  );
}

function main() {
  const dumped = dumpSeed();

  const cars = buildCars(dumped.cars);
  const recommendations = buildRecommendations(
    dumped.cars,
    dumped.tune_codes,
    dumped.code_sources,
    dumped.meta.last_updated,
  );

  const carErrors = cars.flatMap((c) => {
    const r = CarSchema.safeParse(c);
    return r.success ? [] : [`Car ${c.id}: ${r.error.message}`];
  });
  const recErrors = recommendations.flatMap((r, i) => {
    const parsed = RecommendationSchema.safeParse(r);
    return parsed.success ? [] : [`Recommendation[${i}] (${r.discipline}/${r.class}/${r.carId}): ${parsed.error.message}`];
  });
  if (carErrors.length || recErrors.length) {
    console.error("Import produced invalid records, aborting without writing files:\n");
    for (const e of [...carErrors, ...recErrors]) console.error(" -", e);
    process.exit(1);
  }

  const carIds = new Set(cars.map((c) => c.id));
  const orphanRefs = recommendations.filter((r) => !carIds.has(r.carId));
  if (orphanRefs.length) {
    console.error("Recommendations reference unknown carId, aborting without writing files:\n");
    for (const r of orphanRefs) console.error(` - ${r.discipline}/${r.class}/rank${r.rank} -> carId "${r.carId}"`);
    process.exit(1);
  }

  const meta: Meta = {
    version: "1",
    updatedAt: dumped.meta.last_updated,
    sourceRepo: "https://github.com/adolphin8/fh6-tier-list",
    license: "MIT",
    sources: [
      "PC Gamer",
      "Game8",
      "Dexerto",
      "grindout",
      "gamingpromax",
      "Switchblade",
      "IGN",
      "fh6guide",
      "fandomwire",
      "forza.guide",
      "GAMES.gg",
      "skycoach",
      "forzatune.com",
      "JSR Chronic tune sheet (Forza Forums)",
    ],
    lastVerifiedAt: new Date().toISOString().slice(0, 10),
  };

  const dataDir = path.join(root, "data");
  mkdirSync(dataDir, { recursive: true });
  writeFileSync(path.join(dataDir, "cars.json"), JSON.stringify(cars, null, 2) + "\n");
  writeFileSync(path.join(dataDir, "recommendations.json"), JSON.stringify(recommendations, null, 2) + "\n");
  writeFileSync(path.join(dataDir, "meta.json"), JSON.stringify(meta, null, 2) + "\n");

  console.log(`Wrote ${cars.length} cars and ${recommendations.length} recommendations to data/`);
}

main();
