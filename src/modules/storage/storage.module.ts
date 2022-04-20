import { DynamicModule, Global, Module } from '@nestjs/common'

import {
    StorageManagerOptions,
    StorageOptionsToken,
    StorageService,
} from './storage.service'

@Global()
@Module({ providers: [StorageService], exports: [StorageService] })
export class StorageModule {
    static forRoot(options: StorageManagerOptions): DynamicModule {
        return {
            global: true,
            module: StorageModule,
            providers: [
                {
                    provide: StorageOptionsToken,
                    useValue: options,
                },
            ],
        }
    }
}
