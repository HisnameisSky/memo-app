const { useState } = React;

export function MemoApp() {
  // 1. 状態（State）の定義
  // メモの入力中の一時データ
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  // 保存されたメモのリスト（配列）
  const [memos, setMemos] = useState([]);

  // 2. 「追加」ボタンが押された時の処理
  const handleAddMemo = (e) => {
    e.preventDefault(); // ページの再リロードを防ぐ
    
    if (!title.trim() || !content.trim()) return; // 空白なら何もしない

    // 新しいメモオブジェクトを作る
    const newMemo = {
      id: Date.now(), // 一意のID（時刻を利用）
      title: title,
      content: content,
      summary: "（未要約：後でPython AIがここを埋めます）"
    };

    // 既存のリストに新しいメモを追加する（スプレッド構文）
    setMemos([newMemo, ...memos]);

    // 入力欄を空にリセット
    setTitle('');
    setContent('');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2>AI Memo App (Step 1)</h2>

      {/* メモ入力フォーム */}
      <form onSubmit={handleAddMemo} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="メモのタイトル..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ padding: '8px', fontSize: '16px' }}
        />
        <textarea
          placeholder="メモの本文を入力..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows="4"
          style={{ padding: '8px', fontSize: '16px' }}
        />
        <button type="submit" style={{ padding: '10px', background: '#007bff', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '16px' }}>
          メモを追加
        </button>
      </form>

      <hr />

      {/* メモ一覧の表示 */}
      <h3>メモ一覧 ({memos.length}件)</h3>
      {memos.length === 0 ? (
        <p style={{ color: '#888' }}>まだメモはありません。</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {memos.map((memo) => (
            <div key={memo.id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '5px', background: '#f9f9f9' }}>
              <h4 style={{ margin: '0 0 5px 0' }}>{memo.title}</h4>
              <p style={{ margin: '0 0 10px 0', whiteSpace: 'pre-wrap' }}>{memo.content}</p>
              <small style={{ color: '#0066cc', background: '#e6f2ff', padding: '3px 6px', borderRadius: '3px' }}>
                AI要約: {memo.summary}
              </small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}