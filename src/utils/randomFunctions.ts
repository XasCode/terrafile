import crypto from 'crypto';

// Generate a random integer: max > getRandomInt() >= 0
function getRandomInt(max: number): number {
  return Math.floor((crypto.randomBytes(4).readUInt32LE() / 0xffffffff) * max);
}

// randomizeOrder() takes an array and mixes up the order of the elements
function randomizeOrder(incoming: unknown[]): unknown[] {
  let workingCopy = [...incoming];
  const outgoing = [];
  for (let i = incoming.length; i > 0; i -= 1) {
    const selected = getRandomInt(i);
    outgoing.push(workingCopy[selected]);
    workingCopy = [...workingCopy.slice(0, selected), ...workingCopy.slice(selected + 1)];
  }
  return outgoing;
}

export { getRandomInt, randomizeOrder };
