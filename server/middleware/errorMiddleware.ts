import type { ErrorRequestHandler } from "express";
import { INTERNAL_SERVER_ERROR } from "../httpUtils/statusCodes";

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  const statusCode = err.status || INTERNAL_SERVER_ERROR;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};
