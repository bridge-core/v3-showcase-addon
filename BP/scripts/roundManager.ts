import { world, system, Vector3, Entity, Dimension, TicksPerSecond } from '@minecraft/server'
import { RoomManager } from './roomManager'
import { place } from './systems/generationSystem'
import { randomInt, randomNumber } from './util/math'
import { add, distanceBetween } from './util/vector'

const DEBUG: boolean = true

export class RoundManager {
	private static state: 'lobby' | 'loading' | 'game' = 'lobby'
	private static dimension: Dimension | null = null
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
		this.trackedEntities = []

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
		const waveDifficulty = this.wave * world.getPlayers().length
		const spawnPoints = this.buildSpawnPoints()

		let spawnPointQueue = [...spawnPoints]

		for (let i = 0; i < waveDifficulty; i++) {
			if (spawnPointQueue.length === 0) {
				spawnPointQueue = [...spawnPoints]
			}

			const index = Math.floor(Math.random() * spawnPointQueue.length)
			const spawnPoint = spawnPointQueue[index]
			spawnPointQueue.splice(index, 1)

			const spawnPos: Vector3 = {
				x: spawnPoint.x + 0.5 + randomNumber(-0.5, 0.5),
				y: spawnPoint.y,
				z: spawnPoint.z + 0.5 + randomNumber(-0.5, 0.5)
			}

			const delayTicks = randomInt(10, 40) * i

			system.runTimeout(() => {
				if (this.state !== 'game') return

				const entity = this.dimension.spawnEntity('minecraft:zombie', spawnPos)

				this.emitMonsterSpawnEffects(spawnPos, entity.getAABB().extent)
				this.dimension.playSound('trial_spawner.spawn_mob', spawnPos)

				this.trackedEntities.push(entity.id)
			}, delayTicks)
		}

		this.wave++
	}

	private static emitMonsterSpawnEffects(origin: Vector3, size: Vector3): void {
		const amount = 5 * Math.floor(size.x + size.y + size.z)
		const radius = add(size, {
			x: 0.1,
			y: 0.1,
			z: 0.1
		})

		for (let i = 0; i < amount; i++) {
			const emitPos = add(origin, {
				x: randomNumber(-radius.x, radius.x),
				y: randomNumber(0, radius.y * 2),
				z: randomNumber(-radius.z, radius.z)
			})

			this.dimension.spawnParticle('minecraft:blue_flame_particle', emitPos)
		}
	}

	private static buildSpawnPoints(): Set<Vector3> {
		const spawnPoints: Set<Vector3> = new Set()

		for (const player of world.getPlayers()) {
			const sortedSpawnPoints = [...this.spawnPoints].sort((pointA, pointB) => {
				const distanceA = distanceBetween(player.location, pointA)
				const distanceB = distanceBetween(player.location, pointB)

				return distanceA - distanceB
			})

			const selectionCount = Math.min(3, sortedSpawnPoints.length)

			for (let i = 0; i < selectionCount; i++) {
				spawnPoints.add(sortedSpawnPoints[i])
			}
		}

		return spawnPoints
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
