import { API_OBJECTS, APP_NAME, BASE_API_ENDPOINT } from "@/constants/app";
import { swaggerSpec } from "@/utilities/swagger";
import { Router } from "express";
import swaggerUi from "swagger-ui-express";
import pkg from "../../package.json";
import { constructResponse } from "../utilities/common";
import { authRouter } from "./auth.router";
import { oauthRouter } from "./oauth.router";
import { usersRouter } from "./users.router";

const appRouter = Router();

// Define authentication routes
appRouter.use("/api/v1/auth", authRouter);

// Define oauth routes
appRouter.use("/api/v1/oauth", oauthRouter);

// Define user routes
appRouter.use("/api/v1/users", usersRouter);

// Swagger Docs
appRouter.get("/api/docs/openapi.json", (_, res) => { res.json(swaggerSpec) });
appRouter.use(
    "/api/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
        swaggerOptions: {
            url: "/api/docs/openapi.json",
        },
    })
);

appRouter.get("/", (req, res) =>
    constructResponse({
        res,
        code: 200,
        apiObject: API_OBJECTS.Base,
        message: `Welcome to ${APP_NAME} API`,
        data: {
            version: pkg.version,
            docs: `${BASE_API_ENDPOINT}/api/docs`,
            openapi: `${BASE_API_ENDPOINT}/api/docs/openapi.json`
        }
    })
);


export default appRouter;