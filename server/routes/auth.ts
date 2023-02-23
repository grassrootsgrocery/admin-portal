import express from "express";
import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { AIRTABLE_URL_BASE } from "../httpUtils/airtable";
import { fetch } from "../httpUtils/nodeFetch";
//Status codes
import {
  BAD_REQUEST,
  INTERNAL_SERVER_ERROR,
  OK,
  OK_CREATED,
} from "../httpUtils/statusCodes";
//Types
//Error messages
import { AIRTABLE_ERROR_MESSAGE } from "../httpUtils/airtable";
//Logger
import { logger } from "../loggerUtils/logger";

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const router = express.Router();

const generateToken = (id: string) => {
  const secret = process.env.JWT_SECRET || ""; //JWT_SECRET must be set in .env
  return jwt.sign({ id }, secret, { expiresIn: "30d" });
};

/**
 * @description Create a new account. This endpoint is not currently used on the frontend
 * @route  POST /api/users/sign-up
 * @access
 */
router.route("/api/auth/sign-up").post(
  asyncHandler(async (req: Request, res: Response) => {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(BAD_REQUEST);
      throw new Error(
        "Please provide an 'username' and 'password' on the request body of type 'string'."
      );
    }
    //Check if user already exists
    const checkUserExistenceUrl = `${AIRTABLE_URL_BASE}/Users?filterByFormula=SEARCH(Username, "${username}") != ""`;
    const checkUserExistenceResp = await fetch(checkUserExistenceUrl, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
      },
    });
    const checkUserExistenceData = await checkUserExistenceResp.json();
    if (checkUserExistenceData.records.length > 0) {
      res.status(BAD_REQUEST);
      throw new Error("User already exists");
    }
    //Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //Create user by posting to Airtable Users table
    const createUserUrl = `${AIRTABLE_URL_BASE}/Users`;
    const createUserResp = await fetch(createUserUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
      },
      body: JSON.stringify({
        records: [
          {
            fields: {
              Username: username,
              Password: hashedPassword,
            },
          },
        ],
      }),
    });
    if (!createUserResp.ok) {
      throw {
        message: AIRTABLE_ERROR_MESSAGE,
        status: createUserResp.status,
      };
    }
    const createUserData = await createUserResp.json();
    const user = createUserData.records[0];
    if (!user.id) {
      //Should never happen
      res.status(INTERNAL_SERVER_ERROR);
      throw new Error("Uh oh, created user doesn't have 'id' field...");
    }
    res.status(OK_CREATED).json({
      username: user.fields.Username,
      //This token is what will be used to make requests to the rest of the API
      token: generateToken(user.id),
    });
  })
);

/**
 * @description Logs in an existing user
 * @route  POST /api/users/login
 * @access
 */
router.route("/api/auth/login").post(
  asyncHandler(async (req: Request, res: Response) => {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(BAD_REQUEST);
      throw new Error(
        "Please provide an 'username' and 'password' on the request body of type 'string'."
      );
    }
    //Check if user exists
    const checkUserExistenceUrl = `${AIRTABLE_URL_BASE}/Users?filterByFormula=SEARCH(Username, "${username}") != ""`;
    const checkUserExistenceResp = await fetch(checkUserExistenceUrl, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
      },
    });
    const data = await checkUserExistenceResp.json();
    if (data.records.length === 0) {
      logger.error(new Error("User doesn't exist"));
      res.status(BAD_REQUEST);
      throw new Error("Incorrect credentials");
    }
    if (data.records.length !== 1) {
      //This should never happen. Emails should be unique for all users
      res.status(INTERNAL_SERVER_ERROR);
      throw new Error("Something went wrong fetching this user...");
    }

    //Check if password is correct
    const user = data.records[0];
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.fields.Password
    );
    if (!isPasswordCorrect) {
      logger.info("Incorrect password");
      res.status(BAD_REQUEST);
      throw new Error("Incorrect credentials");
    }
    if (!user.id) {
      //Should never happen
      res.status(INTERNAL_SERVER_ERROR);
      throw new Error("Something went wrong fetching this user...");
    }
    res.status(OK).json({
      username: user.fields.Username,
      token: generateToken(user.id),
    });
  })
);
export default router;
