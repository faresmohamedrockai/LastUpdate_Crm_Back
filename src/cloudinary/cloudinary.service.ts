import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import toStream = require('buffer-to-stream');

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});
@Injectable()
export class CloudinaryService {
  uploadImageFromBase64(base64: string): Promise<string> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        base64,
        { folder: 'inventory' },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('No result returned from Cloudinary'));
          resolve(result.secure_url);
        },
      );
    });
  }
}
