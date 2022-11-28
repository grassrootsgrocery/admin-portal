import express from "express";
import asyncHandler from "express-async-handler";
import { fetch } from "./nodeFetch";
//Status codes
import { INTERNAL_SERVER_ERROR, BAD_REQUEST, OK } from "../statusCodes";

import { Request, Response } from "express";
const router = express.Router();

/**
 * @description Get Tuesday recruitment text message blueprint from Make
 * @route  GET /api/messaging/tuesday-recruitment-text
 * @access
 */
router.route("/api/messaging/coordinator-recruitment-text").get(
  asyncHandler(async (req: Request, res: Response) => {
    const coordinatorRecruitmentTextAutomationId = 278585;
    try {
      const resp = await fetch(
        `https://us1.make.com/api/v2/scenarios/${coordinatorRecruitmentTextAutomationId}/blueprint`,
        {
          headers: {
            method: "GET",
            Authorization: `Token ${process.env.MAKE_API_KEY}`,
          },
        }
      );
      const data = await resp.json();
      /*
        This is awful, but there is nothing I can do about it really since this is how the Make API is structured. 
        There might be something better that we can do to try and parse the JSON and get the message instead so that 
        we can avoid magic numbers like this. 
      */
      res.status(OK).json(data.response.blueprint.flow[4].mapper.body);
    } catch (error) {
      console.error(error);
      res
        .status(INTERNAL_SERVER_ERROR)
        .json({ message: "Something went wrong" });
    }
  })
);

/**
 * @description Get Tuesday recruitment text message blueprint from Make
 * @route  GET /api/messaging/tuesday-recruitment-text
 * @access
 */
router.route("/api/messaging/volunteer-recruitment-text").get(
  asyncHandler(async (req: Request, res: Response) => {
    const volunteerRcruitmentTextAutomationId = 299639;
    try {
      const resp = await fetch(
        `https://us1.make.com/api/v2/scenarios/${volunteerRcruitmentTextAutomationId}/blueprint`,
        {
          headers: {
            method: "GET",
            Authorization: `Token ${process.env.MAKE_API_KEY}`,
          },
        }
      );
      const data = await resp.json();
      /*
        This is awful, but there is nothing I can do about it really since this is how the Make API is structured. 
        There might be something better that we can do to try and parse the JSON and get the message instead so that 
        we can avoid magic numbers like this. 
      */
      res.status(OK).json(data.response.blueprint.flow[2].mapper.body);
    } catch (error) {
      console.error(error);
      res
        .status(INTERNAL_SERVER_ERROR)
        .json({ message: "Something went wrong" });
    }
  })
);

export default router;
