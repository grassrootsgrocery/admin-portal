//Types
import express, {Request, Response} from "express";
import asyncHandler from "express-async-handler";
import {adminProtect, protect} from "../middleware/authMiddleware";
import {fetch} from "../httpUtils/nodeFetch";
//Status codes
import {INTERNAL_SERVER_ERROR, OK} from "../httpUtils/statusCodes";
import {AIRTABLE_URL_BASE, airtableGET} from "../httpUtils/airtable";
import {TextAutomation} from "../types";
import {logger} from "../loggerUtils/logger";

import {Twilio} from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = new Twilio(accountSid, authToken);

//Utils
const sendTextWebhook = async (url: string, phoneNumber: string) => {
  const body = JSON.stringify({
    target: {
      data: {
        text: "Override",
      },
    },
    conversation: {
      recipient: {
        handle: phoneNumber,
      },
    },
  });

  return await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
  });
};

async function makeRequest(
  url: string | undefined,
  res: Response,
  onErrorMessage: string
): Promise<any> {
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

function getTextBody(obj: any): string {
  const blueprint = obj.response.blueprint;

  const name = blueprint.name;
  const notes = blueprint.metadata.designer.notes;

  if (!notes) {
    return name;
  }

  return (
    notes.find((note: { text: string }) =>
      note.text.startsWith("(Grassroots Grocery)")
    )?.text || name
  );
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
    logger.info("GET /api/messaging/coordinator-recruitment-text");

    const coordinatorRecruitmentTextBlueprintId = 1138389;
    const url = `https://us1.make.com/api/v2/scenarios/${coordinatorRecruitmentTextBlueprintId}/blueprint`;
    const data = await makeRequest(
      url,
      res,
      "There was a problem fetching the 'Send Coordinator Recruitment Text (Wed afternoon)' text."
    );

    res.status(OK).json(getTextBody(data));
  })
);

/**
 * @description Start the "Send Coordinator Recruitment Text (Wed afternoon)" Make automation
 * @route  POST /api/messaging/coordinator-recruitment-text
 * @access
 */
