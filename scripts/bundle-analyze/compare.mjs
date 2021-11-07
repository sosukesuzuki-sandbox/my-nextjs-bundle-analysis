import fs from "node:fs/promises";
import prettyBytes from "pretty-bytes";
import {
  BUNDLE_ANALYSIS_PATH,
  BASE_BUNDLE_ANALYSIS_PATH,
  ANALYZE_COMMENT_TXT_PATH,
} from "./paths.mjs";
import {
  BUDGET_PERCENT_INCREASE_RED,
  BUDGET_SIZE_NEW_PAGE_RED,
  BUDGET_SIZE_NEW_PAGE_YELLOW,
} from "./budgets.mjs";

const currentBundle = JSON.parse(
  await fs.readFile(BUNDLE_ANALYSIS_PATH, "utf-8")
);
const baseBundle = JSON.parse(
  await fs.readFile(BASE_BUNDLE_ANALYSIS_PATH, "utf-8")
);

const difference = {};
for (const [page, { self, all }] of Object.entries(currentBundle)) {
  const pageFromBaseBundle = baseBundle[page];
  if (pageFromBaseBundle) {
    const { self: baseSelf, all: baseAll } = pageFromBaseBundle;
    if (self === baseSelf && all === baseAll) {
      continue;
    }
    delete currentBundle[page];
    difference[page] = {
      isNew: false,
      self: {
        diff: self - baseSelf,
        size: self,
      },
      all: {
        diff: all - baseAll,
        size: all,
      },
    };
  } else {
    delete currentBundle[page];
    difference[page] = {
      isNew: true,
      self: {
        size: self,
      },
      all: {
        size: all,
      },
    };
  }
}

let textData = "<!-- __NEXTJS_BUNDLE -->\n";
textData += "# バンドルサイズ\n\n";
textData += "## 差があったページ\n\n";
if (Object.keys(difference).length === 0) {
  textData += "なし\n";
} else {
  textData += "<details open><summary>詳細</summary>\n\n";
  textData += printTable(difference, true);
  textData += "\n";
  textData += "</details>\n";
}
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
  for (const [page, { self, all, isNew }] of Object.entries(data)) {
    tableText += "| `" + page + "`";
    if (isNew) {
      tableText += " (New)";
    }
    tableText += " ";
    if (isDifferenceTable) {
      tableText +=
        "| " +
        printSizeWithDiff(self.size, self.diff, isNew, /* isSelf */ true) +
        " ";
      tableText +=
        "| " +
        printSizeWithDiff(all.size, all.diff, isNew, /* isSelf */ false) +
        " |\n";
    } else {
      tableText += "| " + prettyBytes(self) + " ";
      tableText += "| " + prettyBytes(all) + " |\n";
    }
  }
  return tableText;
}

function printSizeWithDiff(size, diff, isNew, isSelf) {
  let res = "";
  res += prettyBytes(size);
  if (!isNew) {
    res +=
      " (" +
      printStatusIndicator(size, diff) +
      "" +
      prettyBytes(diff, { signed: true }) +
      ")";
  } else if (isNew && isSelf && printStatusIndicatorForNewPage(size)) {
    res += " (" + printStatusIndicatorForNewPage(size) + ")";
  }
  return res;
}

function printStatusIndicator(size, diff) {
  const percentageChange = diff / size;
  if (percentageChange >= BUDGET_PERCENT_INCREASE_RED) {
    return " 🔴 ";
  } else if (percentageChange < 0) {
    return " 🟢 ";
  }
  return "";
}

function printStatusIndicatorForNewPage(size) {
  if (
    // 10kb
    size > BUDGET_SIZE_NEW_PAGE_RED
  ) {
    return " 🔴 ";
  } else if (
    // 7kb
    size > BUDGET_SIZE_NEW_PAGE_YELLOW
  ) {
    return " 🟡 ";
  }
  return "";
}
