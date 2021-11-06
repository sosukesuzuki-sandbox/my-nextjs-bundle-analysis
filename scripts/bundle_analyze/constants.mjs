import path from "node:path";
import url from "node:url";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR_PATH = path.join(__dirname, "../..");

export const NEXT_DIR_PATH = path.join(ROOT_DIR_PATH, ".next");
export const ANALYZE_DIR_PATH = path.join(NEXT_DIR_PATH, "analyze");
export const ANALYZE_BASE_BUNDLE_DIR_PATH = path.join(
  ANALYZE_DIR_PATH,
  "base",
  "bundle"
);
export const BUILD_MANIFEST_PATH = path.join(
  NEXT_DIR_PATH,
  "build-manifest.json"
);
export const BUNDLE_ANALYSIS_PATH = path.join(
  ANALYZE_DIR_PATH,
  "__bundle_analysis.json"
);
export const BASE_BUNDLE_ANALYSIS_PATH = path.join(
  ANALYZE_BASE_BUNDLE_DIR_PATH,
  "__bundle_analysis.json"
);
export const ANALYZE_COMMENT_TXT_PATH = path.join(
  ANALYZE_DIR_PATH,
  "__bundle_analysis_comment.txt"
);
