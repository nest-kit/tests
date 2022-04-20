export class AuthParamsException extends Error {
    constructor() {
        super('您输入的信息不正常，请重试。')
        this.name = 'AuthParamsException'
    }
}
