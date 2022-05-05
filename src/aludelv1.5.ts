import { Address, BigInt, log, store, Value } from "@graphprotocol/graph-ts";

import {
  RewardClaimed
} from "../generated/templates/AludelV15Template/AludelV15";

import { CrucibleEntity, ERC20Token, Leaderboard, Reward } from "../generated/schema";
import { getCrucibleId, getRewardId, getTokenId } from "./utils";
import { createERC20Token } from "./erc20Token";

export function handleRewardClaimed(event: RewardClaimed): void {
  let aludel = event.address
  let tokenAddress = event.params.token
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

  let tokenId = getTokenId(tokenAddress)
  let erc20Token = ERC20Token.load(tokenId)
  if (erc20Token == null) {
    erc20Token = createERC20Token(tokenAddress)
  }

  let rewardId = getRewardId(crucibleAddress, aludel, tokenAddress)
  let reward = Reward.load(rewardId)
  if (reward == null) {
    reward = new Reward(rewardId)
    reward.amount = amount
    reward.token = tokenId
    reward.aludel = aludel
    reward.crucible = crucible.id
    // log.warning('newReward: {}', [rewardId])
    crucible.rewardsLength = crucible.rewardsLength.plus(BigInt.fromI32(1))
    
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
