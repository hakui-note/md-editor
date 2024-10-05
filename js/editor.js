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

// プレビューを更新
function updatePreview() {
    preview.innerHTML = marked(editor.value);
}
