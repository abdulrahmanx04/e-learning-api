import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { AuthRequest } from "../all-interfaces/all-interfaces";


@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const requiredRoles= this.reflector.getAllAndOverride<string[]>('roles',[context.getHandler(),context.getClass()])

        const request= context.switchToHttp().getRequest<AuthRequest>()

        return requiredRoles.includes(request.user?.role)

    }
}