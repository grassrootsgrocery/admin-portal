import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import { INTERNAL_SERVER_ERROR, UNAUTHORIZED } from "../httpUtils/statusCodes";
import { AIRTABLE_URL_BASE } from "../httpUtils/airtable";
import { fetch } from "../httpUtils/nodeFetch";
import { logger } from "../loggerUtils/logger";

export const protect = asyncHandler(async (req, res, next) => {
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
  const getUserResp = await fetch(getUserUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
    },
  });
  const getUserData = await getUserResp.json();
  if (getUserData.records.length === 0) {
    res.status(UNAUTHORIZED);
    throw new Error("Not authorized, token failed");
  }
  next();
});
