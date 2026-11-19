import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const rootDir = path.resolve("D:/dealflow-price-tracker");
console.log(`[DealFlow Verifier] Inspecting extension at: ${rootDir}\n`);

let passed = true;

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    passed = false;
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

// 1. Verify Manifest JSON
const manifestPath = path.join(rootDir, "manifest.json");
assert(fs.existsSync(manifestPath), "manifest.json exists");

let manifest = null;
try {
  manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  assert(manifest.manifest_version === 3, "Manifest version is 3");
  assert(typeof manifest.name === "string" && manifest.name.length > 0, "Manifest has valid name");
  assert(typeof manifest.version === "string", "Manifest has version string");
  assert(manifest.description && manifest.description.length <= 132, `Manifest description length <= 132 chars (current: ${manifest.description?.length})`);
} catch (e) {
  assert(false, `manifest.json parsing failed: ${e.message}`);
}

if (manifest) {
  // 2. Check Background Script
  const bgScript = manifest.background?.service_worker;
  assert(bgScript && fs.existsSync(path.join(rootDir, bgScript)), `Service worker exists: ${bgScript}`);

  // 3. Check Content Scripts
  if (manifest.content_scripts && manifest.content_scripts[0]) {
    const cs = manifest.content_scripts[0];
    cs.js?.forEach((f) => {
      assert(fs.existsSync(path.join(rootDir, f)), `Content script JS exists: ${f}`);
    });
    cs.css?.forEach((f) => {
      assert(fs.existsSync(path.join(rootDir, f)), `Content script CSS exists: ${f}`);
    });
  }

  // 4. Check Popup
  const popupHtml = manifest.action?.default_popup;
  assert(popupHtml && fs.existsSync(path.join(rootDir, popupHtml)), `Popup HTML exists: ${popupHtml}`);

  // 5. Check Options UI
  const optionsHtml = manifest.options_ui?.page;
  assert(optionsHtml && fs.existsSync(path.join(rootDir, optionsHtml)), `Options HTML exists: ${optionsHtml}`);

  // 6. Check Icons
  const icons = manifest.icons || {};
  for (const [size, iconRel] of Object.entries(icons)) {
    const iconPath = path.join(rootDir, iconRel);
    assert(fs.existsSync(iconPath), `Icon ${size}x${size} exists: ${iconRel}`);
    const stat = fs.statSync(iconPath);
    assert(stat.size > 0, `Icon ${size}x${size} is non-empty (${stat.size} bytes)`);
  }
}

// 7. Syntax check JS files with node --check
const jsFiles = [
  "background/background.js",
  "content/content.js",
  "popup/popup.js",
  "options/options.js"
];

for (const jsFile of jsFiles) {
  const fullPath = path.join(rootDir, jsFile);
  try {
    execSync(`node --check "${fullPath}"`);
    assert(true, `Syntax valid: ${jsFile}`);
  } catch (err) {
    assert(false, `Syntax error in ${jsFile}: ${err.message}`);
  }
}

console.log("\n=================================");
if (passed) {
  console.log("🎉 ALL DEALFLOW VERIFICATION CHECKS PASSED!");
  process.exit(0);
} else {
  console.error("⚠️ SOME VERIFICATION CHECKS FAILED!");
  process.exit(1);
}
