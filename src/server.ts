// src/index.js
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, { json } from "express";
import { app, server } from "./app";
import { APP_NAME } from "./constants/app";
import appRouter from "./routes";

dotenv.config();

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",");

app.use(
  json({
    limit: "10mb",
    verify: function (req: any, res, buf) {
      var url = req.originalUrl;
      if (url.startsWith("/api/v1/transactions/webhooks/stripe")) {
        req.rawBody = buf.toString();
      }
    },
  }),
);
// app.use(raw({ type: 'application/json' }))
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.urlencoded({ limit: '10mb', extended: true }));

export const port = process.env.PORT || 4000;



app.use((req, res, next) => {
  res.setHeader("X-Powered-By", APP_NAME);
  next();
});

app.use(appRouter);

export default server;