router.route("/api/messaging/coordinator-recruitment-text").post(
  adminProtect,
  asyncHandler(async (req: Request, res: Response) => {
    checkNodeEnvIsProduction(res);

    logger.info("[POST] /api/messaging/coordinator-recruitment-text");

    const resp = await sendTextWebhook(
      process.env.COORDINATOR_RECRUITMENT_TEXT_WEBHOOK!,
      res.locals.user["Twilio Number"]
    );

    const respText = await resp.text();

    const message = resp.ok
      ? "'Send Coordinator Recruitment Text (Wed afternoon)' Make automation started."
      : respText;

    resp.ok ? logger.info(message) : logger.error(respText);

    res.status(resp.ok ? OK : INTERNAL_SERVER_ERROR).json({
      message,
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
    logger.info("GET /api/messaging/volunteer-recruitment-text");

    const volunteerRecruitmentTextBlueprintId = 1134857;
    const url = `https://us1.make.com/api/v2/scenarios/${volunteerRecruitmentTextBlueprintId}/blueprint`;
    const data = await makeRequest(
      url,
      res,
      "There was a problem fetching the 'Send Tuesday recruitment texts' text."
    );
    res.status(OK).json(getTextBody(data));
  })
);

/**
 * @description Start the "Send Tuesday recruitment texts" Make automation
 * @route  POST /api/messaging/volunteer-recruitment-text
 * @access
 */
router.route("/api/messaging/volunteer-recruitment-text").post(
  adminProtect,
  asyncHandler(async (req: Request, res: Response) => {
    checkNodeEnvIsProduction(res);

    logger.info("[POST] /api/messaging/volunteer-recruitment-text");

    const resp = await sendTextWebhook(
      process.env.TUESDAY_RECRUITMENT_TEXT_WEBHOOK!,
      res.locals["user"]!["Twilio Number"]
    );

    const respText = await resp.text();

    const message = resp.ok
      ? "'Send Tuesday recruitment texts' Make automation started."
      : respText;

    resp.ok ? logger.info(message) : logger.error(respText);

    res.status(resp.ok ? OK : INTERNAL_SERVER_ERROR).json({
      message,
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
    logger.info("GET /api/messaging/driver-info-to-coordinators-text");

    const driverInfoToCoordinatorsTextBlueprintId = 1140162;
    const url = `https://us1.make.com/api/v2/scenarios/${driverInfoToCoordinatorsTextBlueprintId}/blueprint`;
    const data = await makeRequest(
      url,
      res,
      "There was a problem fetching the 'Send Driver Info To Coordinators' text."
    );
    //Grab message body
    res.status(OK).json(getTextBody(data));
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

    logger.info("POST /api/messaging/driver-info-to-coordinators-text");

    const resp = await sendTextWebhook(
      process.env.SEND_DRIVER_INFO_TO_COORDINATORS_WEBHOOK!,
      res.locals.user["Twilio Number"]
    );

    const respText = await resp.text();

    const message = resp.ok
      ? "'Send Driver Info To Coordinators' Make automation started."
      : respText;

    resp.ok ? logger.info(message) : logger.error(respText);

    res.status(resp.ok ? OK : INTERNAL_SERVER_ERROR).json({
      message: message,
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
    logger.info("GET /api/messaging/locations-to-drivers-text");

    const driverLocationInfoTextBlueprintId = 329564;
    const url = `https://us1.make.com/api/v2/scenarios/${driverLocationInfoTextBlueprintId}/blueprint`;
    const data = await makeRequest(
      url,
      res,
      "There was a problem fetching the '[NEW] Send Locations and POC details to volunteer drivers (only text, no email)' text."
    );
    res.status(OK).json(getTextBody(data));
  })
);

/**
 * @description Start the "[NEW] Send Locations and POC details to volunteer drivers (only text, no email)" Make automation
 * @route  POST /api/messaging/locations-to-drivers-text
 * @access
 */
router.route("/api/messaging/locations-to-drivers-text").post(
  adminProtect,
  asyncHandler(async (req: Request, res: Response) => {
    checkNodeEnvIsProduction(res);

    logger.info("POST /api/messaging/locations-to-drivers-text");

    const resp = await sendTextWebhook(
      process.env.SEND_LOCATIONS_AND_POC_DETAILS_WEBHOOK!,
      res.locals.user["Twilio Number"]
    );

    const respText = await resp.text();

    const message = resp.ok
      ? "'[NEW] Send Locations and POC details to volunteer drivers (only text, no email)' Make automation started."
      : respText;

    resp.ok ? logger.info(message) : logger.error(respText);

    res.status(resp.ok ? OK : INTERNAL_SERVER_ERROR).json({
      message,
    });
  })
);

/**
 * @description Get the last 7 days of messages sent
 * @route  GET /api/messaging/last-texts-sent
 * @access
 */
router.route("/api/messaging/last-texts-sent").get(
  protect,
  asyncHandler(async (req: Request, res: Response) => {
    // get messages sent in last 7 days
    const url =
      `${AIRTABLE_URL_BASE}/Text Automation History` +
      `?filterByFormula=DATETIME_DIFF(NOW(), {Date}, 'days') <= 7`;

    const data = await airtableGET<TextAutomation>({url});

    if (data.kind === "error") {
      res.status(500).json({
        message: data.error,
      });

      return;
    }

    if (data.records.length === 0) {
      res.status(200).json([]);
      return;
    }

    const fields = data.records.map((record) => record.fields);

    // only sends fields of each one
    res.status(200).json(fields);
  })
);

/**
 * @description Gets a text conversation with a specific number.
 * Number must be URL encoded in the query param due to the + country code.
 * @route  GET /api/messaging/get-text-conversation
 * @access Administrators only
 */
router.route("/api/messaging/get-text-conversation").get(
  adminProtect,
  asyncHandler(async (req: Request, res: Response) => {
    const {targetNumber} = req.query;

    logger.info(
      `GET /api/messaging/get-text-conversation=${targetNumber}`
    );

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    const grassrootsNumber = res.locals.user["Twilio Number"] as string;

    const client = new Twilio(accountSid, authToken);

    const sentMessages = client.messages.list({
      from: grassrootsNumber,
      to: targetNumber as string,
      dateSentAfter: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    })

    const receivedMessages = client.messages.list({
      from: targetNumber as string,
      to: grassrootsNumber,
      dateSentAfter: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    });

    const [sent, received] = await Promise.all([sentMessages, receivedMessages]);

    const messages = [...sent, ...received].sort((a, b) => {
      return new Date(a.dateSent).getTime() - new Date(b.dateSent).getTime();
    });

    res.status(200).json(messages);
  })
);

/**
 * @description Send a text message to a specific number.
 * @route  POST /api/messaging/get-text-conversation
 * @access Administrators only
 */
router.route("/api/messaging/send-text-message").post(
  adminProtect,
  asyncHandler(async (req: Request, res: Response) => {
    const {targetNumber, message} = req.body;

    logger.info(
      `POST /api/messaging/get-text-conversation`
    );
    logger.info(`Request body ${req.body}`);



    const grassrootsNumber = res.locals.user["Twilio Number"] as string;


    const sentMessage = await client.messages.create({
      body: message,
      from: grassrootsNumber,
      to: targetNumber,
    });

    res.status(200).json(sentMessage);
  })
);

export default router;
