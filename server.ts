
import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);
  const wss = new WebSocketServer({ server });

  let gameState: any = null;

  // WebSocket logic
  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');
    
    // Send current state if exists
    if (gameState) {
      ws.send(JSON.stringify({ type: 'SYNC_STATE', state: gameState }));
    }

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'UPDATE_STATE') {
          gameState = message.state;
          // Broadcast to all other clients
          wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({ type: 'SYNC_STATE', state: gameState }));
            }
          });
        } else if (message.type === 'REQUEST_SYNC') {
          if (gameState) {
            ws.send(JSON.stringify({ type: 'SYNC_STATE', state: gameState }));
          }
        }
      } catch (e) {
        console.error('Failed to process WebSocket message', e);
      }
    });
  });

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  const PORT = 3000;
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
