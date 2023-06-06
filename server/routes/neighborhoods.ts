import express from "express";
import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { airtableGET, AIRTABLE_URL_BASE } from "../httpUtils/airtable";
import { protect } from "../middleware/authMiddleware";
//Status codes
import { BAD_REQUEST, OK } from "../httpUtils/statusCodes";
//Types
import { Neighborhood } from "../types";
//Error messages
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

    const neighborhoodsData = await airtableGET<Neighborhood>({ url: url });
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
