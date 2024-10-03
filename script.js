const editor = document.getElementById('editor');
const preview = document.getElementById('preview');
const saveBtn = document.getElementById('saveBtn');
const downloadBtn = document.getElementById('downloadBtn');
const notesList = document.getElementById('notesList');
const noteTitle = document.getElementById('noteTitle');
const newNoteBtn = document.getElementById('newNoteBtn');

let hasChanges = false; // 変更があったかどうかのフラグ
let originalContent = '';
let originalTitle = '';

// メモをローカルストレージに保存
function saveNote() {
    const noteTitle = document.getElementById('noteTitle').value;
    const noteContent = document.getElementById('editor').value;

    if (!noteTitle || !noteContent) {
        alert('タイトルと内容を入力してください。');
        return;
    }

    let notesList = JSON.parse(localStorage.getItem('notes')) || [];
    
    // 既存メモがあるかチェック
    const existingIndex = notesList.findIndex(note => note.title === noteTitle);

    if (existingIndex > -1) {
        // 既存のメモを更新（更新日を保持する）
        notesList[existingIndex].content = noteContent;
        notesList[existingIndex].updatedAt = notesList[existingIndex].updatedAt || new Date().toLocaleDateString();
    } else {
        // 新規メモの場合、現在の日付をセット
        const newNote = {
            title: noteTitle,
            content: noteContent,
            updatedAt: new Date().toLocaleDateString()  // 新規メモの場合に日付を保存
        };
        notesList.push(newNote);
    }

    localStorage.setItem('notes', JSON.stringify(notesList)); // ローカルストレージに保存
    loadNotesFromLocalStorage(); // サイドバーを更新
    showNotification('メモが正常に保存されました'); // 通知を表示
    hasChanges = false;  // 変更フラグをリセット
}

// メモを最終更新日でグループ分け
function loadNotesFromLocalStorage() {
    const notesListElement = document.getElementById('notesList');
    notesListElement.innerHTML = ''; // サイドバーをクリア
    const notes = JSON.parse(localStorage.getItem('notes')) || [];

    // 日付ごとにメモをグループ化する
    const groupedNotes = groupNotesByDate(notes);

    Object.keys(groupedNotes).forEach(date => {
        const dateHeader = document.createElement('h3');
        dateHeader.textContent = date;  // 日付ヘッダーを追加
        notesListElement.appendChild(dateHeader);

        groupedNotes[date].forEach((note, index) => {
            const li = document.createElement('li');

            // メモタイトルと更新日を表示
            li.innerHTML = `
                <strong>${note.title}</strong><br>
                <button class="delete-btn">×</button>
            `;

            // メモをクリックしたら内容を読み込む
            li.addEventListener('click', () => {
                if (hasChanges) {
                    const isConfirmed = confirm("現在のメモが変更されています。メモを切り替えてもよろしいですか？");
                    if (isConfirmed) {
                        hasChanges = false; // キャンセル時にフラグをリセット
                    } else {
                        return;
                    }
                }
                document.getElementById('noteTitle').value = note.title;
                document.getElementById('editor').value = note.content;
                document.getElementById('preview').innerHTML = marked(note.content);
            });

            // 削除ボタンをクリックしたらメモを削除
            li.querySelector('.delete-btn').addEventListener('click', () => {
                event.stopPropagation(); // リストアイテムのクリックイベントを停止
                deleteNote(note.title);
            });

            notesListElement.appendChild(li);
        });
    });
}

// メモを最終更新日ごとにグループ化する関数
function groupNotesByDate(notes) {
    return notes.reduce((acc, note) => {
        const date = new Date(note.updatedAt).toLocaleDateString(); // 日付を取得
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(note);
        return acc;
    }, {});
}


// メモを最終更新日ごとにグループ化する関数
function groupNotesByDate(notes) {
    return notes.reduce((acc, note) => {
        const date = new Date(note.updatedAt).toLocaleDateString(); // 日付を取得
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(note);
        return acc;
    }, {});
}

// サイドバーに保存されたメモを一覧表示
function loadNotes() {
    notesList.innerHTML = '';
    const notes = JSON.parse(localStorage.getItem('notes')) || [];

    notes.forEach((note, index) => {
        const li = document.createElement('li');
        li.textContent = note.title;

        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '&times;';
        deleteBtn.className = 'delete-btn';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            deleteNote(index);
        };

        li.appendChild(deleteBtn);
        li.addEventListener('click', () => loadNoteContent(index));
        notesList.appendChild(li);
    });
}

// メモの内容をエディタに読み込む
function loadNoteContent(index) {
    if (hasChanges && !confirm('変更が保存されていません。移動しますか？')) {
        return;
    }
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    const note = notes[index];

    if (note) {
        noteTitle.value = note.title;
        editor.value = note.content;
        preview.innerHTML = marked(note.content);
    }
}

