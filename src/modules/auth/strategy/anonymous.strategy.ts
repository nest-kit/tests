import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'

import { Strategy } from 'passport'

class ParentAnonymousStrategy extends Strategy {
    constructor() {
        super()
        this.name = 'anonymous'
    }

    authenticate(): any {
        this.pass()
    }
}

@Injectable()
export class AnonymousStrategy extends PassportStrategy(
    ParentAnonymousStrategy,
    'anonymous'
) {
    async validate(): Promise<any> {
        return void 0
    }
}
