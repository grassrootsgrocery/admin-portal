import express from "express";
import asyncHandler from "express-async-handler";
import { protect } from "../middleware/authMiddleware";
import { fetch } from "../httpUtils/nodeFetch";
//Status codes
import { FORBIDDEN, OK } from "../httpUtils/statusCodes";

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
 * @description Get the "Send Coordinator Recruitment Text (Wed afternoon)" blueprint from Make
 * @route  GET /api/messaging/coordinator-recruitment-text
 * @access
 */
router.route("/api/messaging/coordinator-recruitment-text").get(
  protect,
  asyncHandler(async (req: Request, res: Response) => {
    const coordinatorRecruitmentTextAutomationId = 278585;
    const resp = await fetch(
      `https://us1.make.com/api/v2/scenarios/${coordinatorRecruitmentTextAutomationId}/blueprint`,
      {
        method: "GET",
        headers: {
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
 * @description Start the "Send Coordinator Recruitment Text (Wed afternoon)" Make automation
 * @route  POST /api/messaging/coordinator-recruitment-text
 * @access
 */
router.route("/api/messaging/coordinator-recruitment-text").post(
  protect,
  asyncHandler(async (req: Request, res: Response) => {
    if (process.env.NODE_ENV !== "production") {
      res.status(FORBIDDEN);
      throw new Error(
        "'NODE_ENV' must be set to 'production' to start Make automations."
      );
    }
    const sendCoordinatorRecruitmentTextWebhook =
      "https://hook.us1.make.com/573p5mfp7d594jx91vwny8nxjdlvjqew";
    const resp = await fetch(sendCoordinatorRecruitmentTextWebhook);
    if (!resp.ok) {
      throw {
        message: MAKE_ERROR_MESSAGE,
        status: resp.status,
      };
    }
    res.status(OK).json({
      message:
        "'Send Coordinator Recruitment Text (Wed afternoon)' Make automation started.",
    });
  })
);

/**
 * @description Get the "Send Tuesday recruitment texts" blueprint from Make
 * @route  GET /api/messaging/volunteer-recruitment-text
 * @access
 */
router.route("/api/messaging/volunteer-recruitment-text").get(
  protect,
  asyncHandler(async (req: Request, res: Response) => {
    const volunteerRecruitmentTextAutomationId = 299639;
    const resp = await fetch(
      `https://us1.make.com/api/v2/scenarios/${volunteerRecruitmentTextAutomationId}/blueprint`,
      {
        method: "GET",
        headers: {
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
 * @description Start the "Send Tuesday recruitment texts" Make automation
 * @route  POST /api/messaging/volunteer-recruitment-text
 * @access
 */
router.route("/api/messaging/volunteer-recruitment-text").post(
  protect,
  asyncHandler(async (req: Request, res: Response) => {
    if (process.env.NODE_ENV !== "production") {
      res.status(FORBIDDEN);
      throw new Error(
        "'NODE_ENV' must be set to 'production' to start Make automations."
      );
    }
    const sendTuesdayRecruitmentTextAutomationWebhook =
      "https://hook.us1.make.com/ni1ndj7x5ecrgt8ku9tj23cmsvwcrubu";
    const resp = await fetch(sendTuesdayRecruitmentTextAutomationWebhook);
    if (!resp.ok) {
      throw {
        message: MAKE_ERROR_MESSAGE,
        status: resp.status,
      };
    }
    res.status(OK).json({
      message: "'Send Tuesday recruitment texts' Make automation started.",
    });
  })
);

/**
 * @description Get the "Send Driver Info To Coordinators" text message blueprint from Make
 * @route  GET /api/messaging/driver-info-to-coordinators-text
 * @access
 */
router.route("/api/messaging/driver-info-to-coordinators-text").get(
  protect,
  asyncHandler(async (req: Request, res: Response) => {
    const driverInfoToCoordinatorsTextAutomationId = 321301;
    const resp = await fetch(
      `https://us1.make.com/api/v2/scenarios/${driverInfoToCoordinatorsTextAutomationId}/blueprint`,
      {
        method: "GET",
        headers: {
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
 * @description Start the "Send Driver Info To Coordinators" Make automation
 * @route  POST /api/messaging/driver-info-to-coordinators-text
 * @access
 */
router.route("/api/messaging/driver-info-to-coordinators-text").post(
  protect,
  asyncHandler(async (req: Request, res: Response) => {
    if (process.env.NODE_ENV !== "production") {
      res.status(FORBIDDEN);
      throw new Error(
        "'NODE_ENV' must be set to 'production' to start Make automations."
      );
    }
    const sendDriverInfoToCoordinatorsWebhook =
      "https://hook.us1.make.com/5x6qncf3nmcg0ytbmscnxfdqm8t5j97o";
    const resp = await fetch(sendDriverInfoToCoordinatorsWebhook);
    if (!resp.ok) {
      throw {
        message: MAKE_ERROR_MESSAGE,
        status: resp.status,
      };
    }
    res.status(OK).json({
      message: "'Send Driver Info To Coordinators' Make automation started.",
    });
  })
);

/**
 * @description Get the "[NEW] Send Locations and POC details to volunteer drivers (only text, no email)" text message blueprint from Make
 * @route  GET /api/messaging/locations-to-drivers-text
 * @access
 */
router.route("/api/messaging/locations-to-drivers-text").get(
  protect,
  asyncHandler(async (req: Request, res: Response) => {
    const driverLocationInfoTextAutomationId = 329564;
    const resp = await fetch(
      `https://us1.make.com/api/v2/scenarios/${driverLocationInfoTextAutomationId}/blueprint`,
      {
        method: "GET",
        headers: {
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

/**
 * @description Start the "[NEW] Send Locations and POC details to volunteer drivers (only text, no email)" Make automation
 * @route  POST /api/messaging/locations-to-drivers-text
 * @access
 */
router.route("/api/messaging/locations-to-drivers-text").post(
  protect,
  asyncHandler(async (req: Request, res: Response) => {
    if (process.env.NODE_ENV !== "production") {
      res.status(FORBIDDEN);
      throw new Error(
        "'NODE_ENV' must be set to 'production' to start Make automations."
      );
    }
    const sendLocationsAndPOCDetailsWebhook =
      "https://hook.us1.make.com/ot8o7kkpx80bjm1zh63all8a0uegt5t2";
    const resp = await fetch(sendLocationsAndPOCDetailsWebhook);
    if (!resp.ok) {
      throw {
        message: MAKE_ERROR_MESSAGE,
        status: resp.status,
      };
    }
    res.status(OK).json({
      message:
        "'[NEW] Send Locations and POC details to volunteer drivers (only text, no email)' Make automation started.",
    });
  })
);

export default router;
