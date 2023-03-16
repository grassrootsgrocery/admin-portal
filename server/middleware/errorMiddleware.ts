import type { ErrorRequestHandler } from "express";
import { INTERNAL_SERVER_ERROR } from "../httpUtils/statusCodes";
import { logger } from "../loggerUtils/logger";

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  const stack = process.env.NODE_ENV === "production" ? null : err.stack;
  const statusCode = err.status || INTERNAL_SERVER_ERROR;

  logger.error(`${statusCode} ${err.message} ${stack}`);

  res.status(statusCode);
  res.json({
    message: err.message,
    stack,
  });
};
