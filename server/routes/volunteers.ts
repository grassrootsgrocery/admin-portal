import express from "express";
import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import {
  airtableGET,
  airtablePATCH,
  AIRTABLE_URL_BASE,
} from "../httpUtils/airtable";
import { adminProtect, protect } from "../middleware/authMiddleware";
//Status codes
import {
  BAD_REQUEST,
  INTERNAL_SERVER_ERROR,
  OK,
} from "../httpUtils/statusCodes";
//Types
import {
  AirtableResponse,
  Driver,
  ProcessedDriver,
  AirtableRecord,
  ScheduledSlot,
  ProcessedScheduledSlot,
} from "../types";
//Error messages
//Logger
import { logger } from "../loggerUtils/logger";

const router = express.Router();

function processScheduledSlots(
  scheduledSlots: AirtableRecord<ScheduledSlot>[]
): ProcessedScheduledSlot[] {
  function getParticipantType(type: string[] | undefined) {
    if (!type) {
      return "";
    }
    //Replace the word "Distributor" with "Packer"
    const typeCopy = [...type];
    for (let i = 0; i < typeCopy.length; i++) {
      typeCopy[i] = typeCopy[i].replace("Distributor", "Packer");
    }
    typeCopy.sort();
    let typeLabel = typeCopy[0];
    if (typeCopy.length === 2) {
      typeLabel += " & " + typeCopy[1];
    }
    return typeLabel;
  }

  function getTimeSlot(timeslot: string) {
    const optionsTime = {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
      timeZone: "America/New_York",
    } as const;
    return new Date(timeslot).toLocaleString("en-US", optionsTime);
  }

  const volunteerList: ProcessedScheduledSlot[] = [];

  for (const ss of scheduledSlots) {
    const participantType = getParticipantType(ss.fields["Type"]);
    const timeSlot =
      ss.fields["Correct slot time"] && !ss.fields["Correct slot time"]["error"]
        ? getTimeSlot(ss.fields["Correct slot time"])
        : "Error!";

    const volunteer: ProcessedScheduledSlot = {
      id: ss.id,
      firstName: ss.fields["First Name"] ? ss.fields["First Name"][0] : "",
      lastName: ss.fields["Last Name"] ? ss.fields["Last Name"][0] : "",
      confirmed: ss.fields["Confirmed?"] || false,
      cantCome: ss.fields["Can't Come"] || false,
      timeSlot: timeSlot,
      participantType: participantType,
      volunteerStatus: ss.fields["Volunteer Status"]
        ? ss.fields["Volunteer Status"][0]
        : "",
      email: ss.fields["Email"] ? ss.fields["Email"][0] : "None",
      phoneNumber: ss.fields["Phone Formula"] || "None",
      specialGroup: ss.fields["Volunteer Group (for MAKE)"] || null,
    };

    const isDriver = participantType.includes("Driver");
    if (isDriver) {
      volunteer.totalDeliveries = ss.fields["Total Deliveries"];
    }
    volunteerList.push(volunteer);
  }

  return volunteerList;
}

/**
 * @description Get all volunteers who match the ids in the query param
 * @route  GET /api/volunteers/
 * @access
 */
