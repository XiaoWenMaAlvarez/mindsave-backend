import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';
import { envs } from './envs.js';
import { Logger } from './logger.plugin.js';
import { withTimeout } from './timeout.helper.js';

type DeletableResourceType = "image" | "video" | "raw";

export interface CloudinaryFileReference {
  fileUrl: string;
  publicId: string;
  resourceType: string;
}

export interface FilesRepositoryServiceOptions {
  checkHealthTimeoutMs?: number;
  uploadTimeoutMs?: number;
  deleteTimeoutMs?: number;
}

cloudinary.config({ 
  cloud_name: envs.CLOUDINARY_CLOUD_NAME, 
  api_key: envs.CLOUDINARY_API_KEY, 
  api_secret: envs.CLOUDINARY_API_SECRET
});

export class FilesRepositoryService {
  
  private checkHealthTimeoutMs: number;
  private uploadTimeoutMs: number;
  private deleteTimeoutMs: number;

  constructor(options: FilesRepositoryServiceOptions = {}) {
    this.checkHealthTimeoutMs = options.checkHealthTimeoutMs ?? 5_000;
    this.uploadTimeoutMs = options.uploadTimeoutMs ?? 30_000;
    this.deleteTimeoutMs = options.deleteTimeoutMs ?? 10_000;
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await withTimeout(
        cloudinary.api.ping(),
        this.checkHealthTimeoutMs,
        "Cloudinary Health Check"
      );
      return response.status === 'ok';
    } catch(e) {
      Logger.error(`Cloudinary Health Error: ${e}`);
      return false;
    }
  }

  // TAMBIÉN ACEPTA DOCUMENTOS, AUDIOS Y VIDEOS
  async uploadImages(files: Express.Multer.File[]): Promise<UploadApiResponse[]> {
    const uploadOperations: Promise<UploadApiResponse>[] = [];

    try {
      for(const file of files) {
        uploadOperations.push(cloudinary.uploader.upload(file.path, {
          timeout: this.uploadTimeoutMs,
        }));
      }

      const publicUrls = await withTimeout(
        Promise.all(uploadOperations),
        this.uploadTimeoutMs,
        "Cloudinary Upload Images"
      );
    
      return publicUrls;
    } catch(error) {
      void this.cleanupSuccessfulUploads(uploadOperations);
      Logger.error("Cloudinary upload failed");
      throw error;
    }
  }  

  private async cleanupSuccessfulUploads(
    uploadOperations: readonly Promise<UploadApiResponse>[],
  ): Promise<void> {
    await Promise.allSettled(
      uploadOperations.map(async uploadOperation => {
        try {
          const uploadedFile = await uploadOperation;
          await this.deleteFile({
            fileUrl: uploadedFile.secure_url,
            publicId: uploadedFile.public_id,
            resourceType: uploadedFile.resource_type,
          });
        } catch {
          // El upload fallido no creó un archivo que eliminar.
        }
      })
    );
  }

  async deleteFile(reference: CloudinaryFileReference): Promise<void> {
    if(!reference.publicId && !reference.fileUrl) return;

    try {
      const { publicId, resourceType } = this.resolveFileReference(reference);
      const response = await withTimeout(
        cloudinary.uploader.destroy(publicId, {
          resource_type: resourceType,
          invalidate: true,
        }),
        this.deleteTimeoutMs,
        "Cloudinary File Deletion"
      ) as { result?: string };

      if(response.result !== "ok" && response.result !== "not found") {
        throw new Error("Unexpected Cloudinary deletion response");
      }
    } catch(error) {
      Logger.error(`Cloudinary file deletion failed: ${error}`);
      throw error;
    }
  }

  private resolveFileReference(reference: CloudinaryFileReference): {
    publicId: string;
    resourceType: DeletableResourceType;
  } {
    if(reference.publicId && this.isDeletableResourceType(reference.resourceType)) {
      return {
        publicId: reference.publicId,
        resourceType: reference.resourceType,
      };
    }

    return this.extractFileReferenceFromUrl(reference.fileUrl);
  }

  private extractFileReferenceFromUrl(fileUrl: string): {
    publicId: string;
    resourceType: DeletableResourceType;
  } {
    const url = new URL(fileUrl);
    const segments = url.pathname.split('/').filter(Boolean);
    const uploadIndex = segments.indexOf("upload");
    const resourceType = segments[uploadIndex - 1];
    if(uploadIndex < 2 || !this.isDeletableResourceType(resourceType)) {
      throw new Error("Invalid Cloudinary file URL");
    }

    const publicIdSegments = segments.slice(uploadIndex + 1);
    if(/^v\d+$/.test(publicIdSegments[0] ?? "")) publicIdSegments.shift();
    if(publicIdSegments.length === 0) throw new Error("Invalid Cloudinary file URL");

    let publicId = publicIdSegments.map(segment => decodeURIComponent(segment)).join('/');
    if(resourceType !== "raw") {
      const extensionIndex = publicId.lastIndexOf('.');
      if(extensionIndex > publicId.lastIndexOf('/')) {
        publicId = publicId.slice(0, extensionIndex);
      }
    }
    if(!publicId) throw new Error("Invalid Cloudinary file URL");

    return { publicId, resourceType };
  }

  private isDeletableResourceType(value: string | undefined): value is DeletableResourceType {
    return value === "image" || value === "video" || value === "raw";
  }

}
