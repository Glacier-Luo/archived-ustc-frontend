import { mkdir, writeFile, rm } from "fs/promises";
import { join } from "path";

const BASE_URL = process.env.ARCHIVE_URL ?? "http://localhost:10010/service/archive";
const OUT_DIR = join(import.meta.dir, "../src/archive/data");

const ENDPOINTS: Record<string, string> = {
  "game_info.json": "gameInfoData.js",
  "boards.json": "boardsData.js",
  "misc.json": "miscData.js",
  "templates.json": "templatesData.js",
  "area_detail.json": "areaDetailData.js",
  "puzzle_hints.json": "puzzleHints.js",
  "puzzle_list.json": "puzzleList.js",
  "puzzle_triggers.json": "puzzleTriggers.js",
  "story_list.json": "storyList.js",
};

function toJS(data: unknown): string {
  return `const data = ${JSON.stringify(data, null, 2)};\n\nexport default data;\n`;
}

async function fetchJSON(endpoint: string) {
  const url = `${BASE_URL}/${endpoint}`;
  console.log(`Fetching ${url}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} returned ${res.status}`);
  return res.json();
}

async function main() {
  // fetch all endpoints in parallel
  const entries = Object.entries(ENDPOINTS);
  const results = await Promise.all(entries.map(([ep]) => fetchJSON(ep)));

  // write regular data files
  for (let i = 0; i < entries.length; i++) {
    const outPath = join(OUT_DIR, entries[i][1]);
    await writeFile(outPath, toJS(results[i]));
    console.log(`Wrote ${entries[i][1]}`);
  }

  // fetch and split puzzle_details
  const details: Record<string, unknown> = await fetchJSON("puzzle_details.json");
  const detailDir = join(OUT_DIR, "puzzle_details");
  await rm(detailDir, { recursive: true, force: true });
  await mkdir(detailDir, { recursive: true });

  for (const [key, value] of Object.entries(details)) {
    const outPath = join(detailDir, `${key}.js`);
    await writeFile(outPath, toJS(value));
  }
  console.log(`Wrote ${Object.keys(details).length} puzzle detail files`);

  console.log("Done!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
