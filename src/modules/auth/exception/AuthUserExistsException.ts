export class AuthUserExistsException extends Error {
    constructor() {
        super('用户已存在')
        this.name = 'AuthUserExistsException'
    }
}
