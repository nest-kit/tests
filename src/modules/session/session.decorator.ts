import { createParamDecorator, ExecutionContext } from '@nestjs/common'

import { Request } from 'express'

export const Session = createParamDecorator(
    (data: string | undefined, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest() as Request
        return data ? request.session.get(data) : request.session
    }
)
