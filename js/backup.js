// バックアップを作成する関数
function backupNotes() {
    const notesList = JSON.parse(localStorage.getItem('notes')) || [];

    if (notesList.length === 0) {
        alert('バックアップするデータがありません。');
        return;
    }

    const backupData = JSON.stringify(notesList, null, 2); // JSON形式で整形
    const blob = new Blob([backupData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // 日付を取得してファイル名に追加
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().slice(0, 10); // YYYY-MM-DD形式

    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_notes_${formattedDate}.json`; // ファイル名に日付を含める
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url); // メモリ解放
}

// バックアップボタンのクリックイベント
document.getElementById('backupBtn').addEventListener('click', backupNotes);