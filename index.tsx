import React, { useState } from 'react';

// データの設計図（TypeScriptの型定義）
interface Memo {
  id: number;
  title: string;
  content: string;
  summary: string;
  calculatedResult: string | null;
  createdAt: string;
}

export function MemoApp() {
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [memos, setMemos] = useState<Memo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // 簡易的な数式計算ロジック（安全性を少し考慮）
  const evaluateMath = (text: string): string | null => {
    try {
      // 数字と四則演算子、スペース、カッコのみを許可する（セキュリティ向上）
      const sanitized = text.replace(/[^0-9+\-*/().]/g, '');
      if (sanitized.length > 0 && /[\+\-\*\/]/.test(sanitized)) {
        // eslint-disable-next-line no-eval
        const result = eval(sanitized); 
        return `${sanitized} = ${result}`;
      }
    } catch (e) {
      // 計算できない数式の場合は無視
    }
    return null;
  };

  const handleAddMemo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setLoading(true);
    const mathResult = evaluateMath(content);
    
    let aiSummary = "【AI要約完了】";
    try {
      const response = await fetch('http://127.0.0.1:8000/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });
      if (response.ok) {
        const data = await response.json();
        aiSummary = data.summary;
      }
    } catch (error) {
      console.error('API通信エラー:', error);
      aiSummary = "【通信エラー】AI要約を取得できませんでした";
    } finally {
      setLoading(false);
    }

    const newMemo: Memo = {
      id: Date.now(),
      title,
      content,
      summary: aiSummary,
      calculatedResult: mathResult,
      createdAt: new Date().toLocaleTimeString(),
    };

    setMemos([newMemo, ...memos]);
    setTitle('');
    setContent('');
  };

  // 【追加】メモを削除する関数
  const handleDeleteMemo = (id: number) => {
    setMemos(memos.filter((memo) => memo.id !== id));
  };

  return (
    <div style={{ padding: '30px', maxWidth: '650px', margin: '0 auto', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', background: '#faf9f6', minHeight: '100vh', borderRadius: '12px' }}>
      <h2 style={{ color: '#1d1d1f', textAlign: 'center', fontWeight: '600' }}>✨ Apple Notes Style AI Memo</h2>

      {/* 入力フォーム */}
      <form onSubmit={handleAddMemo} style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', marginBottom: '25px', border: '1px solid #e5e5ea' }}>
        <input
          type="text"
          placeholder="タイトル..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={loading}
          style={{ padding: '12px', fontSize: '15px', borderRadius: '8px', border: '1px solid #d2d2d7', outline: 'none' }}
        />
        <textarea
          placeholder="本文（例: 「今月の予算 50000 * 0.8」などと書くと自動計算されます）..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={loading}
          rows={4}
          style={{ padding: '12px', fontSize: '15px', borderRadius: '8px', border: '1px solid #d2d2d7', outline: 'none', resize: 'vertical' }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{ padding: '12px', background: loading ? '#8e8e93' : '#0071e3', color: '#fff', border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '15px', fontWeight: '500' }}
        >
          {loading ? 'AI処理中...' : 'メモを追加'}
        </button>
      </form>

      {/* メモ一覧表示 */}
      <h3 style={{ color: '#1d1d1f', fontSize: '18px', marginBottom: '15px' }}>メモ一覧 ({memos.length}件)</h3>
      
      {memos.length === 0 ? (
        <p style={{ color: '#8e8e93', textAlign: 'center', padding: '30px' }}>まだメモはありません。上のフォームから作成してみましょう！</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {memos.map((memo) => (
            <div key={memo.id} style={{ border: '1px solid #e5e5ea', padding: '20px', borderRadius: '12px', background: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h4 style={{ margin: '0', color: '#1d1d1f', fontSize: '16px' }}>{memo.title}</h4>
                {/* 削除ボタン */}
                <button
                  onClick={() => handleDeleteMemo(memo.id)}
                  style={{ background: '#ff3b30', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}
                >
                  削除
                </button>
              </div>

              <p style={{ margin: '0 0 12px 0', color: '#3a3a3c', whiteSpace: 'pre-wrap', lineHeight: '1.5', fontSize: '14px' }}>{memo.content}</p>

              {/* 計算結果の表示 */}
              {memo.calculatedResult && (
                <div style={{ background: '#f2f1f6', color: '#34c759', padding: '8px 12px', borderRadius: '6px', fontSize: '14px', fontWeight: 'bold', marginBottom: '12px' }}>
                  🧮 計算結果: {memo.calculatedResult}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f2f2f7', paddingTop: '10px' }}>
                <small style={{ color: '#0071e3', background: '#e8f0fe', padding: '4px 8px', borderRadius: '6px', fontWeight: '500' }}>
                  {memo.summary}
                </small>
                <small style={{ color: '#8e8e93', fontSize: '12px' }}>{memo.createdAt}</small>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}