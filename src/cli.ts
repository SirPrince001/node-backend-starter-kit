#!/usr/bin/env node

import { Command } from "commander";
import path from "path";
import fs from "fs-extra";
import { execa } from "execa";
import enquirer from "enquirer";

const { prompt } = enquirer;

// ESM __dirname
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const program = new Command();

program
  .name("backend-starter")
  .description("Interactive Node.js + TypeScript backend starter kit")
  .version("0.2.0")
  .argument("[project-name]", "Project name (optional – will prompt)")
  .action(async (argName?: string) => {
    let projectName = argName || "";

    if (!projectName) {
      const response = (await prompt({
        type: "input",
        name: "name",
        message: "What is your project name?",
        initial: "my-api",
        validate: (value: string) =>
          !value.trim() ? "Required" : /\s/.test(value) ? "No spaces" : true,
      })) as { name: string };

      projectName = response.name;
    }

    const targetDir = path.join(process.cwd(), projectName);

    if (await fs.pathExists(targetDir)) {
      console.error(` "${projectName}" already exists.`);
      process.exit(1);
    }

    console.log(`\n Creating ${projectName}...`);

    // ORM selection - simple string choices + map to folder
    const { orm: selectedOrm } = (await prompt({
      type: "select",
      name: "orm",
      message: "Choose ORM + Database:",
      choices: [
        "Sequelize + MySQL (classic)",
        "Sequelize + PostgreSQL",
        "Prisma + PostgreSQL (recommended for most)",

      ],
      initial: 0,
    })) as { orm: string };

    const ormMap: Record<string, string> = {
      "Sequelize + MySQL (classic)": "sequelize-mysql",
      "Sequelize + PostgreSQL": "sequelize-pg",
      "Prisma + PostgreSQL (recommended for most)": "prisma-pg",

    };

    const ormChoice = ormMap[selectedOrm] || "sequelize-mysql";

    console.log("[DEBUG] Selected display:", selectedOrm);
    console.log("[DEBUG] Mapped folder:", ormChoice);

    // Template paths + DEBUG
    const templateRoot = path.join(__dirname, "../templates");
    console.log("[DEBUG] Template root:", templateRoot);

    const commonDir = path.join(templateRoot, "common");
    console.log("[DEBUG] Common dir:", commonDir);

    const ormDir = path.join(templateRoot, ormChoice);
    console.log("[DEBUG] ORM dir:", ormDir);

    const commonExists = await fs.pathExists(commonDir);
    console.log("[DEBUG] Common exists?", commonExists);

    const ormExists = await fs.pathExists(ormDir);
    console.log("[DEBUG] ORM dir exists?", ormExists);

    await fs.ensureDir(targetDir);

    if (commonExists) {
      await fs.copy(commonDir, targetDir, {
        overwrite: false,
        errorOnExist: false,
      });
      console.log("Copied common files");
    } else {
      console.warn(" common folder not found");
    }

    if (ormExists) {
      await fs.copy(ormDir, targetDir, {
        overwrite: true,
        errorOnExist: false,
      });
      console.log(`Copied ${ormChoice} files`);
    } else {
      console.warn(` Template not found for ${ormChoice} at ${ormDir}`);
    }

    // package.json update
    const pkgPath = path.join(targetDir, "package.json");
    if (await fs.pathExists(pkgPath)) {
      let pkg = await fs.readJson(pkgPath);
      pkg.name = projectName;

      const ormConfig: Record<string, any> = {
        "sequelize-mysql": {
          deps: { sequelize: "^6.37.3", mysql2: "^3.11.3" },
          devDeps: { "sequelize-cli": "^6.6.2" },
        },
        "sequelize-pg": {
          deps: { sequelize: "^6.37.3", pg: "^8.13.0" },
          devDeps: { "sequelize-cli": "^6.6.2" },
        },
        "prisma-pg": {
          deps: { "@prisma/client": "^5.20.0" },
          devDeps: { prisma: "^5.20.0" },
          scripts: {
            "prisma:generate": "prisma generate",
            "prisma:push": "prisma db push",
          },
        },
        "drizzle-pg": {
          deps: { "drizzle-orm": "^0.38.0", postgres: "^3.4.4" },
          devDeps: { "drizzle-kit": "^0.28.0" },
          scripts: {
            "drizzle:generate": "drizzle-kit generate",
            "drizzle:push": "drizzle-kit push",
          },
        },
      };

      const config = ormConfig[ormChoice] || {};
      pkg.dependencies = { ...pkg.dependencies, ...(config.deps || {}) };
      pkg.devDependencies = {
        ...pkg.devDependencies,
        ...(config.devDeps || {}),
      };
      pkg.scripts = { ...pkg.scripts, ...(config.scripts || {}) };

      await fs.writeJson(pkgPath, pkg, { spaces: 2 });
      console.log(" package.json updated");
    }

    // .env
    const envPath = path.join(targetDir, ".env");
    let envContent = `PORT=3000
NODE_ENV=development

# Database configuration
`;

    if (ormChoice.includes("-pg")) {
      envContent += `DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/${projectName}?schema=public"\n`;
    } else {
      envContent += `DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=
DB_NAME=${projectName}
DB_DIALECT=mysql
`;
    }

    await fs.writeFile(envPath, envContent);
    console.log(" .env created");

    // Install
    console.log("\n Installing...");
    try {
      await execa("npm", ["install"], { cwd: targetDir, stdio: "inherit" });
      console.log(" Installed");
    } catch (err) {
      console.error(" Install failed:", err);
    }

    console.log("\n Done!");
    console.log(`cd ${projectName}`);
    console.log("npm run dev");

    if (ormChoice === "prisma-pg") {
      console.log("\nPrisma next: npx prisma generate && npx prisma db push");
    } else if (ormChoice === "drizzle-pg") {
      console.log(
        "\nDrizzle next: npx drizzle-kit generate && npx drizzle-kit push",
      );
    } else {
      console.log("\nSequelize next: npx sequelize-cli db:migrate");
    }
  });