router.route("/api/volunteers/").get(
  protect,
  asyncHandler(async (req: Request, res: Response) => {
    const { scheduledSlotsIds } = req.query;
    logger.info(`GET /api/volunteers/?scheduledSlotsIds=${scheduledSlotsIds}`);

    const isValidRequest =
      scheduledSlotsIds !== undefined && typeof scheduledSlotsIds === "string";
    if (!isValidRequest) {
      res.status(BAD_REQUEST);
      throw new Error(
        "Please provide a 'scheduledSlotsIds' as a query param of type 'string'."
      );
    }

    const url =
      `${AIRTABLE_URL_BASE}/📅 Scheduled Slots?` +
      `filterByFormula=SEARCH(RECORD_ID(), "${scheduledSlotsIds}") != ""` +
      `&fields=First Name` +
      `&fields=Last Name` +
      `&fields=Correct slot time` +
      `&fields=Type` +
      `&fields=Phone Formula` +
      `&fields=Total Deliveries` +
      `&fields=Confirmed?` +
      `&fields=Volunteer Status` +
      `&fields=Can't Come` +
      `&fields=Email` +
      `&fields=Volunteer Group (for MAKE)`;

    const scheduledSlots = await airtableGET<ScheduledSlot>({ url: url });

    if (scheduledSlots.kind === "error") {
      res.status(INTERNAL_SERVER_ERROR).json({
        message: scheduledSlots.error,
      });

      return;
    }

    const volunteers = processScheduledSlots(scheduledSlots.records);

    res.status(OK).json(volunteers);
  })
);

// Utility function to check if the volunteer type has changed
function hasVolunteerTypeChanged(
  originalType: string[],
  newType: string[]
): boolean {
  if (originalType.length !== newType.length) return true;

  return originalType.length === 1 && newType[0] !== originalType[0];
}

/**
 * @description Update a volunteers info
 * @route  PATCH /api/volunteers/update/:volunteerId
 * @access
 */
