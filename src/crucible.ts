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
  BigDecimal,
  BigInt,
  store,
} from "@graphprotocol/graph-ts";
import { CrucibleEntity, Lock, Suscription } from "../generated/schema";

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
  log.debug("{} - {}", [address.toHexString(), id]);
  // if crucible exists and id is not null
  if (crucible != null && id != null) {
    let lock = Lock.load(id);
    // if lock doesn't exist we create it.
    log.debug("loaded {}", [id]);
    if (lock == null) {
      log.debug("is null", []);
      lock = new Lock(id);
      lock.delegate = delegate;
      lock.token = token;
      lock.balance = BigInt.zero();
      lock.crucible = crucible.id;
      lock.suscriptionAmount = BigInt.fromI32(0);
    } else {
    }


    // increment lock's balance
    lock.balance = lock.balance.plus(event.params.amount);
    // increment amount of suscription
    lock.suscriptionAmount = lock.suscriptionAmount.plus(BigInt.fromI32(1));
    // lockId-suscription length
    let suscriptionId = lock.id
      + "-"
      + lock.suscriptionAmount.toString();
    
    let suscription = new Suscription(suscriptionId);
    suscription.type = "LOCK";
    suscription.amount = event.params.amount;
    suscription.timestamp = event.block.timestamp;
    suscription.lock = id;
    suscription.save();
    
    lock.save();

  } else {
    log.warning("crucible {} not found", [address.toHexString()]);
  }
}

export function handleUnlocked(event: Unlocked): void {
  let address = event.address;
  log.warning("unlockkkkkkk", [])
  let crucible = CrucibleEntity.load(address.toHexString().toLowerCase());

  let delegate = event.params.delegate;
  let token = event.params.token;

  let lockID = crypto.keccak256(concat(token, delegate));
  let id = getLockId(address, delegate, token)
  log.warning('unlocking lock {} at {}', [lockID.toHexString(), address.toHexString()])
  if (crucible != null) {
    let lock = Lock.load(id);
    if (lock != null) {
      log.warning('unlock for {}', [crucible.id])
      lock.suscriptionAmount = lock.suscriptionAmount.plus(BigInt.fromI32(1));
      // lockId-suscription length
      let suscriptionId = lock.id
      + "-"
      + lock.suscriptionAmount.toString();
      
      let suscription = new Suscription(suscriptionId);
      suscription.type = "UNLOCK";
      suscription.amount = event.params.amount;
      suscription.timestamp = event.block.timestamp;
      suscription.lock = id;
      suscription.save();
      
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
