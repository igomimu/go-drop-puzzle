#!/bin/bash
# CrazyGames提出素材を一括生成
# 出力先: crazygames/ ディレクトリ
set -e
cd /home/mimura/projects/igopon

OUT=crazygames
mkdir -p "$OUT"

echo "=== CrazyGames素材生成 ==="

# --- 1. カバー画像 (ffmpegでリサイズ+パディング) ---
echo "[1/5] カバー画像生成..."

# ランドスケープ 1920x1080 — desktop画像をスケールアップ+黒パディング
ffmpeg -y -i screenshots/05_desktop.png \
  -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black" \
  "$OUT/cover-landscape-1920x1080.png" 2>/dev/null
echo "  ✓ landscape 1920x1080"

# ポートレート 800x1200 — gameplay画像をリサイズ+パディング
ffmpeg -y -i screenshots/02_gameplay.png \
  -vf "scale=800:1200:force_original_aspect_ratio=decrease,pad=800:1200:(ow-iw)/2:(oh-ih)/2:black" \
  "$OUT/cover-portrait-800x1200.png" 2>/dev/null
echo "  ✓ portrait 800x1200"

# スクエア 800x800 — midgame画像をクロップ+リサイズ
ffmpeg -y -i screenshots/03_midgame.png \
  -vf "crop=420:420:0:160,scale=800:800" \
  "$OUT/cover-square-800x800.png" 2>/dev/null
echo "  ✓ square 800x800"

# --- 2. 動画プレビュー (15-20秒, 1080p, 音声なし, MP4) ---
echo "[2/5] 動画プレビュー生成..."

# webm → mp4, トリム20秒, スケールアップ, 音声除去
ffmpeg -y -i screenshots/f3b25f8c19e7b53434e65d7b98b11b8e.webm \
  -t 20 -an \
  -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black" \
  -c:v libx264 -preset medium -crf 23 \
  "$OUT/preview-portrait-1080p.mp4" 2>/dev/null

# ランドスケープ版も生成(desktopスクリーンショットから動画がないので、ポートレートのみ)
echo "  ✓ preview 1080p portrait (20s, no audio)"

# --- 3. ゲームZIP (index.html at root) ---
echo "[3/5] ゲームZIP生成..."

# CrazyGames用にリビルド (相対パス)
VITE_BASE_PATH=./ npx vite build --base ./ 2>/dev/null

cd dist
zip -r "../$OUT/itrap-crazygames.zip" . 2>/dev/null
cd ..
echo "  ✓ itrap-crazygames.zip ($(du -h "$OUT/itrap-crazygames.zip" | cut -f1))"

# --- 4. 説明文 ---
echo "[4/5] 説明文生成..."

cat > "$OUT/description.txt" << 'DESCRIPTION'
囲Trap (i-Trap) — Go meets Tetris!

A unique puzzle game that blends the ancient strategy game of Go with falling-block mechanics. Place black and white stones on a 20×10 board to capture groups and clear lines before the board fills up!

HOW TO PLAY:
- Stones fall from the top — move them left/right, rotate, or drop
- Surround opponent stones to capture them (just like in Go!)
- Captured stones disappear and score big points
- Clear full rows for bonus points
- Game over when stones reach the top

FEATURES:
- Easy to learn, hard to master
- No Go knowledge needed — the game teaches you naturally
- Combo system — chain captures for massive scores
- Dynamic BGM that intensifies as danger rises
- Global leaderboard — compete for the top score
- Works on desktop and mobile
- Available in English and Japanese

CONTROLS:
- Arrow keys or swipe to move
- Up arrow or tap to rotate
- Down arrow or swipe down to soft drop
- Space or double-tap for hard drop
DESCRIPTION

echo "  ✓ description.txt"

# --- 5. サマリ ---
echo "[5/5] 完了!"
echo ""
echo "=== 生成ファイル一覧 ==="
ls -lh "$OUT/"
echo ""
echo "=== 次のステップ ==="
echo "1. https://developer.crazygames.com/ にログイン"
echo "2. 'Submit a Game' をクリック"
echo "3. 以下をアップロード:"
echo "   - Game ZIP:    $OUT/itrap-crazygames.zip"
echo "   - Landscape:   $OUT/cover-landscape-1920x1080.png"
echo "   - Portrait:    $OUT/cover-portrait-800x1200.png"
echo "   - Square:      $OUT/cover-square-800x800.png"
echo "   - Video:       $OUT/preview-portrait-1080p.mp4"
echo "   - Description: $OUT/description.txt の内容をコピペ"
echo "4. Category: 'Puzzle' を選択"
echo "5. Submit!"
