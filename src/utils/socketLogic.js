const socketIo = require("socket.io");

// Initialize an empty object to store connected users
const users = {};

module.exports = (server) => {
    const io = socketIo(server);

    io.on("connection", (socket) => {
        console.log(`⚡: ${socket.id} user just connected!`);

        // Listen for new messages
        socket.on("message", (data) => {
            try {
                const { sender, recipient, message } = data;
                console.log(
                    `Message from ${sender} to ${recipient}: ${message}`
                );
                // Send the message to the recipient if they are connected
                const recipientSocket = users[recipient];
                if (recipientSocket) {
                    recipientSocket.emit("message", {
                        sender,
                        message,
                        recipient,
                    });
                }
            } catch (error) {
                console.error("Error handling message:", error);
            }
        });

        // Store user's socket connection
        socket.on("login", (userId) => {
            try {
                users[userId] = socket;
            } catch (error) {
                console.error("Error handling login:", error);
            }
        });

        // Clean up disconnected users
        socket.on("disconnect", () => {
            try {
                for (const userId in users) {
                    if (users[userId] === socket) {
                        delete users[userId];
                        console.log(`User disconnected: ${userId}`);
                        break;
                    }
                }
            } catch (error) {
                console.error("Error handling disconnect:", error);
            }
        });
    });
};
