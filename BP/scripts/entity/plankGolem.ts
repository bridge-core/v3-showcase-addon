import { 
    system, 
    world, 
    EquipmentSlot, 
    Entity, 
    Player,
    ItemStack
} from "@minecraft/server";

const ENTITY_ID = 'v3:plank_golem'

export class PlankGolem {

    public static giveArrow(player: Player, target: Entity, givenStack: ItemStack): void {
        const dimension = target.dimension
        const playerEquippableComp = player.getComponent('minecraft:equippable')

        const remainderStack = target.addItem(givenStack)
        playerEquippableComp.setEquipment(EquipmentSlot.Mainhand, remainderStack)

        dimension.playSound('mob.plank_golem.insert', target.location)
    }

    public static takeArrow(entity: Entity): void {
        const inventoryComp = entity.getComponent('minecraft:inventory')
        const container = inventoryComp.container
        
        const firstStack = container.getItem(0)
        if (!firstStack) return

        let newStack = undefined

        if (firstStack.amount - 1 > 0) {
            newStack = firstStack.clone()
            newStack.amount--
        }

        container.setItem(0, newStack)
    }

    public static tick(entity: Entity): void {
        const inventory = entity.getComponent('minecraft:inventory')
        const container = inventory.container

        entity.setProperty('v3:has_arrows', container.emptySlotsCount === 0)
    }

    public static createTicker(entity: Entity): void {
        const tickerId = system.runInterval(() => {
            this.tick(entity)
        })
        entity.setDynamicProperty('v3:entity_ticker_id', tickerId)
    }

    public static destroyTicker(entity: Entity): void {
        const tickerId = entity.getDynamicProperty('v3:entity_ticker_id') as number

        system.clearRun(tickerId)
    }
}

world.afterEvents.playerInteractWithEntity.subscribe(event => {
    const entity = event.target
    if (entity.typeId !== ENTITY_ID) return

    const stack = event.itemStack
    if (!stack || stack.typeId !== 'minecraft:arrow') return

    PlankGolem.giveArrow(event.player, event.target, stack)
})
world.afterEvents.entitySpawn.subscribe(event => {
    const entity = event.entity

    if (entity.typeId === ENTITY_ID) {
        PlankGolem.createTicker(entity)
    }
    if (entity.typeId === 'minecraft:arrow') {
        const projectileComp = entity.getComponent('minecraft:projectile')
    
        const owner = projectileComp.owner
        if (!owner || owner.typeId !== ENTITY_ID) return

        PlankGolem.takeArrow(owner)
    }

})
world.afterEvents.entityLoad.subscribe(event => {
    const entity = event.entity
    if (entity.typeId !== ENTITY_ID) return

    PlankGolem.createTicker(entity)
})
world.beforeEvents.entityRemove.subscribe(event => {
    const entity = event.removedEntity
    if (entity.typeId !== ENTITY_ID) return

    PlankGolem.destroyTicker(entity)
})