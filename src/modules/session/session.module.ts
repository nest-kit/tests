import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common'

import { SessionMiddleware } from './session.middleware'
import { SessionService } from './session.service'

@Global()
@Module({
    providers: [SessionService],
    exports: [SessionService],
})
export class SessionModule implements NestModule {
    configure(consumer: MiddlewareConsumer): any {
        consumer.apply(SessionMiddleware).forRoutes('*')
    }
}
