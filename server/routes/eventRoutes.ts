import express from "express";

const router = express.Router();

import { getEvents } from "../controllers/eventController";

// /api/events
router.route("/").get(getEvents);

export default router;
