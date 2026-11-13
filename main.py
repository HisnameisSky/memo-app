import os
import base64
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from google.genai import types
from typing import Optional

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 【拡張】ファイルデータを受け取れるようにスキーマを修正
class MemoRequest(BaseModel):
    title: str
    content: str
    file_data: Optional[str] = None   # Base64形式のファイル
    mime_type: Optional[str] = None  # "image/png", "application/pdf" など

@app.post("/api/summarize")
def summarize_memo(
    memo: MemoRequest,
    x_api_key: Optional[str] = Header(None)
):
    if not x_api_key:
        raise HTTPException(
            status_code=400,
            detail="APIキーが設定されていません。画面上部からGemini APIキーを設定してください。"
        )

    try:
        client = genai.Client(api_key=x_api_key)
        
        # Geminiに渡すコンテンツのベース（テキストプロンプト）
        prompt = f"""
以下のメモのタイトルと本文、および添付されているファイル（画像やPDF）を読み込み、要点を1〜2文程度で簡潔に要約してください。

タイトル: {memo.title}
本文: {memo.content}
"""
        contents = [prompt]

        # 添付ファイル（画像・PDF）がある場合のマルチモーダル処理
        if memo.file_data and memo.mime_type:
            # "data:image/png;base64,..." のようなプレフィックスがついている場合は剥がす
            base64_str = memo.file_data
            if "," in base64_str:
                base64_str = base64_str.split(",")[1]
            
            # バイナリにデコード
            file_bytes = base64.b64decode(base64_str)
            
            # Gemini SDK用のマルチモーダルパーツを作成
            file_part = types.Part.from_bytes(
                data=file_bytes,
                mime_type=memo.mime_type
            )
            contents.append(file_part)

        # Gemini APIの呼び出し（マルチモーダル対応モデル）
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=contents,
        )

        ai_summary = response.text if response.text else "要約を生成できませんでした。"

        return {
            "status": "success",
            "title": memo.title,
            "summary": f"✨ {ai_summary.strip()}"
        }

    except Exception as e:
        print(f"Gemini API エラー: {e}")
        raise HTTPException(status_code=500, detail=f"APIエラー: {str(e)}")