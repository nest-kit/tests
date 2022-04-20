import { Injectable, Request, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'

import e from 'express'
import { Strategy } from 'passport-custom'

import { AuthService } from '../auth.service'

@Injectable()
export class SessionStrategy extends PassportStrategy(Strategy, 'session') {
    constructor(private readonly authService: AuthService) {
        super()
    }

    async validate(@Request() request: e.Request): Promise<any> {
        const userId = request.session.get('userId')
        if (!userId) {
            throw new UnauthorizedException()
        }
        return await this.authService.findUserById(String(userId))
    }
}
