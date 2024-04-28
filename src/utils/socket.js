const { Server } = require("socket.io");

module.exports = (server) => {
    const io = new Server(server, {
        cors: {
            origin: ["http://localhost:3000", "https://easier-v1.vercel.app"],
        },
    });

    let onlineUser = [];

    const addUser = (userId, socketId) => {
        const userExists = onlineUser.find((user) => user.userId === userId);
        if (!userExists) {
            onlineUser.push({ userId, socketId });
        }
    };

    const removeUser = (socketId) => {
        onlineUser = onlineUser.filter((user) => user.socketId !== socketId);
    };

    const getUser = (userId) => {
        return onlineUser.find((user) => user.userId === userId);
    };

    io.on("connection", (socket) => {
        socket.on("newUser", (userId) => {
            addUser(userId, socket.id);
        });

        socket.on("sendMessage", (data) => {
            const recipient = getUser(data?.recipient);
            recipient?.socketId &&
                io.to(recipient?.socketId).emit("getMessage", data);
        });

        socket.on("disconnect", () => {
            removeUser(socket.id);
        });
    });

    io.listen(4000);
};
