import { TRPCError } from '@trpc/server'
import { AwsClient } from '../aws4fetch/AwsClient'
import { Env } from '../env'

const r2 = new AwsClient({
  accessKeyId: Env.instance.get('R2_ACCESS_KEY_ID'),
  secretAccessKey: Env.instance.get('R2_SECRET_ACCESS_KEY'),
  service: 's3',
  region: 'auto'
})

/*
 * Frequently accessed files (e.g. images (screenshots especially))
 * will be stored in a public bucket, and will be served directly.
 * This does not include videos.
 *
 * Other files will be stored in a private bucket, and will be served
 * through a signed URL.
 */

export const R2 = {
  _getFileUrl: (r2Key: string, publicBucket = false) => new URL(`https://6afb99023e76f1c695f8fbc936e0f48e.r2.cloudflarestorage.com/${publicBucket ? 'noonly-cloud-public' : 'noonly-cloud-private'}/${r2Key}`).toString(),
  getPublicFileUrl: (file: DriveFile) => `https://newimg.noonly.net/${file.r2_key}`,
  createSignedUploadUrl: async (r2Key: string, contentLength: number, contentType: string, publicBucket: boolean) => {
    const location = R2._getFileUrl(r2Key, publicBucket)

    const signedRequest = await r2.sign(location, {
      method: 'PUT',
      headers: {
        'Content-Length': contentLength.toString(),
        'Content-Type': contentType
      },
      aws: {
        signQuery: true,
        appendSessionToken: true,
        allHeaders: true
      }
    }).catch(() => {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to sign request' })
    })
    if (!signedRequest) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to sign request' })

    return { url: signedRequest.url, method: signedRequest.method, headers: signedRequest.headers }
  },
  createSignedDownloadUrl: async (file: DriveFile) => {
    const location = R2._getFileUrl(file.r2_key, file.r2_inPublicBucket)
    const signedRequest = await r2.sign(location.toString(), {
      method: 'GET',
      headers: {
        // This is in seconds
        // Should be more than long enough for the client to start the download,
        // the download continues as long as it was started before it expires.
        // If we make it unnessesarily long, it could be abused and we get billed tons.
        'X-Amz-Expires': '30'
      },
      aws: {
        signQuery: true,
        appendSessionToken: true,
        allHeaders: true
      }
    }).catch(() => {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to sign request' })
    })
    if (!signedRequest) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to sign request' })

    // method is obviously GET and headers are empty
    // So this is just a URL with a signed query string
    // (we can even use it for video streaming in like a html video tag)
    return signedRequest.url
  },
  copyFile: async (file: DriveFile, newR2Key: string) => {
    const location = R2._getFileUrl(newR2Key, file.r2_inPublicBucket)
    await r2.fetch(location.toString(), {
      method: 'PUT',
      headers: {
        'x-amz-copy-source': `/${file.r2_inPublicBucket ? 'noonly-cloud-public' : 'noonly-cloud-private'}/${file.r2_key}`
      }
    }).catch(() => {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to copy file' })
    })
  },
  deleteFile: async (r2Key: string, inPublicBucket: boolean) => {
    const location = R2._getFileUrl(r2Key, inPublicBucket)
    await r2.fetch(location.toString(), { method: 'DELETE' }).catch(() => {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to delete file' })
    })
  },
  /*
   * Retries to delete a file until it succeeds using a exponential backoff strategy
   */
  retryDeleteFile: (r2Key: string, inPublicBucket: boolean, retries = 0) => {
    const location = R2._getFileUrl(r2Key, inPublicBucket)
    r2.fetch(location.toString(), { method: 'DELETE' }).catch(() => {
      setTimeout(() => R2.retryDeleteFile(r2Key, inPublicBucket, retries + 1), 1000 * (2 ** retries))
    })
  },
  shouldUsePublicBucket: (filename: string) => {
    const extension = filename.split('.').pop()
    return imageExtensions.includes(extension as string)
  }
}