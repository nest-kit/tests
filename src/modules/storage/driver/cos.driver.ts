import COS from 'cos-nodejs-sdk-v5'
import fse from 'fs-extra'
import { get } from 'lodash'

import {
    FileNotFoundException,
    FilePermissionException,
    FileUnknownException,
} from '../exception'
import {
    ContentResponse,
    DeleteResponse,
    ExistsResponse,
    FileListResponse,
    FileResponse,
    StatResponse,
    StorageDriver,
} from '../storage.driver'

export interface CosDriverOptions extends COS.COSOptions {
    bucket: string
    region: string
}

function handleError(err: COS.CosSdkError, location: string): Error {
    if (err.message.includes('NoSuchKey')) {
        return new FileNotFoundException(err, location)
    } else if (err.message.includes('AccessDenied')) {
        return new FilePermissionException(err, location)
    } else {
        return new FileUnknownException(err, location)
    }
}

export class CosDriver extends StorageDriver {
    private readonly client: COS

    constructor(public options: CosDriverOptions) {
        super()
        this.client = new COS(options)
    }

    getCommonOptions() {
        return { Bucket: this.options.bucket, Region: this.options.region }
    }

    driver(): COS {
        return this.client
    }

    async copy(src: string, dest: string): Promise<FileResponse> {
        try {
            const result = await this.client.putObjectCopy({
                ...this.getCommonOptions(),
                Key: dest,
                CopySource: `/${this.options.bucket}/${src}`,
            })
            return {
                raw: result,
            }
        } catch (e) {
            throw handleError(e, `${src} -> ${dest}`)
        }
    }

    async delete(location: string): Promise<DeleteResponse> {
        try {
            const result = await this.client.deleteObject({
                ...this.getCommonOptions(),
                Key: location,
            })
            return {
                raw: result,
                wasDeleted: true,
            }
        } catch (e) {
            const err = handleError(e, location)
            if (err instanceof FileNotFoundException) {
                return {
                    raw: err,
                    wasDeleted: false,
                }
            }
            throw err
        }
    }

    async exists(location: string): Promise<ExistsResponse> {
        try {
            console.log({
                ...this.getCommonOptions(),
                Key: location,
            })
            const result = await this.client.headObject({
                ...this.getCommonOptions(),
                Key: location,
            })
            return {
                raw: result,
                exists: true,
            }
        } catch (e) {
            console.log('eee', e)
            const err = handleError(e, location)
            if (err instanceof FileNotFoundException) {
                return {
                    raw: err,
                    exists: false,
                }
            }
            throw err
        }
    }

    async get(
        location: string,
        encoding?: BufferEncoding
    ): Promise<ContentResponse<string>> {
        try {
            const result = await this.client.getObject({
                ...this.getCommonOptions(),
                Key: location,
            })
            return {
                raw: result,
                content: result.Body.toString(encoding ?? 'utf8'),
            }
        } catch (e) {
            throw handleError(e, location)
        }
    }

    async lists(location: string): Promise<FileListResponse> {
        try {
            const result = await this.client.getBucket({
                ...this.getCommonOptions(),
                Prefix: location,
                Delimiter: '/',
            })

            return {
                raw: result,
                list: result.Contents.map(({ Key }) => {
                    return {
                        path: Key,
                        type: 'file',
                    }
                }),
            }
        } catch (e) {
            throw handleError(e, location)
        }
    }

    async getBuffer(location: string): Promise<ContentResponse<Buffer>> {
        try {
            const result = await this.client.getObject({
                ...this.getCommonOptions(),
                Key: location,
            })
            return {
                raw: result,
                content: result.Body,
            }
        } catch (e) {
            throw handleError(e, location)
        }
    }

    async getStat(location: string): Promise<StatResponse> {
        try {
            const result = await this.client.headObject({
                ...this.getCommonOptions(),
                Key: location,
            })
            return {
                raw: result,
                size: get(result.headers, 'content-length', 0),
                modified: get(result.headers, 'last-modified'),
            }
        } catch (e) {
            throw handleError(e, location)
        }
    }

    async getStream(location: string): Promise<NodeJS.ReadableStream> {
        try {
            const result = await this.client.getObject({
                ...this.getCommonOptions(),
                Key: location,
            })
            return fse.createReadStream(result.Body)
        } catch (e) {
            throw handleError(e, location)
        }
    }

    getUrl(
        location: string,
        options?: DeepPartial<COS.GetObjectUrlParams>
    ): Promise<string> {
        return new Promise((resolve, reject) => {
            this.client.getObjectUrl(
                Object.assign(
                    {
                        ...this.getCommonOptions(),
                        Key: location,
                    },
                    options
                ),
                (err, url) => {
                    if (err) {
                        reject(handleError(err, location))
                    } else {
                        resolve(url.Url)
                    }
                }
            )
        })
    }

    async move(src: string, dest: string): Promise<FileResponse> {
        try {
            const putObjectCopyResult = await this.client.putObjectCopy({
                ...this.getCommonOptions(),
                Key: dest,
                CopySource: `/${this.options.bucket}/${src}`,
            })
            const deleteObjectResult = await this.client.deleteObject({
                Bucket: this.options.bucket,
                Region: this.options.region,
                Key: src,
            })
            return {
                raw: [putObjectCopyResult, deleteObjectResult],
            }
        } catch (e) {
            throw handleError(e, src)
        }
    }

    async put(
        location: string,
        content: Buffer | NodeJS.ReadableStream | string
    ): Promise<FileResponse> {
        try {
            const result = await this.client.putObject({
                ...this.getCommonOptions(),
                Key: location,
                Body: content,
            })
            return {
                raw: result,
            }
        } catch (e) {
            throw handleError(e, location)
        }
    }
}
