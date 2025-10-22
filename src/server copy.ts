// src/index.js
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, { json } from "express";
import { app, server } from "./app";
import { APP_NAME } from "./constants/app";

dotenv.config();

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",");

app.use(json({ limit: "10mb" }));
app.use(cookieParser());
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors({ origin: allowedOrigins, credentials: true, }));

export const port = process.env.PORT || 4000;

app.use((_, res, next) => {
  res.setHeader("X-Powered-By", APP_NAME);
  next();
});

export default server;
