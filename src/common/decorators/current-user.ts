import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { AuthRequest } from "../all-interfaces/all-interfaces";



export const CurrentUser= createParamDecorator(
    (data: any, context: ExecutionContext) => {
        const request= context.switchToHttp().getRequest<AuthRequest>()
        return request.user
    }
)