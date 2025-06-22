# Normal Navi - 3D Conversational Character

ロックマンエグゼシリーズの「Normal Navi」キャラクターをベースにした、音声対話可能な3Dキャラクターです。

## 機能

- **3Dモデル表示**: PMX形式のNormal Naviモデルを3D表示
- **音声認識**: Web Speech APIを使用した日本語音声入力
- **音声出力**: Text-to-Speech APIによる音声応答
- **感情表現**: 喜・怒・哀・楽の4つの感情に基づくアニメーション
- **Webhook連携**: miiboサービスとの連携による高度な対話機能

## 使用技術

- **Babylon.js**: 3D描画エンジン
- **Web Speech API**: 音声認識・音声合成
- **PMX形式**: MikuMikuDance用3Dモデル形式
- **Webhook**: miibo SaaSとの連携

## セットアップ

1. WebサーバーでHTMLファイルを提供（ローカルファイルでは動作しません）
2. miiboのWebhook URLとSecret Keyを設定
3. Chrome等のモダンブラウザでアクセス

## ファイル構成

```
netnavi/
├── index.html          # メインアプリケーション
├── pmx-loader.js       # PMXファイルローダー
├── model/
│   └── normalnavi.pmx  # 3Dモデルファイル
├── README.md           # このファイル
└── CLAUDE.md          # 開発者向けガイド
```

## 使い方

1. ブラウザでindex.htmlを開く
2. Webhook URLとSecret Keyを入力
3. 「音声入力開始」ボタンを押して話しかける
4. Normal Naviが感情を込めて応答

## 感情システム

応答テキストの末尾に含まれる感情文字に基づいてアニメーションが変化します：

- **喜**: 跳ねる動作 😊
- **怒**: 震える動作 😠  
- **哀**: うつむく動作 😢
- **楽**: 回転動作 😄

## 注意事項

- HTTPS環境での実行が推奨されます（音声認識のため）
- ChromeまたはEdgeブラウザでの動作を推奨
- PMXファイルの読み込みに失敗した場合、プレースホルダーモデルを表示

## デプロイ方法

詳細なデプロイ方法は`DEPLOYMENT.md`を参照してください。

### 🚀 クイックデプロイ

#### 1. Netlify（最も簡単）
```bash
# ZIPファイルを作成
npm run deploy:netlify
```
作成されたZIPファイルをNetlify（https://www.netlify.com/）にドラッグ&ドロップ

#### 2. ローカル開発サーバー
```bash
# Node.jsサーバー
npm install
npm start

# または Python（開発用）
npm run dev
```

#### 3. その他のプラットフォーム
- **Vercel**: `npm run deploy:vercel`
- **Firebase**: `npm run deploy:firebase`
- **GitHub Pages**: GitHubリポジトリにプッシュして設定

### ⚠️ 重要な注意事項

- **HTTPS必須**: 音声認識機能はHTTPS環境でのみ動作
- **ブラウザ**: Chrome/Edgeを推奨
- **Webhook設定**: miiboのURLとSecret Keyが必要

## 開発

詳細な開発情報は`CLAUDE.md`を参照してください。