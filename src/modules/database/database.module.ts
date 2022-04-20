import { Global, Logger, Module } from '@nestjs/common'

import { DatabaseService } from './database.service'
import { REPOSITORIES } from './repository'

@Global()
@Module({
    providers: [DatabaseService, ...REPOSITORIES],
    exports: [DatabaseService, ...REPOSITORIES],
})
export class DatabaseModule {
    static readonly logger = new Logger(DatabaseModule.name)
}
