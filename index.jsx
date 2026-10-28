const { useState } = React;

export function MemoApp() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [memos, setMemos] = useState([]);

  // メモを追加する関数
  const handleAddMemo = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const newMemo = {
      id: Date.now(), // ユニークなID
      title: title,
      content: content,
      summary: "（未要約：後でPython AIがここを埋めます）",
      createdAt: new Date().toLocaleTimeString() // 作成時刻
    };

    setMemos([newMemo, ...memos]);
    setTitle('');
    setContent('');
  };

  // 【Step 2の新機能】指定したIDのメモを削除する関数
  const handleDeleteMemo = (id) => {
    // 「クリックされたID以外のメモだけを残す」というフィルターをかける
    setMemos(memos.filter((memo) => memo.id !== id));
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif', background: '#f4f6f8', minHeight: '100vh', borderRadius: '8px' }}>
      <h2 style={{ color: '#333', textAlign: 'center' }}>AI Memo App (Step 2)</h2>

      {/* メモ入力フォーム */}
      <form onSubmit={handleAddMemo} style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="メモのタイトル..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ padding: '10px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <textarea
          placeholder="メモの本文を入力..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows="4"
          style={{ padding: '10px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc', resize: 'vertical' }}
        />
        <button type="submit" style={{ padding: '12px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}>
          メモを追加
        </button>
      </form>

      {/* メモ一覧の表示 */}
      <h3 style={{ color: '#444' }}>メモ一覧 ({memos.length}件)</h3>
      {memos.length === 0 ? (
        <p style={{ color: '#888', textAlign: 'center', padding: '20px' }}>まだメモはありません。上のフォームから作成してみましょう！</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {memos.map((memo) => (
            <div key={memo.id} style={{ border: '1px solid #e0e0e0', padding: '15px', borderRadius: '8px', background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h4 style={{ margin: '0', color: '#222' }}>{memo.title}</h4>
                {/* 【Step 2の新機能】削除ボタン */}
                <button
                  onClick={() => handleDeleteMemo(memo.id)}
                  style={{ background: '#ff4d4d', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                >
                  削除
                </button>
              </div>

              <p style={{ margin: '0 0 10px 0', whiteSpace: 'pre-wrap', color: '#555', lineHeight: '1.4' }}>{memo.content}</p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: '8px' }}>
                <small style={{ color: '#0066cc', background: '#e6f2ff', padding: '3px 6px', borderRadius: '4px' }}>
                  AI要約: {memo.summary}
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