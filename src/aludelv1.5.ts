import { BigInt, log, store, Value } from "@graphprotocol/graph-ts";

import {
  RewardClaimed
} from "../generated/templates/AludelV15Template/AludelV15";
import { ERC20 } from "../generated/CrucibleFactory/ERC20";

import { CrucibleEntity, Leaderboard, Reward } from "../generated/schema";
import { getCrucibleId, getRewardId } from "./utils";

export function handleRewardClaimed(event: RewardClaimed): void {
  let aludel = event.address
  let token = event.params.token
  let amount = event.params.amount
  let crucibleAddress = event.params.vault

  // log.warning("prereward: {} {} {} {}", [crucibleAddress.toHex(), aludel.toHex(), token.toHex(), amount.toString()])

  let crucibleId = getCrucibleId(crucibleAddress)
  // load crucible
  let crucible = CrucibleEntity.load(crucibleId);
  if (crucible == null) {
    log.error("rewardClaimed: crucible {} not found", [crucibleId]);
    return
  }
  // log.warning("rewardClaimed: crucible {} loaded", [crucibleId])

  let rewardId = getRewardId(crucibleAddress, aludel, token)
  let reward = Reward.load(rewardId)
  if (reward == null) {
    reward = new Reward(rewardId)
    reward.token = token
    reward.amount = amount
    reward.aludel = aludel
    reward.crucible = crucible.id
    // log.warning('newReward: {}', [rewardId])
    crucible.rewardsLength = crucible.rewardsLength.plus(BigInt.fromI32(1))
    
    let tokenContract = ERC20.bind(token)
    let decimals = tokenContract.try_decimals()
    if (decimals.reverted) {
      log.error("rewardClaimed: failed get token decimals: {}", [token.toHexString()]);
      // reviewme: this behavior may not be ideal.
      reward.tokenDecimals = BigInt.fromI32(18)
    } else {
      reward.tokenDecimals = BigInt.fromI32(decimals.value)
    }
  } else {
    reward.amount = reward.amount.plus(amount)
    // log.warning('updateReward: {}', [rewardId])
  }
  reward.lastUpdate = event.block.timestamp
  reward.save()

  crucible.save()

  let leaderboard = Leaderboard.load(crucibleId)
  if (leaderboard == null) {
    log.error("rewardClaimed: failed to load leaderboard {}", [crucibleId]);
    return
  }
  leaderboard.points = leaderboard.points.plus(amount)
  leaderboard.save()
}
