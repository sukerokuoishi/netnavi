# Normal Navi アプリデプロイメントガイド

このガイドでは、Normal Navi 3D会話アプリをデプロイして使用する方法を説明します。

## 🚀 デプロイ方法

### 1. 静的ホスティングサービス（推奨）

#### Netlify（無料・簡単）

1. **Netlifyアカウント作成**
   - [Netlify](https://www.netlify.com/)でアカウント作成

2. **デプロイ方法**
   ```bash
   # プロジェクトをZIPファイルに圧縮
   zip -r netnavi.zip index.html pmx-loader.js model/ README.md
   ```
   
   - Netlifyの管理画面で「Sites」→「Deploy manually」
   - ZIPファイルをドラッグ&ドロップ
   - 自動的にHTTPS URLが生成されます

3. **カスタムドメイン設定（オプション）**
   - Site settings → Domain management → Add custom domain

#### Vercel（無料・高速）

1. **Vercelアカウント作成**
   - [Vercel](https://vercel.com/)でアカウント作成

2. **デプロイ方法**
   ```bash
   # Vercel CLIインストール
   npm i -g vercel
   
   # プロジェクトフォルダで実行
   cd /Users/suke/workspace/netnavi
   vercel
   ```

#### GitHub Pages（無料）

1. **GitHubリポジトリ作成**
   ```bash
   cd /Users/suke/workspace/netnavi
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/netnavi.git
   git push -u origin main
   ```

2. **GitHub Pages設定**
   - リポジトリ → Settings → Pages
   - Source: Deploy from a branch
   - Branch: main, folder: / (root)

### 2. Firebase Hosting（無料・高性能）

1. **Firebase CLI セットアップ**
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. **プロジェクト初期化**
   ```bash
   cd /Users/suke/workspace/netnavi
   firebase init hosting
   ```

3. **デプロイ**
   ```bash
   firebase deploy
   ```

### 3. 自前サーバー

#### Node.js + Express

```bash
# 簡単なWebサーバー作成
cd /Users/suke/workspace/netnavi
npm init -y
npm install express
```

`server.js`を作成：
```javascript
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('.'));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
```

実行：
```bash
node server.js
```

#### Python（開発用）

```bash
# Python 3の場合
cd /Users/suke/workspace/netnavi
python3 -m http.server 8000

# ブラウザで http://localhost:8000 にアクセス
```

## 🔒 HTTPS設定（重要）

Web Speech APIは**HTTPS環境でのみ動作**します。

### 自動HTTPS（推奨）
- Netlify、Vercel、Firebase Hosting等は自動的にHTTPS化

### 手動HTTPS設定
Let's Encryptを使用（無料SSL証明書）：

```bash
# Ubuntu/Debianの場合
sudo apt install certbot
sudo certbot --standalone -d yourdomain.com

# Nginx設定例
server {
    listen 443 ssl;
    server_name yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    location / {
        root /path/to/netnavi;
        index index.html;
    }
}
```

## ⚙️ 設定

### 1. Miibo Webhook設定

アプリ起動後、左上の設定欄に以下を入力：

- **Webhook URL**: miiboから提供されるWebhook URL
- **Secret Key**: miiboから提供されるシークレットキー

### 2. ブラウザ設定

#### Chrome推奨設定
1. マイク使用許可の設定
2. 「設定」→「プライバシーとセキュリティ」→「サイトの設定」→「マイク」で許可

#### CORS設定（開発時）
ローカル開発時にCORSエラーが発生する場合：

```bash
# Chrome起動時にCORS無効化（開発時のみ）
google-chrome --disable-web-security --user-data-dir="/tmp/chrome_dev"
```

## 🌐 動作確認

### 1. アクセステスト
1. デプロイされたURLにアクセス
2. HTTPSで提供されていることを確認（鍵マークが表示）
3. 3Dモデルが表示されることを確認

### 2. 音声機能テスト
1. ブラウザでマイク使用許可を与える
2. 「音声入力開始」ボタンをクリック
3. 「こんにちは」と話してみる
4. 音声認識が動作することを確認

### 3. Webhook連携テスト
1. Webhook URLとSecret Keyを入力
2. 音声入力を行う
3. miiboからの応答と音声出力を確認

## 🐛 トラブルシューティング

### よくある問題

#### 音声認識が動作しない
- **原因**: HTTP環境で実行している
- **解決**: HTTPS環境でアクセス

#### マイクが使用できない
- **原因**: ブラウザの許可設定
- **解決**: ブラウザ設定でマイク使用を許可

#### PMXモデルが読み込めない
- **原因**: ファイルパスまたはCORSエラー
- **解決**: 
  - ファイルパスを確認
  - プレースホルダーモデルが表示されるので機能には影響なし

#### Webhook連携エラー
- **原因**: URL/Secret Key設定ミス、CORS問題
- **解決**: 
  - 設定値を再確認
  - miibo側でCORS設定を確認

### ログ確認方法

1. ブラウザの開発者ツール（F12）を開く
2. Consoleタブでエラーメッセージを確認
3. Networkタブで通信状況を確認

## 📱 推奨動作環境

- **ブラウザ**: Chrome 70+, Edge 79+, Firefox 62+, Safari 14.1+
- **OS**: Windows 10+, macOS 10.15+, iOS 14.5+, Android 7+
- **インターネット**: 安定した接続（音声認識・合成のため）

## 🔄 更新・メンテナンス

### アップデート方法
1. ファイルを修正
2. 再デプロイ（サービスにより方法が異なる）

### バックアップ
- プロジェクトファイルのバックアップを推奨
- GitHubなどでバージョン管理

## 💡 最適化のヒント

1. **キャッシュ設定**: 静的ファイルのキャッシュを有効化
2. **圧縮**: gzip圧縮を有効化
3. **CDN**: 大きなファイル（PMX）はCDNの使用を検討
4. **モニタリング**: アクセス状況とエラーの監視

これで Normal Navi アプリを本番環境で使用できます！