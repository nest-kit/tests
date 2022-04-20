import { AnonymousStrategy } from './anonymous.strategy'
import { LocalStrategy } from './local.strategy'
import { SessionStrategy } from './session.strategy'

export const STRATEGIES = [LocalStrategy, SessionStrategy, AnonymousStrategy]
