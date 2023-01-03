import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import { UNAUTHORIZED } from "../httpUtils/statusCodes";
import { AIRTABLE_URL_BASE } from "../httpUtils/airtable";
import { fetch } from "../httpUtils/nodeFetch";

export const protect = asyncHandler(async (req, res, next) => {
  let token = null;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      //Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "");
      if (typeof decoded === "string") {
        console.log("Decoded token is a string: ", decoded);
        res.status(UNAUTHORIZED);
        throw new Error("Not authorized, token failed");
      }

      //Get user from token
      const getUserUrl = `${AIRTABLE_URL_BASE}/Users?filterByFormula=SEARCH(RECORD_ID(), "${decoded.id}") != ""`;
      const getUserResp = await fetch(getUserUrl, {
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
    } catch (error) {
      console.error(error);
      res.status(UNAUTHORIZED);
      throw new Error("Not authorized, token failed");
    }
  }
  if (!token) {
    res.status(UNAUTHORIZED);
    throw new Error("Not authorized, no token");
  }
});
