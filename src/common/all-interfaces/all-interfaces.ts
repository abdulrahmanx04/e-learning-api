import { Courses } from "src/courses/entities/course.entity"


export interface UserData {
    id: string,
    role: string
}

export interface AuthRequest {
    user : UserData
}


export interface UserProfileResponse {
    id: string
    name: string
    email: string
    role: string
    isActive: boolean
    avatar?: string | null
    courses?: Pick<Courses, 'id' | 'title' | 'description'>[] | null
}

export interface MaterialsUpload {
    url: string
    fileName: string
    publicId: string
    size: number
}

