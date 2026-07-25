import { DisplaySlotId, world, EntityDieAfterEvent, Player } from "@minecraft/server"

export function initiateScore() {
    if (world.scoreboard.getObjective("score")) {
        return
    }

    world.scoreboard.addObjective("score", "Score")

    const playerScore = world.scoreboard.getObjective("score")

    world.scoreboard.setObjectiveAtDisplaySlot(DisplaySlotId.Sidebar, {
        objective: playerScore
    })
}

export function assignPlayerDefaultScore() {
    const playerScore = world.scoreboard.getObjective("score")

    for (const player of world.getPlayers()) {
        playerScore.setScore(player, 200)
    }
}

export function getPlayerScore(player: Player) {
    const playerScore = world.scoreboard.getObjective("score")

    return playerScore.getScore(player)
}

export function setPlayerScore(player: Player, score: number) {
    const playerScore = world.scoreboard.getObjective("score")

    return playerScore.setScore(player, score)
}

export function clearPlayerScore() {
    for (const player of world.getPlayers()) {
        world.scoreboard.getObjective("score").setScore(player, 0)
    }
}

export function subscribeToScoreCounter() {
    world.afterEvents.entityDie.subscribe(scoreCounter, {
        entityTypes: ["minecraft:zombie"]
    })
}

export function unsubscribeToScoreCounter() {
    world.afterEvents.entityDie.unsubscribe(scoreCounter)
}

function scoreCounter(event: EntityDieAfterEvent) {
    const player = event.damageSource.damagingEntity as Player

    world.scoreboard.getObjective("score").addScore(player, 50)
}