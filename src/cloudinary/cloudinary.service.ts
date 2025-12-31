import { BadRequestException, Injectable } from '@nestjs/common';
import path from 'path';
import {v2 as cloudinary, UploadApiResponse} from 'cloudinary'
@Injectable()
export class CloudinaryService {
  private allowedExtensions= ['.png', '.jpg' ,'.webp','.jpeg','.pdf','.mp4','.mov']

  private allowedMimeTypes = ['image/jpeg','image/jpg','image/png', 'image/webp', 'video/mp4', 'video/mpeg', 'application/pdf']

  private readonly MAX_IMAGE_SIZE= 5 * 1024 * 1024
  private readonly MAX_DOC_SIZE= 100 * 1024 * 1024


  async uploadFile(file: Express.Multer.File,folder: string): Promise<UploadApiResponse> {
      if(!file) {
        throw new BadRequestException('No file uploaded')
      }
      if(file.size === 0) {
        throw new BadRequestException('File is empty')
      }

      const maxSize= file.mimetype === 'image/pdf' ?
      this.MAX_IMAGE_SIZE
      : this.MAX_DOC_SIZE

      if(file.size > maxSize) {
        throw new BadRequestException(`File size cannot exceed ${maxSize/(1024*1024)}MB`)
      }

      if(!this.allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException(`Invalid file mimetype allowed mimetypes:
          ${this.allowedMimeTypes.join(', ')}`)
      }
      
      const ext= path.extname(file.originalname).toLowerCase()

      if(!this.allowedExtensions.includes(ext)) {
        throw new BadRequestException(`Invalid extension type allowed extensions:
          ${this.allowedExtensions.join(', ')}`)
      }

      const resource_type: 'image' | 'video' | 'raw' = 
        file.mimetype.startsWith('image') 
        ?'image'
        : file.mimetype.startsWith('video') ? 
        'video'
        : 'raw'

      return await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream({folder,resource_type},(error,result) => {
          if(error) return reject(error)
          return resolve(result as UploadApiResponse)
        }).end(file.buffer)
      })
  }

  async deleteFile(public_id: string) {
    const result= await cloudinary.uploader.destroy(public_id)
    if(result.result !== 'ok') {
        throw new BadRequestException('File delete failed')
    }
  }
}
