import fs from "node:fs/promises";
import { createRequire } from "node:module";
import {
  NEXT_DIR_PATH,
  BUILD_MANIFEST_PATH,
  ANALYZE_DIR_PATH,
  BUNDLE_ANALYSIS_PATH,
} from "./paths.mjs";

const require = createRequire(import.meta.url);

const { getJsPageSizeInKb } = require("next/dist/build/utils");

const buildManifest = JSON.parse(await fs.readFile(BUILD_MANIFEST_PATH));

const pages = Object.keys(buildManifest.pages);

const result = {};
for (const page of pages) {
  const [self, all] = await getJsPageSizeInKb(
    page,
    NEXT_DIR_PATH,
    buildManifest
  );
  result[page] = { self, all };
}
const data = JSON.stringify(result);
try {
  await fs.mkdir(ANALYZE_DIR_PATH);
} catch {
  // do nothing
}
await fs.writeFile(BUNDLE_ANALYSIS_PATH, data);
