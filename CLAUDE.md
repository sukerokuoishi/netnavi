# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクトの概要 (Project Overview)

このプロジェクトは、「Normal Navi」という名前のロックマンエグゼシリーズのキャラクターをベースにした3Dモデルです。PMX（Polygon Model eXtended）形式のファイルを含み、MikuMikuDance（MMD）や3Dアニメーション用途に使用されます。

**プロジェクトの目的：** ロックマンエグゼ/カプコンの「Normal Navi」キャラクターの3Dモデル化

## プロジェクトの構造 (Project Structure) 

- `model/` - PMXモデルファイルを格納
  - `normalnavi.pmx` - メインキャラクターモデルファイル（249KB）

## 使用技術 (Technologies Used)

- **PMX形式：** MikuMikuDance用の3Dモデル形式
- **3Dモデリング：** 頂点データ、ボーン構造、マテリアル、モーフターゲットを含む
- **アニメーション対応：** MMDでのアニメーション制作に対応

## アーキテクチャパターン (Architecture Patterns)

このプロジェクトは単一のアセット（3Dモデル）で構成されているため、従来のソフトウェアアーキテクチャパターンは適用されません。3Dモデルの構造は以下の通りです：

- **データ構造：** バイナリ形式での3Dメッシュデータ
- **コンポーネント設計：** 頂点、面、ボーン、マテリアルの分離

## エントリーポイント (Main Entry Point)

メインエントリーポイントは `model/normalnavi.pmx` ファイルです。これは以下のソフトウェアで開くことができます：
- MikuMikuDance
- PMXエディタ
- Blender（MMDプラグイン使用）

## フォルダ構造 (Folder Structure)

```
netnavi/
└── model/
    └── normalnavi.pmx  # ロックマンエグゼのNormal Naviキャラクターモデル
```

## データベーススキーマ (Database Schema)

このプロジェクトはデータベースを使用していません。PMXファイル内の3Dモデルデータ構造は以下の通りです：

- **頂点データ：** 3D座標、法線、UV座標
- **面データ：** 三角形メッシュのインデックス
- **ボーンデータ：** スケルタルアニメーション用の骨格構造
- **マテリアル：** テクスチャとシェーディング情報

## 主要データモデル (Key Data Models)

PMXファイル内の主要データ構造：

1. **頂点（Vertex）：** 3D空間での点の位置情報
2. **面（Face）：** 3つの頂点で構成される三角形
3. **ボーン（Bone）：** アニメーション用の骨格システム
4. **モーフ（Morph）：** 表情変化などの変形データ
5. **マテリアル（Material）：** レンダリング用の材質情報

## エラーハンドリング (Error Handling)

このプロジェクトはコード実行を伴わないため、従来のエラーハンドリングは適用されません。PMXファイルの破損や互換性の問題は、使用する3Dソフトウェア側で処理されます。

## 認証処理 (Authentication)

このプロジェクトには認証システムは実装されていません。PMXファイルは静的なアセットファイルであり、アクセス制御は不要です。

## ファイル形式の詳細 (File Format Details)

- **PMXファイル：** MikuMikuDance用の3Dモデル形式で、頂点データ、ボーン構造、マテリアル、日本語スタイルの3Dキャラクターモデル用のモーフターゲットを含む

## 作業環境 (Working Environment)

PMXファイルはバイナリ形式のため、テキストエディタでの直接編集は不可能です。以下の専用ソフトウェアが必要です：
- PMXエディタ（PMXエディタ）
- MMDプラグイン付きBlender  
- MikuMikuDance本体

## 現在の状態 (Current State)

このリポジトリは現在、ビルドシステム、バージョン管理、開発ワークフローを持たない、モデルアセットのみを含んでいます。将来的には、使用目的に応じて適切なアセット管理とビルドプロセスの設定が必要になる可能性があります。