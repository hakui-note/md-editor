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

// Ctrl + Pで新規タブにプレビューを開くショートカット機能
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.key === 'p') {
        event.preventDefault(); // ブラウザのデフォルトの印刷機能を無効にする
        openPreviewInNewTab(); // 新規タブでプレビューを開く
    }
});

// 「新規タブでプレビュー」ボタンのクリックイベント
document.getElementById('previewTabBtn').addEventListener('click', openPreviewInNewTab);