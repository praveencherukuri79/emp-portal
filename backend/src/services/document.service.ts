/**
 * Document Service
 * Business logic for document management operations
 */

import mongoose from 'mongoose';
import Document from '../models/document.model';
import Notification from '../models/notification.model';
import fs from 'fs';
import path from 'path';

class DocumentService {
  /**
   * Get all documents for a user
   */
  async getUserDocuments(userId: string, tenantId: string, filters?: any) {
    const query: any = { userId, tenantId };

    if (filters?.category) {
      query.category = filters.category;
    }

    if (filters?.signatureStatus) {
      query.signatureStatus = filters.signatureStatus;
    }

    return Document.find(query).sort({ createdAt: -1 }).exec();
  }

  /**
   * Get single document by ID
   */
  async getDocumentById(id: string, tenantId: string) {
    return Document.findOne({ _id: id, tenantId })
      .populate('userId', 'firstName lastName email')
      .populate('uploadedBy', 'firstName lastName')
      .exec();
  }

  /**
   * Upload new document
   */
  async uploadDocument(data: any, file: any, userId: string, tenantId: string) {
    const document = await Document.create({
      originalName: data.name || file.originalname,
      category: data.category,
      description: data.description,
      filePath: file.path,
      fileName: file.filename,
      size: file.size,
      mimeType: file.mimetype,
      userId,
      uploadedBy: userId,
      tenantId,
      isSignatureRequired: data.isSignatureRequired || false,
      signatureStatus: data.isSignatureRequired ? 'pending' : undefined
    });

    // Create notification for HR/Admin
    await this.createNotificationForApprovers(
      tenantId,
      'New Document Uploaded',
      `${data.category} document has been uploaded for review`
    );

    return document;
  }

  /**
   * Update document metadata
   */
  async updateDocument(id: string, data: any, userId: string, tenantId: string) {
    const document = await Document.findOne({ _id: id, userId, tenantId });

    if (!document) {
      throw new Error('Document not found');
    }

    if (document.signatureStatus === 'signed') {
      throw new Error('Cannot update signed documents');
    }

    Object.assign(document, {
      originalName: data.name,
      description: data.description,
      category: data.category
    });

    await document.save();
    return document;
  }

  /**
   * Delete document
   */
  async deleteDocument(id: string, userId: string, tenantId: string) {
    const document = await Document.findOne({ _id: id, userId, tenantId });

    if (!document) {
      throw new Error('Document not found');
    }

    // Delete physical file
    try {
      if (fs.existsSync(document.filePath)) {
        fs.unlinkSync(document.filePath);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }

    await document.deleteOne();
    return { message: 'Document deleted successfully' };
  }

  /**
   * Sign document (approve)
   */
  async signDocument(id: string, userId: string, tenantId: string, signatureData?: string) {
    const document = await Document.findOne({ _id: id, tenantId });

    if (!document) {
      throw new Error('Document not found');
    }

    if (!document.isSignatureRequired) {
      throw new Error('Document does not require signature');
    }

    if (document.signatureStatus !== 'pending') {
      throw new Error('Document not pending signature');
    }

    document.signatureStatus = 'signed';
    document.signedBy = new mongoose.Types.ObjectId(userId) as any;
    document.signedAt = new Date();
    if (signatureData) {
      document.signatureData = signatureData;
    }
    await document.save();

    // Create notification for document owner
    await Notification.create({
      userId: document.userId,
      tenantId,
      type: 'success',
      category: 'document',
      title: 'Document Signed',
      message: `Your ${document.category} document has been signed`,
      link: `/documents/${id}`
    });

    return document;
  }

  /**
   * Decline document signature
   */
  async declineDocument(id: string, userId: string, tenantId: string, reason: string) {
    const document = await Document.findOne({ _id: id, tenantId });

    if (!document) {
      throw new Error('Document not found');
    }

    if (document.signatureStatus !== 'pending') {
      throw new Error('Document not pending signature');
    }

    document.signatureStatus = 'declined';
    await document.save();

    // Create notification for document owner
    await Notification.create({
      userId: document.userId,
      tenantId,
      type: 'warning',
      category: 'document',
      title: 'Document Signature Declined',
      message: `Your ${document.category} document signature was declined: ${reason}`,
      link: `/documents/${id}`
    });

    return document;
  }

  /**
   * Get pending signatures for HR/Admin
   */
  async getPendingSignatures(tenantId: string) {
    return Document.find({
      tenantId,
      signatureStatus: 'pending'
    })
      .populate('userId', 'firstName lastName email')
      .populate('uploadedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Download document
   */
  async downloadDocument(id: string, tenantId: string) {
    const document = await Document.findOne({ _id: id, tenantId });

    if (!document) {
      throw new Error('Document not found');
    }

    if (!fs.existsSync(document.filePath)) {
      throw new Error('File not found on server');
    }

    return {
      path: document.filePath,
      name: document.fileName,
      mimeType: document.mimeType
    };
  }

  /**
   * Get document statistics
   */
  async getDocumentStats(tenantId: string, userId?: string) {
    const query: any = { tenantId };
    if (userId) {
      query.userId = userId;
    }

    const stats = await Document.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalDocuments: { $sum: 1 },
          totalSize: { $sum: '$size' },
          byCategory: {
            $push: {
              category: '$category',
              count: 1
            }
          },
          bySignatureStatus: {
            $push: {
              status: '$signatureStatus',
              count: 1
            }
          }
        }
      }
    ]);

    return stats[0] || {
      totalDocuments: 0,
      totalSize: 0,
      byCategory: [],
      bySignatureStatus: []
    };
  }

  /**
   * Create notification for approvers (HR/Admin)
   */
  private async createNotificationForApprovers(
    tenantId: string,
    title: string,
    message: string
  ) {
    // This would query for HR/Admin users and create notifications
    // For now, simplified version
    return;
  }
}

export default new DocumentService();
