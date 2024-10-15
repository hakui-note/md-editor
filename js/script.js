const $editor = $('#editor');
const $preview = $('#preview');
const $saveBtn = $('#saveBtn');
const $downloadBtn = $('#downloadBtn');
const $notesList = $('#notesList');
const $noteTitle = $('#noteTitle');
const $newNoteBtn = $('#newNoteBtn');

let hasChanges = false; // 変更があったかどうかのフラグ
let originalContent = '';
let originalTitle = '';

// メモをローカルストレージに保存
function saveCurrentNote() {
    var noteTitle = $('#noteTitle').val();
    var noteContent = $('#editor').val();

    if (!noteTitle || !noteContent) {
        alert('タイトルと内容を入力してください。');
        return;
    }

    var notesList = JSON.parse(localStorage.getItem('notes')) || [];

    // 既存メモがあるかチェック
    var existingIndex = notesList.findIndex(function(note) {
        return note.title === noteTitle;
    });

    // 日付と時刻を取得
    var now = new Date();
    var dateTime = now.toLocaleDateString() + ' ' + now.toLocaleTimeString(); // 日付と時刻をフォーマット

    if (existingIndex > -1) {
        // 既存のメモを更新（更新日を保持する）
        notesList[existingIndex].content = noteContent;
        notesList[existingIndex].updatedAt = dateTime;
    } else {
        // 新規メモの場合、配列の先頭に追加して、現在の日付をセット
        var newNote = {
            title: noteTitle,
            content: noteContent,
            updatedAt: dateTime, // 日付と時刻を保存
        };
        notesList.push(newNote); // 配列の先頭に追加
    }

    localStorage.setItem('notes', JSON.stringify(notesList)); // ローカルストレージに保存
    loadNotesList(); // サイドバーを更新
    showNotification('メモが正常に保存されました'); // 通知を表示
    hasChanges = false;  // 変更フラグをリセット
}

// メモの配列のソート
function loadNotesList() {
    $('#notesList').empty(); // サイドバーをクリア
    let notes = JSON.parse(localStorage.getItem('notes')) || [];

    // メモを更新日でソート（新しい順に）
    notes = sortNotesByDate(notes);

    // メモを日付ごとにグループ化
    const groupedNotes = groupNotesByDate(notes);

    Object.keys(groupedNotes).forEach(date => {
        const dateHeader = $('<h3>', { text: date });  // 日付ヘッダーを追加
        $('#notesList').append(dateHeader);

        groupedNotes[date].forEach((note, index) => {
            const $li = $('<li>');

            // メモタイトルと削除ボタンを表示
            $li.html(`
                <strong>${note.title}</strong><br>
                <button class="delete-btn">×</button>
            `);

            // メモクリックで内容を読み込む
            $li.on('click', () => {
                if (hasChanges) {
                    const isConfirmed = confirm("現在のメモが変更されています。メモを切り替えてもよろしいですか？");
                    if (isConfirmed) {
                        hasChanges = false; // キャンセル時にフラグをリセット
                    } else {
                        return;
                    }
                }

                // すべてのメモから "active" クラスを削除
                $('#notesList li').removeClass('active');

                // クリックされたメモに "active" クラスを追加
                $li.addClass('active');

                // メモの内容を読み込む
                $('#noteTitle').val(note.title);
                $('#editor').val(note.content);
                $('#preview').html(marked(note.content));
            });

            // 削除ボタンのクリックイベントを追加
            $li.find('.delete-btn').on('click', (event) => {
                event.stopPropagation(); // リストアイテムのクリックイベントを停止
                deleteNote(note.title); // メモを削除
            });

            $('#notesList').append($li);
        });
    });
}

// メモを更新日でソートする関数（降順）
function sortNotesByDate(notes) {
    return notes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

// メモを日付ごとにグループ化する関数
function groupNotesByDate(notes) {
    return notes.reduce((group, note) => {
        const date = note.updatedAt.split(' ')[0]; // 日付のみ抽出
        if (!group[date]) {
            group[date] = [];
        }
        group[date].push(note);
        return group;
    }, {});
}

// サイドバーに保存されたメモを一覧表示
// ChatGPTによる調整
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
        $('#noteTitle').val(note.title);
        $('#editor').val(note.content);
        $('#preview').html(marked(note.content));
    }
}

// メモを削除
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
        loadNotesList();
        showNotification('メモが削除されました'); // 通知を表示
    }
}

