
import express, { Express } from "express";
import http from "http";

export const app: Express = express();
export const server = http.createServer(app);
