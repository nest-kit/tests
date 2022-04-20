import { SessionService } from './session.service'
import { SessionModel, SessionValue } from './session.type'

export async function initSessionManager(
    sessionService: SessionService,
    sessionId?: string,
    deviceId?: string
) {
    return new Promise<SessionManager>((resolve, reject) => {
        try {
            new SessionManager(
                sessionService,
                sessionId,
                deviceId,
                (session) => {
                    resolve(session)
                }
            )
        } catch (e) {
            reject(new Error('创建 Session 失败'))
        }
    })
}

export class SessionManager {
    data: SessionModel = { data: undefined, sessionId: undefined }
    private change = false

    constructor(
        private sessionService: SessionService,
        private sessionId?: string,
        private deviceId?: string,
        onLoad?: (SessionManager) => void
    ) {
        if (sessionId) {
            this._load().then(() => {
                if (onLoad) {
                    onLoad(this)
                }
            })
        } else {
            this._create().then(() => {
                if (onLoad) {
                    onLoad(this)
                }
            })
        }
    }

    async _load() {
        return (this.data = await this.sessionService.getSession(
            this.sessionId
        ))
    }

    async _create() {
        return (this.data = await this.sessionService.createSession(
            this.deviceId
        ))
    }

    async update() {
        if (this.change) {
            await this.sessionService.updateSession(
                this.sessionId,
                this.data.data
            )
        }
    }

    id() {
        return this.data.sessionId
    }

    all() {
        return this.data.data
    }

    set(key: string, value: SessionValue) {
        this.change = true
        this.data.data[key] = value
    }

    get(key: string) {
        return this.data.data[key]
    }

    del(key: string) {
        this.change = true
        delete this.data.data[key]
    }
}
