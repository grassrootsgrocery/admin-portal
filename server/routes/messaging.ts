import express from "express";
import asyncHandler from "express-async-handler";
import { fetch } from "../httpUtils/nodeFetch";
//Status codes
import { INTERNAL_SERVER_ERROR, OK } from "../httpUtils/statusCodes";

import { Request, Response } from "express";
import { MAKE_ERROR_MESSAGE } from "../httpUtils/make";
const router = express.Router();

/**
 * @description Get "Send Coordinator Recruitment Text (Wed afternoon)" blueprint from Make
 * @route  GET /api/messaging/coordinator-recruitment-text
 * @access
 */
router.route("/api/messaging/coordinator-recruitment-text").get(
  asyncHandler(async (req: Request, res: Response) => {
    const coordinatorRecruitmentTextAutomationId = 278585;
    const resp = await fetch(
      `https://us1.make.com/api/v2/scenarios/${coordinatorRecruitmentTextAutomationId}/blueprint`,
      {
        headers: {
          method: "GET",
          Authorization: `Token ${process.env.MAKE_API_KEY}`,
        },
      }
    );
    if (!resp.ok) {
      throw {
        message: MAKE_ERROR_MESSAGE,
        status: resp.status,
      };
    }
    const data = await resp.json();
    /*
      This is awful, but there is nothing I can do about it really since this is how the Make API is structured. 
      There might be something better that we can do to try and parse the JSON and get the message instead so that 
      we can avoid magic numbers like this. 
    */
    res.status(OK).json(data.response.blueprint.flow[4].mapper.body);
  })
);

/**
 * @description Get "Send Tuesday recruitment texts" blueprint from Make
 * @route  GET /api/messaging/volunteer-recruitment-text
 * @access
 */
router.route("/api/messaging/volunteer-recruitment-text").get(
  asyncHandler(async (req: Request, res: Response) => {
    const volunteerRecruitmentTextAutomationId = 299639;
    const resp = await fetch(
      `https://us1.make.com/api/v2/scenarios/${volunteerRecruitmentTextAutomationId}/blueprint`,
      {
        headers: {
          method: "GET",
          Authorization: `Token ${process.env.MAKE_API_KEY}`,
        },
      }
    );
    if (!resp.ok) {
      throw {
        message: MAKE_ERROR_MESSAGE,
        status: resp.status,
      };
    }
    const data = await resp.json();
    /*
        This is awful, but there is nothing I can do about it really since this is how the Make API is structured. 
        There might be something better that we can do to try and parse the JSON and get the message instead so that 
        we can avoid magic numbers like this. 
      */
    res.status(OK).json(data.response.blueprint.flow[2].mapper.body);
  })
);

/**
 * @description Get the "Send Driver Info To Coordinators" text message blueprint from Make
 * @route  GET /api/messaging/driver-info-to-coordinators-text
 * @access
 */
router.route("/api/messaging/driver-info-to-coordinators-text").get(
  asyncHandler(async (req: Request, res: Response) => {
    const driverInfoToCoordinatorsTextAutomationId = 321301;
    const resp = await fetch(
      `https://us1.make.com/api/v2/scenarios/${driverInfoToCoordinatorsTextAutomationId}/blueprint`,
      {
        headers: {
          method: "GET",
          Authorization: `Token ${process.env.MAKE_API_KEY}`,
        },
      }
    );
    if (!resp.ok) {
      throw {
        message: MAKE_ERROR_MESSAGE,
        status: resp.status,
      };
    }
    const data = await resp.json();
    res
      .status(OK)
      .json(
        data.response.blueprint.flow[3].routes[0].flow[1].routes[1].flow[0]
          .mapper.body
      );
  })
);

/**
 * @description Get the "Send Driver Info To Coordinators" text message blueprint from Make
 * @route  GET /api/messaging/driver-info-to-coordinators-text
 * @access
 */
router.route("/api/messaging/location-to-driversinfo-text").get(
  asyncHandler(async (req: Request, res: Response) => {
    const driverLocationInfoTextAutomationId = 329564;
    const resp = await fetch(
      `https://us1.make.com/api/v2/scenarios/${driverLocationInfoTextAutomationId}/blueprint`,
      {
        headers: {
          method: "GET",
          Authorization: `Token ${process.env.MAKE_API_KEY}`,
        },
      }
    );
    if (!resp.ok) {
      throw {
        message: MAKE_ERROR_MESSAGE,
        status: resp.status,
      };
    }
    const data = await resp.json();
    res.status(OK).json(data.response.blueprint.flow[5].mapper.body);
  })
);

export default router;
