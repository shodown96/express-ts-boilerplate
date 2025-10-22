import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"
import { VERIFICATION_TOEKN_LENGTH } from "@/constants/app";

export class AuthService {
  // Middleware to generate access tokens
  static generateAccessToken = (user: any) => {
    return jwt.sign(
      { accountId: user.id },
      `${process.env.ACCESS_TOKEN_SECRET}`,
      { expiresIn: "14d" },
    );
  };

  // Middleware to generate refresh tokens
  static generateRefreshToken = (user: any) => {
    return jwt.sign(
      { accountId: user.id },
      `${process.env.REFRESH_TOKEN_SECRET}`,
      { expiresIn: "21d" },
    );
  };

  // Verify access tokens
  static verifyAccessToken = (token: any) => {
    return jwt.verify(token, `${process.env.ACCESS_TOKEN_SECRET}`);
  };

  // Verify refresh tokens
  static verifyRefreshToken = (token: any) => {
    return jwt.verify(token, `${process.env.REFRESH_TOKEN_SECRET}`);
  };

  static generateRandomPassword = (length = 12) => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$&';
    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    return password;
  }


  static hashPassword = async (password: string) => {
    return await bcrypt.hash(password, 10);
  }

  static generateVerificationToken = (length = VERIFICATION_TOEKN_LENGTH) => {
    const digits = "0123456789";
    let otp = "";

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * digits.length);
      otp += digits[randomIndex];
    }

    return otp;
  };

  static comparePasswords = async (plainPassword: string, hashedPassword: string) => {
    return await bcrypt.compare(plainPassword, hashedPassword)
  }

}