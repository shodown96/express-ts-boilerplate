
import express, { Express } from "express";
import http from "http";

export const port = process.env.PORT || 4000;
export const app: Express = express();
export const server = http.createServer(app);