$(document).ready(function() {

    // サイドバーのドラッグ機能
    var isDragging = false;
    var minWidth = 150; // サイドバーの最小幅
    var maxWidth = 400; // サイドバーの最大幅

    // ドラッグバーが押された時
    $('#dragbar').mousedown(function(e) {
        isDragging = true;
        $('body').addClass('no-select'); // ドラッグ中にテキスト選択を無効にする
    });

    // ドラッグ中の動作
    $(document).mousemove(function(e) {
        if (isDragging) {
            var newWidth = e.pageX;

            // 上限と下限を設定
            if (newWidth < minWidth) newWidth = minWidth;
            if (newWidth > maxWidth) newWidth = maxWidth;

            // サイドバーとメインコンテンツの幅を変更
            $('.sidebar').css('width', newWidth + 'px');
        }
    });

    // ドラッグを終了した時
    $(document).mouseup(function() {
        if (isDragging) {
            isDragging = false;
            $('body').removeClass('no-select'); // ドラッグ終了後にテキスト選択を有効に戻す
        }
    });
});

$(document).ready(function() {
    // 折りたたみボタンのクリックイベント
    $('#toggle-btn').on('click', function() {
        $('.sidebar').toggleClass('collapsed'); // サイドバーを折りたたむ/開く
        $('#main-content').toggleClass('collapsed'); // メインコンテンツのマージン調整
    });
});


// エディタに入力があった場合に変更フラグを立てる
$('#editor').on('input', () => {
    hasChanges = true; // エディタの内容が変更された場合、フラグを立てる
});

// タイトルの変更を検知
$('#noteTitle').on('input', checkChanges);

// 変更を検知する関数
function checkChanges() {
    hasChanges = (editor.value !== originalContent) || (noteTitle.value !== originalTitle);
}

// ページを離れる前に確認ダイアログを表示する
$(window).on('beforeunload', function(event) {
    if (hasChanges) {
        event.preventDefault(); // 標準のダイアログを表示
        event.returnValue = ''; // Chrome用
    }
});

// 新規作成ボタンのクリックイベント
$('#newNoteBtn').on('click', () => {
    if (hasChanges && !confirm('変更が保存されていません。ページを離れますか？')){
        return;
    }
    clearEditor();
});

// 通知を表示する関数
function showNotification(message) {
    const notification = $('#saveNotification');
    notification.text(message);
    notification.removeClass('hidden');
    notification.addClass('visible');

    // 1秒後に通知を非表示にする
    setTimeout(() => {
        notification.removeClass('visible');
        notification.addClass('hidden');
    }, 1000); // 1秒後に非表示
}

// 「保存する」ボタンのクリックイベント
$('#saveBtn').on('click', () => {
    saveCurrentNote(); // ノートを保存する関数を呼び出す
    showNotification('メモが正常に保存されました'); // 保存完了の通知を表示
    hasChanges = false;  // 変更フラグをリセット
});

// Ctrl + Sで保存を実行するショートカット機能
$(document).on('keydown', function(event) {
    if (event.ctrlKey && event.key === 's') {
        event.preventDefault(); // ブラウザのデフォルトの保存機能を無効にする
        saveCurrentNote(); // 保存処理を実行
        showNotification('メモが正常に保存されました'); // // 保存完了の通知を表示
        hasChanges = false;  //   // 変更フラグをリセット
    }
});

// 「ダウンロード」ボタンでMarkdownファイルをダウンロード
$('#downloadBtn').on('click', () => {
    const markdownText = $('#editor').val();
    const blob = new Blob([markdownText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = $('<a>', { href: url, download: `${$('#noteTitle').val() || 'markdown'}.md` });
    $(document.body).append(a);
    a[0].click();
    URL.revokeObjectURL(url);
});

// 最新のメモを所得する関数
function getLatestNote() {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    
    // 最新のメモを取得（更新日でソート）
    const sortedNotes = sortNotesByDate(notes);
    
    // 最新メモを返す
    return sortedNotes[0]; // 最新メモを返す
}

// ページリロード時にメモ一覧を表示
$(window).on('load', () => {
    loadNotesList(); 
    
    const latestNote = getLatestNote();
    if (latestNote) {
        $('#noteTitle').val(latestNote.title); // タイトルを表示
        $('#editor').val(latestNote.content); // 内容を表示
        $('#preview').html(marked(latestNote.content)); // プレビューを更新
    }
});
