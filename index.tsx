import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown'; // 【新規追加】マークダウン用コンポーネント

interface Memo {
  id: number;
  title: string;
  content: string;
  summary: string;
  calculatedResult: string | null;
  fileInfo?: { name: string; type: string } | null;
  createdAt: string;
}

export function MemoApp() {
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  
  const [fileData, setFileData] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const [memos, setMemos] = useState<Memo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('gemini_api_key') || '';
  });
  const [showSettings, setShowSettings] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('gemini_api_key', apiKey);
  }, [apiKey]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setMimeType(file.type);

    const reader = new FileReader();
    reader.onload = () => {
      setFileData(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const evaluateMath = (text: string): string | null => {
    try {
      const sanitized = text.replace(/[^0-9+\-*/().]/g, '');
      if (sanitized.length > 0 && /[\+\-\*\/]/.test(sanitized)) {
        // eslint-disable-next-line no-eval
        const result = eval(sanitized); 
        return `${sanitized} = ${result}`;
      }
    } catch (e) {}
    return null;
  };

  const handleAddMemo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || (!content.trim() && !fileData)) return;

    if (!apiKey.trim()) {
      alert('Gemini APIキーが設定されていません。画面上部の「⚙️ APIキー設定」からキーを入力してください。');
      setShowSettings(true);
      return;
    }

    setLoading(true);
    const mathResult = evaluateMath(content);
    
    let aiSummary = "【AI要約完了】";
    try {
      const response = await fetch('http://127.0.0.1:8000/api/summarize', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-API-Key': apiKey.trim()
        },
        body: JSON.stringify({ 
          title, 
          content: content || '（添付ファイルのみのメモ）',
          file_data: fileData,
          mime_type: mimeType
        }),
      });

      if (response.ok) {
        const data = await response.json();
        aiSummary = data.summary;
      } else {
        const errData = await response.json();
        aiSummary = `【エラー】${errData.detail || '要約の取得に失敗しました'}`;
      }
    } catch (error) {
      console.error('API通信エラー:', error);
      aiSummary = "【通信エラー】Pythonサーバーに接続できません";
    } finally {
      setLoading(false);
    }

    const newMemo: Memo = {
      id: Date.now(),
      title,
      content,
      summary: aiSummary,
      calculatedResult: mathResult,
      fileInfo: fileName ? { name: fileName, type: mimeType || '' } : null,
      createdAt: new Date().toLocaleTimeString(),
    };

    setMemos([newMemo, ...memos]);
    setTitle('');
    setContent('');
    setFileData(null);
    setMimeType(null);
    setFileName(null);
  };

  const handleDeleteMemo = (id: number) => {
    setMemos(memos.filter((memo) => memo.id !== id));
  };

  return (
    <div style={{ padding: '30px', maxWidth: '650px', margin: '0 auto', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', background: '#faf9f6', minHeight: '100vh', borderRadius: '12px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#1d1d1f', margin: 0, fontWeight: '600', fontSize: '20px' }}>✨ Apple Notes Style AI Memo</h2>
        <button
          onClick={() => setShowSettings(!showSettings)}
          style={{ background: '#e5e5ea', color: '#1d1d1f', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}
        >
          {showSettings ? '⚙️ 設定を閉じる' : '⚙️ APIキー設定'}
        </button>
      </div>

      {showSettings && (
        <div style={{ background: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid #d2d2d7', marginBottom: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1d1d1f', marginBottom: '6px' }}>
            Gemini API キー (ブラウザに安全にローカル保存されます)
          </label>
          <input
            type="password"
            placeholder="AIzaSy..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            style={{ width: '100%', padding: '10px', fontSize: '14px', borderRadius: '6px', border: '1px solid #d2d2d7', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
      )}

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
          placeholder="本文（マークダウン記法 # や **太字**、- リストなどが使えます）..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={loading}
          rows={5}
          style={{ padding: '12px', fontSize: '15px', borderRadius: '8px', border: '1px solid #d2d2d7', outline: 'none', resize: 'vertical' }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f9f9f9', padding: '10px', borderRadius: '8px', border: '1px dashed #d2d2d7' }}>
          <label style={{ fontSize: '13px', color: '#0071e3', cursor: 'pointer', fontWeight: '500' }}>
            📎 画像・PDFを添付
            <input 
              type="file" 
              accept="image/*,application/pdf" 
              onChange={handleFileChange} 
              disabled={loading}
              style={{ display: 'none' }} 
            />
          </label>
          <span style={{ fontSize: '13px', color: '#8e8e93' }}>
            {fileName ? `選択中: ${fileName}` : 'ファイル未選択'}
          </span>
          {fileName && (
            <button 
              type="button" 
              onClick={() => { setFileData(null); setMimeType(null); setFileName(null); }}
              style={{ background: 'none', border: 'none', color: '#ff3b30', cursor: 'pointer', fontSize: '12px' }}
            >
              解除
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ padding: '12px', background: loading ? '#8e8e93' : '#0071e3', color: '#fff', border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '15px', fontWeight: '500' }}
        >
          {loading ? 'AI解析中...' : 'メモを追加（AI要約）'}
        </button>
      </form>

      {/* メモ一覧表示 */}
      <h3 style={{ color: '#1d1d1f', fontSize: '18px', marginBottom: '15px' }}>メモ一覧 ({memos.length}件)</h3>
      
      {memos.length === 0 ? (
        <p style={{ color: '#8e8e93', textAlign: 'center', padding: '30px' }}>まだメモはありません。マークダウンやファイルを試してみましょう！</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {memos.map((memo) => (
            <div key={memo.id} style={{ border: '1px solid #e5e5ea', padding: '20px', borderRadius: '12px', background: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h4 style={{ margin: '0', color: '#1d1d1f', fontSize: '16px' }}>{memo.title}</h4>
                <button
                  onClick={() => handleDeleteMemo(memo.id)}
                  style={{ background: '#ff3b30', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}
                >
                  削除
                </button>
              </div>

              {/* 【マークダウン対応】本文を ReactMarkdown でレンダリング */}
              <div style={{ color: '#3a3a3c', fontSize: '14px', lineHeight: '1.6', marginBottom: '12px' }}>
                <ReactMarkdown>{memo.content}</ReactMarkdown>
              </div>

              {memo.fileInfo && (
                <div style={{ background: '#eef4fd', color: '#0071e3', padding: '6px 10px', borderRadius: '6px', fontSize: '13px', marginBottom: '10px' }}>
                  📎 添付ファイル: {memo.fileInfo.name}
                </div>
              )}

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