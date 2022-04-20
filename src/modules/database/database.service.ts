import {
    INestApplication,
    Injectable,
    Logger,
    OnModuleInit,
} from '@nestjs/common'

import { PrismaClient } from '@prisma/client'

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit {
    static readonly logger = new Logger(DatabaseService.name)

    async onModuleInit() {
        await this.$connect()
    }

    async enableShutdownHooks(app: INestApplication) {
        this.$on('beforeExit', async () => {
            await app.close()
        })
    }
}
