import { Router, Request, Response } from "express";
import { authenticate, authorizeMinRole } from "../middlewares/auth.middleware";
import { UserRole } from "../types/enums";
import analyticsService from "../services/analytics.service";

const router = Router();

/**
 * @route   GET /api/reports/timesheets
 * @desc    Get timesheet reports with filtering (Supervisor+)
 * @access  Private - Supervisor+
 */
router.get("/timesheets", authenticate, authorizeMinRole(UserRole.SUPERVISOR), async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenantId!;
    const { startDate, endDate, userId } = req.query;
    
    const start = startDate ? new Date(startDate as string) : new Date(new Date().getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate as string) : new Date();

    // Use analytics service for comprehensive timesheet analytics
    const analytics = await analyticsService.getTimesheetAnalytics(tenantId, start, end, userId as string);

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error("Timesheet reports error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate timesheet report"
    });
  }
});

/**
 * @route   GET /api/reports/leaves
 * @desc    Get leave reports with filtering (Supervisor+)
 * @access  Private - Supervisor+
 */
router.get("/leaves", authenticate, authorizeMinRole(UserRole.SUPERVISOR), async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenantId!;
    const { startDate, endDate, userId } = req.query;
    
    const start = startDate ? new Date(startDate as string) : new Date(new Date().getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate as string) : new Date();

    // Use analytics service for comprehensive leave analytics
    const analytics = await analyticsService.getLeaveAnalytics(tenantId, start, end, userId as string);

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error("Leave reports error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate leave report"
    });
  }
});

/**
 * @route   GET /api/reports/employees
 * @desc    Get employee analytics reports (HR+)
 * @access  Private - HR+
 */
router.get("/employees", authenticate, authorizeMinRole(UserRole.HR), async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenantId!;

    // Use analytics service for employee analytics
    const analytics = await analyticsService.getEmployeeAnalytics(tenantId);

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error("Employee reports error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate employee report"
    });
  }
});

/**
 * @route   GET /api/reports/documents
 * @desc    Get document analytics reports (HR+)
 * @access  Private - HR+
 */
router.get("/documents", authenticate, authorizeMinRole(UserRole.HR), async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenantId!;
    const { userId } = req.query;

    // Use analytics service for document analytics
    const analytics = await analyticsService.getDocumentAnalytics(tenantId, userId as string);

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error("Document reports error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate document report"
    });
  }
});

/**
 * @route   GET /api/reports/productivity
 * @desc    Get productivity metrics for a user (Supervisor+)
 * @access  Private - Supervisor+
 */
router.get("/productivity", authenticate, authorizeMinRole(UserRole.SUPERVISOR), async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenantId!;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "startDate and endDate are required"
      });
    }

    const metrics = await analyticsService.getProductivityMetrics(
      tenantId,
      new Date(startDate as string),
      new Date(endDate as string)
    );

    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error("Productivity reports error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate productivity report"
    });
  }
});

/**
 * @route   GET /api/reports/attendance
 * @desc    Get attendance reports (Supervisor+)
 * @access  Private - Supervisor+
 * @note    Stub endpoint - attendance tracking not yet implemented
 */
router.get("/attendance", authenticate, authorizeMinRole(UserRole.SUPERVISOR), async (req: Request, res: Response) => {
  try {
    // TODO: Implement attendance tracking and analytics
    res.json({
      success: true,
      data: [],
      message: "Attendance tracking feature coming soon"
    });
  } catch (error) {
    console.error("Attendance reports error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate attendance report"
    });
  }
});

/**
 * @route   GET /api/reports/timesheets/export
 * @desc    Export timesheet reports as CSV or PDF
 * @access  Private - Supervisor+
 */
router.get("/timesheets/export", authenticate, authorizeMinRole(UserRole.SUPERVISOR), async (req: Request, res: Response) => {
  try {
    const { format = 'csv', startDate, endDate, userId } = req.query;
    
    if (format === 'csv') {
      const start = startDate ? new Date(startDate as string) : new Date(new Date().getFullYear(), 0, 1);
      const end = endDate ? new Date(endDate as string) : new Date();
      
      const analytics = await analyticsService.getTimesheetAnalytics(req.user!.tenantId, start, end, userId as string);
      
      // Generate CSV from analytics summary data
      let csv = 'Metric,Value\n';
      csv += `Total Hours,${analytics.totalHours}\n`;
      csv += `Billable Hours,${analytics.billableHours}\n`;
      csv += `Non-Billable Hours,${analytics.nonBillableHours}\n`;
      csv += `Total Entries,${analytics.totalEntries}\n`;
      csv += `Utilization Rate,${analytics.utilizationRate}%\n\n`;
      
      csv += 'Project,Hours\n';
      analytics.byProject.forEach((proj: any) => {
        csv += `${proj.project},${proj.hours}\n`;
      });
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=timesheet-report.csv');
      res.send(csv);
    } else {
      // PDF export - stub for now
      res.status(501).json({
        success: false,
        message: 'PDF export not yet implemented'
      });
    }
  } catch (error) {
    console.error("Timesheet export error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to export timesheet report"
    });
  }
});

/**
 * @route   GET /api/reports/leaves/export
 * @desc    Export leave reports as CSV or PDF
 * @access  Private - Supervisor+
 */
router.get("/leaves/export", authenticate, authorizeMinRole(UserRole.SUPERVISOR), async (req: Request, res: Response) => {
  try {
    const { format = 'csv', startDate, endDate, userId } = req.query;
    
    if (format === 'csv') {
      const start = startDate ? new Date(startDate as string) : new Date(new Date().getFullYear(), 0, 1);
      const end = endDate ? new Date(endDate as string) : new Date();
      
      const analytics = await analyticsService.getLeaveAnalytics(req.user!.tenantId, start, end, userId as string);
      
      // Generate CSV from analytics summary data
      let csv = 'Metric,Value\n';
      csv += `Total Days,${analytics.totalDays}\n`;
      csv += `Total Requests,${analytics.totalRequests}\n`;
      csv += `Approval Rate,${analytics.approvalRate}%\n\n`;
      
      csv += 'Leave Type,Days\n';
      csv += `Sick,${analytics.byType.sick}\n`;
      csv += `Annual,${analytics.byType.annual}\n`;
      csv += `Personal,${analytics.byType.personal}\n`;
      csv += `Unpaid,${analytics.byType.unpaid}\n`;
      csv += `Maternity,${analytics.byType.maternity}\n`;
      csv += `Paternity,${analytics.byType.paternity}\n`;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=leave-report.csv');
      res.send(csv);
    } else {
      // PDF export - stub for now
      res.status(501).json({
        success: false,
        message: 'PDF export not yet implemented'
      });
    }
  } catch (error) {
    console.error("Leave export error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to export leave report"
    });
  }
});

/**
 * @route   GET /api/reports/attendance/export
 * @desc    Export attendance reports as CSV or PDF
 * @access  Private - Supervisor+
 */
router.get("/attendance/export", authenticate, authorizeMinRole(UserRole.SUPERVISOR), async (req: Request, res: Response) => {
  try {
    const { format = 'csv' } = req.query;
    
    if (format === 'csv') {
      // Stub - attendance tracking not implemented yet
      const csv = 'Date,Employee,Status\n';
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=attendance-report.csv');
      res.send(csv);
    } else {
      res.status(501).json({
        success: false,
        message: 'PDF export not yet implemented'
      });
    }
  } catch (error) {
    console.error("Attendance export error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to export attendance report"
    });
  }
});

export default router;

