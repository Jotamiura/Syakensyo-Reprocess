/**
 * Syakensyo-Reprocess - 車検証ファイル再処理ツール
 *
 * リネーマーにミスったファイルを再投入するための前処理スクリプト。
 * 日付プレフィックス（YYYYMMDD_）と処理済みサフィックス（[!], [B], [R!], [RB]）を
 * 除去して、自動リネーマーが再処理できる状態に戻す。
 *
 * 【使い方】
 * 1. GASエディタで reprocessFiles() を実行
 * 2. 初回は権限の許可を求められるので「許可」をクリック
 * 3. ログで結果を確認
 *
 * 【ドライラン】
 * reprocessFiles_DryRun() で実際の変更なしに結果を確認できる
 */

// ★ 対象フォルダのID（自動リネームフォルダ）
var TARGET_FOLDER_ID = '1vP-Y3TsLFDKbY4K79cks6mJVivnSdR7l';

/**
 * ファイル名をリセットして再処理可能にする
 *
 * 除去対象:
 * - 先頭の日付プレフィックス（YYYYMMDD_）
 * - 処理済みサフィックス: [!], [B], [R!], [RB]
 * - サフィックス前のスペース（半角・全角）
 *
 * 除去後、自動リネーマーが再度リネーム → BPO Processor が再処理する
 */
function reprocessFiles() {
  var folder = DriveApp.getFolderById(TARGET_FOLDER_ID);
  var files = folder.getFiles();

  var count = 0;
  var skipped = 0;

  Logger.log('=== Syakensyo-Reprocess 開始 ===');
  Logger.log('対象フォルダ: ' + folder.getName());

  while (files.hasNext()) {
    var file = files.next();
    var oldName = file.getName();

    // PDF以外はスキップ
    if (!oldName.endsWith('.pdf')) {
      continue;
    }

    var newName = oldName;
    var changed = false;

    // ① 先頭の日付部分（YYYYMMDD_）を削除
    var dateMatch = newName.match(/^\d{8}_(.+)$/);
    if (dateMatch) {
      newName = dateMatch[1];
      changed = true;
    }

    // ② 処理済みサフィックスを削除（[!], [B], [R!], [RB]）
    var suffixPattern = /[\s\u3000]*\[(?:!|B|R!|RB)\]\.pdf$/;
    if (suffixPattern.test(newName)) {
      newName = newName.replace(suffixPattern, '.pdf');
      changed = true;
    }

    // ③ Description（符丁）をクリア（再判定させるため）
    if (changed && file.getDescription()) {
      file.setDescription('');
      Logger.log('  Description クリア');
    }

    if (changed) {
      file.setName(newName);
      Logger.log('✅ ' + oldName + '  →  ' + newName);
      count++;
    } else {
      Logger.log('⏭ スキップ: ' + oldName);
      skipped++;
    }
  }

  Logger.log('===========================');
  Logger.log('完了！ リネーム: ' + count + '件 / スキップ: ' + skipped + '件');
}

/**
 * ドライラン（実際の変更なし）
 */
function reprocessFiles_DryRun() {
  var folder = DriveApp.getFolderById(TARGET_FOLDER_ID);
  var files = folder.getFiles();

  var wouldChange = 0;
  var wouldSkip = 0;

  Logger.log('=== 【ドライラン】実際の変更は行いません ===');
  Logger.log('対象フォルダ: ' + folder.getName());

  while (files.hasNext()) {
    var file = files.next();
    var oldName = file.getName();

    if (!oldName.endsWith('.pdf')) {
      continue;
    }

    var newName = oldName;
    var changed = false;

    var dateMatch = newName.match(/^\d{8}_(.+)$/);
    if (dateMatch) {
      newName = dateMatch[1];
      changed = true;
    }

    var suffixPattern = /[\s\u3000]*\[(?:!|B|R!|RB)\]\.pdf$/;
    if (suffixPattern.test(newName)) {
      newName = newName.replace(suffixPattern, '.pdf');
      changed = true;
    }

    if (changed) {
      Logger.log('  [変更予定] ' + oldName + '  →  ' + newName);
      wouldChange++;
    } else {
      Logger.log('  [スキップ] ' + oldName);
      wouldSkip++;
    }
  }

  Logger.log('===========================');
  Logger.log('変更予定: ' + wouldChange + '件 / スキップ: ' + wouldSkip + '件');
}
