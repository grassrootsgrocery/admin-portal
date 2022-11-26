///// <reference lib="dom" />
import express from "express";
import asyncHandler from "express-async-handler";
//import fetch from "node-fetch";
// ✅ Do this if using TYPESCRIPT
import { RequestInfo, RequestInit } from "node-fetch";

const fetch = (url: RequestInfo, init?: RequestInit) =>
  import("node-fetch").then(({ default: fetch }) => fetch(url, init));

import { Request, Response } from "express";

const router = express.Router();

/**
 * @description Get all upcoming events.
 * @route  GET /api/messaging/
 * @access
 */
router.route("/api/messaging").get(
  asyncHandler(async (req: Request, res: Response) => {
    console.log(process.env.MAKE_API_KEY);
    try {
      const resp = await fetch(
        "https://us1.make.com/api/v2/scenarios?teamId=1989&pg%5Blimit%5D=100",
        {
          headers: {
            method: "GET",
            Authorization: `Token ${process.env.MAKE_API_KEY}`,
          },
        }
      );
      const data = await resp.json();
      res.status(200).json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Something went wrong" });
    }
  })
);

export default router;
