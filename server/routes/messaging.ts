import express from "express";
import asyncHandler from "express-async-handler";
import { fetch } from "../httpUtils/nodeFetch";
//Status codes
import { INTERNAL_SERVER_ERROR, OK } from "../httpUtils/statusCodes";

import { Request, Response } from "express";
import { MAKE_ERROR_MESSAGE } from "../httpUtils/make";
const router = express.Router();

/*
All of these endpoints are pretty bad because we are fetching data from Make and using magic numbers to grab the exact
part of the response that contains the text message body that is used in the automations. There is probably some better way
to be doing this. Perhaps we should be talking to the Twilio API to get the text messsages instead, but that would have its 
own problems if they were to ever change the Make automations to use different text messages.
*/

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
 * @description Get the "[NEW] Send Locations and POC details to volunteer drivers (only text, no email)" text message blueprint from Make
 * @route  GET /api/messaging/locations-to-drivers-text
 * @access
 */
router.route("/api/messaging/locations-to-drivers-text").get(
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
