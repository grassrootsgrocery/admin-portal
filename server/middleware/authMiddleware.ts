import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import { INTERNAL_SERVER_ERROR, UNAUTHORIZED } from "../httpUtils/statusCodes";
import { AIRTABLE_URL_BASE, airtableGET } from "../httpUtils/airtable";
import { fetch } from "../httpUtils/nodeFetch";
import { logger } from "../loggerUtils/logger";
import { IncomingHttpHeaders } from "http";
import { AirtableRecord } from "../types";

// using any here because types are huge
const checkTokenAndExtractUser = async (
  req: any,
  res: any
): Promise<AirtableRecord<{ Admin: boolean }>> => {
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith("Bearer") ||
    req.headers.authorization.split(" ").length !== 2
  ) {
    res.status(UNAUTHORIZED);
    throw new Error("Please send a bearer token in request headers");
  }
  let token = req.headers.authorization.split(" ")[1];
  if (!process.env.JWT_SECRET) {
    res.status(INTERNAL_SERVER_ERROR);
    logger.error("'process.env.JWT_SECRET' is not set");
    throw new Error(
      "Something went wrong processing the bearer token. Please try again later."
    );
  }
  //Verify token
  let decoded = null;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    logger.error(e instanceof Error ? e.message : "");
    res.status(UNAUTHORIZED);
    throw new Error("Not authorized, token failed");
  }
  if (typeof decoded === "string") {
    logger.info(`Decoded token is a string: ${decoded}`);
    res.status(UNAUTHORIZED);
    throw new Error("Not authorized, token failed");
  }

  //Get user from token
  const getUserUrl = `${AIRTABLE_URL_BASE}/Users?filterByFormula=SEARCH(RECORD_ID(), "${decoded.id}") != ""`;
  const getUserResp = await airtableGET<{ Admin: boolean }>({
    url: getUserUrl,
  });

  if (getUserResp.kind === "error") {
    res.status(INTERNAL_SERVER_ERROR).json({
      message: getUserResp.error,
    });

    throw new Error("Something went wrong finding the user");
  }

  if (getUserResp.records.length === 0) {
    res.status(UNAUTHORIZED);
    throw new Error("Not authorized, token failed");
  }

  return getUserResp.records[0];
};

export const protect = asyncHandler(async (req, res, next) => {
  await checkTokenAndExtractUser(req, res);
  next();
});

export const adminProtect = asyncHandler(async (req, res, next) => {
  const user = await checkTokenAndExtractUser(req, res);

  if (!user.fields["Admin"]) {
    res.status(UNAUTHORIZED);
    throw new Error("Not authorized, not an admin");
  }

  next();
});
