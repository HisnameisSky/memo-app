const { useState } = React;

export function MemoApp() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [memos, setMemos] = useState([]);
  // 【新機能】通信中のローディング状態を管理するState
  const [loading, setLoading] = useState(false);

  // 【Step 4の肝】PythonバックエンドとAPI通信する非同期関数
  const handleAddMemo = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setLoading(true); // 通信開始！ボタンを「要約中...」にする

    let aiSummary = "要約の取得に失敗しました";

    try {
      // 1. Python (FastAPI) サーバーに POST リクエストを送信
      const response = await fetch('http://127.0.0.1:8000/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title,
          content: content,
        }),
      });

      // 2. 返ってきた JSON データを解析
      if (response.ok) {
        const data = await response.json();
        aiSummary = data.summary; // バックエンドが作った要約文を取り出す
      }
    } catch (error) {
      console.error('API通信エラー:', error);
    } finally {
      setLoading(false); // 通信終了！ローディング解除
    }

    // 3. 取得した要約文を含めて新しいメモを作成
    const newMemo = {
      id: Date.now(),
      title: title,
      content: content,
      summary: aiSummary, // Pythonから届いた要約が入る！
      createdAt: new Date().toLocaleTimeString(),
    };

    setMemos([newMemo, ...memos]);
    setTitle('');
    setContent('');
  };

  const handleDeleteMemo = (id) => {
    setMemos(memos.filter((memo) => memo.id !== id));
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif', background: '#f4f6f8', minHeight: '100vh', borderRadius: '8px' }}>
      <h2 style={{ color: '#333', textAlign: 'center' }}>AI Memo App (Complete!)</h2>

      {/* メモ入力フォーム */}
      <form onSubmit={handleAddMemo} style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="メモのタイトル..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={loading}
          style={{ padding: '10px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <textarea
          placeholder="メモの本文を入力..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={loading}
          rows="4"
          style={{ padding: '10px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc', resize: 'vertical' }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '12px',
            background: loading ? '#aaa' : '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          {loading ? 'AI要約中...' : 'メモを追加（AI要約を実行）'}
        </button>
      </form>

      {/* メモ一覧表示 */}
      <h3 style={{ color: '#444' }}>メモ一覧 ({memos.length}件)</h3>
      {memos.length === 0 ? (
        <p style={{ color: '#888', textAlign: 'center', padding: '20px' }}>まだメモはありません。</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {memos.map((memo) => (
            <div key={memo.id} style={{ border: '1px solid #e0e0e0', padding: '15px', borderRadius: '8px', background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h4 style={{ margin: '0', color: '#222' }}>{memo.title}</h4>
                <button
                  onClick={() => handleDeleteMemo(memo.id)}
                  style={{ background: '#ff4d4d', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                >
                  削除
                </button>
              </div>

              <p style={{ margin: '0 0 10px 0', whiteSpace: 'pre-wrap', color: '#555', lineHeight: '1.4' }}>{memo.content}</p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: '8px' }}>
                <small style={{ color: '#0066cc', background: '#e6f2ff', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                  {memo.summary}
                </small>
                <small style={{ color: '#999', fontSize: '11px' }}>{memo.createdAt}</small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}