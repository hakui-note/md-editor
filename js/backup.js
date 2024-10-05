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
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup_notes.json'; // バックアップファイル名
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url); // メモリ解放
}

// バックアップボタンのクリックイベント
document.getElementById('backupBtn').addEventListener('click', backupNotes);