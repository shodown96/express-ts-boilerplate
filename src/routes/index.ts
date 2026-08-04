import { API_OBJECTS, APP_NAME, BASE_API_ENDPOINT } from "@/constants/app";
import { swaggerSpec } from "@/utilities/swagger";
import { renderMarkdownFile } from "@/utilities/markdown";
import { Router } from "express";
import swaggerUi from "swagger-ui-express";
import pkg from "../../package.json";
import { constructResponse } from "../utilities/common";
import { authRouter } from "./auth.router";
import { oauthRouter } from "./oauth.router";
import { usersRouter } from "./users.router";
import { contactRouter } from "./contact.router";

const appRouter = Router();

// Define authentication routes
appRouter.use("/api/v1/auth", authRouter);

// Define oauth routes
appRouter.use("/api/v1/oauth", oauthRouter);

// Define user routes
appRouter.use("/api/v1/users", usersRouter);

// Define contact routes
appRouter.use("/api/v1/contact", contactRouter);

// Swagger Docs
appRouter.get("/api/docs/openapi.json", (_, res) => { res.json(swaggerSpec) });
appRouter.get("/api/docs/guide", (_, res) => renderMarkdownFile(res, "API.md"));
appRouter.get("/api/docs/architecture", (_, res) => renderMarkdownFile(res, "ARCHITECTURE.md"));
appRouter.use(
    "/api/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
        swaggerOptions: {
            url: "/api/docs/openapi.json",
        },
    })
);
appRouter.get("/", (_, res) => renderMarkdownFile(res, "BASE.md"));

// appRouter.get("/", (req, res) =>
//     constructResponse({
//         res,
//         code: 200,
//         apiObject: API_OBJECTS.Base,
//         message: `Welcome to ${APP_NAME} API`,
//         data: {
//             version: pkg.version,
//             docs: `${BASE_API_ENDPOINT}/api/docs`,
//             openapi: `${BASE_API_ENDPOINT}/api/docs/openapi.json`,
//             guide: `${BASE_API_ENDPOINT}/api/docs/guide`,
//         }
//     })
// );


export default appRouter;