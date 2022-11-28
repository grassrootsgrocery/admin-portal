import express from "express";
import asyncHandler from "express-async-handler";
import { fetch } from "./nodeFetch";

import { Request, Response } from "express";
const router = express.Router();

/**
 * @description Get Tuesday recruitment text message blueprint from Make
 * @route  GET /api/messaging/tuesday-recruitment-text
 * @access
 */
router.route("/api/messaging/volunteer-recruitment-text").get(
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const resp = await fetch(
        "https://us1.make.com/api/v2/scenarios/299639/blueprint",
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

/**
 * @description Get Tuesday recruitment text message blueprint from Make
 * @route  GET /api/messaging/tuesday-recruitment-text
 * @access
 */
router.route("/api/messaging/coordinator-recruitment-text").get(
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const resp = await fetch(
        "https://us1.make.com/api/v2/scenarios/278585/blueprint",
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
