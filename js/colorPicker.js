// プルダウンの選択肢がクリックされたときの処理
function applyColor(selector, applyColorFunction, dropdownId, optionsId, isMarker = false) {
    document.querySelectorAll(selector).forEach(item => {
        item.addEventListener('click', () => {
            const color = item.getAttribute('data-color');
            
            // 選択された色を用いて、適切なタグを生成
            if (isMarker) {
                applyColorFunction(`<span style="background-color:${color};">`, `</span>`); // マーカー用
            } else {
                applyColorFunction(`<font color="${color}">`, `</font>`); // 文字色用
            }

            // プルダウンを閉じる
            document.getElementById(optionsId).style.display = 'none';
        });
    });
}

// 文字色の処理
applyColor('#colorOptions li', applyTextColor, 'colorDropdown', 'colorOptions', false);

// マーカーの処理
applyColor('#markerOptions li', applyMarkerColor, 'markerDropdown', 'markerOptions', true);


// 選択されたテキストに文字色を適用する関数
function applyTextColor(startTag, endTag) {
    applyTagToSelection(startTag, endTag);
}

// 選択されたテキストにマーカー色を適用する関数
function applyMarkerColor(startTag, endTag) {
    applyTagToSelection(startTag, endTag);
}

// 共通のタグ適用関数
function applyTagToSelection(startTag, endTag) {
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

    updatePreview(); // プレビューを更新
}
