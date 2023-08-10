import { IoAdapter } from '@nestjs/platform-socket.io'
import { RedisClient } from 'redis'
import { ServerOptions } from 'socket.io'
import { createAdapter } from 'socket.io-redis'

export function getRedisIoAdapter(host: string, port: number): any {
	const pubClient = new RedisClient({ host, port })
	const subClient = pubClient.duplicate()
	const redisAdapter = createAdapter({ pubClient, subClient })

	return class RedisIoAdapter extends IoAdapter {
		createIOServer(port: number, options?: ServerOptions): any {
			const server = super.createIOServer(port, options)
			server.adapter(redisAdapter)
			return server
		}
	}
}