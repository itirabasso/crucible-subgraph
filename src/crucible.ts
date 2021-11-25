import {
  Locked,
  RageQuit,
  Unlocked,
} from "../generated/templates/CrucibleTemplate/Crucible";
import {
  log,
  Address,
  Bytes,
  crypto,
  ByteArray,
  BigInt,
  store,
} from "@graphprotocol/graph-ts";
import { CrucibleEntity, Lock, Stake, Unstake } from "../generated/schema";
import {getCrucibleId, getLockId, getStakeId, getUnstakeId} from "./utils";

export function handleLocked(event: Locked): void {
  let crucibleId = getCrucibleId(event.address);
  let crucible = CrucibleEntity.load(crucibleId);

  let delegate = event.params.delegate;
  let token = event.params.token;

  let id = getLockId(crucibleId, delegate, token)
  // if crucible exists and id is not null
  if (crucible == null) {
    // log.warning("crucible {} not found", [crucibleId]);
    return
  }
  let lock = Lock.load(id);

  // if lock doesn't exist we create it.
  if (lock == null) {
    lock = new Lock(id);
    lock.delegate = delegate;
    lock.token = token;
    lock.balance = BigInt.zero();
    lock.crucible = crucible.id;
    lock.stakesLength = BigInt.fromI32(0);
    lock.unstakesLength = BigInt.fromI32(0);
  } else {

  }
  lock.stakesLength = lock.stakesLength.plus(BigInt.fromI32(1))
  // increment lock's balance
  lock.balance = lock.balance.plus(event.params.amount);
  lock.save();

  let stakeId = getStakeId(lock, lock.stakesLength)
  let stake = new Stake(stakeId);
  stake.amount = event.params.amount;
  stake.timestamp = event.block.timestamp;
  stake.lock = id;
  stake.save();

}

export function handleUnlocked(event: Unlocked): void {
  let crucibleId = getCrucibleId(event.address);
  // load crucible
  let crucible = CrucibleEntity.load(crucibleId);
  if (crucible == null) {
    // log.warning("crucible {} not found", [crucibleId]);
    return
  }

  let delegate = event.params.delegate;
  let token = event.params.token;

  let id = getLockId(crucibleId, delegate, token)

  // load lock
  let lock = Lock.load(id);
  if (lock == null) {
    // log.error("unlocking invalid lock: {}", [id]);
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
    if (lastStake == null) return;

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
      amountToUnstake = BigInt.zero()
      lastStake.save()
    } else {
      // full unstake
      unstake.amount = lastStake.amount
      // decrease unstake amount
      amountToUnstake = amountToUnstake.minus(lastStake.amount)
      // remove last stake entity
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
}

export function handleRageQuit(event: RageQuit): void {
  let address = event.address;
  let crucible = CrucibleEntity.load(address.toHex());

  if (crucible != null) {
  } else {
    log.warning("crucible {} not found", [address.toHexString()]);
  }
}
