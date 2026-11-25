// The One-Line Exit — program/v1 entry writer.
// Node 22, standard library only, no network, no secrets.
// Writes one single-line resignation letter to
// $MAKEFUN_OUTPUT_DIR/entry.txt (fallback /output/entry.txt),
// then reads the file back and proves it is byte-for-byte the
// letter this program meant to write.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The letter: a flight attendant who has spent six years telling
// passengers to fasten their seatbelts finally unbuckles from a
// job that never took off. The setup is the familiar cabin
// announcement; the punchline turns the safety instruction back
// on the job itself.
const ENTRY =
  "I resign, effective today: after six years of telling passengers to fasten their seatbelts, I am unbuckling from a job that never took off.";

// The gate in the kit: /output/entry.txt must be UTF-8 text of
// 1 to 140 characters, not only white space.
const MIN_CHARS = 1;
const MAX_CHARS = 140;
const FALLBACK_DIR = "/output";
const FILENAME = "entry.txt";

function reject(reason: string): never {
  throw new Error(`entry rejected: ${reason}`);
}

// Every shape rule the gate enforces, checked before anything
// touches the disk, so a bad entry fails loudly instead of
// shipping a file the judge will never see.
function validate(text: string): void {
  if (/[\r\n]/.test(text)) {
    reject("must be exactly one line");
  }
  if (text.trim().length === 0) {
    reject("must not be only white space");
  }
  if (text.length < MIN_CHARS || text.length > MAX_CHARS) {
    reject(
      `must be ${MIN_CHARS} to ${MAX_CHARS} characters, got ${text.length}`,
    );
  }
  // The letter reads as one sentence: a single full stop, at the end.
  const stops = text.split(".").length - 1;
  if (stops !== 1 || !text.endsWith(".")) {
    reject(`must be one sentence, found ${stops} period(s)`);
  }
  // No leading or trailing padding sneaking past the character count.
  if (text !== text.trim()) {
    reject("must not start or end with white space");
  }
  // The gate reads UTF-8: the text must survive a UTF-8 round trip
  // unchanged, so no lone surrogate or undecodable character can slip in.
  if (Buffer.from(text, "utf8").toString("utf8") !== text) {
    reject("must be valid UTF-8 text");
  }
}

function outputDir(): string {
  return process.env.MAKEFUN_OUTPUT_DIR ?? FALLBACK_DIR;
}

function main(): void {
  validate(ENTRY);
  const bytes = Buffer.byteLength(ENTRY, "utf8");
  console.log(`entry is ${ENTRY.length} characters (${bytes} bytes), inside the gate`);

  const target = join(outputDir(), FILENAME);
  mkdirSync(outputDir(), { recursive: true });
  writeFileSync(target, ENTRY, "utf8");

  // Read it straight back: what the judge sees must be what we wrote.
  const onDisk = readFileSync(target, "utf8");
  if (onDisk !== ENTRY) {
    reject(`${target} does not match the entry`);
  }
  console.log(`wrote ${target} (${ENTRY.length} characters, verified)`);
  console.log(ENTRY);
}

main();
