import fs from 'fs'
import { z } from 'zod'

const loadEnvFile = (filepath: string) => {
  const content = fs.readFileSync(filepath, 'utf8')
  return content.trim().split(/\r?\n/u).reduce((result: any, elem) => {
    let line = elem.trim()
    if (!line || line.startsWith('#'))
      return result

    // Inline comments; For simple values:
    // key=value # comment
    // For values with a hashtag in them:
    // key="valueWith#" # comment
    // let line = rawLine.split('#')[0].trim()
    const _splitIndex = line.indexOf('=')
    const _key = line.substring(0, _splitIndex).trim()
    const _value = line.substring(_splitIndex + 1).trim()
    if (_value.startsWith('"') && _value.split('"').length === 3)
      line = `${_key}=${_value.split('"')[1]}`
    else
      line = line.split('#')[0]

    const splitIndex = line.indexOf('=')
    const key = line.substring(0, splitIndex).trim()
    const value = line.substring(splitIndex + 1).trim()

    if (!key)
      throw new Error(`Missing key for environment variable in ${filepath}`)

    result[key] = (value.startsWith('\'') && value.endsWith('\'')) ? value.slice(1, -1) : value
    return result
  }, {})
}

const readEnv = (validator: z.ZodObject<any, any>) => {
  const _env = loadEnvFile('.env')
  const _res = validator.safeParse(_env)
  if (!_res.success) {
    _res.error.issues.forEach((issue) => {
      if (issue.code === 'invalid_type') {
        if (issue.expected === 'number')
          _env[issue.path[0]] = Number(_env[issue.path[0]])
        else if (issue.expected === 'boolean')
          _env[issue.path[0]] = _env[issue.path[0]] === 'true'
      }
    })
  }
  const res = validator.safeParse(_env)
  if (!res.success) {
    res.error.issues.forEach((issue) => {
      if (issue.code === 'invalid_type')
        console.error(`ERROR: Environment variable '${issue.path.join('.')}' is not a ${issue.expected}!`)
      process.exit(1)
    })
  }

  return _env
}

// =========== EDIT THIS ===========

const validator = z.object({
  // General
  PROJECT_NAME: z.string(),
  PORT: z.number(),
  HOST_URL: z.string(),
  FAVICON_URL: z.string(),
  API_VERSION: z.string(),
  REGISTRATIONS_ENABLED: z.boolean(),
  GLOBAL_RATE_LIMIT_PER_SECOND: z.number(),
  NOREPLY_EMAIL: z.string().email(),
  // Auth
  JWT_ACCESS_TOKEN_SECRET: z.string(),
  JWT_ACCESS_TOKEN_EXPIRATION_TIME: z.number(),
  JWT_REFRESH_TOKEN_SECRET: z.string(),
  JWT_REFRESH_TOKEN_EXPIRATION_TIME: z.number(),
  // Credentials
  R2_ACCESS_KEY_ID: z.string(),
  R2_SECRET_ACCESS_KEY: z.string(),
  PRISMA_DATABASE_URL: z.string(),
  REDIS_HOST: z.string(),
  REDIS_PORT: z.number(),
  REDIS_PASSWORD: z.string(),
  MAIL_SERVER_HOST: z.string(),
  MAIL_SERVER_PORT: z.number(),
  MAIL_SERVER_SECURE: z.boolean(),
  MAIL_SERVER_USER: z.string(),
  MAIL_SERVER_PASS: z.string()
})

// =========== EDIT THIS ===========

export class Env {
  private static _instance: Env
  private env: z.infer<typeof validator>

  private constructor() {
    this.env = readEnv(validator)
  }

  static get instance(): Env {
    if (!Env._instance)
      Env._instance = new Env()

    return Env._instance
  }

  get<T extends keyof z.infer<typeof validator>>(k: T) {
    return this.env[k]
  }
}