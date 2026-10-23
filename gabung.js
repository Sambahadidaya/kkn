import fs from "fs";
import path from "path";

const ROOT = "./";
const OUTPUT = "./output/project-context3.md";

const IGNORE = [
    "node_modules",
    ".git",
    "log",
    ".next",
    "dist",
    "build",
    ".vercel",
    ".idea",
    ".vscode",
    "coverage",
    "output"
];

const EXTENSIONS = [
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".json",
    ".css",
    ".scss",
    ".html",
    ".md",
    ".sql"
];

let totalFiles = 0;
let totalFolders = 0;
let totalLines = 0;
let totalCharacters = 0; // 1. Variabel baru untuk total karakter

const toc = [];
const sections = [];

function walk(dir) {
    totalFolders++;

    const entries = fs.readdirSync(dir).sort();

    for (const entry of entries) {

        if (IGNORE.includes(entry))
            continue;

        const full = path.join(dir, entry);

        const stat = fs.statSync(full);

        if (stat.isDirectory()) {
            walk(full);
            continue;
        }

        if (!EXTENSIONS.includes(path.extname(entry)))
            continue;

        totalFiles++;

        const relative = full.replace(/\\/g, "/");

        const code = fs.readFileSync(full, "utf8");

        const lines = code.split("\n").length;
        const chars = code.length; // 2. Hitung jumlah karakter (termasuk spasi & newline)

        totalLines += lines;
        totalCharacters += chars; // 3. Akumulasikan ke total global

        toc.push(`- [${relative}](#${slug(relative)})`);

        sections.push(`
---

# ${relative}

**Size:** ${(stat.size / 1024).toFixed(2)} KB

**Lines:** ${lines}

**Characters:** ${chars.toLocaleString()}

\`\`\`${language(entry)}
${code}
\`\`\`
`);
    }
}

function slug(str) {
    return str
        .toLowerCase()
        .replace(/[^\w]+/g, "-");
}

function language(file) {

    const ext = path.extname(file);

    switch (ext) {
        case ".js":
        case ".jsx":
            return "javascript";

        case ".ts":
        case ".tsx":
            return "typescript";

        case ".css":
            return "css";

        case ".scss":
            return "scss";

        case ".json":
            return "json";

        case ".sql":
            return "sql";

        case ".html":
            return "html";

        case ".md":
            return "markdown";

        default:
            return "";
    }

}

walk(ROOT);

let tree = "";

function makeTree(dir, prefix = "") {

    const entries = fs.readdirSync(dir).sort();

    entries.forEach((entry, index) => {

        if (IGNORE.includes(entry))
            return;

        const full = path.join(dir, entry);

        const last = index === entries.length - 1;

        tree += prefix + (last ? "└── " : "├── ") + entry + "\n";

        if (fs.statSync(full).isDirectory()) {

            makeTree(
                full,
                prefix + (last ? "    " : "│   ")
            );

        }

    });

}

makeTree(ROOT);

const markdown = `# Project Context

Generated:

${new Date().toLocaleString()}

---

# Statistics

| Item | Total |
|------|------:|
|Folders|${totalFolders}|
|Files|${totalFiles}|
|Lines|${totalLines.toLocaleString()}|
|Characters|${totalCharacters.toLocaleString()}|

---

# Directory Tree

\`\`\`text
${tree}
\`\`\`

---

# Table of Contents

${toc.join("\n")}

${sections.join("\n")}
`;

fs.mkdirSync("./output", { recursive: true });

fs.writeFileSync(OUTPUT, markdown);

console.log("=================================");
console.log("Project exported successfully!");
console.log("Output:", OUTPUT);
console.log("=================================");