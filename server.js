const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// 静的ファイルの提供
app.use(express.static('.'));

// CORSヘッダーを追加（開発用）
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Secret-Key');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// メインページ
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ヘルスチェック
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        app: 'Normal Navi 3D'
    });
});

// 404ハンドラー
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'index.html'));
});

// エラーハンドラー
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({ 
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Normal Navi 3D Server running at:`);
    console.log(`   Local:    http://localhost:${PORT}`);
    console.log(`   Network:  http://[your-ip]:${PORT}`);
    console.log('');
    console.log('📝 Note: For full functionality, use HTTPS in production');
    console.log('🎤 Web Speech API requires HTTPS for microphone access');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 SIGINT received, shutting down gracefully');
    process.exit(0);
});