program.parse();



// import { Command } from "commander";
// import path from "path";
// import fs from "fs-extra";
// import { execa } from "execa";
// import enquirer from "enquirer";

// const { prompt } = enquirer;

// // ESM __dirname equivalent
// import { fileURLToPath } from "node:url";
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const program = new Command();

// program
//   .name("backend-starter")
//   .description("Interactive Node.js + TypeScript backend starter kit")
//   .version("0.2.0")
//   .argument("[project-name]", "Project name (optional – will prompt)")
//   .action(async (argName?: string) => {
//     let projectName = argName || "";

//     if (!projectName) {
//       const response = (await prompt({
//         type: "input",
//         name: "name",
//         message: "What is your project name?",
//         initial: "my-api",
//         validate: (value: string) =>
//           !value.trim() ? "Required" : /\s/.test(value) ? "No spaces" : true,
//       })) as { name: string };

//       projectName = response.name;
//     }

//     const targetDir = path.join(process.cwd(), projectName);

//     if (await fs.pathExists(targetDir)) {
//       console.error(`Folder "${projectName}" already exists.`);
//       process.exit(1);
//     }

//     console.log(`\nCreating ${projectName}...`);

//     // ──────────────────────────────────────────────
//     // RELIABLE TEMPLATE ROOT (works in dev + published package)
//     // ──────────────────────────────────────────────
//     let templateRoot = ""; // ← initialized here → fixes TS2454

//     // Most common case in published packages: templates is sibling to dist/
//     const possibleTemplateRoot = path.join(__dirname, "..", "templates");

//     if (await fs.pathExists(possibleTemplateRoot)) {
//       templateRoot = possibleTemplateRoot;
//     } else {
//       // Fallback: walk up the directory tree looking for package.json
//       let currentDir = __dirname;
//       let found = false;

//       while (currentDir !== path.parse(currentDir).root) {
//         const pkgPath = path.join(currentDir, "package.json");
//         if (await fs.pathExists(pkgPath)) {
//           templateRoot = path.join(currentDir, "templates");
//           found = true;
//           break;
//         }
//         currentDir = path.dirname(currentDir);
//       }

//       // Ultimate fallback
//       if (!found) {
//         templateRoot = path.join(__dirname, "templates");
//       }
//     }

//     // Early exit with clear message if templates are missing
//     if (!(await fs.pathExists(templateRoot))) {
//       console.error("\n[ERROR] Could not locate the templates folder");
//       console.error("  Expected at:", templateRoot);
//       console.error("\nPossible reasons:");
//       console.error("  • templates folder was not copied during build");
//       console.error("  • npm publish did not include the templates");
//       console.error(
//         "  • unusual installation path / package manager structure",
//       );
//       process.exit(1);
//     }

//     console.log("[DEBUG] Resolved template root:", templateRoot);

//     // ──────────────────────────────────────────────
//     // ORM selection
//     // ──────────────────────────────────────────────
//     const { orm: selectedOrm } = (await prompt({
//       type: "select",
//       name: "orm",
//       message: "Choose ORM + Database:",
//       choices: [
//         "Sequelize + MySQL (classic)",
//         "Sequelize + PostgreSQL",
//         "Prisma + PostgreSQL (recommended for most)",
//         // "Drizzle + PostgreSQL",  // add when ready
//       ],
//       initial: 0,
//     })) as { orm: string };

