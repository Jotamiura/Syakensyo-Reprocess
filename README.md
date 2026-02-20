# Syakensyo-Reprocess

車検証リネーマーのミスファイル再処理ツール。

## 概要

自動リネーマー（Syakensyo-Renamer）でミスったファイルを再投入するための前処理スクリプト。
日付プレフィックスと処理済みサフィックスを除去して、自動リネーマーが再処理できる状態に戻す。

## 除去対象

| 対象 | 例 | 除去後 |
|---|---|---|
| 日付プレフィックス `YYYYMMDD_` | `20260630_京都100あ4782_東京海上_車検証.pdf` | `京都100あ4782_東京海上_車検証.pdf` |
| サフィックス `[!]` (非BPO) | `京都830さ6610_東京海上日動_車検証[!].pdf` | `京都830さ6610_東京海上日動_車検証.pdf` |
| サフィックス `[B]` (BPO処理済) | `...車検証[B].pdf` | `...車検証.pdf` |
| サフィックス `[R!]` (承認+非BPO) | `...車検証[R!].pdf` | `...車検証.pdf` |
| サフィックス `[RB]` (承認+BPO済) | `...車検証[RB].pdf` | `...車検証.pdf` |

Description（符丁）も同時にクリアされるため、BPO顧客判定も再実行される。

## 使い方

### スタンドアロン版（このリポジトリ）

1. https://script.google.com にアクセス
2. 「新しいプロジェクト」→ `コード.js` の内容を貼り付け
3. `reprocessFiles_DryRun()` で確認（実際の変更なし）
4. `reprocessFiles()` を実行

### bpo-processor 連動版（推奨）

BPO リポジトリの `gas/bpo-processor/コード.js` にも同じ関数が組み込み済み。
こちらは一時停止機能と連携できるため、本番運用ではこちらを推奨。

```
1. pauseProcessing()       ← 処理を一時停止（競合回避）
2. reprocessFiles_DryRun() ← ドライランで確認
3. reprocessFiles()        ← 実行
4. resumeProcessing()      ← 再開 → 自動リネーマー → BPO Processor が再処理
```

## 処理フロー

```
ミスファイル（処理済み状態）
  ↓ reprocessFiles()
ファイル名リセット（生ファイル状態に戻る）
  ↓ 自動リネーマー (Syakensyo-Renamer)
YYYYMMDD_使用者名_登録番号_車台番号.pdf
  ↓ BPO Processor (Pipeline A)
OCR → BPO統合DB に書き込み
```

## 関数一覧

| 関数 | 用途 |
|---|---|
| `reprocessFiles()` | ファイル名リセット実行 |
| `reprocessFiles_DryRun()` | ドライラン（変更なしで結果確認） |
