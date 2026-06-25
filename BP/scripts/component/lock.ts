import { BlockComponentPlayerInteractEvent, Vector3, system, BlockVolume, EquipmentSlot } from '@minecraft/server'
import { RoundManager } from '../roundManager'

system.beforeEvents.startup.subscribe(event => {
    event.blockComponentRegistry.registerCustomComponent('survival:lock', {
        onPlayerInteract: (event) => clearDoor(event)
    })
})

function clearDoor(lockEvent: BlockComponentPlayerInteractEvent) {
    if (lockEvent.player.getComponent("minecraft:equippable").getEquipment(EquipmentSlot.Mainhand).typeId != "minecraft:trial_key") {
        return
    }

    lockEvent.player.getComponent("minecraft:equippable").setEquipment(EquipmentSlot.Mainhand)

    lockEvent.dimension.fillBlocks(new BlockVolume(lockEvent.block.location, { x: lockEvent.block.location.x, y: lockEvent.block.location.y - 1, z: lockEvent.block.location.z }), "minecraft:air")
}