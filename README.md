# Cyber Chess V3 Desktop Engines (WASM)

[日本語 (Japanese)](#japanese) | [English](#english)


* **Landing Page**: [https://tztechno.github.io/proj12](https://tztechno.github.io/proj12)
* **Main Product Page**: [https://cyber-matrix.netlify.app/products/chess](https://cyber-matrix.netlify.app/products/chess)
* **Official WebAssembly Engine Repository**: [https://github.com/tztechno/cyber_chess_v3_desktop_engines](https://github.com/tztechno/cyber_chess_v3_desktop_engines)


---

<a id="japanese"></a>
## 日本語

### 概要
本リポジトリは、次世代3Dチェスシミュレーター**『[サイバーチェス V3 Desktop Edition](https://cyber-matrix.netlify.app/products/chess)』**に同梱されている、WebAssembly（WASM）形式のチェス思考エンジンのソースコードおよびビルド環境を公開するものです。

本アプリに内蔵されている思考演算コンポーネントは、オープンソースの強力なチェス変則エンジンである **Fairy-Stockfish**（および **Stockfish**）をベースにWebAssembly化されています。

### ライセンスについて
本リポジトリ内のエンジンソースコード、接続用のラッパー、およびビルド手順は、**GNU General Public License version 3 (GPL v3)** に基づいて公開されています。ユーザーはGPLv3の規定に従い、このエンジン部分を自由に取得、改変、再コンパイルすることができます。

### アーキテクチャと疎結合（非リンク）の証明
『サイバーチェス V3 Desktop Edition』は、独自の知的財産（プロプライエタリなUI・演出ロジック）を保護しつつ、GPLv3コードを安全に統合するために、**プロセスおよびスレッドレベルでの厳格な隔離アーキテクチャ**を採用しています。

1. **実行環境の完全分離**: 
   UIおよび画面描画、対局進行などのビジネスロジックは、Next.jsおよびTauriで構築された「**Main UI Thread**（完全非公開・クローズドソース）」で処理されます。思考エンジンは、ブラウザ/ランタイムのバックグラウンドで完全に独立して動作する「**Web Worker Thread**（本リポジトリにて公開）」内で稼働します。
2. **共有メモリなしの疎結合通信**: 
   Main UI ThreadとWeb Worker Threadの間には、直接的な関数呼び出し（APIリンク）やメモリ共有（ポインタの共有など）は一切存在しません。
3. **UCI標準テキストプロトコル**: 
   両コンポーネント間の通信は、チェス業界標準のテキストメッセージングプロトコルである **UCI (Universal Chess Interface)** に完全に準拠し、非同期の `postMessage` のみで行われます。
   * **UI ➔ Engine**: `position startpos moves e2e4...` (文字列送信)
   * **Engine ➔ UI**: `bestmove d7d5` (文字列受信)

この「非リンクかつテキストコマンドによる仲介」という構成は、GPLv3において「**Mere Aggregation（単なる集合体）**」として定義されます。これにより、GPLv3の公開義務が独自のフロントエンドUI（Next.js側）に波及（感染）することは法的に遮断され、独自の知的財産を安全にクローズドソースで維持したまま、最高峰のオープンソースエンジンを100%合法的に組み込むことが可能となっています。

### ビルド手順 (WASMコンパイル)
本リポジトリから、アプリに同梱されているものと同一のWASMエンジンバイナリを再現ビルドする手順は以下の通りです。

#### 1. 前提条件のインストール
コンパイルには **Emscripten SDK (emsdk)** が必要です。
```bash
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
./emsdk install latest
./emsdk activate latest
source ./emsdk_env.sh
```

#### 2. コンパイルの実行
リポジトリのルート（Makefileが存在するディレクトリ）で以下のコマンドを実行します。
```bash
make wasm
```
ビルドが成功すると、Next.jsの `/public` フォルダへ配置可能な以下のビルド成果物が生成されます：
* `cyber_chess_engine.js` (WASMロード用JavaScript)
* `cyber_chess_engine.wasm` (エンジンバイナリ本体)
* `engine-worker.js` (Web Worker隔離スレッド制御スクリプト)

---

<a id="english"></a>
## English

### Overview
This repository provides the WebAssembly (WASM) chess engine source code and compilation environment distributed with the next-generation 3D chess simulator, **[Cyber Chess V3 Desktop Edition](https://cyber-matrix.netlify.app/products/chess)**.

The reasoning engine bundled inside the application is powered by a WebAssembly port of **Fairy-Stockfish** (and **Stockfish**), the world-class open-source chess variant engine.

### License
The engine source code, integration wrappers, and build tools in this repository are licensed under the **GNU General Public License version 3 (GPL v3)**. In accordance with GPLv3, you are free to study, modify, and recompile this engine component.

### Architecture & Loose Coupling Proof (Aggregation)
To protect our proprietary intellectual property (3D UI, graphics, and custom presentation logic) while safely integrating the GPLv3 engine, "Cyber Chess V3 Desktop Edition" employs a strict **process-level and thread-level isolation architecture**.

1. **Complete Execution Isolation**: 
   The frontend user interface, graphics, and overall game management run inside the **Main UI Thread** (built with Next.js + Tauri, fully proprietary and closed-source). The heavy chess engine calculations are completely offloaded to a background **Web Worker Thread** (provided in this repository).
2. **Zero Memory Sharing / No Direct Linking**: 
   There is no shared memory, pointer sharing, or direct C++ linking/function calling between the Main UI Thread and the Web Worker Thread.
3. **UCI Text Protocol Messaging**: 
   Communication between the UI and the Engine is strictly limited to asynchronous string serialization via `postMessage`, strictly adhering to the standard chess protocol, **UCI (Universal Chess Interface)**:
   * **UI ➔ Engine**: `position startpos moves e2e4...` (Text Command)
   * **Engine ➔ UI**: `bestmove d7d5` (Text Response)

Because they communicate solely through a standardized text messaging pipeline across process/thread barriers without any static or dynamic linking, this system qualifies as a **"Mere Aggregation"** under GPLv3. Consequently, the copyleft requirement of GPLv3 is legally blocked from infecting the proprietary Next.js UI, allowing us to safeguard our commercial frontend assets while fully complying with open-source regulations.

### Build Instructions (WASM Compilation)
To reproduce the exact WebAssembly binary bundled within the application:

#### 1. Prerequisites
You need the **Emscripten SDK (emsdk)** installed on your machine.
```bash
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
./emsdk install latest
./emsdk activate latest
source ./emsdk_env.sh
```

#### 2. Compiling the Engine
Run the build command in the root directory where the Makefile is located:
```bash
make wasm
```
Upon a successful build, the following assets will be generated, which are ready to be served from the Next.js `/public` assets folder:
* `cyber_chess_engine.js` (WebAssembly loading wrapper)
* `cyber_chess_engine.wasm` (Compiled WebAssembly binary)
* `engine-worker.js` (The background Web Worker thread script)
