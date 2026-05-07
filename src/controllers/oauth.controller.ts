import { ACCESS_TOKEN_NAME, API_OBJECTS, APP_NAME } from "@/constants/app";
import { ERROR_MESSAGES, STRINGS } from "@/constants/messages";
import {
    AccountService,
    AuthService,
    EmailService
} from "@/services";
import { GoogleOauthTokenResponse, GoogleOauthUserResponse } from "@/types/oauth";
import { constructResponse } from "@/utilities/common";
import { RequestHandler } from "express";

export class OauthController {
    static googleSignIn: RequestHandler = async (req, res) => {
        try {

            const { code } = req.body;
            const referrer = req.headers.referer;

            const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    code: decodeURIComponent(code),
                    client_id: process.env.GOOGLE_CLIENT_ID!,
                    client_secret: process.env.GOOGLE_CLIENT_SECRET!,
                    redirect_uri: `${referrer}sso-callback`,
                    grant_type: 'authorization_code',
                }),
            });

            const { access_token } = await tokenRes.json() as GoogleOauthTokenResponse;

            const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: { Authorization: `Bearer ${access_token}` },
            });

            const userData = await userRes.json();
            const user = userData as GoogleOauthUserResponse;

            const existingAccount = await AccountService.getAccount(user.email);
            let accessToken = ""
            let refreshToken = ""

            let updated;
            if (existingAccount) {
                console.log(existingAccount.id)
                updated = await AccountService.updateAccount(existingAccount.id, {
                    avatarUrl: user.picture,
                    lastLogin: new Date(),
                });
            } else {
                updated = await AccountService.createAccount({
                    name: user.name,
                    email: user.email,
                    avatarUrl: user.picture,
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
                accessToken = AuthService.generateAccessToken(updated);
                refreshToken = AuthService.generateRefreshToken(updated);
                AuthService.setCookie({ req, res, token: accessToken, tokenName: ACCESS_TOKEN_NAME })
            }
            const data = {
                user: {
                    ...updated,
                    role: undefined,
                    isAdmin: updated.role.includes("admin")
                },
                accessToken,
                refreshToken
            };
            return constructResponse({
                res,
                message: STRINGS.LoginSuccess,
                code: 200,
                data,
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