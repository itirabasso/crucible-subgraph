import {
  Locked,
  RageQuit,
  Unlocked,
} from "../generated/templates/CrucibleTemplate/Crucible";
import {
  log,
  BigInt,
  store,
} from "@graphprotocol/graph-ts";
import { CrucibleEntity, ERC20Token, Leaderboard, Lock, RewardProgram, Stake, Unstake } from "../generated/schema";
import {getAludelId, getCrucibleId, getLockId, getStakeId, getTokenId, getUnstakeId} from "./utils";
import { createERC20Token } from "./erc20Token";
import { AludelV15Template } from "../generated/templates";
import { AludelV15 } from "../generated/templates/AludelV15Template/AludelV15";

export function handleLocked(event: Locked): void {
  let crucibleId = getCrucibleId(event.address);
  let crucible = CrucibleEntity.load(crucibleId);

  let aludelAddress = event.params.delegate
  let maybeAludel = AludelV15.bind(aludelAddress)
  // if this call reverts the delegate dont have a compatible abi with aludel.
  let length = maybeAludel.try_getVaultFactorySetLength();
  if (length.reverted) {
    log.warning('delegate is not an aludel: {}', [aludelAddress.toString()])
  } else {
    let program = RewardProgram.load(getAludelId(aludelAddress))
    if (program == null) {
      AludelV15Template.create(aludelAddress)
      program = new RewardProgram(getAludelId(aludelAddress))
      program.save()
    }
  }

  let delegate = event.params.delegate;
  let tokenAddress = event.params.token;

  let erc20Token = ERC20Token.load(getTokenId(tokenAddress))
  if (erc20Token == null) {
    erc20Token = createERC20Token(tokenAddress)
  }

  let id = getLockId(crucibleId, delegate, tokenAddress)
  // if crucible exists and id is not null
  if (crucible == null) {
    log.warning("crucible {} not found", [crucibleId]);
    return
  }
  let lock = Lock.load(id);

  // if lock doesn't exist we create it.
  if (lock == null) {
    lock = new Lock(id);
    lock.delegate = delegate;
    lock.token = getTokenId(tokenAddress)
    lock.balance = BigInt.zero();
    lock.crucible = crucible.id;
    lock.stakesLength = BigInt.fromI32(0);
    lock.unstakesLength = BigInt.fromI32(0);

    // log.warning("new lock in {}  with {} at {}", [crucible.id, token.toHexString(), delegate.toHexString()]);

  } else {

  }
  lock.stakesLength = lock.stakesLength.plus(BigInt.fromI32(1))
  // increment lock's balance
  lock.balance = lock.balance.plus(event.params.amount);
  lock.save();

  let stakeId = getStakeId(lock, lock.stakesLength)
  // log.warning("new stake: {}", [stakeId]);

  let stake = new Stake(stakeId);
  stake.amount = event.params.amount;
  stake.timestamp = event.block.timestamp;
  stake.lock = id;

  stake.save();

  let leaderboard = Leaderboard.load(crucibleId)
  if (leaderboard == null) {
    log.error("rewardClaimed: failed to load leaderboard {}", [crucibleId]);
    return
  }
  leaderboard.points = leaderboard.points.plus(stake.amount)
  leaderboard.save()
}

export function handleUnlocked(event: Unlocked): void {
  let crucibleId = getCrucibleId(event.address);
  // load crucible
  let crucible = CrucibleEntity.load(crucibleId);
  if (crucible == null) {
    log.warning("crucible {} not found", [crucibleId]);
    return
  }

  let delegate = event.params.delegate;
  let token = event.params.token;

  let id = getLockId(crucibleId, delegate, token)

  // load lock
  let lock = Lock.load(id);
  if (lock == null) {
    log.error("unlocking invalid lock: {}", [id]);
    return;
  }

  let amountToUnstake = event.params.amount
  let stakesLength = lock.stakesLength
  let unstakesLength = lock.unstakesLength

  while (amountToUnstake.gt(BigInt.zero())) {
    // at least 1 stake must exist
    // let lastStakeId = lock.stakes[.length - 1]
    let lastStakeId = getStakeId(lock, stakesLength)
    let lastStake = Stake.load(lastStakeId)
    if (lastStake == null) {
      log.warning('last stake not found {}', [lastStakeId])
      return;
    }
    
    // duration of subscription
    let duration = event.block.timestamp.minus(lastStake.timestamp)
    // increase amount of unstakes
    unstakesLength = unstakesLength.plus(BigInt.fromI32(1))
    
    let unstakeId = getUnstakeId(lock, unstakesLength)
    // log.warning("new unstake {}", [unstakeId])
    let unstake = new Unstake(unstakeId)
    // is a partial unstake?
    if (lastStake.amount > amountToUnstake) {
      unstake.amount = amountToUnstake
      // reduce stake balance
      lastStake.amount = lastStake.amount.minus(amountToUnstake)
      amountToUnstake = BigInt.zero()
      lastStake.save()
    } else {
      // full unstake
      unstake.amount = lastStake.amount
      // decrease unstake amount
      amountToUnstake = amountToUnstake.minus(lastStake.amount)
      // remove last stake entity
      // log.warning('removing lastStakeId: {}', [lastStakeId])
      store.remove('Stake', lastStakeId)
      // stakes = stakes.slice(0, stakes.length)
      stakesLength = stakesLength.minus(BigInt.fromI32(1))
    }

    // update new unstake attributes
    unstake.duration = duration
    unstake.timestamp = event.block.timestamp;
    unstake.lock = id
    unstake.save()
  }
  // update
  lock.unstakesLength = unstakesLength
  lock.stakesLength = stakesLength
  lock.balance = lock.balance.minus(event.params.amount);
  
  // should we remove the lock when balance reaches 0?
  lock.save();

  let leaderboard = Leaderboard.load(crucibleId)
  if (leaderboard == null) {
    log.error("rewardClaimed: failed to load leaderboard {}", [crucibleId]);
    return
  }
  leaderboard.points = leaderboard.points.minus(event.params.amount)
  leaderboard.save()

}

export function handleRageQuit(event: RageQuit): void {
  let address = event.address;
  let crucible = CrucibleEntity.load(address.toHex());

  if (crucible != null) {
  } else {
    log.error("crucible {} not found", [address.toHexString()]);
  }
}
