import { Injectable, NestMiddleware } from '@nestjs/common'

import { Request, Response } from 'express'
import { cloneDeep, get, isArray, isObject } from 'lodash'

import { initSessionManager } from './session.manager'
import { SessionService } from './session.service'

@Injectable()
export class SessionMiddleware implements NestMiddleware<Request, Response> {
    constructor(private readonly sessionService: SessionService) {}

    async use(req: Request, res: Response, next: () => void) {
        if (req.session) {
            next()
        }

        const sessionId = this.parseKeyByRequest(req, 'sessionId')
        const deviceId = this.parseKeyByRequest(req, 'deviceId')

        const sessionData = await initSessionManager(
            this.sessionService,
            sessionId,
            deviceId
        )

        req.session = sessionData

        if (!sessionId) {
            console.log(sessionData)
            res.cookie('sessionId', sessionData.id(), {
                maxAge: 1000 * 60 * 60 * 24 * 7,
                httpOnly: true,
                secure: false,
            })
        }

        res.addListener('finish', async () => {
            await sessionData.update()
        })

        next()
    }

    parseKeyByRequest(req: Request, savedKey: string): string | undefined {
        let key: string | undefined = cloneDeep(req.cookies[savedKey])

        if (!key) {
            const val = req.headers[savedKey]
            if (val) {
                if (isArray(val)) {
                    key = val.join(',')
                } else {
                    key = val
                }
            }
        }

        if (!key) {
            key = get(req, 'query.' + savedKey, undefined)
        }

        if (!key && isObject(req.body)) {
            key = get(req.body, savedKey, undefined)
        }

        return key
    }
}
