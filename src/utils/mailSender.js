// utils/mailSender.js
const nodemailer = require('nodemailer');

const mailSender = async (email, title, body) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            }
        });

        const mailOptions = {
            from: process.env.MAIL_USER,
            to: email,
            subject: title,
            html: body,
        };

        const info = await transporter.sendMail(mailOptions);
        return info;
    } catch (error) {
        throw new Error("Failed to send email");
    }
};


// emailTemplates/verificationTemplate.js
const generateVerificationEmailTemplate = (otp) => {
    const mainColor = "#336a86";
    const template = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>OTP Verification</title>
            <style>
                /* Add your email styling here */
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #fff;
                    border-radius: 5px;
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                }
                .header {
                    text-align: center;
                    margin-bottom: 20px;
                }
                .logo {
                    font-size: 32px;
                    font-weight: bold;
                    color: ${mainColor};
                    margin-bottom: 10px;
                }
                .tagline {
                    font-size: 18px;
                    color: #666;
                    margin-top: 0;
                }
                .otp {
                    text-align: center;
                    padding: 30px;
                    background-color: ${mainColor};
                    border-radius: 5px;
                    margin-bottom: 30px;
                }
                .otp-code {
                    font-size: 56px;
                    margin: 0;
                    color: #fff;
                }
                .cta-button {
                    display: block;
                    width: 200px;
                    margin: 0 auto;
                    padding: 12px 20px;
                    text-align: center;
                    font-size: 18px;
                    font-weight: bold;
                    color: #fff !important;
                    background-color: ${mainColor};
                    text-decoration: none;
                    border-radius: 5px;
                }
                .footer {
                    text-align: center;
                    margin-top: 20px;
                    color: #666;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 class="logo">Easier</h1>
                    <p class="tagline">Simplifying your life</p>
                </div>
                <div class="otp">
                    <h2 class="otp-code">${otp}</h2>
                </div>
                <p class="footer">This OTP is valid for 5 minutes. If you didn't request this email, please ignore it.</p>
            </div>
        </body>
        </html>
    `;
    return template;
};

module.exports = { mailSender, generateVerificationEmailTemplate };
