import { Request, Response } from "express";
export const getEvents = (req: Request, res: Response) => {
  const events = [{ name: "My event", date: "today" }];
  res.status(200).json(events);
};
