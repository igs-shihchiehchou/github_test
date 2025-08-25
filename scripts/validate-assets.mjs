#!/usr/bin/env node
/**
 * Custom validation script for project & asset rules.
 * 1. Project Setting : 不可任意變更
 * 2. Layers & Sorting Layers : 不可任意增加/刪減
 * 3. Physics - Collision Matrix : 不可任意修改/刪減，可透過 TS 程式功能改變 Collision Matrix，但離開遊戲須變更回來
 *    => If physics settings file (guessed) is changed, flag.
 * 4. Texture Compression : 所有貼圖壓縮設定都選 PartyGo Astc{?x?}
 * 5. 上傳貼圖(Texture)資源解析度尺寸不可超過 2048x2048
 * 6. assets/games/ 下建立開發資料夾，創建小遊戲入口單一場景
 * 7. assets/ 內禁止在非小遊戲所屬資料夾進行開發、寫入開發內容檔案
 * 8. 僅例外允許修改 fake_main.scene 中 fakemain 節點內資訊
 *
 * Because we lack precise engine file formats, many checks are heuristic. Adjust as real file locations become known.
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import sharp from 'sharp';

// Changed files passed from pre-commit
// pre-commit passes filenames
const changedFiles = process.argv.slice(2);

let violations = [];

function addViolation(file, message, detail) {
  violations.push({ file, message, detail });
}

// Rule helpers
const maxTextureSize = 2048;
const imageExt = new Set(['.png', '.jpg', '.jpeg', '.webp']);

function looksLikeTexture(file) {
  const ext = path.extname(file).toLowerCase();
  return imageExt.has(ext);
}

async function checkImageSize(file) {
  try {
    const meta = await sharp(file).metadata();
    if (meta.width && meta.height && (meta.width > maxTextureSize || meta.height > maxTextureSize)) {
      addViolation(file, '圖片大小(>2048x2048不合規定! (Texture too large >2048x2048)', `${meta.width}x${meta.height}`);
    }
  } catch (_err) {
    addViolation(file, '無法讀取圖片元數據 (Failed to read image metadata)');
  }
}

// Determine allowed development directories under assets/games (excluding common & sample_game which are shared/demo)
// If a file is added/modified under assets/ but not in games/<allowedGame>/, flag it.
function checkAllowedPath(file) {
  // Allowed paths:
  // 1. assets/games/** (anything under games)
  // 2. assets/scene/scene.scene (single file)
  if (file.startsWith('assets/games/') || file.startsWith('tests/') || file === 'assets/scene/scene.scene') {
    // early return: allowed path
    return;
  }

  addViolation(file, '只允許修改 assets/games/** 或 tests/** 或 assets/scene/scene.scene (Changes outside allowed asset paths are forbidden)');
}

// --- Texture Compression Validation ---
const builderPath = 'settings/v2/packages/builder.json';
let builderLoaded = false;
let allowedAstcPresetIds = new Set();

function loadBuilderCompressionPresets() {
  if (builderLoaded) {
  // already attempted
    return;
  }

  builderLoaded = true;
  try {
    const raw = fs.readFileSync(builderPath, 'utf8');
    const json = JSON.parse(raw);
    const presets = (json && json.textureCompressConfig && json.textureCompressConfig.userPreset) || {};
    const entries = Object.entries(presets);
    const namePattern = /^PartyGo Astc(\d+)x(\d+)$/i;
    for (const [id, preset] of entries) {
      if (preset && namePattern.test(preset.name)) {
        allowedAstcPresetIds.add(id);
      }
    }
  } catch (_e) {
    // If we can't read it, leave set empty; later checks will flag.
  }
}

function isMetaPath(file) {
  return file.endsWith('.meta');
}

function isImageImporterMeta(file) {
  if (!isMetaPath(file)) {
    return false;
  }

  try {
    if (!fs.existsSync(file)) {
      return false;
    }

    const content = fs.readFileSync(file, 'utf8');
    const json = JSON.parse(content);
    return json && json.importer === 'image';
  } catch (_e) {
    // silently ignore parse errors here; they'll be handled later if needed
    return false;
  }
}

function checkTextureMetaCompression(file) {
  if (!isMetaPath(file)) {
    return;
  }

  try {
    const content = fs.readFileSync(file, 'utf8');
    const json = JSON.parse(content);
    // only enforce for image importer meta
    if (json.importer !== 'image') {
      return;
    }

    const compress = json.userData && json.userData.compressSettings;
    if (!compress) {
      addViolation(file, '缺少 compressSettings (Missing compressSettings in image .meta)');
      return;
    }

    if (!compress.useCompressTexture) {
      addViolation(file, '未啟用貼圖壓縮 useCompressTexture (useCompressTexture not true)');
    }

    const presetId = compress.presetId;
    if (!presetId) {
      addViolation(file, '缺少壓縮 presetId (Missing presetId in compressSettings)');
    } else if (!allowedAstcPresetIds.has(presetId)) {
      addViolation(file, '使用未授權的壓縮預設 (Preset not an allowed PartyGo Astc)', presetId);
    }
  } catch (_e) {
    addViolation(file, '無法解析貼圖 meta 以檢查壓縮設定 (Failed to parse image meta for compression check)');
  }
}

function checkSettings(file) {
  if (file.startsWith('settings/')) {
    // Disallow direct modifications except allowlist
    const allowlist = [
      // placeholder for files allowed to change automatically
    ];
    const base = file.replace(/\\/g, '/');
    if (!allowlist.some(a => base.startsWith(a))) {
      addViolation(file, 'Project settings 檔案不可任意變動! (Project settings files are protected)');
    }
  }
}

async function main() {
  const imageChecks = [];
  // Determine if we need to validate builder compression config
  const needBuilderValidation = changedFiles.includes(builderPath) || changedFiles.some(isImageImporterMeta);
  if (needBuilderValidation) {
    loadBuilderCompressionPresets();

    if (!allowedAstcPresetIds.size) {
      addViolation(builderPath, '無法驗證貼圖壓縮，因為沒有可用的 PartyGo Astc 預設 (No PartyGo Astc presets loaded from builder.json)');
      return;
    }
  }

  for (const f of changedFiles) {
    checkSettings(f);
    checkAllowedPath(f);
    checkTextureMetaCompression(f);
    if (looksLikeTexture(f) && fs.existsSync(f)) {
      imageChecks.push(checkImageSize(f));
    }
  }

  await Promise.all(imageChecks);

  if (violations.length) {
    /* global console */
    console.error('\n專案規則檢查 (Asset / Project rule violations):');
    for (const v of violations) {
      console.error(`- ${v.file}: ${v.message}${v.detail ? ' -> ' + v.detail : ''}`);
    }

    console.error('\n請修正以上問題!!! (Please fix the above issues before committing.)');
    process.exit(1);
  }
}

main();
