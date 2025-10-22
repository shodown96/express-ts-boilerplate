import { ACCESS_TOKEN_NAME, API_OBJECTS, APP_NAME } from "@/constants/app";
import { ERROR_MESSAGES, STRINGS } from "@/constants/messages";
import {
    AccountService,
    AuthService,
    EmailService
} from "@/services";
import { GoogleOauthTokenResponse, GoogleOauthUserResponse } from "@/types/oauth";
import { constructResponse } from "@/utilities/common";
import axios from "axios";
import { RequestHandler } from "express";

export class OauthController {
    static googleSignIn: RequestHandler = async (req, res) => {
        try {
            const { code } = req.body;
            const tokenRes = await axios.post(
                'https://oauth2.googleapis.com/token',
                new URLSearchParams({
                    code: decodeURIComponent(code),
                    client_id: process.env.GOOGLE_CLIENT_ID!,
                    client_secret: process.env.GOOGLE_CLIENT_SECRET!,
                    redirect_uri: `${process.env.SSO_CALLBACK_URL}`,
                    grant_type: 'authorization_code',
                }),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                }
            );
            const { access_token } = tokenRes.data as GoogleOauthTokenResponse;

            const userRes = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            });
            // console.log("userRes", userRes.data)
            const user = userRes.data as GoogleOauthUserResponse;

            const existingAccount = await AccountService.getAccount(user.email);

            let updated;
            if (existingAccount) {
                updated = await AccountService.updateAccount(existingAccount.id, {
                    avatar: { create: { url: user.picture } },
                    lastLogin: new Date(),
                });
            } else {
                updated = await AccountService.createAccount({
                    name: user.name,
                    email: user.email,
                    avatar: { create: { url: user.picture } },
                    lastLogin: new Date(),
                });
                if (updated) {
                    await EmailService.sendHTMLEmail({
                        email: updated.email,
                        subject: `Welcome to ${APP_NAME}`,
                        params: {
                            name: updated.name.split(" ")[0],
                        },
                        emailType: 'welcome'
                    })
                }
            }
            if (updated) {
                const accessToken = AuthService.generateAccessToken(updated);
                res.cookie(ACCESS_TOKEN_NAME, accessToken, {
                    httpOnly: true,
                    maxAge: 24 * 60 * 60 * 1000,
                    secure: process.env.NODE_ENV === "development" ? false : true,
                    sameSite: process.env.NODE_ENV === "development" ? undefined : "strict",
                    path: "/",
                    domain: process.env.DOMAIN
                })
            }
            return constructResponse({
                res,
                message: STRINGS.LoggedOut,
                code: 200,
                data: updated,
                apiObject: API_OBJECTS.Account,
            });
        } catch (error) {
            // console.error(error);
            return constructResponse({
                res,
                message: ERROR_MESSAGES.InternalServerError,
                code: 500,
                data: error,
                apiObject: API_OBJECTS.Account,
            });
        }
    };
}