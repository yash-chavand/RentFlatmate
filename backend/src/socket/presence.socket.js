// In-memory mapping of userId -> Set of active socket.id's
const activeUsers = new Map();

function handlePresence(io, socket) {
  const userId = socket.user.id;

  // Add socket to the user's connection set
  if (!activeUsers.has(userId)) {
    activeUsers.set(userId, new Set());
  }
  activeUsers.get(userId).add(socket.id);

  // If this is the user's first active connection, broadcast online status
  if (activeUsers.get(userId).size === 1) {
    socket.broadcast.emit('presence:online', { userId });
  }

  // Send the list of currently online user IDs to the newly connected user
  const onlineUserIds = Array.from(activeUsers.keys());
  socket.emit('presence:list', { onlineUserIds });

  socket.on('disconnect', () => {
    const userSockets = activeUsers.get(userId);
    if (userSockets) {
      userSockets.delete(socket.id);
      
      // If the user has no more open sockets, they are fully offline
      if (userSockets.size === 0) {
        activeUsers.delete(userId);
        socket.broadcast.emit('presence:offline', { userId });
      }
    }
  });
}

function getOnlineUsers() {
  return Array.from(activeUsers.keys());
}

module.exports = {
  handlePresence,
  getOnlineUsers,
};
