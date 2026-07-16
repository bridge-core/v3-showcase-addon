import { world, system, Vector3, Entity, Dimension, BlockVolume, ListBlockVolume, Block, BlockDynamicPropertiesComponent } from '@minecraft/server'
import { RoundManager } from './roundManager'

type Room = {
    id: number,
    volume: BlockVolume,
    name: string,
    locked: boolean
}

export class RoomManager {
    public rooms: Room[] = []

    public addRoom(vol: BlockVolume, name: string) {
        const room: Room = {
            id: this.rooms.length,
            volume: vol,
            name: name,
            locked: name == "start" ? false : true
        }

        this.rooms.push(room)

        world.tickingAreaManager.createTickingArea(`survival:${room.id}`, {
            dimension: world.getDimension("overworld"),
            from: vol.from,
            to: vol.to
        })

        system.runTimeout(() => {
            const dataBlocks: ListBlockVolume = world.getDimension("overworld").getBlocks(vol, {
                includeTypes: ["survival:lock", "survival:monster_spawn_point"]
            })

            for (const blockLocation of dataBlocks.getBlockLocationIterator()) {
                const dataBlock: Block = world.getDimension("overworld").getBlock(blockLocation)

                const dynamicProperties: any = dataBlock.getComponent("minecraft:dynamic_properties")

                const structureData = {
                    room_id: room.id
                };

                (dynamicProperties as BlockDynamicPropertiesComponent).set("structureData", JSON.stringify(structureData))
            }

            world.sendMessage(room.name)

            if (name == "start") this.unlockRoom(room.id)
        }, 20)
    }

    public unlockRoom(roomId: number) {
        const room: Room = this.rooms[roomId]

        const lockBlocks: ListBlockVolume = world.getDimension("overworld").getBlocks(room.volume, {
            includeTypes: ["survival:lock"]
        })

        for (const lockLocation of lockBlocks.getBlockLocationIterator()) {
            const clearArea: Vector3 = {
                x: lockLocation.x,
                y: lockLocation.y - 1,
                z: lockLocation.z
            }

            world.getDimension("overworld").fillBlocks(new BlockVolume(lockLocation, clearArea), "minecraft:air")
        }

        const spawnerBlocks: ListBlockVolume = world.getDimension("overworld").getBlocks(room.volume, {
            includeTypes: ["survival:monster_spawn_point"]
        })

        world.sendMessage(`From: ${room.volume.from.x} ${room.volume.from.y} ${room.volume.from.z}, To: ${room.volume.to.x} ${room.volume.to.y} ${room.volume.to.z}`)

        for (const spawnerLocation of spawnerBlocks.getBlockLocationIterator()) {
            world.sendMessage("Registered spawner")
            RoundManager.registerSpawnPoint(spawnerLocation)
        }
    }

    public reset() {
        this.rooms.length = 0
    }
}