router.route("/api/volunteers/update/:volunteerId").patch(
  adminProtect,
  asyncHandler(async (req: Request, res: Response) => {
    const { volunteerId } = req.params;
    logger.info(`PATCH /api/volunteers/update/${volunteerId}`);
    logger.info("Request body: ", req.body);

    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      participantType,
    }: {
      firstName: string;
      lastName: string;
      email: string;
      phoneNumber: string;
      participantType: string[];
    } = req.body;

    const stringFields = [firstName, lastName, email, phoneNumber];

    const isValidRequest = stringFields.every((field) => {
      return field.trim().length > 0;
    });

    if (!isValidRequest) {
      logger.error(`Invalid request body: ${JSON.stringify(req.body)}`);

      res.status(BAD_REQUEST).json({
        message: `Please provide a valid 'firstName', 'lastName', 'email', and 'phoneNumber' on the body.`,
      });
    }

    // also verify that the participantType is valid
    const validParticipantTypes = ["Driver", "Packer"];

    const isParticipantTypeValid =
      participantType.length > 0 &&
      participantType.every((type) => validParticipantTypes.includes(type));

    if (!isParticipantTypeValid) {
      res.status(BAD_REQUEST).json({
        message: `Please provide a valid 'participantType' on the body, valid types are ${validParticipantTypes}. 
        Was provided ${participantType}.`,
      });
    }

    // replace all Packer with Distributor the array for airtable
    const airtableParticipantType = participantType.map((type) =>
      type.replace("Packer", "Distributor")
    );

    // get all their original info from scheduled slots
    const originalRecord =
      `${AIRTABLE_URL_BASE}/📅 Scheduled Slots?` +
      `filterByFormula=SEARCH(RECORD_ID(), "${volunteerId}") != ""`;

    // get original info from scheduled slots
    const originalInfo = await airtableGET<{
      "Phone Formula": string;
      "Phone Number": string;
      "🚛 Supplier Pickup Event": string;
      "Logistics Slot": string;
      "Driving Slot": string;
      Type: string[];
    }>({
      url: originalRecord,
    });

    if (originalInfo.kind === "error") {
      res.status(INTERNAL_SERVER_ERROR).json({
        message: originalInfo.error,
      });

      return;
    }

    // check if the volunteerId is valid, that means original info exists
    if (originalInfo.records.length == 0) {
      logger.error(`Could not find a volunteer with the id ${volunteerId}`);

      res.status(BAD_REQUEST).json({
        message: `Could not find a volunteer with the id ${volunteerId}`,
      });

      return;
    }

    // if the phone number changed make sure we don't have a conflict
    const phoneNumberChanged =
      originalInfo.records[0].fields["Phone Formula"] !== phoneNumber;

    if (phoneNumberChanged) {
      // lookup new number and check for conflict
      const lookupNewNumber =
        `${AIRTABLE_URL_BASE}/🙋🏽Volunteers CRM?` +
        `filterByFormula=SEARCH("${phoneNumber}", "Phone Number") != ""`;

      const newNumberFetch = await airtableGET({
        url: lookupNewNumber,
      });

      if (newNumberFetch.kind === "error") {
        res.status(INTERNAL_SERVER_ERROR).json({
          message: newNumberFetch.error,
        });

        return;
      }

      if (newNumberFetch.records.length > 0) {
        logger.error(
          `The phone number ${phoneNumber} is already in use by another volunteer.`
        );

        res.status(BAD_REQUEST).json({
          message: `The phone number ${phoneNumber} is already in use by another volunteer.`,
        });

        return;
      }
    }

    // get actual Volunteer CRM recordId
    const phoneNumberRef = originalInfo.records[0].fields["Phone Number"];

    const lookupVolunteerCRMRecordId =
      `${AIRTABLE_URL_BASE}/🙋🏽Volunteers CRM?` +
      `filterByFormula=SEARCH(RECORD_ID(), "${phoneNumberRef}") != ""`;

    // lookup the volunteer in the crm table
    const volunteerRecordIdFetch = await airtableGET({
      url: lookupVolunteerCRMRecordId,
    });

    if (volunteerRecordIdFetch.kind === "error") {
      res.status(INTERNAL_SERVER_ERROR).json({
        message: volunteerRecordIdFetch.error,
      });

      return;
    }

    if (volunteerRecordIdFetch.records.length == 0) {
      logger.error(
        `Could not find a volunteer with the phone number ${phoneNumber}`
      );

      res.status(BAD_REQUEST).json({
        message: `Could not find a volunteer with the phone number ${phoneNumber}`,
      });

      return;
    }

    const volunteerRecordId = volunteerRecordIdFetch.records[0].id;

    // to update persons info issue patch to the Volunteers CRM table
    const updatePersonInfoBody = {
      records: [
        {
          id: volunteerRecordId,
          fields: {
            "First Name": firstName,
            "Last Name": lastName,
            "Email Address": email,
            "Phone Number": phoneNumber,
          },
        },
      ],
    };

    const contactInfoUpdateResult = await airtablePATCH({
      url: `${AIRTABLE_URL_BASE}/🙋🏽Volunteers CRM`,
      body: updatePersonInfoBody,
    });

    if (contactInfoUpdateResult.kind === "error") {
      res.status(INTERNAL_SERVER_ERROR).json({
        message: contactInfoUpdateResult.error,
      });

      return;
    }

    if (
      !hasVolunteerTypeChanged(
        airtableParticipantType,
        originalInfo.records[0].fields.Type
      )
    ) {
      logger.info(
        `Volunteer ${volunteerId} has not changed their volunteer type.`
      );
      res.status(OK).json({
        message: `Volunteer ${volunteerId} has not changed their volunteer type.`,
      });

      return;
    }

    const supplierPickupEvent =
      originalInfo.records[0].fields["🚛 Supplier Pickup Event"];

    const originalRolesSet = new Set([...originalInfo.records[0].fields.Type]);
    const newRolesSet = new Set(airtableParticipantType);

    const wasBoth =
      originalRolesSet.has("Driver") && originalRolesSet.has("Distributor");
    const isNowBoth =
      newRolesSet.has("Driver") && newRolesSet.has("Distributor");
    const isNewlySingleRole =
      newRolesSet.size === 1 &&
      (newRolesSet.has("Driver") || newRolesSet.has("Distributor"));

    let slotPayload;

    // cases
    // 1. Volunteer had only one role and is now choosing both roles.
    // 2. Volunteer had only one role and is switching to the other single role.
    // 3. Volunteer had both roles and is still keeping both roles.
    // 4. Volunteer had one role and is keeping that same role.
    // 5. Volunteer had both roles and is now choosing only one role.

    // need to do a time check here also
    const driverLookupSlot =
      `${AIRTABLE_URL_BASE}/⏳ Available Slots?` +
      `filterByFormula=AND(` +
      `{Time Slot (readable)}="10:30am",` +
      `{🚛 Supplier Pickup Event Record ID}="${supplierPickupEvent}",` +
      `Type="Driver"
      )`;

    const logisticsLookupSlot =
      `${AIRTABLE_URL_BASE}/⏳ Available Slots?` +
      `filterByFormula=AND(` +
      `{🚛 Supplier Pickup Event Record ID}="${supplierPickupEvent}",` +
      `Type="Distributor"
      )`;

    if (wasBoth) {
      if (isNewlySingleRole) {
        // Scenario 5: They were originally both and now only one.
        let roleToNullify = newRolesSet.has("Driver")
          ? "Driver"
          : "Distributor";

        slotPayload =
          roleToNullify === "Distributor"
            ? { "Driving Slot": null }
            : { "Logistics Slot": null };
      } else if (isNowBoth) {
        // Scenario 3: They were both roles and are still keeping both roles.
        // no need to do anything

        logger.info(
          `Volunteer ${volunteerId} has not changed their volunteer type.`
        );
        res.status(OK).json({
          message: `Volunteer ${volunteerId} has not changed their volunteer type.`,
        });

        return;
      }
    } else {
      if (isNowBoth) {
        // Scenario 1: They had only one role and are now choosing both roles.

        // figure out which role they are adding
        let roleToAdd =
          newRolesSet.has("Driver") && !originalRolesSet.has("Driver")
            ? "Driver"
            : "Distributor";

        // get matching slot, if they are becoming a driver we need to get them into the 10:30 slot,
        // packer only has one slot
        const lookupSlot =
          roleToAdd === "Driver" ? driverLookupSlot : logisticsLookupSlot;

        const slotFetch = await airtableGET({
          url: lookupSlot,
        });

        if (slotFetch.kind === "error") {
          res.status(INTERNAL_SERVER_ERROR).json({
            message: slotFetch.error,
          });

          return;
        }

        if (slotFetch.records.length == 0) {
          logger.error(
            `Could not find a slot for ${supplierPickupEvent} for ${roleToAdd}`
          );
          res.status(BAD_REQUEST).json({
            message: `Could not find a slot for ${supplierPickupEvent} for ${roleToAdd}`,
          });

          return;
        }

        const slotId = slotFetch.records[0].id;

        slotPayload =
          roleToAdd === "Driver"
            ? { "Driving Slot": [slotId] }
            : { "Logistics Slot": [slotId] };
      } else if (
        newRolesSet.has("Driver") &&
        originalRolesSet.has("Distributor")
      ) {
        // Scenario 2: They switched from "Distributor" to "Driver".

        // get the driver slot
        const slotFetch = await airtableGET({
          url: driverLookupSlot,
        });

        if (slotFetch.kind === "error") {
          res.status(INTERNAL_SERVER_ERROR).json({
            message: slotFetch.error,
          });

          return;
        }

        if (slotFetch.records.length == 0) {
          logger.error(
            `Could not find a driving slot for ${supplierPickupEvent}`
          );
          res.status(BAD_REQUEST).json({
            message: `Could not find a driving slot for ${supplierPickupEvent}`,
          });

          return;
        }

        const slotId = slotFetch.records[0].id;

        slotPayload = { "Driving Slot": [slotId], "Logistics Slot": null };
      } else if (
        newRolesSet.has("Distributor") &&
        originalRolesSet.has("Driver")
      ) {
        // Scenario 2: They switched from "Driver" to "Distributor".

        // get the logistics slot
        const slotFetch = await airtableGET({
          url: logisticsLookupSlot,
        });

        if (slotFetch.kind === "error") {
          res.status(INTERNAL_SERVER_ERROR).json({
            message: slotFetch.error,
          });

          return;
        }

        if (slotFetch.records.length == 0) {
          logger.error(
            `Could not find a logistics slot for ${supplierPickupEvent}`
          );
          res.status(BAD_REQUEST).json({
            message: `Could not find a logistics slot for ${supplierPickupEvent}`,
          });

          return;
        }

        const slotId = slotFetch.records[0].id;

        slotPayload = { "Driving Slot": null, "Logistics Slot": [slotId] };
      } else {
        // Scenario 4: They had one role and are keeping that same role.
        // nothing needs to be done

        res.status(OK).json({
          message: `Volunteer ${volunteerId} has not changed their volunteer type.`,
        });

        return;
      }
    }

    // to update volunteer type issue patch to the Scheduled Slots table
    const updateVolunteerTypeBody = {
      records: [
        {
          id: volunteerId,
          fields: {
            Type: airtableParticipantType,
            ...slotPayload,
          },
        },
      ],
    };

    const volunteerTypeUpdateResult = await airtablePATCH({
      url: `${AIRTABLE_URL_BASE}/📅 Scheduled Slots`,
      body: updateVolunteerTypeBody,
    });

    if (volunteerTypeUpdateResult.kind === "error") {
      res.status(INTERNAL_SERVER_ERROR).json({
        message: volunteerTypeUpdateResult.error,
      });

      return;
    }

    res.status(OK).json({
      message: "updated volunteer type",
    });
  })
);

