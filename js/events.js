// プルダウンの開閉処理（文字色）
document.getElementById('colorDropdown').addEventListener('click', (event) => {
    const colorDropdown = document.getElementById('colorOptions');
    const markerDropdown = document.getElementById('markerOptions');
    
    // マーカープルダウンが開いていたら閉じる
    if (markerDropdown.style.display === 'block') {
        markerDropdown.style.display = 'none';
    }

    // 文字色プルダウンの開閉
    colorDropdown.style.display = colorDropdown.style.display === 'block' ? 'none' : 'block';
    event.stopPropagation(); // クリックイベントの伝播を防ぐ
});

// プルダウンの開閉処理（マーカー）
document.getElementById('markerDropdown').addEventListener('click', (event) => {
    const colorDropdown = document.getElementById('colorOptions');
    const markerDropdown = document.getElementById('markerOptions');
    
    // 文字色プルダウンが開いていたら閉じる
    if (colorDropdown.style.display === 'block') {
        colorDropdown.style.display = 'none';
    }

    // マーカープルダウンの開閉
    markerDropdown.style.display = markerDropdown.style.display === 'block' ? 'none' : 'block';
    event.stopPropagation(); // クリックイベントの伝播を防ぐ
});

// 選択範囲のテキストをタグで囲む
function wrapSelectedText(startTag, endTag) {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selectedText = editor.value.substring(start, end);

    if (selectedText) {
        const newText = startTag + selectedText + endTag;
        editor.setRangeText(newText);
    } else {
        editor.setRangeText(startTag + endTag);
        editor.selectionStart = editor.selectionEnd = start + startTag.length;
    }

    updatePreview();
}
// ページ全体のクリックイベントリスナー
document.addEventListener('click', (event) => {
    const colorOptions = document.getElementById('colorOptions');
    const markerOptions = document.getElementById('markerOptions');

    // プルダウンメニュー以外の部分をクリックしたら閉じる
    if (!colorOptions.contains(event.target) && !markerOptions.contains(event.target)) {
        colorOptions.style.display = 'none';
        markerOptions.style.display = 'none';
    }
});

