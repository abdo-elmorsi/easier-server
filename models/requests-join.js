const mongoose = require("mongoose");

const RequestJoinSchema = new mongoose.Schema(
    {
        user_name: {
            type: String,
            required: [true, "User name is required!"],
        },
        user_email: {
            type: String,
            required: [true, "User email is required!"],
        },
        user_phone_number: {
            type: String,
            required: [true, "User phone number is required!"],
        },
        email_sent: {
            type: Boolean,
            default: false,
        },
        request_id: {
            type: String,
        },
        seen_by: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);



const RequestJoin = mongoose.models.RequestJoin || mongoose.model("RequestJoin", RequestJoinSchema);

module.exports = RequestJoin;
