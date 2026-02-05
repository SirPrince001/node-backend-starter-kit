// scripts/copy-templates.js
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const src = path.join(__dirname, "../src/templates");
const dest = path.join(__dirname, "../templates"); 

fs.copySync(src, dest, { overwrite: true });
console.log(`Templates copied to → ${dest}`);
