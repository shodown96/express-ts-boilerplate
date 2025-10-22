import { API_OBJECTS, APP_NAME } from "@/constants/app";
import { Router } from "express";
import pkg from "../../package.json";
import { constructResponse } from "../utilities/common";
import { authRouter } from "./auth.router";
import { oauthRouter } from "./oauth.router";
import { usersRouter } from "./users.router";

// import swaggerUi from "swagger-ui-express";
// import swaggerSpec from "../swagger";
// import { postRouter } from "./posts.router";
// import { transactionsRouter } from "./transactions.router";
// import { uploadsRouter } from "./uploads.router";
// import { adminRouter } from "./admin.router";
// import { notificationRouter } from "./notifications.router";
// import { rewardsRouter } from "./rewards.router";
// import { messageRouter } from "./message.router";
// import { reportsRouter } from "./reports.router";
// import { socialAuthRouter } from "./socialauth.router";
// import { appstoreRouter } from "./appstore.router";

const appRouter = Router();

// Define authentication routes
appRouter.use("/api/v1/auth", authRouter);

// Define oauth routes
appRouter.use("/api/v1/oauth", oauthRouter);

// Define user routes
appRouter.use("/api/v1/users", usersRouter);

// // Define upgrade routes
// appRouter.use("/api/v1/transactions", transactionsRouter);

// // Define posts routes
// appRouter.use("/api/v1/posts", postRouter);

// // Define uploads routes
// appRouter.use("/api/v1/uploads", uploadsRouter);

// // Define admin routes
// appRouter.use("/api/v1/admins", adminRouter);

// // Define notification routes
// appRouter.use("/api/v1/notifications", notificationRouter);

// // Define rewards routes
// appRouter.use("/api/v1/rewards", rewardsRouter);

// // Define messages routes
// appRouter.use("/api/v1/messages", messageRouter);

// // Define reports routes
// appRouter.use("/api/v1/reports", reportsRouter);

// // Define socialauth routes
// appRouter.use("/api/v1/socialauth", socialAuthRouter);

// // Define appstore routes
// appRouter.use("/api/v1/appstore", appstoreRouter);

// Swagger Docs
// appRouter.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

appRouter.get("/", (req, res) =>
    constructResponse({
        res,
        code: 200,
        apiObject: API_OBJECTS.Base,
        message: `Welcome to ${APP_NAME} API`,
        data: {
            version: pkg.version
        }
    })
);


export default appRouter;