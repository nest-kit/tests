import { Logger, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'

import * as compression from 'compression'
import * as cookieParser from 'cookie-parser'

import { AppModule } from './app.module'

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        cors: true,
        bodyParser: true,
    })
    app.enableShutdownHooks()

    // 压缩
    app.use(compression())
    // Cookie 解析
    app.use(cookieParser())
    // 全局验证开启
    app.useGlobalPipes(new ValidationPipe())

    await app.listen(3333)

    Logger.log('服务启动成功 http://localhost:3333', 'Bootstrap')
}

bootstrap()
