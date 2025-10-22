import { DEFAULT_PAGE_SIZE, VERIFICATION_TOEKN_LENGTH } from "@/constants/app";
import { ERROR_MESSAGES, STRINGS } from "@/constants/messages";
import crypto from "crypto";
import { Response } from "express";

export const generateOTP = (length = VERIFICATION_TOEKN_LENGTH) => {
  const digits = "0123456789";
  let otp = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * digits.length);
    otp += digits[randomIndex];
  }

  return otp;
};

export const isValid = (value: any) => {
  return value !== undefined && value !== "" && value !== null && value !== "undefined";
};

export const isURL = (str: string): boolean => {
  // Regular expression for a simple URL pattern
  const urlRegex: RegExp = /^(http|https):\/\/[^ "]+$/;

  // Test the string against the regex
  return urlRegex.test(str);
};

export const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString();
};

export const addYearsToDate = (date: string | Date, years = 1) => {
  const originalDate = new Date(date);
  const newDate = new Date(originalDate);
  newDate.setFullYear(originalDate.getFullYear() + years);
  return newDate.toLocaleDateString();
};

export const verifyPaystackTransaction = (eventData: any, signature: any) => {
  const hmac = crypto.createHmac(
    "sha512",
    `${process.env.PAYSTACK_API_SECRET_KEY}`,
  );
  const expectedSignature = hmac
    .update(JSON.stringify(eventData))
    .digest("hex");
  return expectedSignature === signature;
};

export const paginateData = ({
  items,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE
}: { page?: number, pageSize?: number, items: any[] }) => {
  const startIndex = (Number(page) - 1) * Number(pageSize);
  const endIndex = startIndex + Number(pageSize);
  const _items = items.slice(startIndex, endIndex);
  const totalPages = Math.ceil(items.length / Number(pageSize));

  const data: any = {
    pageSize,
    totalPages,
    items: _items,
    total: items.length,
    currentPage: page,
  };
  return data;
};

export const paginateItems = ({
  page,
  pageSize,
  items,
  total,
}: {
  page: number;
  pageSize: number;
  items: any;
  total: number;
}) => {
  const totalPages = total ? Math.ceil(total / pageSize) : 0;
  const data: any = {
    items,
    pageSize,
    totalPages,
    currentPage: page,
    total: total,
  };
  return data;
};

const successCodes = [200, 201];

export const constructResponse = ({
  res,
  message,
  data = {},
  code,
  apiObject,
}: {
  res: Response;
  message?: string;
  data?: any;
  code: number;
  apiObject: string;
}) => {
  const isSuccess = successCodes.includes(code);
  if (process.env.NODE_ENV === "development" || process.env.DOMAIN?.includes("dev")) {
    if (!isSuccess) {
      console.log("isSuccess", isSuccess)
      console.log(
        "[error]:",
        code,
        res.req.method,
        res.req.originalUrl,
        message,
        // res.req.route,
        data?.toString() === "[object Object]" ? data : data?.toString(),
      );
    } else {
      console.log("[success]:", code, res.req.method, res.req.originalUrl)
    }
  }

  const _res = {
    apiObject,
    code,
    status: isSuccess ? "success" : "failure",
    message:
      message ||
      (isSuccess
        ? STRINGS.Success
        : ERROR_MESSAGES.InternalServerError),
    errorMessage: !isSuccess ? data : undefined,
    result: isSuccess ? data : {},
  };
  return res.status(code).json(_res) as any;
};

export const extractHashtags = (postBody: string) => {
  return postBody.match(/#[a-zA-Z0-9_]+/g) || [];
};

export const getFirstName = (name = "") => {
  return name.split(" ")[0] || "";
};

export const getLastName = (name = "") => {
  return name.split(" ").slice(1).join("") || "";
};

export function generateRandomString(length = 10): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export function generateRandomFileName(length: number, extension: string): string {
  const randomString = generateRandomString(length);
  return randomString + '.' + extension;
}

export function getFileExtension(base64Data: string): string | null {
  // Define supported file types and their corresponding extensions
  const fileTypeMappings: { [key: string]: string } = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'application/pdf': 'pdf',
    'video/mp4': 'mp4',
    'audio/mpeg': 'mp3',
    'audio/wav': 'wav',
    'text/plain': 'txt',
    'application/json': 'json',
    'application/xml': 'xml',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'application/vnd.ms-powerpoint': 'ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
    // Add more mappings as needed
  };

  // Extract the file type from the base64 data
  const match = base64Data.match(/^data:([a-z]+\/[a-z0-9-+.]+);base64,/i);
  if (!match) return null;

  // Extract the file type from the match
  const fileType = match[1];

  // Retrieve the extension based on the file type
  return fileTypeMappings[fileType.toLowerCase()] || null;
}

export const generateFileName = ({
  file, folder, name
}: { file: string, folder: string, name: string }) => {
  const ext = getFileExtension(file);
  const randomName = name.length === 0 ? generateRandomString() : name;
  return `${folder}/${randomName}.${ext}`
}

export const hasDatePassed = (dateString: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time for accurate comparison

  const targetDate = new Date(dateString);
  targetDate.setHours(0, 0, 0, 0); // Reset time for accurate comparison

  return today > targetDate;
};