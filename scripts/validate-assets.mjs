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
  let sharp = null;
  try {
    const sharpMod = await import('sharp').catch(() => null);
    sharp = sharpMod && (sharpMod.default || sharpMod);
    if (!sharp) {
      addViolation(file, '無法 import sharp (Failed to import sharp)');
      return;
    }

  } catch (_err) {
    addViolation(file, '無法 import sharp (Failed to import sharp)');
  }

  // Dynamically import sharp if present; skip silently if missing or error.
  try {
    const meta = await sharp(file).metadata();
    if (meta.width && meta.height && (meta.width > maxTextureSize || meta.height > maxTextureSize)) {
      addViolation(file, '圖片大小(>2048x2048不合規定! (Texture too large >2048x2048)', `${meta.width}x${meta.height}`);
    }
  } catch (_err) {
    // ignore errors (missing sharp or read failure)
    addViolation(file, '無法讀取圖片元數據 (Failed to read image metadata)');
  }
}

// Determine allowed development directories under assets/games (excluding common & sample_game which are shared/demo)
// If a file is added/modified under assets/ but not in games/<allowedGame>/, flag it.
function checkAllowedPath(file) {
  // Allowed paths:
  // 1. assets/games/** (anything under games)
  // 2. assets/scene/scene.scene (single file)
  if (file.startsWith('assets/games/') || file === 'assets/scene/scene.scene') {
    // early return: allowed path
    return;
  }

  addViolation(file, '只允許修改 assets/games/** 或 assets/scene/scene.scene (Changes outside allowed asset paths are forbidden)');
}

function checkMetaCompression(file) {
  if (!file.endsWith('.json') && !file.endsWith('.meta')) {
    return;
  }

  // Heuristic: load and search for astc property
  try {
    const content = fs.readFileSync(file, 'utf8');
    if (/texture/i.test(content) && !/astc/i.test(content)) {
      addViolation(file, '圖片壓縮格式錯誤，只接受 Astc! (Texture compression not set to ASTC, expected PartyGo Astc)');
    }
  } catch (_err) {
    // ignore read error
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

  for (const f of changedFiles) {
    checkSettings(f);
    checkAllowedPath(f);
    checkMetaCompression(f);
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

    console.error('\n請修正以下問題!!! (Please fix the above issues before committing.)');
    process.exit(1);
  }
}

main();
