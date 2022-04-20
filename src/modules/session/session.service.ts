import { Injectable } from '@nestjs/common'

import Redis from 'ioredis'
import { nanoid } from 'nanoid'

import { RedisService } from '../redis/redis.service'
import { SessionData, SessionModel } from './session.type'

@Injectable()
export class SessionService {
    public static COOKIE_EXPIRES_IN_SECONDS = 1000 * 60 * 60 * 24 * 7
    public static SESSION_EXPIRES_IN_SECONDS = 60 * 60 * 24 * 7
    public readonly dbPrefix: 'token'
    public readonly devicePrefix: 'device'
    public readonly userPrefix: 'user'

    private db: Redis

    constructor(redis: RedisService) {
        this.db = redis.getSessionClient()
    }

    async _getSessionId(_id?: string) {
        const id = _id || nanoid()
        const str = await this.db.get(`${this.dbPrefix}:${id}`)
        if (str) {
            return await this._getSessionId()
        }
        return id
    }

    async createSession(
        _deviceId?: string,
        userId?: number
    ): Promise<SessionModel> {
        const sessionId = await this._getSessionId()
        const deviceId = _deviceId || nanoid()

        const data: SessionData = { deviceId, userId: userId?.toString() }

        // 创建 session
        await this.db.set(
            `${this.dbPrefix}:${sessionId}`,
            JSON.stringify(data),
            'EX',
            SessionService.SESSION_EXPIRES_IN_SECONDS
        )
        // 创建 session 和 device 的关联
        await this.db.set(
            `${this.devicePrefix}:${deviceId}`,
            sessionId,
            'EX',
            SessionService.SESSION_EXPIRES_IN_SECONDS
        )

        // 如果存在用户进行绑定
        if (userId) {
            // 创建用户和 session 的关联
            await this.db.sadd(`${this.userPrefix}:${userId}`, sessionId)
        }

        return {
            data,
            sessionId,
        }
    }

    async updateSession(sessionId: string, data: SessionData) {
        await this.db.set(`${this.dbPrefix}:${sessionId}`, JSON.stringify(data))
    }

    async deleteSession(sessionId: string) {
        const data = await this.db.get(`${this.dbPrefix}:${sessionId}`)
        if (!data) {
            return
        }

        const { deviceId, userId } = JSON.parse(data) as SessionData
        await this.db.del(`${this.dbPrefix}:${sessionId}`)
        await this.db.del(`${this.devicePrefix}:${deviceId}`)
        if (userId) {
            await this.db.srem(`${this.userPrefix}:${userId}`, sessionId)
        }
    }

    async getSession(sessionId: string): Promise<SessionModel> {
        const data = await this.db.get(`${this.dbPrefix}:${sessionId}`)
        if (!data) {
            return
        }
        return {
            data: JSON.parse(data) as SessionData,
            sessionId,
        }
    }

    async getSessions(sessions: string[]): Promise<SessionModel[]> {
        const all = sessions.map((item) => {
            return this.getSession(item)
        })
        return await Promise.all(all)
    }

    async getSessionByDevice(deviceId: string) {
        const sessionId = await this.db.get(`${this.devicePrefix}:${deviceId}`)
        if (!sessionId) {
            return
        }
        return await this.getSession(sessionId)
    }

    async getSessionsByUserId(
        userId: string
    ): Promise<SessionModel[] | undefined> {
        const sessionIds = await this.db.smembers(
            `${this.userPrefix}:${userId}`
        )
        if (!sessionIds.length) {
            return
        }
        return await this.getSessions(sessionIds)
    }
}
