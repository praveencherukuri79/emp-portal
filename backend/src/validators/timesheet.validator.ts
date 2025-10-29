import { body, param, query, ValidationChain } from "express-validator";
import { TimesheetStatus } from "../types/enums";

export class TimesheetValidator {
  static createTimesheet(): ValidationChain[] {
    return [
      body("date")
        .isISO8601()
        .withMessage("Valid date is required")
        .custom((value) => {
          const date = new Date(value);
          const now = new Date();
          if (date > now) {
            throw new Error("Cannot create timesheet for future dates");
          }
          return true;
        }),
      body("hours")
        .isFloat({ min: 0.5, max: 24 })
        .withMessage("Hours must be between 0.5 and 24"),
      body("projectName")
        .trim()
        .notEmpty()
        .withMessage("Project name is required")
        .isLength({ max: 200 })
        .withMessage("Project name too long"),
      body("description")
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage("Description too long"),
      body("taskType")
        .optional()
        .isIn(["Development", "Testing", "Meeting", "Documentation", "Support", "Training", "Other"])
        .withMessage("Invalid task type"),
    ];
  }

  static updateTimesheet(): ValidationChain[] {
    return [
      param("id")
        .isMongoId()
        .withMessage("Invalid timesheet ID"),
      body("hours")
        .optional()
        .isFloat({ min: 0.5, max: 24 })
        .withMessage("Hours must be between 0.5 and 24"),
      body("projectName")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Project name cannot be empty")
        .isLength({ max: 200 })
        .withMessage("Project name too long"),
      body("description")
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage("Description too long"),
      body("status")
        .optional()
        .isIn(Object.values(TimesheetStatus))
        .withMessage("Invalid status"),
    ];
  }

  static getTimesheetById(): ValidationChain[] {
    return [
      param("id")
        .isMongoId()
        .withMessage("Invalid timesheet ID"),
    ];
  }

  static approveRejectTimesheet(): ValidationChain[] {
    return [
      param("id")
        .isMongoId()
        .withMessage("Invalid timesheet ID"),
      body("comments")
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage("Comments too long"),
    ];
  }

  static getTimesheetsByDateRange(): ValidationChain[] {
    return [
      query("startDate")
        .optional()
        .isISO8601()
        .withMessage("Invalid start date format"),
      query("endDate")
        .optional()
        .isISO8601()
        .withMessage("Invalid end date format")
        .custom((value, { req }) => {
          if (req.query.startDate && value) {
            const start = new Date(req.query.startDate as string);
            const end = new Date(value);
            if (end < start) {
              throw new Error("End date must be after start date");
            }
          }
          return true;
        }),
      query("userId")
        .optional()
        .isMongoId()
        .withMessage("Invalid user ID"),
      query("status")
        .optional()
        .isIn(Object.values(TimesheetStatus))
        .withMessage("Invalid status"),
    ];
  }
}
