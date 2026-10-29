from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# 【重要】React（別ドメイン・別ポート）からの通信を許可する設定（CORS）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# リクエストで送られてくるデータの型定義（Pydanticモデル）
class MemoRequest(BaseModel):
    title: str
    content: str

# メモを受け取って要約を返すAPIのエンドポイント
@app.post("/api/summarize")
def summarize_memo(memo: MemoRequest):
    # 【モックAI処理】本来はここでOpenAIやGeminiのAPIを呼び出します
    # 本日はまず、本文の最初の数文字を使ったAI風要約を返します
    short_content = memo.content[:15] if len(memo.content) > 15 else memo.content
    summary_text = f"【AI自動要約】「{short_content}...」に関する重要な内容です。"
    
    return {
        "status": "success",
        "title": memo.title,
        "summary": summary_text
    }