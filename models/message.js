const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        message: {
            type: String,
            required: true,
        },
        sender: {
            type: String,
            required: true,
        },
        recipient: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports =
    mongoose.models.message || mongoose.model("message", messageSchema);
