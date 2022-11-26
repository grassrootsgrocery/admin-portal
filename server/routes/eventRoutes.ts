import express from "express";
import { Request, Response } from "express";

const router = express.Router();

/**
 * @description Get all upcoming events.
 * @route  GET /api/events/
 * @access
 */
router.route("/api/events").get((req: Request, res: Response) => {
  const events = [{ name: "My event", date: "today" }];
  res.status(200).json(events);
});

export default router;
