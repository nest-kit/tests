import { Injectable } from '@nestjs/common'

import { User, UserAuthType } from '@prisma/client'
import Redis from 'ioredis'

import { UserAuthRepository } from '../database/repository/user-auth.repository'
import { UserRepository } from '../database/repository/user.repository'
import { RedisService } from '../redis/redis.service'
import { SessionManager } from '../session/session.manager'
import { SessionService } from '../session/session.service'
import { AuthParamsException } from './exception/AuthParamsException'
import { AuthUserExistsException } from './exception/AuthUserExistsException'
import { AuthUserNotFoundException } from './exception/AuthUserNotFoundException'
import { hash_password, verify_password } from './utils'

@Injectable()
export class AuthService {
    private db: Redis

    constructor(
        private readonly userAuthRepository: UserAuthRepository,
        private readonly userRepository: UserRepository,
        private readonly sessionService: SessionService,
        private readonly redisService: RedisService
    ) {
        this.db = redisService.getAuthClient()
    }

    async basicAuthRegister(identity: string, password: string) {
        const hasUser = await this.userRepository.getUserByIdentity(identity)
        if (!hasUser) {
            const user = await this.userRepository.createUser(identity)
            await this.userAuthRepository.bindUserTypes(
                user.id,
                [UserAuthType.PASSWORD],
                [hash_password(password)],
                [undefined]
            )
            return user
        }
        throw new AuthUserExistsException()
    }

    async basicAuth(identity: string, password: string) {
        const userAuth = identity.includes('@')
            ? await this.userAuthRepository.findByEmail(identity)
            : await this.userAuthRepository.findByMobile(identity)

        if (userAuth) {
            if (verify_password(password, userAuth.authKey)) {
                return userAuth.user
            }
            throw new AuthParamsException()
        }

        throw new AuthUserNotFoundException()
    }

    async socialAuth(type: UserAuthType[], identity: string[], raw: object) {
        let user = await this.userAuthRepository.findUserByTypes(type, identity)
        if (!user) {
            user = await this.userRepository.createUserBySocial(raw)
            await this.userAuthRepository.bindUserTypes(
                user.id,
                type,
                identity,
                type.map(() => raw)
            )
        }

        return user
    }

    async login(session: SessionManager, user: User, deviceId?: string) {
        session.set('userId', user.id)
        session.set('deviceId', deviceId)
    }

    async findUserById(id: string) {
        return this.userRepository.getUserById(id)
    }
}
