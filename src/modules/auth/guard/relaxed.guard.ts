import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class RelaxedGuard extends AuthGuard(['session', 'anonymous']) {}
