import { type NextFunction, type Request, type Response } from "express";
import { Logger } from "../../config/logger.plugin.js";
import multer from 'multer';
import { CustomError } from '../../domain/init.js';
import { existsSync } from 'node:fs';
import { unlink } from 'node:fs/promises';

const ALLOWED_MIME_TYPES = [
  // Imágenes
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  // Documentos
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_FILES = 5;

const upload = multer({ 
      dest: 'uploads/',
      limits: {
        fileSize: MAX_FILE_SIZE,
        files: MAX_FILES,
      },
      fileFilter: (_req, file, cb) => {
        if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new CustomError(`Tipo de archivo no permitido: ${file.mimetype}. Solo se permiten imágenes y documentos.`, 400));
        }
      },
    }); 


export class HandleFileMiddleware {

  static handleUploadFiles = (req: Request, res: Response, next: NextFunction) => {
      upload.array('files', MAX_FILES)(req, res, async (err: any) => {
        if (err) {
          if (req.files && Array.isArray(req.files)) {
            await Promise.all(
              req.files.map(async (file: Express.Multer.File) => {
                try {
                  if (file.path && existsSync(file.path)) {
                    await unlink(file.path);
                  }
                } catch (e: any) {
                  if (e.code !== 'ENOENT') {
                    Logger.error(`Error al eliminar archivo temporal tras fallo en upload: ${e}`);
                  }
                }
              })
            );
          }

          if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
              return res.status(400).json({ error: 'El tamaño de uno o más archivos excede el límite permitido de 5MB' });
            }
            if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') {
              return res.status(400).json({ error: `El número de archivos excede el máximo permitido de ${MAX_FILES}` });
            }
            return res.status(400).json({ error: `Error en la subida de archivos: ${err.message}` });
          }

          if (err instanceof CustomError) {
            return res.status(err.statusCode).json({ error: err.message });
          }

          return res.status(400).json({ error: err.message || 'Error al procesar los archivos' });
        }
        next();
      });
    };

}
