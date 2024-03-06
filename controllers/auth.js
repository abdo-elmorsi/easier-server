const bcrypt = require("bcryptjs");
const User = require("../models/user");
const OTP = require("../models/otp");
const { generateOtp } = require("../src/utils/utils");

const signIn = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res
                .status(400)
                .json({ message: "email and password are required!" });

        const user = await User.findUser(email, password);
        if (!user)
            return res
                .status(404)
                .json({ message: "Wrong email or password!" });

        await sendEmailOtp(req, res, next);
    } catch (error) {
        next(error)
    }
};
const verify = async (req, res, next) => {
    try {
        const { otp, email, password } = req.body;

        if (!email || !password || !otp) {
            return res
                .status(400)
                .json({ message: "Email, password, and OTP are required!" });
        }

        const user = await User.findUser(email, password);
        if (!user) {
            return res.status(404).json({ message: "Invalid credentials!" });
        }

        const otpRecord = await OTP.findOne({ email });
        // remove 0000 condition in production
        if (!otpRecord || (otpRecord.otp !== otp && otp != "0000")) {
            return res.status(400).json({ message: "Invalid OTP!" });
        }

        // Check if the OTP has expired
        if (new Date(otpRecord.expireIn).getTime() < new Date().getTime()) {
            return res.status(400).json({ message: "OTP has expired!" });
        }

        // Remove the used OTP record
        await OTP.deleteOne({ email });

        const token = await user.generateAuthToken();
        res.status(200).json({ user, token });
    } catch (error) {
        next(error);
    }
};


const updatePassword = async (req, res, next) => {
    try {
        const { user } = req;
        const { oldPassword, newPassword } = req.body;
        const passwordsMatch = await bcrypt.compare(oldPassword, user.password);
        if (!passwordsMatch) {
            return res.status(400).json({ message: "Invalid old password" });
        }
        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        next(error);
    }
};
const changePassword = async (req, res, next) => {
    try {
        const { password, otp, email } = req.body;

        // Check if OTP record exists for the email
        const record = await OTP.findOne({ email });
        if (!record) {
            return res.status(400).json({ message: "OTP not found for this email" });
        }

        // Validate the received OTP
        if (record.otp !== otp) {
            return res.status(400).json({ message: "Incorrect OTP" });
        }

        // Check if the OTP has expired
        if (new Date(record.expireIn).getTime() < new Date().getTime()) {
            return res.status(400).json({ message: "OTP has expired" });
        }

        // Find the user by email and update the password
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        // Update user's password and save
        user.password = password;
        await user.save();

        // Mark the OTP as used or delete it
        await OTP.deleteOne({ email }); // or use record.remove() to delete the record

        return res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        next(error);
    }
};


const forgotPassword = async (req, res, next) => {
    try {
        const email = req.body?.email;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Email does not exist!" });
        }
        await sendEmailOtp(req, res, next);
    } catch (error) {
        next(error);
    }
};
const sendEmailOtp = async (req, res, next) => {
    try {
        const email = req.body?.email;
        const otpCode = generateOtp(); // Generate a 4-digit OTP
        await OTP.findOneAndUpdate(
            { email },
            {
                email,
                otp: otpCode,
                expireIn: new Date().getTime() + 300 * 1000 // Set expiration time (5 minutes)
            },
            { new: true, upsert: true }
        );
        return res.status(200).json({
            message: `The OTP has been sent to ${email}. Please check your email inbox.`,
            data: { email }
        });
    } catch (error) {
        next(error);
    }
};


module.exports = {
    signIn,
    verify,
    forgotPassword,
    changePassword,
    updatePassword,
};
