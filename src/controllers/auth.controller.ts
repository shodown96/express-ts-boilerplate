import { AccountRole } from "@prisma/client";
import { RequestHandler } from "express";
import {
  AccountService,
  AuthService,
  EmailService
} from "@/services"
import { constructResponse, getFirstName, hasDatePassed } from "@/utilities/common";
import { ACCESS_TOKEN_NAME, API_OBJECTS, APP_NAME } from "@/constants/app";
import { ERROR_MESSAGES, STRINGS } from "@/constants/messages";

export class AuthController {

  // Register a new user
  static signUp: RequestHandler = async (req, res) => {
    // if (process.env.NODE_ENV === "production") {
    //   return constructResponse({
    //     res,
    //     message: "This app is currently locked.",
    //     code: 500,
    //     apiObject: API_OBJECTS.Auth,
    //   });
    // }
    const { email } = req.body;
    if (!email)
      return constructResponse({
        res,
        message: ERROR_MESSAGES.BadRequestError,
        code: 400,
        apiObject: API_OBJECTS.Account,
      });

    try {
      const existing = await AccountService.getAccount(email);
      if (existing) {
        return constructResponse({
          res,
          message: ERROR_MESSAGES.UserAlreadyExists,
          code: 400,
          apiObject: API_OBJECTS.Account,
        });
      }
      const { code, ...rest } = req.body
      const user = await AccountService.createAccount(rest);
      if (!user) {
        return constructResponse({
          res,
          message: ERROR_MESSAGES.BadRequestError,
          code: 400,
          apiObject: API_OBJECTS.Account,
        });
      }

      const accessToken = AuthService.generateAccessToken(user);
      const refreshToken = AuthService.generateRefreshToken(user);

      // res.cookie(ACCESS_TOKEN_NAME, accessToken, {
      //   httpOnly: true,
      //   maxAge: 24 * 60 * 60 * 1000, // Output: 86400000
      //   sameSite: "lax",
      //   secure: process.env.NODE_ENV === "development" ? false : true,
      //   domain:
      //     process.env.NODE_ENV === "development"
      //       ? "localhost"
      //       : process.env.DOMAIN,
      //   path: "/",
      // });
      const hasPassed = hasDatePassed("2025-03-14")
      EmailService.sendHTMLEmail({
        email,
        subject:
          `Welcome to The ${APP_NAME}`,
        params: { name: getFirstName(user.name) },
        emailType: hasPassed ? "welcome" : "welcome2",
      });

      const data = { user: { ...user, role: undefined }, accessToken, refreshToken };
      return constructResponse({
        res,
        message: STRINGS.Success,
        code: 201,
        data,
        apiObject: API_OBJECTS.Account,
      });
    } catch (error) {
      return constructResponse({
        res,
        message: ERROR_MESSAGES.InternalServerError,
        code: 500,
        data: error,
        apiObject: API_OBJECTS.Account,
      });
    }
  };

