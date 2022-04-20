import { Inject, Injectable } from '@nestjs/common'

import {
    CosDriver,
    CosDriverOptions,
    LocalDriver,
    LocalStorageOptions,
    OssDriver,
    OssDriverOptions,
} from './driver'
import {
    DiskExistsException,
    DiskNotExistsException,
    DriverExistsException,
    DriverNotExistsException,
} from './exception'
import { StorageDriver, StorageDriverConstructor } from './storage.driver'

export declare type StorageDiskOption =
    | { driver: 'local'; config: LocalStorageOptions }
    | { driver: 'oss'; config: OssDriverOptions }
    | { driver: 'cos'; config: CosDriverOptions }
    | { driver: string; config: unknown }

export interface StorageManagerOptions {
    default: string
    disks: StorageDiskOption[]
}

export const StorageOptionsToken = 'STORAGE_OPTIONS_TOKEN'

@Injectable()
export class StorageService {
    private default: string

    private disksConfigs: StorageDiskOption[]

    private disks = new Map<string, StorageDriver>()

    private drivers = new Map<string, StorageDriverConstructor>()

    constructor(
        @Inject(StorageOptionsToken)
        private readonly options: StorageManagerOptions
    ) {
        this.default = options.default
        this.disksConfigs = options.disks
        this.initDrivers()
    }

    initDrivers() {
        this.registerDriver('local', LocalDriver)
        this.registerDriver('oss', OssDriver)
        this.registerDriver('cos', CosDriver)
    }

    registerDriver(name: string, driver: StorageDriverConstructor) {
        if (this.drivers.has(name)) {
            throw new DriverExistsException()
        }
        this.drivers.set(name, driver)
    }

    getDriver<T extends StorageDriver = StorageDriver>(
        name: string
    ): StorageDriverConstructor<T> {
        if (!this.drivers.has(name)) {
            throw new DriverNotExistsException()
        }
        return this.drivers.get(name) as StorageDriverConstructor<T>
    }

    getDisk<T extends StorageDriver = StorageDriver>(name: string): T {
        if (!this.disks.has(name)) {
            const config = this.disksConfigs.find((i) => i.driver == name)
            if (!config) {
                throw new DiskNotExistsException()
            }
            const driver = this.getDriver(config.driver)
            const disk = new driver(config.config)
            this.disks.set(name, disk)
        }
        return this.disks.get(name) as T
    }

    getDisks(): Map<string, StorageDriver> {
        return this.disks
    }

    getDrivers(): Map<string, StorageDriverConstructor> {
        return this.drivers
    }

    addDisk(name: string, disk: unknown) {
        const config = this.disksConfigs.find((i) => i.driver == name)
        if (config) {
            throw new DiskExistsException()
        }
        this.disksConfigs.push({
            driver: name,
            config: disk,
        })
    }
}