/**
 * @description Confirm a volunteer for an event
 * @route  PATCH /api/volunteers/confirm/:volunteerId
 * @access
 */
router.route("/api/volunteers/confirm/:volunteerId").patch(
  protect,
  asyncHandler(async (req: Request, res: Response) => {
    const { volunteerId } = req.params;
    logger.info(`PATCH /api/volunteers/confirm/${volunteerId}`);
    logger.info("Request body: ", req.body);
    const { newConfirmationStatus } = req.body;

    const isValidRequest =
      volunteerId &&
      typeof volunteerId === "string" &&
      typeof newConfirmationStatus === "boolean";

    if (!isValidRequest) {
      res.status(BAD_REQUEST);
      throw new Error(
        "Please provide a 'volunteerId' as a query param and a 'newConfirmationStatus' on the body."
      );
    }

    const body = {
      records: [
        {
          id: volunteerId,
          fields: { "Confirmed?": newConfirmationStatus },
        },
      ],
    };
    const result = await airtablePATCH({
      url: `${AIRTABLE_URL_BASE}/📅 Scheduled Slots`,
      body: body,
    });
    res.status(OK).json(result);
  })
);

/**
 * @description Update the "Can't Come" status for a volunteer  for a particular event
 * @route  PATCH /api/volunteers/going/:volunteerId
 * @access
 */
