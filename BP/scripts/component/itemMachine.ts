import { BlockComponentPlayerInteractEvent, world, Vector3, system, BlockVolume, EquipmentSlot, BlockDynamicPropertiesComponent, LootTable, BlockComponentOnPlaceEvent, CustomComponentParameters, ItemStack } from '@minecraft/server'
import { CustomForm, ObservableString } from '@minecraft/server-ui'
import { RoundManager } from '../roundManager'
import { getPlayerScore, setPlayerScore } from '../systems/scoreSystem'

system.beforeEvents.startup.subscribe(event => {
    event.blockComponentRegistry.registerCustomComponent('survival:item_machine', {
        onPlayerInteract: (event, componentParameters) => useItemMachine(event, componentParameters)
    })
})

async function useItemMachine(event: BlockComponentPlayerInteractEvent, paramsData: CustomComponentParameters) {
    const name: string = paramsData.params["name"]
    const lootTableManager = world.getLootTableManager()
    const lootTable: LootTable = lootTableManager.getLootTable(paramsData.params["loot_table"])
    const price: number = paramsData.params["price"]

    const buy = () => {
        const player = event.player
        const playerScore = getPlayerScore(player)

        if (playerScore < price) {
            player.sendMessage("Not enough Score!")
            return
        }

        setPlayerScore(player, playerScore - price)

        const boughtItems = lootTableManager.generateLootFromTable(lootTable)

        for (const item of boughtItems) {
            player.addItem(item)
        }
    }

    await new CustomForm(event.player, `${name} For U`)
        .divider()
        .label(`Shop ${name}`)
        .divider()
        .button(`Buy for ${price} Score`, buy)
        .divider()
        .closeButton()
        .show()
}