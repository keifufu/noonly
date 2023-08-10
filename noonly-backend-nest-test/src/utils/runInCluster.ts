import * as cluster from 'cluster'
import * as os from 'os'

export function runInCluster(
	bootstrap: () => Promise<void>
) {
	const numberOfCores = os.cpus().length

	if ((cluster as any).isMaster) {
		for (let i = 0; i < numberOfCores; i++)
			(cluster as any).fork()
	} else {
		bootstrap()
	}
}