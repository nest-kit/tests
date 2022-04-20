export class AuthUserNotFoundException extends Error {
    constructor() {
        super('没有此用户')
        this.name = 'AuthUserNotFoundException'
    }
}
