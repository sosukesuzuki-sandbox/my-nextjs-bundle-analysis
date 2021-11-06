import fs from "node:fs/promises";
import prettyBytes from "pretty-bytes";
import {
  BUNDLE_ANALYSIS_PATH,
  BASE_BUNDLE_ANALYSIS_PATH,
  ANALYZE_COMMENT_TXT_PATH,
} from "./constants.mjs";

const currentBundle = JSON.parse(
  await fs.readFile(BUNDLE_ANALYSIS_PATH, "utf-8")
);
const baseBundle = JSON.parse(
  await fs.readFile(BASE_BUNDLE_ANALYSIS_PATH, "utf-8")
);

const difference = {};
for (const [page, { self, all }] of Object.entries(currentBundle)) {
  const { self: baseSelf, all: baseAll } = baseBundle[page];
  if (self === baseSelf && all === baseAll) {
    continue;
  }
  delete currentBundle[page];
  difference[page] = {
    self: {
      diff: self - baseSelf,
      size: self,
    },
    all: {
      diff: all - baseAll,
      size: all,
    },
  };
}

let textData = "<!-- __NEXTJS_BUNDLE -->\n";
textData += "# バンドルサイズ\n\n";
textData += "## 差があったページ\n\n";
textData +=
  Object.keys(difference).length === 0
    ? "なし\n"
    : printTable(difference, true);
textData += "\n";
textData += "## その他のページ\n\n";
if (Object.keys(currentBundle).length === 0) {
  textData += "なし\n";
} else {
  textData += "<details><summary>詳細</summary>\n\n";
  textData += printTable(currentBundle);
  textData += "\n";
  textData += "</details>\n";
}

await fs.writeFile(ANALYZE_COMMENT_TXT_PATH, textData);

function printTable(data, isDifferenceTable = false) {
  let tableText = "";
  tableText += "| Page | Size | First Load JS |\n";
  tableText += "|------|------|---------------|\n";
  for (const [page, { self, all }] of Object.entries(data)) {
    tableText += "| `" + page + "` ";
    if (isDifferenceTable) {
      tableText +=
        "| " +
        prettyBytes(self.size) +
        "(" +
        prettyBytes(self.diff, { signed: true }) +
        ")" +
        " ";
      tableText +=
        "| " +
        prettyBytes(all.size) +
        "(" +
        prettyBytes(all.diff, { signed: true }) +
        ")" +
        " |\n";
    } else {
      tableText += "| " + prettyBytes(self) + " ";
      tableText += "| " + prettyBytes(all) + " |\n";
    }
  }
  return tableText;
}
