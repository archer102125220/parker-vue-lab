type WebSocketConfingFunction = (event: Event) => void;
type WebSocketConfingMessageFunction = (event: MessageEvent) => void;

type CustomWebSocketSend = (event: string, data?: unknown) => void;

interface WebSocketConfing {
  open: WebSocketConfingFunction;
  message: WebSocketConfingMessageFunction;
  close: WebSocketConfingFunction;
  error: WebSocketConfingFunction;
  url?: string;
}

interface WebSocketInterface extends Omit<WebSocket, 'send'> {
  _send: WebSocket['send'];
  send: CustomWebSocketSend;
}

export function createWebSocket(
  confing: WebSocketConfing = {
    open() {},
    message() {},
    close() {},
    error() {}
  }
) {
  if (typeof window !== 'object') return;

  if (typeof confing !== 'object' || confing === null) {
    throw new Error('invalid confing');
  }

  const { url, open, message, close, error } = confing;

  if (
    typeof url !== 'string' ||
    url === '' ||
    (url.includes('ws://') === false && url.includes('wss://') === false)
  ) {
    throw new Error('invalid url');
  }

  // 這裡需要使用型別斷言，因為我們要修改原生的 WebSocket 實例，
  // 實作自定義的 WebSocketInterface 並覆寫其 'send' 方法。
  const socket = new WebSocket(url) as unknown as WebSocketInterface;

  // 這裡需要型別斷言來取得原本原生 WebSocket 的 'send' 方法，
  // 因為 'socket' 已經被定義為 WebSocketInterface 型別。
  socket._send = (socket as unknown as WebSocket).send;

  socket.send = function (event: string, data?: unknown) {
    const payload = { event, data };
    // console.log(payload);
    this._send(JSON.stringify(payload));
  };

  if (typeof open === 'function') {
    socket.addEventListener('open', open);
  }
  if (typeof message === 'function') {
    socket.addEventListener('message', message);
  }
  if (typeof close === 'function') {
    socket.addEventListener('close', close);
  }
  if (typeof error === 'function') {
    socket.addEventListener('error', error);
  }

  return socket;
}
