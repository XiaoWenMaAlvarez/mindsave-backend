import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';
import { envs } from './envs.js';
import { Logger } from './logger.plugin.js';

cloudinary.config({ 
  cloud_name: envs.CLOUDINARY_CLOUD_NAME, 
  api_key: envs.CLOUDINARY_API_KEY, 
  api_secret: envs.CLOUDINARY_API_SECRET
});

export class FilesRepositoryService {
  
  async checkHealth(): Promise<boolean> {
    try {
      const response = await cloudinary.api.ping();
      return response.status === 'ok';
    } catch(e) {
      Logger.error(`Cloudinary Health Error: ${e}`);
      return false;
    }
  }

  // TAMBIÉN ACEPTA DOCUMENTOS, AUDIOS Y VIDEOS
  async uploadImages(files: Express.Multer.File[]): Promise<UploadApiResponse[]> {
    try {
      const publicUrls = await Promise.all(
        files.map((file) => {
          const response = cloudinary.uploader.upload(file.path)
          return response
        })
      );
    
      return publicUrls;
    } catch(e) {
      Logger.error(`Cloudinary Upload Error: ${e}`);
      return [];
    }
  }  

}
