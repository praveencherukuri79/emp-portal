import { body, param, query, ValidationChain } from "express-validator";
import { LeaveStatus, LeaveType } from "../types/enums";

export class LeaveValidator {
  static createLeave(): ValidationChain[] {
    return [
      body("leaveType")
        .isIn(Object.values(LeaveType))
        .withMessage("Invalid leave type"),
      body("startDate")
        .isISO8601()
        .withMessage("Valid start date is required")
        .custom((value) => {
          const start = new Date(value);
          const now = new Date();
          now.setHours(0, 0, 0, 0);
          if (start < now) {
            throw new Error("Start date cannot be in the past");
          }
          return true;
        }),
      body("endDate")
        .isISO8601()
        .withMessage("Valid end date is required")
        .custom((value, { req }) => {
          const start = new Date(req.body.startDate);
          const end = new Date(value);
          if (end < start) {
            throw new Error("End date must be after or equal to start date");
          }
          return true;
        }),
      body("reason")
        .trim()
        .notEmpty()
        .withMessage("Reason is required")
        .isLength({ min: 10, max: 500 })
        .withMessage("Reason must be between 10 and 500 characters"),
      body("halfDay")
        .optional()
        .isBoolean()
        .withMessage("Half day must be a boolean"),
    ];
  }

  static updateLeave(): ValidationChain[] {
    return [
      param("id")
        .isMongoId()
        .withMessage("Invalid leave ID"),
      body("leaveType")
        .optional()
        .isIn(Object.values(LeaveType))
        .withMessage("Invalid leave type"),
      body("startDate")
        .optional()
        .isISO8601()
        .withMessage("Invalid start date format"),
      body("endDate")
        .optional()
        .isISO8601()
        .withMessage("Invalid end date format"),
      body("reason")
        .optional()
        .trim()
        .isLength({ min: 10, max: 500 })
        .withMessage("Reason must be between 10 and 500 characters"),
    ];
  }

  static approveRejectLeave(): ValidationChain[] {
    return [
      param("id")
        .isMongoId()
        .withMessage("Invalid leave ID"),
      body("comments")
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage("Comments too long"),
    ];
  }

  static getLeaveById(): ValidationChain[] {
    return [
      param("id")
        .isMongoId()
        .withMessage("Invalid leave ID"),
    ];
  }

  static getLeavesByDateRange(): ValidationChain[] {
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
        .isIn(Object.values(LeaveStatus))
        .withMessage("Invalid status"),
      query("leaveType")
        .optional()
        .isIn(Object.values(LeaveType))
        .withMessage("Invalid leave type"),
    ];
  }

  static getLeaveBalance(): ValidationChain[] {
    return [
      query("userId")
        .optional()
        .isMongoId()
        .withMessage("Invalid user ID"),
    ];
  }
}
