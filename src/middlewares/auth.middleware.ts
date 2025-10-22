import { RequestHandler } from "express";
import { ACCESS_TOKEN_NAME, API_OBJECTS } from "../constants/app";
import { ERROR_MESSAGES } from "../constants/messages";
import { AccountService, AuthService } from "../services";
import { constructResponse, isValid } from "../utilities/common";

export const authenticate: RequestHandler = async (req, res, next) => {
  try {
    let token = req.headers.authorization?.split(" ")[1];
    if (!isValid(token)) {
      token = req?.cookies?.[ACCESS_TOKEN_NAME];
    }

    if (!isValid(token)) {
      return constructResponse({
        res,
        message: ERROR_MESSAGES.AuthenticationError,
        code: 401,
        apiObject: API_OBJECTS.Account,
      });
    }

    const decodedToken: any = AuthService.verifyAccessToken(token);
    const user = await AccountService.getAccount(decodedToken?.accountId, true);
    if (!user) {
      return constructResponse({
        res,
        message: ERROR_MESSAGES.AuthenticationError,
        code: 401,
        apiObject: API_OBJECTS.Account,
      });
    }
    if (user.banned) {
      return constructResponse({
        res,
        message: ERROR_MESSAGES.AccountBanned,
        code: 401,
        apiObject: API_OBJECTS.Account,
      });
    }
    AccountService.syncLastLogin(user.id, user.lastLogin)

    req.user = user as any;
    next();
  } catch (error) {
    return constructResponse({
      res,
      message: ERROR_MESSAGES.AuthenticationError,
      code: 401,
      apiObject: API_OBJECTS.Account,
    });
  }
};
