import { BlockComponentPlayerInteractEvent, Vector3, system, BlockVolume, EquipmentSlot, BlockDynamicPropertiesComponent, world } from '@minecraft/server'
import { RoundManager } from '../roundManager'
import { decrementItemAtSlot } from '../util/inventory'

system.beforeEvents.startup.subscribe(event => {
    event.blockComponentRegistry.registerCustomComponent('survival:lock', {
        onPlayerInteract: (event) => clearDoor(event)
    })
})

function clearDoor(lockEvent: BlockComponentPlayerInteractEvent) {
    const equippable = lockEvent.player.getComponent('minecraft:equippable')

    const mainhandSlot = equippable.getEquipmentSlot(EquipmentSlot.Mainhand)
    if (!mainhandSlot.hasItem() || mainhandSlot.typeId !== 'survival:key') return

    decrementItemAtSlot(mainhandSlot)

    const dynamicProperties: any = lockEvent.block.getComponent("minecraft:dynamic_properties")

    const roomId = JSON.parse((dynamicProperties as BlockDynamicPropertiesComponent).get("structureData") as string).room_id

    RoundManager.roomManager.unlockRoom(roomId)

    lockEvent.dimension.fillBlocks(new BlockVolume(lockEvent.block.location, { x: lockEvent.block.location.x, y: lockEvent.block.location.y - 1, z: lockEvent.block.location.z }), "minecraft:air")
}