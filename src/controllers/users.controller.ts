import { API_OBJECTS } from "@/constants/app";
import { ERROR_MESSAGES, STRINGS } from "@/constants/messages";
import { RequestHandler } from "express";
import { constructResponse } from "../utilities/common";

export class UsersController {
  static myProfileController: RequestHandler = async (req: any, res: any) => {
    try {
      return constructResponse({
        res,
        message: STRINGS.Success,
        code: 200,
        data: req.user,
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