  // Login with an existing user
  static signIn: RequestHandler = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return constructResponse({
        res,
        message: ERROR_MESSAGES.BadRequestError,
        code: 400,
        apiObject: API_OBJECTS.Account,
      });
    }
    try {
      const user = await AccountService.getAccount(email, true);

      if (!user) {
        return constructResponse({
          res,
          message: ERROR_MESSAGES.InvalidCredentialsProvided,
          code: 401,
          apiObject: API_OBJECTS.Account,
        });
      }

      const referer = req.get('Referer');
      // console.log("referrer", referer)
      if (!referer) {
        const platform = req.query.PLATFORM
        if (platform) {
          if (user?.role === AccountRole.admin) {
            return constructResponse({
              res,
              message: ERROR_MESSAGES.InvalidCredentialsProvided,
              code: 401,
              apiObject: API_OBJECTS.Account,
            });
          }
        }
      } else {
        if (referer.includes("admin")) {
          if (user?.role !== AccountRole.admin) {
            return constructResponse({
              res,
              message: ERROR_MESSAGES.InvalidCredentialsProvided,
              code: 401,
              apiObject: API_OBJECTS.Account,
            });
          }
        }
      }

      const isPasswordCorrect = await AccountService.authenticate(email, password);
      if (!isPasswordCorrect.isAuthenticated) {
        if (isPasswordCorrect.isSocialAccount) {
          return constructResponse({
            res,
            message: ERROR_MESSAGES.SocialInvalidCredentialsProvided,
            code: 401,
            apiObject: API_OBJECTS.Account,
          });
        }
        return constructResponse({
          res,
          message: ERROR_MESSAGES.InvalidCredentialsProvided,
          code: 401,
          apiObject: API_OBJECTS.Account,
        });
      }

      const accessToken = AuthService.generateAccessToken(user);
      const refreshToken = AuthService.generateRefreshToken(user);
      // res.cookie(ACCESS_TOKEN_NAME, accessToken, {
      //   httpOnly: true,
      //   maxAge: 24 * 60 * 60 * 1000, // Output: 86400000
      //   sameSite: "lax",
      //   secure: process.env.NODE_ENV === "development" ? false : true,
      //   domain:
      //     process.env.NODE_ENV === "development"
      //       ? "localhost"
      //       : process.env.DOMAIN,
      //   path: "/",
      // });

      const data = {
        user: {
          ...user,
          role: user.role === AccountRole.admin ? AccountRole.admin : undefined,
          deleted: false,
          deletedAt: null
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
      return constructResponse({
        res,
        message: ERROR_MESSAGES.InternalServerError,
        code: 500,
        data: error,
        apiObject: API_OBJECTS.Account,
      });
    }
  };

  // Route to refresh access token using the refresh token
  static getToken: RequestHandler = async (req, res) => {
    try {
      const refreshToken = req.body.refreshToken;
      if (!refreshToken)
        return constructResponse({
          res,
          message: ERROR_MESSAGES.InvalidCredentialsProvided,
          code: 401,
          apiObject: API_OBJECTS.Account,
        });
      const decodedToken: any = AuthService.verifyRefreshToken(refreshToken);
      if (!decodedToken) {
        return constructResponse({
          res,
          message: ERROR_MESSAGES.InvalidCredentialsProvided,
          code: 401,
          apiObject: API_OBJECTS.Account,
        });
      }
      const user = await AccountService.getAccount(decodedToken?.accountId);

      const accessToken = AuthService.generateAccessToken(user);
      return constructResponse({
        res,
        message: STRINGS.Success,
        code: 200,
        data: { accessToken },
        apiObject: API_OBJECTS.Token,
      });
    } catch (error) {
      return constructResponse({
        res,
        message: ERROR_MESSAGES.InternalServerError,
        code: 500,
        data: error,
        apiObject: API_OBJECTS.Account,
      });
    }
  };

  static setPassword: RequestHandler = async (req, res, next) => {
    try {
      const { password } = req.body
      const user = await AccountService.setAccountPassword(req.user.id, password);
      if (!user) {
        return constructResponse({
          res,
          code: 400,
          message: ERROR_MESSAGES.BadRequestError,
          apiObject: API_OBJECTS.Auth,
        });
      }
      return constructResponse({
        res,
        code: 200,
        data: user,
        message: STRINGS.PasswordSetSuccessful,
        apiObject: API_OBJECTS.Auth,
      });
    } catch (error) {
      return constructResponse({
        res,
        code: 500,
        data: error,
        message: ERROR_MESSAGES.InternalServerError,
        apiObject: API_OBJECTS.Auth,
      });
    }
  };

  // TODO: restrict otp sending too many times here too
  static sendCode: RequestHandler = async (req, res) => {

    const { email } = req.body;
    if (!email)
      return constructResponse({
        res,
        message: ERROR_MESSAGES.BadRequestError,
        code: 400,
        apiObject: API_OBJECTS.OTP,
      });

    try {
      const user = await AccountService.getAccount(email);
      // if (!user) {
      //   return constructResponse({
      //     res,
      //     message: ERROR_MESSAGES.AccountNotFoundError,
      //     code: 400,
      //     apiObject: API_OBJECTS.OTP,
      //   });
      // }
      const otp = await AccountService.createVerificationToken(email);
      EmailService.sendHTMLEmail({
        email,
        subject: `Your ${APP_NAME} Account Verification OTP`,
        params: { otp: otp.code, name: getFirstName(user?.name) || email },
        emailType: "registration",
      });
      return constructResponse({
        res,
        message: STRINGS.EmailVerificationSent,
        code: 200,
        apiObject: API_OBJECTS.OTP,
      });
    } catch (error) {
      return constructResponse({
        res,
        message: ERROR_MESSAGES.InternalServerError,
        code: 500,
        data: error,
        apiObject: API_OBJECTS.Account,
      });
    }
  };

  static verifyEmail: RequestHandler = async (req, res) => {
    const { code } = req.body;
    if (!code)
      return constructResponse({
        res,
        message: ERROR_MESSAGES.BadRequestError,
        code: 400,
        apiObject: API_OBJECTS.Auth,
      });
    try {
      const dbOTP = await AccountService.getVerificationToken(req.user.email, code);

      if (!dbOTP) {
        return res
          .status(401)
          .json({ message: ERROR_MESSAGES.InvalidOTPProvided });
      }

      await AccountService.deleteVerificationToken(dbOTP.email, dbOTP.code);
      return constructResponse({
        res,
        message: STRINGS.EmailVerified,
        code: 200,
        apiObject: API_OBJECTS.Account,
      });
    } catch (error) {
      return constructResponse({
        res,
        message: ERROR_MESSAGES.InternalServerError,
        code: 500,
        data: error,
        apiObject: API_OBJECTS.Account,
      });
    }
  };

  static checkEmailExists: RequestHandler = async (req, res) => {
    // if (process.env.NODE_ENV === "production") {
    //   return constructResponse({
    //     res,
    //     message: "This app is currently locked.",
    //     code: 500,
    //     apiObject: API_OBJECTS.Auth,
    //   });
    // }

    const { email } = req.body;
    if (!email)
      return constructResponse({
        res,
        message: ERROR_MESSAGES.BadRequestError,
        code: 400,
        apiObject: API_OBJECTS.Auth,
      });
    try {
      const existing = await AccountService.checkIfEmailExists(email);
      if (existing) {
        return constructResponse({
          res,
          message: ERROR_MESSAGES.UserAlreadyExists,
          code: 400,
          apiObject: API_OBJECTS.Account,
        });
      }
      return constructResponse({
        res,
        message: STRINGS.Success,
        code: 200,
        apiObject: API_OBJECTS.Account,
      });
    } catch (error) {
      return constructResponse({
        res,
        message: ERROR_MESSAGES.InternalServerError,
        code: 500,
        data: error,
        apiObject: API_OBJECTS.Account,
      });
    }
  };

  static verifyCode: RequestHandler = async (req, res) => {
    const { code, reset = false } = req.body;
    if (!code)
      return constructResponse({
        res,
        message: ERROR_MESSAGES.BadRequestError,
        code: 400,
        apiObject: API_OBJECTS.Auth,
      });
    try {
      const dbOTP = await AccountService.verifyVerificationTokenbyCode(code);
      if (!dbOTP) {
        return constructResponse({
          res,
          message: ERROR_MESSAGES.InvalidOTPProvided,
          code: 401,
          apiObject: API_OBJECTS.OTP,
        });
      }
      return constructResponse({
        res,
        message: STRINGS.OTPVerified,
        code: 200,
        apiObject: API_OBJECTS.OTP,
      });
    } catch (error) {
      console.log(error)
      return constructResponse({
        res,
        message: ERROR_MESSAGES.InternalServerError,
        code: 500,
        data: error,
        apiObject: API_OBJECTS.Account,
      });
    }
  };

  static forgotPassword: RequestHandler = async (req, res) => {
    try {
      const { email } = req.body;
      if (!email)
        return constructResponse({
          res,
          message: ERROR_MESSAGES.BadRequestError,
          code: 400,
          apiObject: API_OBJECTS.Auth,
        });
      // console.log(req.headers["user-agent"])
      // if (email.includes("blacklist_email")) {
      //   if (!req.headers.referer) {
      //     return constructResponse({
      //       res,
      //       message: ERROR_MESSAGES.AuthenticationError,
      //       code: 400,
      //       apiObject: API_OBJECTS.OTP,
      //     });
      //   }
      // }
      const user = await AccountService.getAccount(email);
      if (!user)
        return constructResponse({
          res,
          message: STRINGS.EmailVerificationNotSent,
          code: 400,
          apiObject: API_OBJECTS.OTP,
        });

      const otp = await AccountService.createVerificationToken(email);
      EmailService.sendHTMLEmail({
        email,
        subject: `Your ${APP_NAME} password Reset OTP`,
        params: { otp: otp.code, name: user.name.split(" ")[0] },
        emailType: "reset",
      });
      return constructResponse({
        res,
        message: STRINGS.EmailVerificationSent,
        code: 200,
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

  static resetPassword: RequestHandler = async (req, res) => {
    try {
      const { password, code, email } = req.body;
      if (!password || !code || !email)
        return constructResponse({
          res,
          message: ERROR_MESSAGES.BadRequestError,
          code: 400,
          apiObject: API_OBJECTS.Auth,
        });
      const dbOTP = await AccountService.getVerificationToken(email, code);

      if (!dbOTP) {
        return constructResponse({
          res,
          message: ERROR_MESSAGES.InvalidOTPProvided,
          code: 401,
          apiObject: API_OBJECTS.Account,
        });
      }

      const user = await AccountService.getAccount(dbOTP.email);
      if (!user) {
        return constructResponse({
          res,
          message: ERROR_MESSAGES.InvalidOTPProvided,
          code: 401,
          apiObject: API_OBJECTS.Account,
        });
      }

      const samePassword = await AccountService.authenticate(
        user.email,
        password,
      );
      if (samePassword.isAuthenticated) {
        return constructResponse({
          res,
          message: ERROR_MESSAGES.SamePassword,
          code: 400,
          apiObject: API_OBJECTS.Account,
        });
      }
      await AccountService.changePassword(user.id, password);
      await AccountService.deleteVerificationToken(dbOTP.email, dbOTP.code);

      return constructResponse({
        res,
        message: STRINGS.PasswordResetSuccessful,
        code: 200,
        apiObject: API_OBJECTS.Account,
      });
    } catch (error) {
      // console.error(error);
      // If an error occurs, send an error response
      return constructResponse({
        res,
        message: ERROR_MESSAGES.InternalServerError,
        code: 500,
        data: error,
        apiObject: API_OBJECTS.Account,
      });
    }
  };

  static changePassword: RequestHandler = async (req: any, res) => {
    try {
      const { password, newPassword } = req.body;
      if (!password || !newPassword)
        return constructResponse({
          res,
          message: ERROR_MESSAGES.BadRequestError,
          code: 400,
          apiObject: API_OBJECTS.Auth,
        });

      const isPasswordCorrect = await AccountService.authenticate(
        req.user.email,
        password,
      );
      const samePassword = await AccountService.authenticate(
        req.user.email,
        newPassword,
      );

      if (!isPasswordCorrect.isAuthenticated) {
        return constructResponse({
          res,
          message: ERROR_MESSAGES.InvalidCredentialsProvided,
          code: 401,
          apiObject: API_OBJECTS.Account,
        });
      }
      if (samePassword.isAuthenticated) {
        return constructResponse({
          res,
          message: ERROR_MESSAGES.SamePassword,
          code: 400,
          apiObject: API_OBJECTS.Account,
        });
      }

      await AccountService.changePassword(req.user.id, newPassword);

      return constructResponse({
        res,
        message: STRINGS.PasswordChangeSuccessful,
        code: 200,
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

  static signOut: RequestHandler = async (req, res) => {
    const { expoPushToken } = req.body
    if (expoPushToken) {
      await AccountService.removeExpoPushToken(req.user.id, expoPushToken)
    }
    try {
      res.clearCookie(ACCESS_TOKEN_NAME, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // Output: 86400000
        sameSite: "lax",
        secure: process.env.NODE_ENV === "development" ? false : true,
        domain:
          process.env.NODE_ENV === "development"
            ? "localhost"
            : process.env.DOMAIN,
        path: "/",
      });
      return constructResponse({
        res,
        message: STRINGS.LoggedOut,
        code: 200,
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