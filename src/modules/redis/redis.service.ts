import { Injectable } from '@nestjs/common'

import Redis, { RedisOptions } from 'ioredis'

@Injectable()
export class RedisService {
    private readonly clients: Record<string, Redis>
    private readonly options: RedisOptions

    constructor() {
        this.options = {
            host: 'localhost',
            port: 6379,
            password: 'root',
        }
        this.clients = {}
    }

    getDefault() {
        return this.createAndGetClient('default', 0)
    }

    getAuthClient() {
        return this.createAndGetClient('auth', 1)
    }

    getSessionClient() {
        return this.createAndGetClient('session', 2)
    }

    getClient(string) {
        return this.clients[string]
    }

    createAndGetClient(string, db = 0) {
        if (!this.clients[string]) {
            this.createClient(string, db)
        }
        return this.getClient(string)
    }

    createClient(string, db = 0) {
        this.clients[string] = new Redis(Object.assign(this.options, { db }))
    }
}
