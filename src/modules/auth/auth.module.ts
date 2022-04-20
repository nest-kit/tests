import { Global, Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { PassportModule } from '@nestjs/passport'

import { AuthService } from './auth.service'
import { RelaxedGuard } from './guard/relaxed.guard'
import { STRATEGIES } from './strategy'

@Global()
@Module({
    imports: [PassportModule],
    providers: [
        AuthService,
        ...STRATEGIES,
        {
            provide: APP_GUARD,
            useClass: RelaxedGuard,
        },
    ],
    exports: [AuthService],
})
export class AuthModule {}
