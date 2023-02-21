import express from "express";
import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { AIRTABLE_URL_BASE } from "../httpUtils/airtable";
import { fetch } from "../httpUtils/nodeFetch";
import { protect } from "../middleware/authMiddleware";
//Status codes
import { BAD_REQUEST, OK } from "../httpUtils/statusCodes";
//Types
import { AirtableResponse, Neighborhood } from "../types";
//Error messages
import { AIRTABLE_ERROR_MESSAGE } from "../httpUtils/airtable";
//Logger
import { logger } from "../loggerUtils/logger";

const router = express.Router();

/**
 * @description
 * @route  GET /api/neighborhoods
 * @access
 */
router.route("/api/neighborhoods").get(
  protect,
  asyncHandler(async (req: Request, res: Response) => {
    const { neighborhoodIds } = req.query;
    logger.info(`GET /api/neighborhoods/?neighborhoodIds=${neighborhoodIds}`);

    const isValidRequest =
      neighborhoodIds !== undefined && typeof neighborhoodIds === "string";
    if (!isValidRequest) {
      res.status(BAD_REQUEST);
      throw new Error(
        "Please provide a 'neighborhoodIds' as a query param of type 'string'."
      );
    }

    const url =
      `${AIRTABLE_URL_BASE}/🏡 Neighborhoods?` +
      `filterByFormula=SEARCH(RECORD_ID(), "${neighborhoodIds}") != ""` +
      `&fields%5B%5D=Name`;

    const resp = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
      },
    });
    if (!resp.ok) {
      throw {
        message: AIRTABLE_ERROR_MESSAGE,
        status: resp.status,
      };
    }
    const neighborhoodsData =
      (await resp.json()) as AirtableResponse<Neighborhood>;
    const processedNeighborhoods: Neighborhood[] =
      neighborhoodsData.records.map((neighborhood) => {
        return {
          id: neighborhood.id,
          Name: neighborhood.fields.Name,
        };
      });
    res.status(OK).json(processedNeighborhoods) as Response<Neighborhood>;
  })
);

export default router;
