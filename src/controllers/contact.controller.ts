import { RequestHandler } from "express";
import { EmailService } from "@/services";
import { API_OBJECTS } from "@/constants/app";
import { ERROR_MESSAGES, STRINGS } from "@/constants/messages";
import { constructResponse, isValid } from "@/utilities/common";

export class ContactController {
  static submit: RequestHandler = async (req, res) => {
    const { name, email, message } = req.body || {};

    if (!isValid(name) || !isValid(email) || !isValid(message)) {
      return constructResponse({
        res,
        message: ERROR_MESSAGES.ValidationError,
        code: 400,
        apiObject: API_OBJECTS.Contact,
      });
    }

    try {
      await EmailService.sendEmail({
        email: String(process.env.EMAIL_CONTACT_ADDRESS),
        subject: STRINGS.NewContactSubmission,
        replyTo: email,
        text: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Message:</strong></p><p>${message}</p>`,
      });

      return constructResponse({
        res,
        message: STRINGS.SubmittedSuccessfully,
        code: 200,
        apiObject: API_OBJECTS.Contact,
      });
    } catch (error) {
      return constructResponse({
        res,
        message: ERROR_MESSAGES.InternalServerError,
        code: 500,
        data: error,
        apiObject: API_OBJECTS.Contact,
      });
    }
  };
}
