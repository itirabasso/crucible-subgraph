import {
  Locked,
  Locked__Params,
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

export function concat(a: ByteArray, b: ByteArray): ByteArray {
  let out = new Uint8Array(a.length + b.length);
  for (let i = 0; i < a.length; i++) {
    out[i] = a[i];
  }
  for (let j = 0; j < b.length; j++) {
    out[a.length + j] = b[j];
  }
  return Bytes.fromUint8Array(out);
}

function addSuscription(lock: Lock): void {}

function getLockId(crucible: Address, delegate: Address, token: Address): string {
  // onchain lockID
  let lockID = crypto.keccak256(concat(delegate, token));
  // entity id = lockID-crucible_address
  let id = lockID.toHex().toLowerCase() + "-" + crucible.toHexString().toLowerCase();
  return id
}

export function handleLocked(event: Locked): void {
  let address = event.address;
  let crucible = CrucibleEntity.load(address.toHexString().toLowerCase());

  let delegate = event.params.delegate;
  let token = event.params.token;

  let id = getLockId(address, delegate, token)  
  // if crucible exists and id is not null
  if (crucible != null && id != null) {
    let lock = Lock.load(id);
    // if lock doesn't exist we create it.
    if (lock == null) {
      lock = new Lock(id);
      lock.delegate = delegate;
      lock.token = token;
      lock.balance = BigInt.zero();
      lock.crucible = crucible.id;
      lock.stakesAmount = BigInt.fromI32(0);
    } else {
    }


    // increment lock's balance
    lock.balance = lock.balance.plus(event.params.amount);
    // increment amount of suscription
    // lock.suscriptionAmount = lock.suscriptionAmount.plus(BigInt.fromI32(1));
    // lockId-suscription length
    let stakeId = lock.id
      + "-"
      + lock.stakesAmount.toString();
    
    let stake = new Stake(stakeId);
    stake.amount = event.params.amount;
    stake.timestamp = event.block.timestamp;
    stake.lock = id;
    stake.save();
    
    lock.save();

  } else {
    log.warning("crucible {} not found", [address.toHexString()]);
  }
}

export function handleUnlocked(event: Unlocked): void {
  let address = event.address;
  let crucible = CrucibleEntity.load(address.toHexString().toLowerCase());

  let delegate = event.params.delegate;
  let token = event.params.token;

  let id = getLockId(address, delegate, token)
  if (crucible != null) {
    let lock = Lock.load(id);
    if (lock != null) {
      log.warning('unlock for {}', [crucible.id])
      // lock.suscriptionAmount = lock.suscriptionAmount.plus(BigInt.fromI32(1));
      let stakesAmount = lock.stakes.length
      let unstakesAmount = lock.unstakes.length
      // lockId-suscription length
      let unstakeId = lock.id
      + "-"
      + unstakesAmount.toString();
      
      let unstakeAmount = event.params.amount
      let removedStakes = 0
      let stakes = lock.stakes
      while (unstakeAmount.gt(BigInt.zero())) {
        // at least 1 stake must exist
        let lastStakeId = lock.stakes[stakes.length - 1]
        let lastStake = Stake.load(lastStakeId)
        if (lastStake == null) return;
        // duration of subscription
        let duration = event.block.timestamp.minus(lastStake.timestamp)

        let unstake = new Unstake(unstakeId)

        // is a partial unstake?
        if (lastStake.amount > unstakeAmount) {
          unstake.amount = unstakeAmount
        } else {
          // full unstake
          unstake.amount = lastStake.amount
          // decrease unstake amount
          unstakeAmount.minus(lastStake.amount)
          // remove last stake entity
          store.remove('Stake', lastStakeId)
          stakes = stakes.slice(0, stakes.length)
        }
        unstake.duration = duration
        unstake.lock = id
        unstake.save()
        
      }
      
      lock.balance = lock.balance.minus(event.params.amount);
      // if the balance zero remove entity from store
      if (lock.balance.isZero()) {
        // store.remove("Lock", id);
      } else {
        lock.save();
      }
    } else {
      log.error("unlocking invalid lock: {}", [id]);
    }
  } else {
    log.warning("crucible {} not found", [address.toHexString()]);
  }
}

export function handleRageQuit(event: RageQuit): void {
  let address = event.address;
  let crucible = CrucibleEntity.load(address.toHex());

  if (crucible != null) {
  } else {
    log.warning("crucible {} not found", [address.toHexString()]);
  }
}
