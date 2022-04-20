import { Injectable, Logger } from '@nestjs/common'

import { Prisma, UserAuthType } from '@prisma/client'

import { DatabaseService } from '../database.service'

import UserAuthCreateManyInput = Prisma.UserAuthCreateManyInput

@Injectable()
export class UserAuthRepository {
    static readonly logger = new Logger(UserAuthRepository.name)

    constructor(private readonly db: DatabaseService) {}

    async findByEmail(email: string) {
        return this.db.userAuth.findFirst({
            where: {
                user: {
                    email: email,
                },
            },
            include: { user: true },
        })
    }

    async findByMobile(mobile: string) {
        return this.db.userAuth.findFirst({
            where: {
                user: {
                    mobile: mobile,
                },
            },
            include: { user: true },
        })
    }

    async findUserByToken(token: string) {
        const auth = await this.db.userAuth.findFirst({
            where: {
                authKey: token,
            },
            include: { user: true },
        })
        if (auth) {
            return auth.user
        }
        return undefined
    }

    async findUserByType(type: UserAuthType) {
        const auth = await this.db.userAuth.findFirst({
            where: {
                type,
            },
            include: { user: true },
        })
        if (auth) {
            return auth.user
        }
        return undefined
    }

    async bindUserTypes(
        userId: number,
        types: UserAuthType[],
        keys: string[],
        raw: object[]
    ) {
        await this.db.userAuth.deleteMany({
            where: {
                userId,
            },
        })
        await this.db.userAuth.createMany({
            data: types.map(
                (type, index) =>
                    ({
                        userId,
                        type,
                        authKey: keys[index],
                        authRaw: raw[index],
                    } as UserAuthCreateManyInput)
            ),
        })
    }

    async findUserByTypes(types: UserAuthType[], keys: string[]) {
        const auth = await this.db.userAuth.findMany({
            where: {
                type: {
                    in: types,
                },
                authKey: {
                    in: keys,
                },
            },
            include: { user: true },
        })

        if (auth.length == 0) {
            return undefined
        }
        if (auth.length == 1) {
            return auth[0].user
        }

        //  if all users are the same user, otherwise throws an exception
        return auth.reduce((acc, curr) => {
            if (acc.id !== curr.user.id) {
                throw new Error(
                    '多用户存在相同互联主键，请联系客服解决此问题。'
                )
            }
            return acc
        }, auth[0].user)
    }
}