router.route("/api/volunteers/going/:volunteerId").patch(
  protect,
  asyncHandler(async (req: Request, res: Response) => {
    const { volunteerId } = req.params;
    const { newGoingStatus } = req.body;
    logger.info(`PATCH /api/volunteers/going/${volunteerId}`);

    const isValidRequest =
      volunteerId &&
      typeof volunteerId === "string" &&
      typeof newGoingStatus === "boolean";

    if (!isValidRequest) {
      res.status(BAD_REQUEST);
      throw new Error(
        "Please provide a 'volunteerId' as a query param and a 'newGoingStatus' on the body."
      );
    }

    const body = {
      records: [
        {
          id: volunteerId,
          fields: { "Can't Come": newGoingStatus },
        },
      ],
    };
    const result = await airtablePATCH({
      url: `${AIRTABLE_URL_BASE}/📅 Scheduled Slots`,
      body: body,
    });
    res.status(OK).json(result);
  })
);

function processDriverData(driver: AirtableRecord<Driver>): ProcessedDriver {
  // TODO: process restricted locations
  const optionsTime = {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
    timeZone: "America/New_York",
  } as const;

  const timeSlot = driver.fields["Driving Slot Time"]
    ? new Date(driver.fields["Driving Slot Time"][0]).toLocaleString(
        "en-US",
        optionsTime
      )
    : "";

  return {
    // validate each data type data, returns N/A for null values
    id: driver.id,
    firstName: driver.fields["First Name"]
      ? driver.fields["First Name"][0]
      : "N/A",
    lastName: driver.fields["Last Name"]
      ? driver.fields["Last Name"][0]
      : "N/A",
    timeSlot: timeSlot, // time slot in HH:MM AM/PM format
    deliveryCount: driver.fields["Total Deliveries"] || 0,
    zipCode: driver.fields["Zip Code"] ? driver.fields["Zip Code"][0] : "N/A",
    vehicle: driver.fields["Transportation Types"]
      ? driver.fields["Transportation Types"][0]
      : "N/A",
    restrictedLocations: driver.fields["Restricted Neighborhoods"]
      ? driver.fields["Restricted Neighborhoods"]
      : [],
    dropoffLocations: driver.fields["📍 Drop off location"] || [],
    phoneNumber: driver.fields["Phone Formula"] || "None",
    email: driver.fields["Email"] ? driver.fields["Email"][0] : "None",
  };
}