function deleteNote(title) {
    // 削除確認のダイアログを表示
    const isConfirmed = confirm(`メモ「${title}」を削除してもよろしいですか？`);
    
    if (isConfirmed) {
        let notesList = JSON.parse(localStorage.getItem('notes')) || [];

        // 指定されたタイトルのメモを削除
        notesList = notesList.filter(note => note.title !== title);

        // 更新後のメモをローカルストレージに保存
        localStorage.setItem('notes', JSON.stringify(notesList));

        // メモ一覧を更新
        loadNotesFromLocalStorage();
        showNotification('メモが削除されました'); // 通知を表示
    }
}

// エディタの内容をクリアする
function clearEditor() {
    noteTitle.value = '';
    editor.value = '';
    preview.innerHTML = '';
    originalContent = '';
    originalTitle = '';
    hasChanges = false;
}

// エディタの内容をプレビューにリアルタイム反映
editor.addEventListener('input', () => {
    const markdownText = editor.value;
    preview.innerHTML = marked(markdownText);
    checkChanges();
});

// エディタに入力があった場合に変更フラグを立てる
document.getElementById('editor').addEventListener('input', () => {
    hasChanges = true; // エディタの内容が変更された場合、フラグを立てる
});

// タイトルの変更を検知
noteTitle.addEventListener('input', checkChanges);

// 変更を検知する関数
function checkChanges() {
    hasChanges = (editor.value !== originalContent) || (noteTitle.value !== originalTitle);
}

// ページを離れる前に確認ダイアログを表示する
window.addEventListener('beforeunload', (event) => {
    if (hasChanges) {
        event.preventDefault(); // 標準のダイアログを表示
        event.returnValue = ''; // Chrome用
    }
});

// 新規作成ボタンのクリックイベント
newNoteBtn.addEventListener('click', () => {
    if (hasChanges && !confirm('変更が保存されていません。ページを離れますか？')) {
        return;
    }
    clearEditor();
});

// 通知を表示する関数
function showNotification(message) {
    const notification = document.getElementById('saveNotification');
    notification.textContent = message;
    notification.classList.remove('hidden');
    notification.classList.add('visible');

    // 1秒後に通知を非表示にする
    setTimeout(() => {
        notification.classList.remove('visible');
        notification.classList.add('hidden');
    }, 1000); // 1秒後に非表示
}

// 「保存する」ボタンのクリックイベント
saveBtn.addEventListener('click', () => {
    saveNote(); // ノートを保存する関数を呼び出す
    showNotification('メモが正常に保存されました'); // 保存完了の通知を表示
    hasChanges = false;  // 変更フラグをリセット
});

// 「ダウンロード」ボタンでMarkdownファイルをダウンロード
downloadBtn.addEventListener('click', () => {
    const markdownText = editor.value;
    const blob = new Blob([markdownText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${noteTitle.value || 'markdown'}.md`; // タイトルをファイル名に使用
    a.click();
    URL.revokeObjectURL(url);
});

// 新規タブでプレビューを表示する関数
function openPreviewInNewTab() {
    const previewContent = document.getElementById('preview').innerHTML; // プレビューの内容を取得

    // 新しいウィンドウを開き、プレビューを表示
    const newWindow = window.open('', '_blank');
    newWindow.document.write(`
        <html>
            <head>
                <title>プレビュー</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 20px;
                        padding: 0;
                    }
                </style>
            </head>
            <body>
                ${previewContent} <!-- プレビュー内容を埋め込む -->
            </body>
        </html>
    `);
    newWindow.document.close(); // ドキュメントの書き込みを終了
}

// 「新規タブでプレビュー」ボタンのクリックイベント
document.getElementById('previewTabBtn').addEventListener('click', openPreviewInNewTab);

// Ctrl + Sで保存を実行するショートカット機能
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.key === 's') {
        event.preventDefault(); // ブラウザのデフォルトの保存機能を無効にする
        saveNote(); // 保存処理を実行
        showNotification('メモが正常に保存されました'); // 保存完了の通知を表示
        hasChanges = false;  // 変更フラグをリセット
    }
});

// Ctrl + Pで新規タブにプレビューを開くショートカット機能
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.key === 'p') {
        event.preventDefault(); // ブラウザのデフォルトの印刷機能を無効にする
        openPreviewInNewTab(); // 新規タブでプレビューを開く
    }
});

// ページリロード時にメモ一覧を表示
window.addEventListener('load', () => {
    loadNotesFromLocalStorage(); 
    clearEditor();
});
