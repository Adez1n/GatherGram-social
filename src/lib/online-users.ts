const globalForOnlineUsers = globalThis as unknown as {
  gathergramOnlineUsers?: Map<string, number>;
};

const onlineUsers =
  globalForOnlineUsers.gathergramOnlineUsers ?? new Map<string, number>();

globalForOnlineUsers.gathergramOnlineUsers = onlineUsers;

export function addOnlineUser(userId: string) {
  onlineUsers.set(userId, (onlineUsers.get(userId) ?? 0) + 1);
}

export function removeOnlineUser(userId: string) {
  const currentConnections = onlineUsers.get(userId) ?? 0;

  if (currentConnections <= 1) {
    onlineUsers.delete(userId);
    return;
  }

  onlineUsers.set(userId, currentConnections - 1);
}

export function isUserOnline(userId: string) {
  return onlineUsers.has(userId);
}

export function getOnlineUsers() {
  return Array.from(onlineUsers.keys());
}
