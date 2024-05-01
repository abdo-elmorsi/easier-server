const { Server } = require("socket.io");

module.exports = (server) => {
    const io = new Server(server, {
        cors: {
            origin: ["http://localhost:3000", "https://easier-v1.vercel.app"],
        },
    });

    const onlineUsers = new Map();

    const addUser = (userId, socketId) => {
        if (!onlineUsers.has(userId)) {
            onlineUsers.set(userId, socketId);
        }
    };

    const removeUser = (socketId) => {
        onlineUsers.forEach((id, userId) => {
            if (id === socketId) {
                onlineUsers.delete(userId);
            }
        });
    };

    const getUserSocketId = (userId) => {
        return onlineUsers.get(userId);
    };

    const emitOnlineUsers = () => {
        const onlineUserIds = Array.from(onlineUsers.keys());
        io.emit("getOnlineUsers", onlineUserIds);
    };

    io.on("connection", (socket) => {
        socket.on("newUser", (userId) => {
            addUser(userId, socket.id);
            emitOnlineUsers();
        });

        socket.on("sendMessage", (data) => {
            const recipientSocketId = getUserSocketId(data?.recipient);
            if (recipientSocketId) {
                io.to(recipientSocketId).emit("getMessage", data);
            }
        });

        socket.on("disconnect", () => {
            removeUser(socket.id);
            emitOnlineUsers();
        });
    });

    io.listen(4000);
};
