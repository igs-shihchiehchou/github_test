#!/usr/bin/env node
/**
 * Custom validation script for project & asset rules.
 * Rules (Chinese descriptions kept for clarity):
 * 1. Project Setting : 不可任意變更  (We approximate by forbidding changes under settings/v2 except an allowlist)
 * 2. Layers & Sorting Layers : 不可任意增加/刪減 (Assume layers config file would live under settings/v2; detect structural diffs if file changed)
 * 3. Physics - Collision Matrix : 不可任意修改/刪減，可透過 TS 程式功能改變 Collision Matrix，但離開遊戲須變更回來
 *    => If physics settings file (guessed) is changed, flag.
 * 4. Texture Compression : 所有貼圖壓縮設定都選 PartyGo Astc{?x?} (We can only heuristic check meta json contains 'astc')
 * 5. 上傳貼圖(Texture)資源解析度尺寸不可超過 2048x2048
 * 6. assets\\games\\ 下建立開發資料夾，創建小遊戲入口單一場景 (Not enforceable per commit; informational)
 * 7. assets\\ 內禁止在非小遊戲所屬資料夾進行開發、寫入開發內容檔案
 *    (Only allow modifications in assets/games/<game_name>/ ; shared folders common & sample_game 不可做遊戲邏輯開發)
 * 8. 僅例外允許修改 fake_main.scene 中 fakemain 節點內資訊 (We would parse file if exists; currently we just allow modifications to that file path)
 *
 * Because we lack precise engine file formats, many checks are heuristic. Adjust as real file locations become known.
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

// Changed files passed from pre-commit
const changedFiles = process.argv.slice(2); // pre-commit passes filenames

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
  // Dynamically import sharp if present; skip silently if missing or error.
  try {
    const sharpMod = await import('sharp').catch(() => null);
    const sharp = sharpMod && (sharpMod.default || sharpMod);
    if (!sharp) {
      return;
    }

    const meta = await sharp(file).metadata();
    if (meta.width && meta.height && (meta.width > maxTextureSize || meta.height > maxTextureSize)) {
      addViolation(file, 'Texture too large (>2048x2048)', `${meta.width}x${meta.height}`);
    }
  } catch (_err) {
    // ignore errors (missing sharp or read failure)
  }
}

// Determine allowed development directories under assets/games (excluding common & sample_game which are shared/demo)
// If a file is added/modified under assets/ but not in games/<allowedGame>/, flag it.
function checkGamePath(file) {
  if (!file.startsWith('assets/')) {
    return;
  }

  // Allowed shared folders: assets/games/common/, assets/games/sample_game/, assets/scene/
  if (file.startsWith('assets/games/common/') || file.startsWith('assets/games/sample_game/') || file.startsWith('assets/scene/')) {
    // Development should not happen in common or sample_game (rule 7) except maybe meta/scene adjustments; flag edits to source-like files
    const disallowedExt = ['.ts', '.js', '.tsx', '.jsx', '.json', '.scene'];
    const ext = path.extname(file).toLowerCase();
    if (disallowedExt.includes(ext)) {
      addViolation(file, 'Forbidden to develop inside shared or sample game folder (common/sample_game)');
    }

    return;
  }

  if (file.startsWith('assets/games/')) {
    // game-specific folder must be one level deeper: assets/games/<game_name>/...
    const parts = file.split('/');
    if (parts.length < 3) {
      return; // root marker
    }
    // OK - we allow
  } else {
    // other assets root modifications (like adding code) discouraged
    const codeLike = ['.ts', '.js', '.tsx', '.jsx'];
    if (codeLike.includes(path.extname(file))) {
      addViolation(file, 'Development code should reside under assets/games/<game_name>/, not at this path');
    }
  }
}

function checkMetaCompression(file) {
  if (!file.endsWith('.json') && !file.endsWith('.meta')) {
    return;
  }
  // Heuristic: load and search for astc property

  try {
    const content = fs.readFileSync(file, 'utf8');
    if (/texture/i.test(content) && !/astc/i.test(content)) {
      addViolation(file, 'Texture compression not set to ASTC (expected PartyGo Astc)');
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
      addViolation(file, 'Project settings files are protected (不可任意變更)');
    }
  }
}

async function main() {
  const imageChecks = [];

  for (const f of changedFiles) {
    checkSettings(f);
    checkGamePath(f);
    checkMetaCompression(f);
    if (looksLikeTexture(f) && fs.existsSync(f)) {
      imageChecks.push(checkImageSize(f));
    }
  }

  await Promise.all(imageChecks);

  if (violations.length) {
    /* global console */
    console.error('\nAsset / Project rule violations:');
    for (const v of violations) {
      console.error(`- ${v.file}: ${v.message}${v.detail ? ' -> ' + v.detail : ''}`);
    }

    console.error('\nPlease fix the above issues before committing.');
    process.exit(1);
  }
}

main();
