import express from "express";
import asyncHandler from "express-async-handler";
import { fetch } from "./nodeFetch";

import { Request, Response } from "express";
const router = express.Router();

/**
 * @description Get all upcoming messages.
 * @route  GET /api/messaging/
 * @access
 */
router.route("/api/messaging").get(
  asyncHandler(async (req: Request, res: Response) => {
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
