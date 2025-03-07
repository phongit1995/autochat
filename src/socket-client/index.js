const socketClient = require('socket.io-client');

// Create Socket.IO client connection to external WebSocket server
const socketConnection = socketClient('wss://gaubong.us:3200', {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 10,
  transports: ['websocket'],
  extraHeaders: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36'
  }
});

// Set up event handlers
socketConnection.on('connect', () => {
  console.log('Connected to wss://gaubong.us:3200');
});

socketConnection.on('disconnect', () => {
  console.log('Disconnected from wss://gaubong.us:3200');
});

socketConnection.on('error', (error) => {
  console.error('Socket connection error:', error);
});

/**
 * Gửi tin nhắn Socket.IO theo định dạng raw như trong Network tab
 * Định dạng: 42["event_name", data]
 * @param {string} eventName - Tên sự kiện
 * @param {any} data - Dữ liệu muốn gửi
 * @returns {boolean} - Trạng thái gửi tin nhắn
 */
function sendRawMessage(eventName, data) {
  if (socketConnection.connected) {
    // Sử dụng phương thức emit của Socket.IO để gửi tin nhắn
    // Socket.IO sẽ tự động định dạng tin nhắn thành 42["event_name", data]
    socketConnection.emit(eventName, data);
    console.log(`Raw message sent: 42["${eventName}", ${JSON.stringify(data)}]`);
    return true;
  } else {
    console.error('Cannot send message: Socket is not connected');
    return false;
  }
}

/**
 * Gửi tin nhắn Socket.IO theo định dạng raw với prefix "42"
 * @param {any} data - Dữ liệu muốn gửi (không cần tên sự kiện)
 * @returns {boolean} - Trạng thái gửi tin nhắn
 */
function send42Data(data) {
  return sendRawMessage('42', data);
}

// Example: Listen for a specific event from the server
onMessage('serverMessage', (data) => {
  console.log('Received message from server:', data);
  // Handle the message here
});

/**
 * Send a message to the WebSocket server
 * @param {string} eventName - The name of the event to emit
 * @param {any} data - The data to send with the event
 * @param {Function} callback - Optional callback function when server acknowledges the event
 */
function sendMessage(eventName, data, callback) {
  if (socketConnection.connected) {
    socketConnection.emit(eventName, data, callback);
    console.log(`Message sent to server: ${eventName}`, data);
    return true;
  } else {
    console.error('Cannot send message: Socket is not connected');
    return false;
  }
}

/**
 * Listen for messages from the WebSocket server
 * @param {string} eventName - The name of the event to listen for
 * @param {Function} callback - The callback function to execute when the event is received
 */
function onMessage(eventName, callback) {
  socketConnection.on(eventName, (data) => {
    console.log(`Message received from server: ${eventName}`, data);
    callback(data);
  });
}

/**
 * Gửi dữ liệu raw trực tiếp qua WebSocket
 * Sử dụng khi bạn cần kiểm soát hoàn toàn định dạng tin nhắn
 * @param {string} rawData - Dữ liệu raw muốn gửi
 * @returns {boolean} - Trạng thái gửi tin nhắn
 */
function sendRawData(rawData) {
  if (socketConnection.connected) {
    try {
      // Truy cập vào socket engine để gửi dữ liệu raw
      const socket = socketConnection.io.engine.transport.ws;
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(rawData);
        console.log(`Raw data sent: ${rawData}`);
        return true;
      } else {
        console.error('WebSocket is not open');
        return false;
      }
    } catch (error) {
      console.error('Error sending raw data:', error);
      return false;
    }
  } else {
    console.error('Cannot send raw data: Socket is not connected');
    return false;
  }
}

// Socket.IO client tự động kết nối khi khởi tạo
// Nếu muốn kết nối thủ công, sử dụng open() thay vì connect()

// Export the socket connection and helper functions
module.exports = {
  socket: socketConnection,
  sendMessage,
  onMessage,
  sendRawMessage,
  send42Data,
  sendRawData
};
