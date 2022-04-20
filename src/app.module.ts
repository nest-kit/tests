import { Logger, Module } from '@nestjs/common'

import { AuthModule } from './modules/auth/auth.module'
import { DatabaseModule } from './modules/database/database.module'
import { RedisModule } from './modules/redis/redis.module'
import { SessionModule } from './modules/session/session.module'
import { CosDriverOptions } from './modules/storage/driver'
import { StorageModule } from './modules/storage/storage.module'
import { SystemModule } from './pages/system/system.module'

@Module({
    imports: [
        DatabaseModule,
        SessionModule,
        RedisModule,
        StorageModule.forRoot({
            default: 'cos',
            disks: [
                {
                    driver: 'local',
                    config: {
                        path: './public',
                        urlPrefix: 'https://xxx.xxxxx',
                    },
                },
                {
                    driver: 'cos',
                    config: {
                        bucket: 'xxxx',
                        region: 'ap-xxxx',
                        urlPrefix: 'https://xxxxx.xxxxx',
                        SecretId: 'xxxx',
                        SecretKey: 'xxxxxxx',
                    } as CosDriverOptions,
                },
            ],
        }),
        AuthModule,
        SystemModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {
    static logger = new Logger(AppModule.name)
}
