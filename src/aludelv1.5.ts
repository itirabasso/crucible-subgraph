import {
  Address,
  BigInt,
  ethereum,
  log,
  store,
  Value,
} from "@graphprotocol/graph-ts";

import { AludelCreated, AludelV15, GeyserCreated, RewardClaimed, RewardClaimed1 as RewardClaimedLegacy } from "../generated/templates/AludelV15Template/AludelV15";

import {
  CrucibleEntity,
  ERC20Token,
  Leaderboard,
  Reward,
  RewardProgram,
} from "../generated/schema";
import { getAludelId, getCrucibleId, getRewardId, getTokenId } from "./utils";
import { createERC20Token } from "./erc20Token";

export function handleGeyserCreation(event: GeyserCreated): void {
  _handleCreation(event.address)
}

export function handleAludelCreation(event: AludelCreated): void {
  _handleCreation(event.address)
}

function _handleCreation(aludelAddress: Address): void {
  let aludelContract = AludelV15.bind(aludelAddress)
  
  let aludelId = getAludelId(aludelAddress)
  let aludel = RewardProgram.load(aludelId)
  if (aludel == null) {
    log.error('unable to load aludel {}', [aludelId])
    return;
  }

  let owner = aludelContract.try_owner()
  if (owner.reverted) {
    log.error("handleCreation: failed get aludel owner: {}", [aludelAddress.toHexString()]);
  } else {
    aludel.owner = owner.value
  }

  aludel.save()
}

export function _handleRewardClaimed(
  event: ethereum.Event,
  aludel: Address,
  tokenAddress: Address,
  amount: BigInt,
  crucibleAddress: Address
): void {
  let crucibleId = getCrucibleId(crucibleAddress);
  // load crucible
  let crucible = CrucibleEntity.load(crucibleId);
  if (crucible == null) {
    log.error("rewardClaimed: crucible {} not found", [crucibleId]);
    return;
  }

  let aludelId = getAludelId(aludel)
  let rewardProgram = RewardProgram.load(aludelId)
  if (rewardProgram == null) {
    log.error("rewardClaimed: reward program {} not found", [aludelId]);
    return;
  }
  // log.warning("rewardClaimed: crucible {} loaded", [crucibleId])

  let tokenId = getTokenId(tokenAddress);
  let erc20Token = ERC20Token.load(tokenId);
  if (erc20Token == null) {
    erc20Token = createERC20Token(tokenAddress);
  }

  let rewardId = getRewardId(crucibleAddress, aludel, tokenAddress);
  let reward = Reward.load(rewardId);
  if (reward == null) {
    reward = new Reward(rewardId);
    reward.amount = amount;
    reward.token = tokenId;
    reward.aludel = aludel;
    reward.crucible = crucible.id;
    reward.rewardProgram = aludelId
    // log.warning('newReward: {}', [rewardId])
    crucible.rewardsLength = crucible.rewardsLength.plus(BigInt.fromI32(1));
  } else {
    reward.amount = reward.amount.plus(amount);
    // log.warning('updateReward: {}', [rewardId])
  }
  reward.lastUpdate = event.block.timestamp;
  reward.save();

  crucible.save();

  let leaderboard = Leaderboard.load(crucibleId);
  if (leaderboard == null) {
    log.error("rewardClaimed: failed to load leaderboard {}", [crucibleId]);
    return;
  }
  leaderboard.points = leaderboard.points.plus(amount);
  leaderboard.save();
}

export function handleRewardClaimed(event: RewardClaimed): void {
  let aludel = event.address;
  let tokenAddress = event.params.token;
  let amount = event.params.amount;
  let crucibleAddress = event.params.vault;

  // log.warning("prereward: {} {} {} {}", [crucibleAddress.toHex(), aludel.toHex(), token.toHex(), amount.toString()])

  _handleRewardClaimed(event, aludel, tokenAddress, amount, crucibleAddress);
}

export function handleRewardClaimedLegacy(event: RewardClaimedLegacy): void {
  let aludel = event.address;
  let tokenAddress = event.params.token;
  let amount = event.params.amount;
  let crucibleAddress = event.params.vault;

  // log.warning("prereward: {} {} {} {}", [crucibleAddress.toHex(), aludel.toHex(), token.toHex(), amount.toString()])

  _handleRewardClaimed(event, aludel, tokenAddress, amount, crucibleAddress);
}
