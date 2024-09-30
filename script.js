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
    const title = noteTitle.value.trim();
    const content = editor.value;
    
    if (!title) {
        alert('タイトルを入力してください');
        return;
    }

    const note = {
        title: title,
        content: content
    };

    let notes = JSON.parse(localStorage.getItem('notes')) || [];

    // 既存のタイトルがあれば更新、なければ新規追加
    const existingIndex = notes.findIndex(n => n.title === title);
    if (existingIndex > -1) {
        notes[existingIndex] = note;
    } else {
        notes.push(note);
    }

    localStorage.setItem('notes', JSON.stringify(notes));
    loadNotes();

    // 保存後に original のコンテンツを更新
    originalContent = content;
    originalTitle = title;
    hasChanges = false;
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

// メモを削除する
function deleteNote(index) {
    if (confirm("本当に削除しますか？")) {
        const notes = JSON.parse(localStorage.getItem('notes')) || [];
        notes.splice(index, 1);
        localStorage.setItem('notes', JSON.stringify(notes));
        loadNotes();

        // 現在表示中のノートが削除された場合、エディタをクリア
        if (index === notes.findIndex(n => n.title === noteTitle.value)) {
            clearEditor();
        }
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

// 「保存する」ボタンのクリックイベント
saveBtn.addEventListener('click', saveNote);

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

// ページロード時にメモ一覧を表示
window.addEventListener('load', () => {
    loadNotes();
    clearEditor();
});
