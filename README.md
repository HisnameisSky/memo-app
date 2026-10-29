# 📝 AI-Powered Memo App (AIひとこと要約付きメモ帳アプリ)

React（フロントエンド）と Python / FastAPI（バックエンド）を組み合わせた、フルスタックのメモ帳アプリケーションです。メモを入力すると、バックエンド側で自動的にAI風の要約文が生成され、リアルタイムで画面に反映されます。

---

## 🛠️ 使用技術 (Tech Stack)

- **Frontend:** React (JavaScript / JSX), HTML5, CSS3
- **Backend:** Python, FastAPI, Pydantic, Uvicorn
- **Tools:** Git / GitHub, REST API, CORS

---

## 🔄 アーキテクチャ & データの流れ (Data Flow)

1. **ユーザー入力:** Reactの `useState` でタイトルと本文を管理。
2. **APIリクエスト:** 「メモ追加」ボタンを押すと、非同期処理 (`fetch` / `asyncio`) でFastAPIへ `POST` リクエストを送信。
3. **バックエンド処理:** FastAPI (`main.py`) が `Pydantic` でデータ型を検証し、要約データを生成。
4. **画面反映:** レスポンスとして返却された要約文を含めてメモリストを更新し、UIに即座にレンダリング。

## 🚀 導入・起動方法 (Getting Started)
このプロジェクトをローカル環境で動かす手順です。

1. リポジトリのクローン
```
git clone https://github.com/あなたのユーザー名/ai-memo-app.git
cd ai-memo-app
```

2. バックエンド（Python / FastAPI）の起動
```
# 仮想環境の作成と有効化
python -m venv .venv
# Mac/Linuxの場合:
source .venv/bin/activate
# Windowsの場合:
# .venv\Scripts\activate

# 依存ライブラリのインストール
pip install fastapi uvicorn

# サーバーの起動
uvicorn main:app --reload
```

```
サーバーが起動したら [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) でAPIのテストが可能です。
```

3. フロントエンド（React）の起動
index.jsx をお使いの環境（Babel/React CDN環境やVite等）で読み込み、ブラウザで表示してください。

✨ 工夫したポイント・学び (Highlights)
CORSと非同期通信の理解: フロントとバックエンドが別ポートで動く環境における、CORS設定や async/await を用いたエラーハンドリングを実装しました。

UI/UXの向上: 通信中のローディング状態（loading ステート）を管理し、二重送信防止や「AI要約中...」といった動的なボタン表示に対応しました。

データ不変性 (Immutability): Reactの状態管理において、配列を直接書き換えずスプレッド構文や .filter() を用いて安全に更新する設計を意識しています。

👤 著者 (Author)
GitHub: @HisnameisSky