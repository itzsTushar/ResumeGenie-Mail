import { google } from "googleapis";
import "dotenv/config";

const oAuth2Client = new google.auth.OAuth2(
    process.env.OAUTH_CLIENT_ID,
    process.env.OAUTH_CLIENT_SECRET,
    process.env.REDIRECT_URI
);

oAuth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN
});

const sendEmail = async function (toGmail: string, otp: string): Promise<void> {
    try {
        console.log("1. Initializing Gmail API client...");
        const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

        const subject = "OTP for Registration";
        const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString("base64")}?=`;
        
        const messageParts = [
            `To: ${toGmail}`,
            `Subject: ${utf8Subject}`,
            `MIME-Version: 1.0`,
            `Content-Type: text/html; charset=utf-8`,
            ``,
            `<p>Your OTP is: <b>${otp}</b></p><p>This OTP expires in 5 minutes.</p>`
        ];
        
        const message = messageParts.join("\n");

        // Encode the message in base64url format required by Gmail API
        const encodedMessage = Buffer.from(message)
            .toString("base64")
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, "");

        console.log("2. Sending mail via Gmail API...");
        await gmail.users.messages.send({
            userId: "me",
            requestBody: {
                raw: encodedMessage,
            },
        });

        console.log("3. Mail sent successfully via Gmail API!");
    } catch (err) {
        console.error("ERROR IN sendEmail:", err);
        throw new Error("Failed To Send OTP");
    }
};

export { sendEmail };
