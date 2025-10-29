import { body, param, ValidationChain } from "express-validator";

export class DocumentValidator {
  static uploadDocument(): ValidationChain[] {
    return [
      body("title")
        .trim()
        .notEmpty()
        .withMessage("Title is required")
        .isLength({ max: 200 })
        .withMessage("Title too long"),
      body("documentType")
        .isIn(["Contract", "Policy", "Agreement", "Certificate", "Report", "Other"])
        .withMessage("Invalid document type"),
      body("description")
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage("Description too long"),
      body("requiresSignature")
        .optional()
        .isBoolean()
        .withMessage("Requires signature must be a boolean"),
      body("assignedTo")
        .optional()
        .isMongoId()
        .withMessage("Invalid user ID for assignment"),
    ];
  }

  static updateDocument(): ValidationChain[] {
    return [
      param("id")
        .isMongoId()
        .withMessage("Invalid document ID"),
      body("title")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Title cannot be empty")
        .isLength({ max: 200 })
        .withMessage("Title too long"),
      body("description")
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage("Description too long"),
      body("status")
        .optional()
        .isIn(["Pending", "Signed", "Declined", "Expired"])
        .withMessage("Invalid status"),
    ];
  }

  static signDocument(): ValidationChain[] {
    return [
      param("id")
        .isMongoId()
        .withMessage("Invalid document ID"),
      body("signatureData")
        .optional()
        .isString()
        .withMessage("Signature data must be a string"),
    ];
  }

  static declineDocument(): ValidationChain[] {
    return [
      param("id")
        .isMongoId()
        .withMessage("Invalid document ID"),
      body("reason")
        .trim()
        .notEmpty()
        .withMessage("Decline reason is required")
        .isLength({ min: 10, max: 500 })
        .withMessage("Reason must be between 10 and 500 characters"),
    ];
  }

  static getDocumentById(): ValidationChain[] {
    return [
      param("id")
        .isMongoId()
        .withMessage("Invalid document ID"),
    ];
  }
}
