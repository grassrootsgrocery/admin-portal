import express from "express";
import asyncHandler from "express-async-handler";
import { protect } from "../middleware/authMiddleware";
import { Request, Response } from "express";
import { AIRTABLE_URL_BASE } from "../httpUtils/airtable";
import { fetch } from "../httpUtils/nodeFetch";
//Status codes
import { BAD_REQUEST, OK } from "../httpUtils/statusCodes";
//Types
import {
  AirtableResponse,
  Record,
  SpecialGroup,
  ProcessedSpecialGroup,
} from "../types";
//Error messages
import { AIRTABLE_ERROR_MESSAGE } from "../httpUtils/airtable";

const router = express.Router();

function processSpecialGroups(
  specialGroup: Record<SpecialGroup>
): ProcessedSpecialGroup {
  return {
    name: specialGroup.fields["Name"] ? specialGroup.fields["Name"] : "N/A",
    events: specialGroup.fields["🚛 Supplier Pickup Events"],
  };
}

/**
 * @description Get all special groups
 * @route  GET /api/specialGroups
 * @access
 */
router.route("/api/special-groups").get(
  protect,
  asyncHandler(async (req: Request, res: Response) => {
    console.log(`GET /api/special-groups`);

    const url =
      `${AIRTABLE_URL_BASE}/👨‍👨‍👧 Volunteer Groups?` +
      `&fields=Name` + // Special Group Name
      `&fields=🚛 Supplier Pickup Events`; // Supplier Pickup Events -> list of events group is registered for

    const resp = await fetch(url, {
      headers: {
        method: "GET",
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
      },
    });
    if (!resp.ok) {
      throw {
        message: AIRTABLE_ERROR_MESSAGE,
        status: resp.status,
      };
    }
    const specialGroups = (await resp.json()) as AirtableResponse<SpecialGroup>;
    let processedSpecialGroups = specialGroups.records.map((specialGroup) =>
      processSpecialGroups(specialGroup)
    );
    res.status(OK).json(processedSpecialGroups) as Response<
      ProcessedSpecialGroup[]
    >;
  })
);

/**
 * @description Create new special group
 * @route  POST /api/add-special-group
 * @access
 */
router.route("/api/add-special-group").post(
  asyncHandler(async (req: Request, res: Response) => {
    console.log(`POST /api/add-special-group`);

    const records = {
      records: [
        {
          fields: req.body,
        },
      ],
    };

    const url = `${AIRTABLE_URL_BASE}/👨‍👨‍👧 Volunteer Groups`;

    const resp = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(records),
    });
    if (!resp.ok) {
      throw {
        message: AIRTABLE_ERROR_MESSAGE,
        status: resp.status,
      };
    }

    const specialGroups = (await resp.json()) as AirtableResponse<SpecialGroup>;
    let processedSpecialGroups = specialGroups.records.map((specialGroup) =>
      processSpecialGroups(specialGroup)
    );
    res.status(OK).json(processedSpecialGroups) as Response<
      ProcessedSpecialGroup[]
    >;
  })
);

/**
 * @description Add group to event
 * @route  PATCH /api/add-group-to-event
 * @access
 */
router.route("/api/add-group-to-event").post(
  asyncHandler(async (req: Request, res: Response) => {
    console.log(`PATCH /api/add-group-to-event`);

    const records = {
      records: [
        {
          fields: req.body,
        },
      ],
    };

    const url = `${AIRTABLE_URL_BASE}/👨‍👨‍👧 Volunteer Groups`;

    const resp = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(records),
    });
    if (!resp.ok) {
      throw {
        message: AIRTABLE_ERROR_MESSAGE,
        status: resp.status,
      };
    }

    const specialGroups = (await resp.json()) as AirtableResponse<SpecialGroup>;
    let processedSpecialGroups = specialGroups.records.map((specialGroup) =>
      processSpecialGroups(specialGroup)
    );
    res.status(OK).json(processedSpecialGroups) as Response<
      ProcessedSpecialGroup[]
    >;
  })
);

export default router;
