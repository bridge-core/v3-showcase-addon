import { world, system, Vector3, Entity, Dimension } from '@minecraft/server'
import { RoomManager } from './roomManager'
import { place } from './systems/generationSystem'
import { getRandomRange } from './util/math'

const DEBUG: boolean = true

export class RoundManager {
	private static state: 'lobby' | 'loading' | 'game' = 'lobby'
	private static dimension: Dimension | null = null
	private static difficulty: number = 1
	private static wave: number = 0
	private static spawnPoints: Set<Vector3> = new Set()
	private static trackedEntities: string[] = []
	private static tickerId: number = 0

	public static roomManager: RoomManager = new RoomManager()

	public static load(location: Vector3, dimension: Dimension) {
		if (this.state !== 'lobby') {
			world.sendMessage(`Attempted to load when in state ${this.state}!`)

			return
		}

		this.state = 'loading'
		this.dimension = dimension

		world.sendMessage(`Loading...`)

		place(location, dimension)
	}

	public static start() {
		if (this.state !== 'loading') {
			world.sendMessage(`Attempted to start when in state ${this.state}!`)

			return
		}

		if (this.spawnPoints.size === 0) {
			world.sendMessage(`Attempted to load with no spawn points added yet!`)

			return
		}

		this.state = 'game'

		this.trackedEntities = []
		this.difficulty = 1
		this.wave = 1
		this.tickerId = system.runInterval(() => this.tick())
		this.incrementWave()

		world.sendMessage(`Starting game...`)
	}

	public static stop() {
		if (this.state !== 'game') {
			world.sendMessage(`Attempted to stop when in state ${this.state}!`)

			return
		}

		this.state = 'lobby'

		system.clearRun(this.tickerId)
	}

	public static registerSpawnPoint(location: Vector3) {
		this.spawnPoints.add(location)
	}

	public static clearSpawnPoint(location: Vector3) {
		for (const point of this.spawnPoints) {
			if (point.x !== location.x) continue
			if (point.y !== location.y) continue
			if (point.z !== location.z) continue

			this.spawnPoints.delete(point)
		}
	}

	private static tick(): void {
		if (DEBUG && system.currentTick % 10 === 0) {
			for (const spawnPoint of this.spawnPoints) {
				this.dimension.spawnParticle('minecraft:blue_flame_particle', spawnPoint)
			}
		}
	}

	private static incrementWave(): void {
		const waveDifficulty = this.difficulty * world.getPlayers().length * this.wave

		let spawnPointQueue = [...this.spawnPoints]

		for (let i = 0; i < waveDifficulty; i++) {
			if (spawnPointQueue.length === 0) {
				spawnPointQueue = [...this.spawnPoints]
			}

			const index = Math.floor(Math.random() * spawnPointQueue.length)
			const spawnPoint = spawnPointQueue[index]
			spawnPointQueue.splice(index, 1)

			const spawnPos: Vector3 = {
				x: spawnPoint.x + 0.5,
				y: spawnPoint.y,
				z: spawnPoint.z + 0.5
			}

			system.runTimeout(() => {
				const entity = this.dimension.spawnEntity('minecraft:zombie', spawnPos)
				this.trackedEntities.push(entity.id)
			}, getRandomRange(5, 40))
		}

		this.difficulty++
	}

	public static onEntityDie(entity: Entity) {
		if (!this.trackedEntities.includes(entity.id)) return

		this.trackedEntities.splice(this.trackedEntities.indexOf(entity.id), 1)

		if (this.trackedEntities.length > 0) return

		world.sendMessage('Round complete!')

		this.incrementWave()
	}
}

world.afterEvents.entityDie.subscribe(event => {
	RoundManager.onEntityDie(event.deadEntity)
})
