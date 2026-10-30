import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai

app = FastAPI()

# React（別ドメイン・別ポート）からの通信を許可する設定（CORS）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Geminiクライアントの初期化
# 環境変数 "GEMINI_API_KEY" から自動的にキーを読み込みます
client = genai.Client()

# リクエストで送られてくるデータの型定義（Pydanticモデル）
class MemoRequest(BaseModel):
    title: str
    content: str

# メモを受け取ってGemini APIで要約を返すエンドポイント
@app.post("/api/summarize")
def summarize_memo(memo: MemoRequest):
    try:
        # Geminiに渡すプロンプトの作成
        prompt = f"""
以下のメモのタイトルと本文を読み、要点を1〜2文程度で簡潔に要約してください。

タイトル: {memo.title}
本文: {memo.content}
"""

        # Gemini APIの呼び出し (軽量で高速な gemini-2.5-flash モデルを使用)
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )

        ai_summary = response.text if response.text else "要約を生成できませんでした。"

        return {
            "status": "success",
            "title": memo.title,
            "summary": f"✨ {ai_summary.strip()}"
        }

    except Exception as e:
        print(f"Gemini API エラー: {e}")
        raise HTTPException(status_code=500, detail=str(e))