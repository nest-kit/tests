import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'

import { Strategy } from 'passport'

@Injectable()
export class AnonymousStrategy extends PassportStrategy(Strategy, 'anonymous') {
    async validate(): Promise<any> {
        this.pass()
    }
}
