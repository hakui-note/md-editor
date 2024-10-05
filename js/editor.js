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

// プレビューを更新
function updatePreview() {
    preview.innerHTML = marked(editor.value);
}
