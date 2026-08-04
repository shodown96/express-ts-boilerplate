import { AccountRole } from "@prisma/client";
import { RequestHandler } from "express";
import {
  AccountService,
  AuthService,
  EmailService
} from "@/services"
import { constructResponse, getFirstName } from "@/utilities/common";
import { ACCESS_TOKEN_NAME, API_OBJECTS, APP_NAME } from "@/constants/app";
import { ERROR_MESSAGES, STRINGS } from "@/constants/messages";

export class AuthController {

  static signUp: RequestHandler = async (req, res) => {
    if (!req.body?.email)
      return constructResponse({
        res,
        message: ERROR_MESSAGES.BadRequestError,
        code: 400,
        apiObject: API_OBJECTS.Account,
      });

    try {
      const existing = await AccountService.getAccount(req.body.email);
      if (existing) {
        return constructResponse({
          res,
          message: ERROR_MESSAGES.UserAlreadyExists,
          code: 400,
          apiObject: API_OBJECTS.Account,
        });
      }

      const user = await AccountService.createAccount({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
      });

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

      EmailService.sendHTMLEmail({
        email: req.body.email,
        subject: `Welcome to The ${APP_NAME}`,
        params: { name: getFirstName(user.name) },
        emailType: "welcome",
      });

      return constructResponse({
        res,
        message: STRINGS.Success,
        code: 201,
        data: { user: { ...user, role: undefined }, accessToken, refreshToken },
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

  static signIn: RequestHandler = async (req, res) => {
    if (!req.body?.email || !req.body?.password) {
      return constructResponse({
        res,
        message: ERROR_MESSAGES.BadRequestError,
        code: 400,
        apiObject: API_OBJECTS.Account,
      });
    }
    try {
      const user = await AccountService.getAccount(req.body.email, true);

      if (!user) {
        return constructResponse({
          res,
          message: ERROR_MESSAGES.InvalidCredentialsProvided,
          code: 401,
          apiObject: API_OBJECTS.Account,
        });
      }

      const referer = req.get('Referer');
      if (!referer) {
        const platform = req.query.PLATFORM;
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

      const isPasswordCorrect = await AccountService.authenticate(req.body.email, req.body.password);
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

      return constructResponse({
        res,
        message: STRINGS.LoginSuccess,
        code: 200,
        data: {
          user: {
            ...user,
            role: user.role === AccountRole.admin ? AccountRole.admin : undefined,
            deleted: false,
            deletedAt: null,
          },
          accessToken,
          refreshToken,
        },
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

  static signOut: RequestHandler = async (req, res) => {
    try {
      AuthService.removeCookie({ req, res, tokenName: ACCESS_TOKEN_NAME });
      return constructResponse({
        res,
        message: STRINGS.LoggedOut,
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

  static getToken: RequestHandler = async (req, res) => {
    try {
      if (!req.body.refreshToken)
        return constructResponse({
          res,
          message: ERROR_MESSAGES.InvalidCredentialsProvided,
          code: 401,
          apiObject: API_OBJECTS.Account,
        });

      const decodedToken: any = AuthService.verifyRefreshToken(req.body.refreshToken);
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

  static setPassword: RequestHandler = async (req, res) => {
    try {
      if (!req.body.password) {
        return constructResponse({
          res,
          code: 400,
          message: ERROR_MESSAGES.BadRequestError,
          apiObject: API_OBJECTS.Auth,
        });
      }

      const user = await AccountService.setAccountPassword(req.user.id, req.body.password);
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

  static sendCode: RequestHandler = async (req, res) => {
    if (!req.body.email)
      return constructResponse({
        res,
        message: ERROR_MESSAGES.BadRequestError,
        code: 400,
        apiObject: API_OBJECTS.OTP,
      });

    try {
      const user = await AccountService.getAccount(req.body.email);
      const otp = await AccountService.createVerificationToken(req.body.email);

      EmailService.sendHTMLEmail({
        email: req.body.email,
        subject: `Your ${APP_NAME} Account Verification OTP`,
        params: { otp: otp.code, name: getFirstName(user?.name) || req.body.email },
        emailType: "otp",
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
    if (!req.body.code)
      return constructResponse({
        res,
        message: ERROR_MESSAGES.BadRequestError,
        code: 400,
        apiObject: API_OBJECTS.Auth,
      });

    try {
      const dbOTP = await AccountService.getVerificationToken(req.user.email, req.body.code);

      if (!dbOTP) {
        return res.status(401).json({ message: ERROR_MESSAGES.InvalidOTPProvided });
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
    if (!req.body.email)
      return constructResponse({
        res,
        message: ERROR_MESSAGES.BadRequestError,
        code: 400,
        apiObject: API_OBJECTS.Auth,
      });

    try {
      const existing = await AccountService.checkIfEmailExists(req.body.email);
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
    if (!req.body.code)
      return constructResponse({
        res,
        message: ERROR_MESSAGES.BadRequestError,
        code: 400,
        apiObject: API_OBJECTS.Auth,
      });

    try {
      const dbOTP = await AccountService.verifyVerificationTokenbyCode(req.body.code);
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
      console.log(error);
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
      if (!req.body.email)
        return constructResponse({
          res,
          message: ERROR_MESSAGES.BadRequestError,
          code: 400,
          apiObject: API_OBJECTS.Auth,
        });

      const user = await AccountService.getAccount(req.body.email);
      if (!user)
        return constructResponse({
          res,
          message: STRINGS.EmailVerificationNotSent,
          code: 400,
          apiObject: API_OBJECTS.OTP,
        });

      const otp = await AccountService.createVerificationToken(req.body.email);
      EmailService.sendHTMLEmail({
        email: req.body.email,
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
      if (!req.body.password || !req.body.code || !req.body.email)
        return constructResponse({
          res,
          message: ERROR_MESSAGES.BadRequestError,
          code: 400,
          apiObject: API_OBJECTS.Auth,
        });

      const dbOTP = await AccountService.getVerificationToken(req.body.email, req.body.code);
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

      const samePassword = await AccountService.authenticate(user.email, req.body.password);
      if (samePassword.isAuthenticated) {
        return constructResponse({
          res,
          message: ERROR_MESSAGES.SamePassword,
          code: 400,
          apiObject: API_OBJECTS.Account,
        });
      }

      await AccountService.changePassword(user.id, req.body.password);
      await AccountService.deleteVerificationToken(dbOTP.email, dbOTP.code);

      return constructResponse({
        res,
        message: STRINGS.PasswordResetSuccessful,
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

  static changePassword: RequestHandler = async (req: any, res) => {
    try {
      if (!req.body.password || !req.body.newPassword)
        return constructResponse({
          res,
          message: ERROR_MESSAGES.BadRequestError,
          code: 400,
          apiObject: API_OBJECTS.Auth,
        });

      const isPasswordCorrect = await AccountService.authenticate(req.user.email, req.body.password);
      const samePassword = await AccountService.authenticate(req.user.email, req.body.newPassword);

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

      await AccountService.changePassword(req.user.id, req.body.newPassword);

      return constructResponse({
        res,
        message: STRINGS.PasswordChangeSuccessful,
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
}