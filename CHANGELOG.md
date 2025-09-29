### 2025/09/27 - プレイヤー名と本日のハイスコア
- Switched the leaderboard backend to Google Apps Script (`https://script.google.com/macros/s/AKfycbwgWbujSnffnvNr3HBgbrDi8aI-aEDwcxwIYHsW7UDaDDHZqyeP5fTuUa9EXzmBmaQIDA/exec`) so all players share today's ranking.
- Updated `puzzle/script.js` to post scores via `fetch` and pull the shared top five with network error handling and loading states.
- Adjusted `puzzle/style.css` so the board anchors to the top on desktop (no oversized gap above the canvas).
- Prevented the Space/Enter hard-drop keys from re-triggering the start buttons (no more accidental board resets when focused).

- Added a player name field and daily top-5 leaderboard to puzzle/index.html, keeping the drop puzzle page self-contained.
- Extended puzzle/script.js to persist player names, log today's scores (capped at five visible entries), and refresh the leaderboard each game over.
- Styled the new panels in puzzle/style.css for consistent sidebar presentation and removed the header "Goアプリに戻る" link.

#### Verification
- Enter a player name, finish several games, and confirm the "本日のハイスコア" list shows only today’s top five scores sorted by points.
- Reload the page to ensure the player name and today’s leaderboard restore from local storage.
- Start a new game after midnight (or adjust system date) to verify the leaderboard resets to an empty state for the new day.
### 2025/09/27 - Automate GitHub Pages publishing

- Added Scripts/Publish-GoApp.ps1 to rebuild the puzzle bundle, refresh the ZIP artifact, and sync docs/ into the go-drop-puzzle GitHub Pages repo with optional commit/push.
- The script accepts -NoCommit, -NoPush, and -SkipZip switches plus a custom -CommitMessage for flexible release workflows.

#### Verification
- Run pwsh -File ..\Scripts\Publish-GoApp.ps1 -NoPush inside go-app/ to confirm it rebuilds dist/github-pages/docs/ and stages updates in the cloned repo.
- Inspect go-drop-puzzle/docs/ and git status to ensure only the expected files changed before pushing manually.

### 2025/09/27 - Split drop puzzle into dedicated page

- Moved `falling-go.html` / `falling-go.js` / `falling-go.css` into `puzzle/` alongside the puzzle entry point.
- Updated `index.html` to link the "Drop Puzzle" CTA to `puzzle/index.html`.
- Added helper script Scripts/Serve-GoApp.ps1 so the dev server launches with a single command (falls back to npx if px is unavailable).
- Added batch launcher Scripts/Launch-GoApp.bat to start the server (keeping the console open) and open a chosen route once it responds.

#### Verification
- From `go-app/` load the landing page and follow the Drop Puzzle link to ensure it opens `puzzle/index.html`.
- Open `puzzle/index.html` directly and confirm styles/scripts still load and gameplay works.
- Run `Scripts/Launch-GoApp.bat` (double-click or `Scripts\Launch-GoApp.bat 8080 puzzle/`) and confirm the PowerShell window stays up and the puzzle route loads once the server responds.

### 2025/09/26 - いごぽん UI整備と演出追加

- `falling-go.html` を UTF-8 化し、日本語ラベルとモバイル一時停止ボタンを調整。
- `falling-go.js` に捕獲ハイライトを追加し、囲まれた石と囲んだ石を即時に色反転させてから0.2秒後に消去するよう変更。
- `index.html` から「いごぽんを開く」で遷移できる導線を追加。
- `style.css` に専用ボタンリンクスタイルを追加。

#### 推奨確認
- ブラウザで `falling-go.html` を開き、捕獲時にハイライト→0.2秒後に石が消えること。
- モバイル操作ボタンのポーズが有効に働くこと。
- `index.html` から「いごぽんを開く」で新ページが起動すること。

### 2025/08/08 - SGFファイル保存機能の確認とWebDriverのログイン問題解決

- `save_sgf.py` ファイルの作成と更新を行い、SGFファイルの保存機能（重複スキップ/上書き機能を含む）を確認しました。
- WebDriverを使用したログインプロセスで一時的な問題が発生しましたが、最終的にログインに成功しました。





