import { BlockComponentPlayerInteractEvent, Vector3, system, BlockVolume, EquipmentSlot, BlockDynamicPropertiesComponent, BlockComponentOnPlaceEvent } from '@minecraft/server'
import { CustomForm, ObservableString } from '@minecraft/server-ui'
import { RoundManager } from '../roundManager'

system.beforeEvents.startup.subscribe(event => {
    event.blockComponentRegistry.registerCustomComponent('survival:structure_settings', {
        onPlayerInteract: (event) => manageStructureSettings(event),
        onPlace: (event) => placeStucture(event)
    })
})

function placeStucture(placeEvent: BlockComponentOnPlaceEvent) {
    const dynamicProperties: any = placeEvent.block.getComponent("minecraft:dynamic_properties")

    const structureSettingsData = (dynamicProperties as BlockDynamicPropertiesComponent).get("structureSettings")

    if (!structureSettingsData) return

    const settings = JSON.parse(structureSettingsData as string)

    const volumeArea: Vector3 = settings.structureVolume

    const blockLocation: Vector3 = placeEvent.block.location

    let secondaryBlockLocation: Vector3 = {
        x: 0,
        y: 0,
        z: 0
    }

    const currentStructureRot = placeEvent.block.permutation.getState("minecraft:cardinal_direction")

    // 0 Degrees Rot
    if (currentStructureRot == "north") {
        secondaryBlockLocation = {
            x: blockLocation.x + volumeArea.x,
            y: blockLocation.y + volumeArea.y,
            z: blockLocation.z + volumeArea.z
        }
    }

    // 90 Degrees Rot
    if (currentStructureRot == "east") {
        secondaryBlockLocation = {
            x: blockLocation.x - volumeArea.x,
            y: blockLocation.y + volumeArea.y,
            z: blockLocation.z + volumeArea.z
        }
    }

    // 180 Degrees Rot
    if (currentStructureRot == "south") {
        secondaryBlockLocation = {
            x: blockLocation.x - volumeArea.x,
            y: blockLocation.y + volumeArea.y,
            z: blockLocation.z - volumeArea.z
        }
    }


    // 270 Degrees Rot
    if (currentStructureRot == "west") {
        secondaryBlockLocation = {
            x: blockLocation.x + volumeArea.x,
            y: blockLocation.y + volumeArea.y,
            z: blockLocation.z - volumeArea.z
        }
    }


    RoundManager.roomManager.addRoom(new BlockVolume(blockLocation, secondaryBlockLocation), settings.room_id)
}

async function manageStructureSettings(structureSettingsEvent: BlockComponentPlayerInteractEvent) {
    const xValue = new ObservableString("0", {
        clientWritable: true
    })
    const yValue = new ObservableString("0", {
        clientWritable: true
    })
    const zValue = new ObservableString("0", {
        clientWritable: true
    })

    const roomIdentifierValue = new ObservableString("new_room", {
        clientWritable: true
    })

    const dynamicProperties: any = structureSettingsEvent.block.getComponent("minecraft:dynamic_properties")

    const structureSettingsData = (dynamicProperties as BlockDynamicPropertiesComponent).get("structureSettings")

    if (structureSettingsData) {
        const settings = JSON.parse(structureSettingsData as string)

        const volumeArea: Vector3 = settings.structureVolume

        xValue.setData(volumeArea.x.toString())
        yValue.setData(volumeArea.y.toString())
        zValue.setData(volumeArea.z.toString())

        roomIdentifierValue.setData(settings.room_id)
    }

    await new CustomForm(structureSettingsEvent.player, "Structure Settings")
        .divider()
        .label("Information")
        .divider()
        .textField("Room Identifier", roomIdentifierValue)
        .divider()
        .label("Block Volume")
        .divider()
        .textField("X", xValue)
        .textField("Y", yValue)
        .textField("Z", zValue)
        .closeButton()
        .show()

    const xCoord = Number(xValue.getData())
    const yCoord = Number(yValue.getData())
    const zCoord = Number(zValue.getData())

    const volData: Vector3 = {
        x: xCoord,
        y: yCoord,
        z: zCoord
    }

    const structureSettings = {
        room_id: roomIdentifierValue.getData(),
        structureVolume: volData
    }

    console.warn(JSON.stringify(structureSettings));

    (dynamicProperties as BlockDynamicPropertiesComponent).set("structureSettings", JSON.stringify(structureSettings))
}