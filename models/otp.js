// models/otpModel.js
const mongoose = require('mongoose');
const { mailSender, generateVerificationEmailTemplate } = require('../src/utils/mailSender');

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    expireIn: {
        type: Date,
        default: Date.now,
        expires: 60 * 5, // The document will be automatically deleted after 5 minutes of its creation time
    },
});
// Define a function to send emails
async function sendVerificationEmail(email, otp) {
    try {
        const body = generateVerificationEmailTemplate(otp)
        const mailResponse = await mailSender(
            email,
            "Verification Email",
            body
        );
    } catch (error) {
        throw error;
    }
}
otpSchema.pre("findOneAndUpdate", async function (next) {
    try {
        const { email, otp } = this.getUpdate(); // Retrieve the update object

        await sendVerificationEmail(email, otp);

        next();
    } catch (error) {
        next(error);
    }
});


// otpSchema.pre("save", async function (next) {
//     console.log("New document saved to the database");
//     // Only send an email when a new document is created
//     if (this.isNew) {
//         await sendVerificationEmail(this.email, this.otp);
//     }
//     next();
// });
module.exports = mongoose.model("OTP", otpSchema);