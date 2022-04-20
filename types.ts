import { SessionManager } from './src/modules/session/session.manager'

export {}

declare global {
    type DeepPartial<T> = {
        [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
    }

    interface Array<T> {
        filter<T>(value: BooleanConstructor): NonNullable<T>[]
    }

    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Request {
            session: SessionManager
        }
    }
}