//     const ormMap: Record<string, string> = {
//       "Sequelize + MySQL (classic)": "sequelize-mysql",
//       "Sequelize + PostgreSQL": "sequelize-pg",
//       "Prisma + PostgreSQL (recommended for most)": "prisma-pg",
//       // "Drizzle + PostgreSQL": "drizzle-pg",
//     };

//     const ormChoice = ormMap[selectedOrm] || "sequelize-mysql";

//     console.log("[DEBUG] Selected display:", selectedOrm);
//     console.log("[DEBUG] Mapped folder:", ormChoice);

//     const commonDir = path.join(templateRoot, "common");
//     const ormDir = path.join(templateRoot, ormChoice);

//     console.log("[DEBUG] Common dir:", commonDir);
//     console.log("[DEBUG] ORM dir:", ormDir);

//     const commonExists = await fs.pathExists(commonDir);
//     console.log("[DEBUG] Common exists?", commonExists);

//     const ormExists = await fs.pathExists(ormDir);
//     console.log("[DEBUG] ORM dir exists?", ormExists);

//     await fs.ensureDir(targetDir);

//     if (commonExists) {
//       await fs.copy(commonDir, targetDir, {
//         overwrite: false,
//         errorOnExist: false,
//       });
//       console.log("Copied common files");
//     } else {
//       console.warn("⚠️  common folder not found – skipping");
//     }

//     if (ormExists) {
//       await fs.copy(ormDir, targetDir, {
//         overwrite: true,
//         errorOnExist: false,
//       });
//       console.log(`Copied ${ormChoice} files`);
//     } else {
//       console.warn(`⚠️  Template not found for ${ormChoice} at ${ormDir}`);
//     }

//     // Update package.json
//     const pkgPath = path.join(targetDir, "package.json");
//     if (await fs.pathExists(pkgPath)) {
//       let pkg = await fs.readJson(pkgPath);
//       pkg.name = projectName;

//       const ormConfig: Record<string, any> = {
//         "sequelize-mysql": {
//           deps: { sequelize: "^6.37.3", mysql2: "^3.11.3" },
//           devDeps: { "sequelize-cli": "^6.6.2" },
//         },
//         "sequelize-pg": {
//           deps: { sequelize: "^6.37.3", pg: "^8.13.0" },
//           devDeps: { "sequelize-cli": "^6.6.2" },
//         },
//         "prisma-pg": {
//           deps: { "@prisma/client": "^5.20.0" },
//           devDeps: { prisma: "^5.20.0" },
//           scripts: {
//             "prisma:generate": "prisma generate",
//             "prisma:push": "prisma db push",
//           },
//         },
//         // "drizzle-pg": { ... }  // add when ready
//       };

//       const config = ormConfig[ormChoice] || {};
//       pkg.dependencies = { ...pkg.dependencies, ...(config.deps || {}) };
//       pkg.devDependencies = {
//         ...pkg.devDependencies,
//         ...(config.devDeps || {}),
//       };
//       pkg.scripts = { ...pkg.scripts, ...(config.scripts || {}) };

//       await fs.writeJson(pkgPath, pkg, { spaces: 2 });
//       console.log("Updated package.json");
//     }

//     // Create .env
//     const envPath = path.join(targetDir, ".env");
//     let envContent = `PORT=3000
// NODE_ENV=development

// # Database configuration
// `;

//     if (ormChoice.includes("-pg")) {
//       envContent += `DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/${projectName}?schema=public"\n`;
//     } else {
//       envContent += `DB_HOST=localhost
// DB_PORT=3306
// DB_USER=root
// DB_PASS=
// DB_NAME=${projectName}
// DB_DIALECT=mysql
// `;
//     }

//     await fs.writeFile(envPath, envContent);
//     console.log("Created .env file");

//     // Install dependencies
//     console.log("\nInstalling dependencies...");
//     try {
//       await execa("npm", ["install"], { cwd: targetDir, stdio: "inherit" });
//       console.log("Dependencies installed ✓");
//     } catch (err) {
//       console.error("npm install failed:", err);
//     }

//     console.log("\nDone! 🎉");
//     console.log("Next steps:");
//     console.log(`  cd ${projectName}`);
//     console.log("  npm run dev");

//     if (ormChoice === "prisma-pg") {
//       console.log("\nPrisma next steps:");
//       console.log("  npx prisma generate");
//       console.log("  npx prisma db push");
//     } else if (ormChoice === "drizzle-pg") {
//       console.log("\nDrizzle next steps:");
//       console.log("  npx drizzle-kit generate");
//       console.log("  npx drizzle-kit push");
//     } else {
//       console.log("\nSequelize next step:");
//       console.log("  npx sequelize-cli db:migrate");
//     }
//   });

// program.parse();
