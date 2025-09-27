/**
 * Simple Collaboration Server
 * 
 * A basic WebSocket server for collaborative editing.
 * This is a demonstration server - use a proper solution like ShareJS or Yjs in production.
 */

const WebSocket = require('ws');
const http = require('http');
const path = require('path');
const fs = require('fs');

/**
 * Collaborative server
 */
class CollaborationServer {
  constructor(port = 8080) {
    this.port = port;
    this.clients = new Map();
    this.operations = [];
    this.revision = 0;
    this.documentState = { ops: [{ insert: 'Welcome to collaborative editing!\n' }] };
    
    this.setupServer();
  }
  
  setupServer() {
    // Create HTTP server for serving static files
    this.httpServer = http.createServer((req, res) => {
      this.handleHttpRequest(req, res);
    });
    
    // Create WebSocket server
    this.wss = new WebSocket.Server({ server: this.httpServer });
    this.wss.on('connection', (ws, req) => {
      this.handleConnection(ws, req);
    });
    
    this.httpServer.listen(this.port, () => {
      console.log(`Collaboration server running on http://localhost:${this.port}`);
      console.log(`WebSocket server running on ws://localhost:${this.port}`);
    });
  }
  
  handleHttpRequest(req, res) {
    // Serve static files for demo
    let filePath = req.url === '/' ? '/collaboration-demo.html' : req.url;
    filePath = path.join(__dirname, filePath);
    
    // Security check
    if (!filePath.startsWith(__dirname)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }
    
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Not Found');
        return;
      }
      
      const ext = path.extname(filePath);
      const contentType = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json'
      }[ext] || 'text/plain';
      
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  }
  
  handleConnection(ws, req) {
    const clientId = this.generateClientId();
    console.log(`Client connected: ${clientId}`);
    
    const client = {
      id: clientId,
      ws: ws,
      name: 'Anonymous',
      color: this.generateRandomColor(),
      cursor: null,
      lastSeen: Date.now(),
      isOnline: true
    };
    
    this.clients.set(clientId, client);
    
    // Send initial state
    this.sendToClient(client, {
      type: 'sync-state',
      revision: this.revision,
      operations: this.operations,
      document: this.documentState
    });
    
    // Notify other clients
    this.broadcast({
      type: 'client-join',
      client: {
        id: client.id,
        name: client.name,
        color: client.color,
        lastSeen: client.lastSeen,
        isOnline: client.isOnline
      }
    }, clientId);
    
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        this.handleMessage(client, message);
      } catch (error) {
        console.error('Failed to parse message:', error);
      }
    });
    
    ws.on('close', () => {
      console.log(`Client disconnected: ${clientId}`);
      this.clients.delete(clientId);
      
      this.broadcast({
        type: 'client-leave',
        clientId: clientId
      });
    });
    
    ws.on('error', (error) => {
      console.error(`WebSocket error for client ${clientId}:`, error);
    });
  }
  
  handleMessage(client, message) {
    switch (message.type) {
      case 'operation':
        this.handleOperation(client, message.operation);
        break;
        
      case 'client-update':
        this.handleClientUpdate(client, message.client);
        break;
        
      case 'sync-request':
        this.handleSyncRequest(client, message);
        break;
        
      default:
        console.warn('Unknown message type:', message.type);
    }
  }
  
  handleOperation(client, operation) {
    // Simple operation handling - in production, use proper OT
    this.operations.push(operation);
    this.revision++;
    
    // Apply operation to document state (simplified)
    if (operation.operation.insert) {
      // For demo purposes, just append to document
      this.documentState.ops.push(operation.operation);
    }
    
    // Broadcast to other clients
    this.broadcast({
      type: 'operation',
      operation: operation
    }, client.id);
    
    // Send acknowledgment
    this.sendToClient(client, {
      type: 'operation-ack',
      operationId: operation.id
    });
  }
  
  handleClientUpdate(client, updates) {
    Object.assign(client, updates);
    client.lastSeen = Date.now();
    
    this.broadcast({
      type: 'client-update',
      client: {
        id: client.id,
        name: client.name,
        color: client.color,
        cursor: client.cursor,
        lastSeen: client.lastSeen,
        isOnline: client.isOnline
      }
    }, client.id);
  }
  
  handleSyncRequest(client, message) {
    this.sendToClient(client, {
      type: 'sync-state',
      revision: this.revision,
      operations: this.operations.slice(message.revision || 0),
      document: this.documentState
    });
  }
  
  sendToClient(client, message) {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  }
  
  broadcast(message, excludeClientId = null) {
    for (const [clientId, client] of this.clients) {
      if (clientId !== excludeClientId) {
        this.sendToClient(client, message);
      }
    }
  }
  
  generateClientId() {
    return 'client-' + Math.random().toString(36).substr(2, 9);
  }
  
  generateRandomColor() {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
  
  getStats() {
    return {
      connectedClients: this.clients.size,
      totalOperations: this.operations.length,
      currentRevision: this.revision,
      uptime: process.uptime()
    };
  }
}

// Start server if run directly
if (require.main === module) {
  const port = process.env.PORT || 8080;
  new CollaborationServer(port);
}

module.exports = CollaborationServer;
