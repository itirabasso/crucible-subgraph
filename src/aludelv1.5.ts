import { Address, BigInt, log, store, Value } from "@graphprotocol/graph-ts";

import {
  RewardClaimed
} from "../generated/templates/AludelV15Template/AludelV15";
import { ERC20 } from "../generated/CrucibleFactory/ERC20";

import { CrucibleEntity, ERC20Token, Leaderboard, Reward } from "../generated/schema";
import { getCrucibleId, getRewardId } from "./utils";

export function createERC20Token(address: Address): ERC20Token {
  let tokenContract = ERC20.bind(address)
  let token = new ERC20Token(address.toHexString())

  token.address = address
  let decimals = tokenContract.try_decimals()
  if (decimals.reverted) {
    log.error("createERC20Token: failed get token decimals: {}", [address.toHexString()]);
    // reviewme: this behavior may not be ideal.
    token.decimals = BigInt.fromI32(0)
  } else {
    token.decimals = BigInt.fromI32(decimals.value)
  }

  let name = tokenContract.try_name()
  if (name.reverted) {
    log.error("createERC20Token: failed get token name: {}", [address.toHexString()]);
    // reviewme: this behavior may not be ideal.
    token.name = ''
  } else {
    token.name = name.value
  }

  let symbol = tokenContract.try_symbol()
  if (symbol.reverted) {
    log.error("createERC20Token: failed get token symbol: {}", [address.toHexString()]);
    // reviewme: this behavior may not be ideal.
    token.symbol = ''
  } else {
    token.symbol = symbol.value
  }

  token.save()

  return token
}

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

  let erc20Token = ERC20Token.load(tokenAddress.toHexString())
  if (erc20Token == null) {
    erc20Token = createERC20Token(tokenAddress)
  }

  let rewardId = getRewardId(crucibleAddress, aludel, tokenAddress)
  let reward = Reward.load(rewardId)
  if (reward == null) {
    reward = new Reward(rewardId)
    reward.amount = amount
    reward.token = tokenAddress.toHexString()
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
