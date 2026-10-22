import { google } from "googleapis";
import nodemailer from "nodemailer";
import "dotenv/config";
const oAuth2Client = new google.auth.OAuth2(
    process.env.OAUTH_CLIENT_ID,
    process.env.OAUTH_CLIENT_SECRET,
    process.env.REDIRECT_URI
);

oAuth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN
});

const sendEmail = async function (
    toGmail: string,
    otp: string
): Promise<void> {
    try {
        const accessTokenResponse = await oAuth2Client.getAccessToken();
        const accessToken = accessTokenResponse.token;

        if (!accessToken) {
            throw new Error("Failed to obtain Gmail access token");
        }

        const transport = nodemailer.createTransport({
            service: "gmail",
            auth: {
                type: "OAuth2",
                user: process.env.AUTH_USER_EMAIL,
                clientId: process.env.OAUTH_CLIENT_ID,
                clientSecret: process.env.OAUTH_CLIENT_SECRET,
                refreshToken: process.env.GMAIL_REFRESH_TOKEN,
                accessToken
            }
        });

        const mailOption = {
            from: `ResumenGeninMail Registertaion <${process.env.AUTH_USER_EMAIL}>`,
            to: toGmail,
            subject: "OTP for Registration",
            text: `Your OTP is ${otp}. It expires in 5 minutes.`,
            html: `<p>Your OTP is: <b>${otp}</b></p>
                   <p>This OTP expires in 5 minutes.</p>`
        };

        await transport.sendMail(mailOption);
    } catch (err) {
    	throw new ApiError(501,"Failed To Send OTP");
    }
};

export{sendEmail};