/**
 * @description Get all the drivers for an event
 * @route  GET /api/volunteers/drivers
 * @access
 */
router.route("/api/volunteers/drivers").get(
  protect,
  asyncHandler(async (req: Request, res: Response) => {
    logger.info("GET /api/volunteers/drivers");
    const url =
      `${AIRTABLE_URL_BASE}/📅 Scheduled Slots?` +
      `view=Assign Location ` +
      // Get fields for driver info table
      `&fields=First Name` + // First Name
      `&fields=Last Name` + // Last Name
      `&fields=Driving Slot Time` + // Time Slot
      `&fields=Total Deliveries` + // Delivery Type
      `&fields=Zip Code` + // Zip Code
      `&fields=Phone Formula` +
      `&fields=Email` +
      `&fields=Transportation Types` + // Vehicle
      `&fields=Restricted Neighborhoods` + // Restricted Locations
      `&fields=📍 Drop off location`; // Restricted Locations

    const drivers = await airtableGET<Driver>({ url });

    if (drivers.kind === "error") {
      res.status(BAD_REQUEST).json({
        message: drivers.error,
      });

      return;
    }

    let processedDrivers: ProcessedDriver[] = drivers.records.map((driver) =>
      processDriverData(driver)
    );
    processedDrivers.sort((driver1, driver2) =>
      driver1.firstName < driver2.firstName ? -1 : 1
    );

    res.status(OK).json(processedDrivers);
  })
);

/**
 * @description Assign a driver a dropoff location
 * @route  PATCH /api/volunteers/drivers/assign-location/:driverId
 * @access
 */
router.route("/api/volunteers/drivers/assign-location/:driverId").patch(
  protect,
  asyncHandler(async (req: Request, res: Response) => {
    const { driverId } = req.params;
    logger.info("PATCH /api/volunteers/drivers/assign-location/:driverId");
    const { locationIds } = req.body;

    const isValidRequest =
      locationIds && driverId && typeof driverId === "string"; //&& typeof locationIds === "string[]";
    if (!isValidRequest) {
      res.status(BAD_REQUEST);
      throw new Error(
        "Please provide 'driverId' as a query param and locationIds' with type string[] on the request body"
      );
    }
    logger.info(`PATCH /api/volunteers/drivers/assign-location/${driverId}`);

    const body = {
      records: [
        {
          id: driverId,
          fields: { "📍 Drop off location": locationIds },
        },
      ],
    };
    const result = await airtablePATCH({
      url: `${AIRTABLE_URL_BASE}/📅 Scheduled Slots`,
      body: body,
    });
    res.status(OK).json(result);
  })
);
export default router;
