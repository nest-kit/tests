import { Injectable, Logger } from '@nestjs/common'

import { get } from 'lodash'
import { customAlphabet } from 'nanoid'

import { DatabaseService } from '../database.service'

const alphabet = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 8)

@Injectable()
export class UserRepository {
    static readonly logger = new Logger(UserRepository.name)

    constructor(private readonly db: DatabaseService) {}

    genUserName() {
        return alphabet()
    }

    getUserByIdentity(identity: string) {
        if (identity.includes('@')) {
            return this.db.user.findFirst({
                where: { email: identity },
            })
        } else {
            return this.db.user.findFirst({
                where: { mobile: identity },
            })
        }
    }

    createUserBySocial(raw: object) {
        let nickname = get<Record<string, string>, string, string>(
            raw as never,
            'nickname',
            this.genUserName()
        )
        nickname = get(raw, 'data.nickname', nickname)
        nickname = get(raw, 'username', nickname)
        nickname = get(raw, 'data.username', nickname)

        return this.db.user.create({
            data: {
                nickname,
            },
        })
    }

    createUser(identity: string) {
        return this.db.user.create({
            data: {
                nickname: this.genUserName(),
                [identity.includes('@') ? 'email' : 'mobile']: identity,
            },
        })
    }

    getUserById(id: string) {
        return this.db.user.findFirst({
            where: { id: Number(id) },
        })
    }
}
