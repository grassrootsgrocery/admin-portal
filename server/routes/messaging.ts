import express from "express";
import asyncHandler from "express-async-handler";
import { protect } from "../middleware/authMiddleware";
import { fetch } from "../httpUtils/nodeFetch";
//Types
import { Request, Response } from "express";
//Status codes
import { INTERNAL_SERVER_ERROR, OK } from "../httpUtils/statusCodes";

//Utils
async function makeRequest(
  url: string | undefined,
  res: Response,
  onErrorMessage: string
) {
  if (!url) {
    throw new Error("url is undefined");
  }
  const resp = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Token ${process.env.MAKE_API_KEY}`,
    },
  });
  if (!resp.ok) {
    res.status(resp.status);
    throw new Error(onErrorMessage);
  }
  return await resp.json();
}

function checkNodeEnvIsProduction(res: Response) {
  if (process.env.NODE_ENV !== "production") {
    res.status(INTERNAL_SERVER_ERROR);
    throw new Error(
      "'NODE_ENV' must be set to 'production' to start Make automations."
    );
  }
}

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
    const coordinatorRecruitmentTextBlueprintId = 278585;
    const url = `https://us1.make.com/api/v2/scenarios/${coordinatorRecruitmentTextBlueprintId}/blueprint`;
    const data = await makeRequest(
      url,
      res,
      "There was a problem fetching the 'Send Coordinator Recruitment Text (Wed afternoon)' text."
    );
    //Grab the coordinator recruitment text from the response body
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
    checkNodeEnvIsProduction(res);
    await makeRequest(
      process.env.COORDINATOR_RECRUITMENT_TEXT_WEBHOOK,
      res,
      "Unable to start 'Send Coordinator Recruitment Text (Wed afternoon)' Make automation."
    );
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
    const volunteerRecruitmentTextBlueprintId = 299639;
    const url = `https://us1.make.com/api/v2/scenarios/${volunteerRecruitmentTextBlueprintId}/blueprint`;
    const data = await makeRequest(
      url,
      res,
      "There was a problem fetching the 'Send Tuesday recruitment texts' text."
    );
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
    checkNodeEnvIsProduction(res);
    await makeRequest(
      process.env.TUESDAY_RECRUITMENT_TEXT_WEBHOOK,
      res,
      "Unable to start 'Send Tuesday recruitment texts' Make automation."
    );
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
    const driverInfoToCoordinatorsTextBlueprintId = 321301;
    const url = `https://us1.make.com/api/v2/scenarios/${driverInfoToCoordinatorsTextBlueprintId}/blueprint`;
    const data = await makeRequest(
      url,
      res,
      "There was a problem fetching the 'Send Driver Info To Coordinators' text."
    );
    //Grab message body
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
    checkNodeEnvIsProduction(res);
    await makeRequest(
      process.env.SEND_DRIVER_INFO_TO_COORDINATORS_WEBHOOK,
      res,
      "Unable to start 'Send Driver Info To Coordinators' Make automation."
    );
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
    const driverLocationInfoTextBlueprintId = 329564;
    const url = `https://us1.make.com/api/v2/scenarios/${driverLocationInfoTextBlueprintId}/blueprint`;
    const data = await makeRequest(
      url,
      res,
      "There was a problem fetching the '[NEW] Send Locations and POC details to volunteer drivers (only text, no email)' text."
    );
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
    checkNodeEnvIsProduction(res);
    await makeRequest(
      process.env.SEND_LOCATIONS_AND_POC_DETAILS_WEBHOOK,
      res,
      "Unable to start '[NEW] Send Locations and POC details to volunteer drivers (only text, no email)' Make automation."
    );
    res.status(OK).json({
      message:
        "'[NEW] Send Locations and POC details to volunteer drivers (only text, no email)' Make automation started.",
    });
  })
);

export default router;
