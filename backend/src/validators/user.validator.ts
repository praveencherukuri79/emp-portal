import { body, param, query, ValidationChain } from "express-validator";
import { UserRole } from "../types/enums";

export class UserValidator {
  static createUser(): ValidationChain[] {
    return [
      body("email")
        .isEmail()
        .withMessage("Valid email is required")
        .normalizeEmail(),
      body("password")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage("Password must contain uppercase, lowercase, and number"),
      body("firstName")
        .trim()
        .notEmpty()
        .withMessage("First name is required")
        .isLength({ max: 50 })
        .withMessage("First name too long"),
      body("lastName")
        .trim()
        .notEmpty()
        .withMessage("Last name is required")
        .isLength({ max: 50 })
        .withMessage("Last name too long"),
      body("role")
        .isIn(Object.values(UserRole))
        .withMessage("Invalid role"),
      body("tenantId")
        .isMongoId()
        .withMessage("Invalid tenant ID"),
      body("employeeInfo.department")
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage("Department name too long"),
      body("employeeInfo.position")
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage("Position name too long"),
      body("employeeInfo.hireDate")
        .optional()
        .isISO8601()
        .withMessage("Invalid hire date format"),
    ];
  }

  static updateUser(): ValidationChain[] {
    return [
      param("id")
        .isMongoId()
        .withMessage("Invalid user ID"),
      body("email")
        .optional()
        .isEmail()
        .withMessage("Valid email is required")
        .normalizeEmail(),
      body("firstName")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("First name cannot be empty")
        .isLength({ max: 50 })
        .withMessage("First name too long"),
      body("lastName")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Last name cannot be empty")
        .isLength({ max: 50 })
        .withMessage("Last name too long"),
      body("role")
        .optional()
        .isIn(Object.values(UserRole))
        .withMessage("Invalid role"),
      body("employeeInfo.department")
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage("Department name too long"),
      body("employeeInfo.position")
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage("Position name too long"),
    ];
  }

  static changePassword(): ValidationChain[] {
    return [
      param("id")
        .isMongoId()
        .withMessage("Invalid user ID"),
      body("currentPassword")
        .notEmpty()
        .withMessage("Current password is required"),
      body("newPassword")
        .isLength({ min: 8 })
        .withMessage("New password must be at least 8 characters")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage("Password must contain uppercase, lowercase, and number")
        .custom((value, { req }) => {
          if (value === req.body.currentPassword) {
            throw new Error("New password must be different from current password");
          }
          return true;
        }),
    ];
  }

  static searchUsers(): ValidationChain[] {
    return [
      param("query")
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage("Search query must be between 2 and 100 characters"),
    ];
  }

  static getUserById(): ValidationChain[] {
    return [
      param("id")
        .isMongoId()
        .withMessage("Invalid user ID"),
    ];
  }

  static paginationQuery(): ValidationChain[] {
    return [
      query("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Page must be a positive integer"),
      query("limit")
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage("Limit must be between 1 and 100"),
    ];
  }
}
