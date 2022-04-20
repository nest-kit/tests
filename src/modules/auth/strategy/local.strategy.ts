import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'

import { Request } from 'express'
import { Strategy } from 'passport-local'

import { AuthService } from '../auth.service'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super({ usernameField: 'identity', passReqToCallback: true })
        this.name = 'local'
    }

    async validate(
        request: Request,
        identity: string,
        password: string
    ): Promise<any> {
        const user = await this.authService.basicAuth(identity, password)
        if (!user) {
            throw new UnauthorizedException()
        }
        await this.authService.login(request.session, user)
        return user
    }
}
