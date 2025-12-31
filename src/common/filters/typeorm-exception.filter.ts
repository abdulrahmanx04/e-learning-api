import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from "@nestjs/common";
import { EntityNotFoundError, QueryFailedError, TypeORMError } from "typeorm";


@Catch(TypeORMError)
export class TypeOrmExceptionFilter implements ExceptionFilter {

    private readonly errorTypes= {
        '23505': {
            status: HttpStatus.CONFLICT,
            message: 'Resource already exists',
            error: 'DuplicateEntry'
        },
        '23503': {
            status: HttpStatus.BAD_REQUEST,
            message: 'Resource does not exist',
            error: 'ForeignKeyViolation'
        },
        '23502': {
            status: HttpStatus.BAD_REQUEST,
            message: 'Required field is missing',
            error: 'NotNullViolation'
        },
        '22P02': {
            status: HttpStatus.BAD_REQUEST,
            message: 'Invalid data format',
            error: 'InvalidDataFormat'
        }
    }
    catch(exception: any, host: ArgumentsHost) {
        const response= host.switchToHttp().getResponse() 
        
        let status=HttpStatus.INTERNAL_SERVER_ERROR
        let message= 'Database query error occured'
        let error= 'DatabaseQueryError'

        if(exception instanceof QueryFailedError) {
            const err= exception as QueryFailedError & {code: string}
            const errorType= this.errorTypes[err.code] 
            if(errorType) {
                status= errorType.status
                message= errorType.message
                error= errorType.error
            }
        }else if( exception instanceof EntityNotFoundError) {
            status= HttpStatus.NOT_FOUND
            message= 'Resource not found'
            error= 'Notfound'
        }

        response.status(status).json({
            success: false,
            status,
            message,
            error,
            timestamp: new Date().toISOString()
        })
    }
}