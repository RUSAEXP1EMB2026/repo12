// ==========================================
// センサー情報取得用の関数
// ==========================================
function getNatureRemoData(endpoint) {
  const url = `https://api.nature.global/1/${endpoint}`;
  
  // ユーザーが書いた送信処理に合わせて、取得時のオプションを統一
  const options = {
    "method": "get",
    "headers": {
      "Authorization": `Bearer ${REMO_ACCESS_TOKEN}`
    },
    "muteHttpExceptions": true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const statusCode = response.getResponseCode();

    if (statusCode === 200) {
      return JSON.parse(response.getContentText());
    } else {
      Logger.log(`エラー: センサー情報の取得に失敗 (ステータスコード: ${statusCode})`);
      return null; // 失敗時はnullを返す
    }
  } catch (e) {
    Logger.log(`通信エラー(センサー取得): ${e.message}`);
    return null;
  }
}


// ==========================================
// 部屋に人がいるか判定する関数
function isRoomOccupied(deviceData) {
  // データがうまく取得できていない場合は「人がいない」と判定して安全側に倒す
  if (!deviceData || deviceData.length === 0) return false;

  const events = deviceData[0].newest_events;

  const ilVal = events.il.val;
  const moCreatedAt = new Date(events.mo.created_at); 
  const now = new Date();
  
  // ▼ 環境に合わせて調整してください ▼
  const IL_THRESHOLD = 50; // 照度の閾値
  const MO_TIMEOUT_MINUTES = 30; // 何分以内なら人がいると判定するか
  
  const diffMinutes = (now.getTime() - moCreatedAt.getTime()) / (1000 * 60);
  
  const isLightOn = ilVal >= IL_THRESHOLD;
  const isPersonDetected = diffMinutes <= MO_TIMEOUT_MINUTES;
  
  Logger.log(`センサー確認: 照度=${ilVal}, 人感経過時間=${Math.round(diffMinutes)}分`);
  
  return isLightOn && isPersonDetected;;
}
// ==========================================
