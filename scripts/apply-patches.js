#!/usr/bin/env node
import { readFileSync, existsSync, readdirSync } from "fs";
import { join } from "path";
import { spawnSync } from "child_process";

const PATCHES_DIR = join(process.cwd(), "patches");
const NODE_MODULES = join(process.cwd(), "node_modules");

function applyPatch(patchFile, targetPackage) {
  const patchPath = join(PATCHES_DIR, patchFile);
  const packagePath = join(NODE_MODULES, targetPackage.startsWith("@") ? targetPackage : `@${targetPackage}`);

  if (!existsSync(packagePath)) {
    console.warn(`Package ${targetPackage} not found, skipping patch`);
    return false;
  }

  // Check if patch is already applied by doing a dry-run
  const checkResult = spawnSync("git", ["apply", "--check", patchPath], {
    cwd: packagePath,
    stdio: "pipe",
  });

  if (checkResult.status === 0) {
    console.log(`Applying patch: ${patchFile} to ${targetPackage}`);
    const result = spawnSync("git", ["apply", "--whitespace=nowarn", patchPath], {
      cwd: packagePath,
      stdio: "inherit",
    });
    if (result.status !== 0) {
      console.error(`Failed to apply patch: ${patchFile}`);
      return false;
    }
    console.log(`Successfully applied: ${patchFile}`);
  } else {
    console.log(`Patch already applied or not needed: ${patchFile} (skipping)`);
  }
  return true;
}

function main() {
  if (!existsSync(PATCHES_DIR)) {
    console.log("No patches directory found");
    return;
  }

  const patchFiles = readdirSync(PATCHES_DIR).filter(f => f.endsWith(".patch"));

  if (patchFiles.length === 0) {
    console.log("No patch files found");
    return;
  }

  let allSuccess = true;

  for (const patchFile of patchFiles) {
    // Extract package name from patch filename (format: @scope+name.patch or @scope+name+version.patch)
    const match = patchFile.match(/^@?(.+)\.patch$/);
    if (!match) {
      console.warn(`Could not parse package name from ${patchFile}, skipping`);
      continue;
    }

    const targetPackage = match[1].replace(/\+/g, "/");
    const success = applyPatch(patchFile, targetPackage);
    if (!success) allSuccess = false;
  }

  if (!allSuccess) {
    console.error("Some patches failed to apply");
    process.exit(1);
  }

  console.log("All patches applied successfully");
}

main();