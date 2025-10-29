import { Router, Request, Response } from "express";
import { authenticate, authorizeMinRole } from "../middlewares/auth.middleware";
import { UserRole } from "../types/enums";
import documentService from "../services/document.service";
import multer from "multer";
import path from "path";

const router = Router();
router.use(authenticate);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "backend/uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx|xls|xlsx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  }
});

router.get("/pending", authorizeMinRole(UserRole.HR), async (req: Request, res: Response) => {
  try {
    const documents = await documentService.getPendingSignatures(req.user!.tenantId);
    res.json(documents);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching pending documents", error: error.message });
  }
});

router.get("/stats", async (req: Request, res: Response) => {
  try {
    const stats = await documentService.getDocumentStats(req.user!.tenantId, req.user!.userId);
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching statistics", error: error.message });
  }
});

router.get("/", async (req: Request, res: Response) => {
  try {
    const documents = await documentService.getUserDocuments(req.user!.userId, req.user!.tenantId, req.query);
    res.json(documents);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching documents", error: error.message });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const document = await documentService.getDocumentById(req.params.id, req.user!.tenantId);
    if (!document) return res.status(404).json({ message: "Document not found" });
    res.json(document);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching document", error: error.message });
  }
});

router.post("/", upload.single("file"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const document = await documentService.uploadDocument(req.body, req.file, req.user!.userId, req.user!.tenantId);
    res.status(201).json(document);
  } catch (error: any) {
    res.status(500).json({ message: "Error uploading document", error: error.message });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  try {
    const document = await documentService.updateDocument(req.params.id, req.body, req.user!.userId, req.user!.tenantId);
    res.json(document);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const result = await documentService.deleteDocument(req.params.id, req.user!.userId, req.user!.tenantId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/:id/download", async (req: Request, res: Response) => {
  try {
    const fileInfo = await documentService.downloadDocument(req.params.id, req.user!.tenantId);
    res.download(fileInfo.path, fileInfo.name);
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
});

router.post("/:id/sign", authorizeMinRole(UserRole.HR), async (req: Request, res: Response) => {
  try {
    const { signatureData } = req.body;
    const document = await documentService.signDocument(req.params.id, req.user!.userId, req.user!.tenantId, signatureData);
    res.json(document);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/:id/decline", authorizeMinRole(UserRole.HR), async (req: Request, res: Response) => {
  try {
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ message: "Decline reason is required" });
    const document = await documentService.declineDocument(req.params.id, req.user!.userId, req.user!.tenantId, reason);
    res.json(document);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
