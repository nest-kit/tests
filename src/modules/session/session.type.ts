export declare type SessionValue = string | number | boolean | undefined

export interface SessionData {
    deviceId: string
    userId?: string

    [key: string]: SessionValue
}

export interface SessionModel {
    data: SessionData
    sessionId: string
}
