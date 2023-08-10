import fetch, { Headers } from 'node-fetch'

import fs from 'fs'
import { v4 as uuid } from 'uuid'
import { AwsClient } from './awsClient.js'

const b2 = new AwsClient({
	accessKeyId: '',
	secretAccessKey: '',
	service: 's3'
})

const createSignedUploadURL = async (key, contentLength, contentType, contentEncoding) => {
  const location = new URL(`https://<id>.r2.cloudflarestorage.com/noonly-cloud-private/${key}`)

  if (!contentLength) throw new Error('Missing contentLength.')
  if (!contentLength) throw new Error('Missing contentType.')
  const signHeaders = new Headers()
  signHeaders.set('Content-Length', contentLength)
  signHeaders.set('Content-Type', contentType)
  if (contentEncoding) signHeaders.set('Content-Encoding', contentEncoding)
  
  const signedRequest = await b2.sign(location, {
    method: 'PUT',
    headers: signHeaders,
    aws: {
      signQuery: true,
      appendSessionToken: true,
      allHeaders: true
    }
  }).catch(() => { throw new Error('Failed to sign request.') })
  if (!signedRequest) throw new Error('Failed to sign request.')
 
  const { method, url, headers } = signedRequest
  return { method, url, headers }
}

const createSignedDownloadURL = async (key) => {
  const location = new URL(`https://<id>.r2.cloudflarestorage.com/noonly-cloud-private/${key}`)
  const signedRequest = await b2.sign(location, {
    method: 'GET',
    aws: {
      signQuery: true,
      appendSessionToken: true,
      allHeaders: true
    }
  }).catch(() => { throw new Error('Failed to sign request.') })
  if (!signedRequest) throw new Error('Failed to sign request.')

  const { method, url, headers } = signedRequest
  return { method, url, headers }
}

const deleteKey = async (key) => {
  const location = new URL(`https://<id>.r2.cloudflarestorage.com/noonly/${key}`)
  const signedRequest = await b2.sign(location, {
    method: 'DELETE',
    aws: {
      signQuery: true,
      appendSessionToken: true,
      allHeaders: true
    }
  }).catch(() => { throw new Error('Failed to sign request.') })
  if (!signedRequest) throw new Error('Failed to sign request.')

  const { method, url, headers } = signedRequest
  return { method, url, headers }
}

// Uploads a file to B2, the filename set cannot be changed after the signed url is created
// If the size is bigger than what was specified when creating the signed url, the upload will succeed but the file will be truncated
// to the specified size
const upload = async () => {
  const filename = `my-test-file.zip`
  const size = fs.statSync('./test.zip').size
  const res = await createSignedUploadURL(filename, size, 'application/zip', 'application/x-zip-compressed')
  await fetch(res.url, { method: res.method, body: fs.createReadStream('./test.zip'), headers: res.headers }).then((e) => {
    // console.log(e)
  })
}

// Only necessary for the private bucket.
const filename = 'fcable.mp4'
const download = async () => {
  const res = await createSignedDownloadURL(filename)
  console.log(res.url, res.method, res.headers)
  return
}

const runDelete = async () => {
  const location = new URL(`https://<id>.r2.cloudflarestorage.com/noonly/${filename}`)
  await b2.fetch(location.toString(), {
    method: 'DELETE',
  }).then((res) => console.log(res))
}

const copy = async () => {
  const location = new URL(`https://<id>.r2.cloudflarestorage.com/noonly/test2.zip`)
  await b2.fetch(location.toString(), {
    method: 'PUT',
    headers: {
      'x-amz-copy-source': '/noonly/b33d3e37-f52f-4493-aa0e-3fcdc62f801c.zip'
    }
  }).then((res) => console.log(res))
}

upload()
// download()
// runDelete()
// copy()