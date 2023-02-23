import winston from "winston";
import dotenv from "dotenv";
dotenv.config();

// Configure logger
const { combine, errors, timestamp, json, printf } = winston.format;

const logLevels = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  trace: 5,
};
const serverLogFormat = printf(({ level, message, timestamp, stack }) => {
  return `[${timestamp}] ${level.toLocaleUpperCase()}: ${message} ${
    stack !== undefined ? "STACK: " + stack : ""
  }`;
});

export const logger = winston.createLogger({
  levels: logLevels,
  level: process.env.NODE_ENV !== "dev" ? "warn" : "trace",
  format: combine(
    errors({ stack: true }),
    timestamp(),
    json(),
    serverLogFormat
  ),
  transports: [new winston.transports.Console()],
  exceptionHandlers: [
    new winston.transports.Console({ consoleWarnLevels: ["error"] }),
  ],
  rejectionHandlers: [
    new winston.transports.Console({ consoleWarnLevels: ["error"] }),
  ],
});

/**
 * To include a stack trace when logging exceptions:
 *  logger.error(new Error("Leave a descriptive error message here"));
 *
 * How the output should appear in the console:
 *  {
 *    level: "string",
 *    message: "string",
 *    stack: "string", //Only when an exception is thrown
 *    timestamp: "string"
 *  }
 *
 * Description of log levels:
 * - TRACE: this level should be used when tracing the path of a program's execution.
 * - DEBUG: any messages that may be needed for troubleshooting or diagnosing issues should be logged at this level.
 * - INFO: this level should be used when capturing a typical or expected event that occurred during normal program
 *    execution, usually things that are notable from a business logic perspective.
 * - WARN: log at this level when an event is unexpected but recoverable. You can also use it to indicate potential
 *    problems in the system that need to be mitigated before they become actual errors.
 * - ERROR: any error that prevents normal program execution should be logged at this level. The application can
 *    usually continue to function, but the error must be addressed if it persists.
 * - FATAL: use this level to log events that prevent crucial business functions from working. In situations like
 *    this, the application cannot usually recover, so immediate attention is required to fix such issues.
 *
 */
