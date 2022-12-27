import { Chan, selectChan } from "./mod";
import { background } from "./context/mod";
import { WaitGroup } from "./sync/mod";
const wait = new WaitGroup();
const ch = new Chan<number>();
async function main() {
  console.log("test");
  for (let i = 0; i < 1000000; i++) {
    wait.add(1);
    write();
  }
  read();
  const begin = Date.now();
  await wait.wait();
  console.log("all used", Date.now() - begin);
}
async function read() {
  let i = 0;
  const max = 1000;
  const c = ch.readCase();
  const done = background().done.readCase();
  while (true) {
    if (await selectChan(c, done) == done) {
      throw new Error("done");
    }
    i = 1;
    c.read()!;
    Merge:
    while (i < max) {
      switch (selectChan(0, c, done)) {
        case done:
          throw new Error("done");
        case c:
          c.read();
          i++;
          break;
        default:
          break Merge;
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
}
async function write() {
  await ch.write(1);
  wait.done();
}
main();
