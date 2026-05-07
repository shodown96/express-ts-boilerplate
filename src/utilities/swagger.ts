import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "App API",
      version: "1.0.0",
      description:
        "Backend API",
    },
    servers: [
      {
        url: "http://localhost:4000/api/v1",
        description: "Local development",
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "token",
        },
      },
    },
  },
  // point at every route file that contains JSDoc comments
  apis: ["./src/routes/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);