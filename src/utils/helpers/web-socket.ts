// TODO
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WebSocketConfingFunction = (event: Event) => any;
// TODO
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WebSocketConfingMessageFunction = (event: MessageEvent) => any;
type CustomWebSocketSend = (
  event: string | ArrayBufferLike | Blob | ArrayBufferView,
  // TODO
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any
) => void;
interface WebSocketConfing {
  open: WebSocketConfingFunction;
  message: WebSocketConfingMessageFunction;
  close: WebSocketConfingFunction;
  error: WebSocketConfingFunction;
  url?: string;
}

interface WebSocketInterface extends Omit<WebSocket, 'send'> {
  // _send?: WebSocket['send'];
  _send?: CustomWebSocketSend;
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

  if (typeof confing !== 'object') throw new Error('invalid confing');

  const { url, open, message, close, error } = confing;

  if (
    typeof url !== 'string' ||
    url === '' ||
    (url.includes('ws://') === false && url.includes('wss://') === false)
  ) {
    throw new Error('invalid url');
  }

  const socket: WebSocketInterface = new WebSocket(url);

  socket._send = socket.send;
  // TODO
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  socket.send = function (event: any, data: any) {
    const payload = { event, data };
    // console.log(payload);
    // TODO
    // eslint-disable-next-line
    // @ts-ignore
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
