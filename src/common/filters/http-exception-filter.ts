import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from "@nestjs/common";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const response= host.switchToHttp().getResponse() as Record<string,any>
        let message= exception.getResponse()
        let status= exception.getStatus() as number

        const errorResponse= typeof message == 'string' ?
        {success: false, message}
        : {success: false, ...message}

        response.status(status).json({
            ...errorResponse,
            statusCode: status,
            timestamp: new Date().toISOString()
        })
       
    }
}