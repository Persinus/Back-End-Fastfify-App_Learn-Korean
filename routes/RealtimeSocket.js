const fp = require('fastify-plugin');

module.exports = fp(async function (fastify, opts) {
  const io = require('socket.io')(fastify.server, { cors: { origin: '*' } });
  const onlineUsers = new Map();
  const messages = {}; // { 'userA_userB': [ {from, to, content, timestamp} ] }

  io.on('connection', (socket) => {
    socket.on('register', (username) => {
      onlineUsers.set(username, socket.id);
      socket.username = username;
      io.emit('online-users', Array.from(onlineUsers.keys()));
    });

    socket.on('private-message', ({ from, to, content }) => {
      const key = [from, to].sort().join('_');
      if (!messages[key]) messages[key] = [];
      const msg = { from, to, content, timestamp: new Date() };
      messages[key].push(msg);

      const toSocketId = onlineUsers.get(to);
      if (toSocketId) {
        io.to(toSocketId).emit('private-message', msg);
      }
    });

    // Lấy lịch sử tin nhắn giữa 2 user
    socket.on('get-history', ({ user1, user2 }) => {
      const key = [user1, user2].sort().join('_');
      socket.emit('history', messages[key] || []);
    });

    socket.on('disconnect', () => {
      if (socket.username) {
        onlineUsers.delete(socket.username);
        io.emit('online-users', Array.from(onlineUsers.keys()));
      }
    });
  });

  fastify.decorate('io', io);
});