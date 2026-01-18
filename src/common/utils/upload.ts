import { UploadApiResponse } from "cloudinary";
import { CloudinaryService } from "../../cloudinary/cloudinary.service";


export async function uploadFiles(cloudinaryService: CloudinaryService,folder: string,
    files?: Express.Multer.File[]
) {
    if(!files?.length) return []
    return await Promise.all(
        files.map(async(file) => {
            const upload= await cloudinaryService.uploadFile(file,folder) as UploadApiResponse
            return {
                url: upload.secure_url,
                fileName: upload.original_filename,
                publicId: upload.public_id,
                size: upload.bytes
            }
        })
    )
}

