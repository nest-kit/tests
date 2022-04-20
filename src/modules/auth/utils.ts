import * as bcrypt from 'bcrypt'

const saltOrRounds = 10

export function hash_password(password: string) {
    return bcrypt.hashSync(password, saltOrRounds)
}

export function verify_password(password: string, hash: string) {
    return bcrypt.compareSync(password, hash)
}
