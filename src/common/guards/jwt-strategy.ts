import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserData } from "../all-interfaces/all-interfaces";


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy,'jwt') {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT! ,
            ignoreExpiration: false 
        })
    }
    async validate(payload: any){
        return {id: payload.id, role: payload.role} as UserData
    }

}