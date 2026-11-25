import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY = "lockdoubt: the doubt, halfway to the car, that you did not lock the door.";
const MAX_LENGTH = 140;
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const ENTRY_FILE = "entry.txt";
const WORD = /^[A-Za-z][A-Za-z'-]*$/;

type EntryFacts = {
  entry: string;
  characters: number;
  bytes: number;
  hasDefinition: boolean;
};

function fail(message: string): never {
  process.stderr.write(`invalid entry: ${message}\n`);
  process.exit(1);
}

function entryFacts(text: string): EntryFacts {
  const colon = text.indexOf(":");
  const word = colon === -1 ? "" : text.slice(0, colon).trim();
  const definition = colon === -1 ? "" : text.slice(colon + 1).trim();
  return {
    entry: text,
    characters: [...text].length,
    bytes: Buffer.byteLength(text, "utf8"),
    hasDefinition: colon !== -1 && WORD.test(word) && definition.length > 0,
  };
}

function validate(text: string): EntryFacts {
  const facts = entryFacts(text);

  if (facts.entry.trim().length === 0) fail("entry is empty");
  if (text !== text.trim()) fail("entry has leading or trailing whitespace");
  if (/[\r\n]/.test(text)) fail("entry is not a single line");
  if (facts.characters < 1 || facts.characters > MAX_LENGTH) {
    fail(`entry must be 1..${MAX_LENGTH} characters, got ${facts.characters}`);
  }
  if (facts.bytes < 1 || facts.bytes > MAX_LENGTH) {
    fail(`entry must be 1..${MAX_LENGTH} bytes, got ${facts.bytes}`);
  }
  if (!text.includes(":")) fail("entry has no colon");
  if (!facts.hasDefinition) fail("entry needs a word, a colon and a definition");

  return facts;
}

const facts = validate(ENTRY);

mkdirSync(OUTPUT_DIR, { recursive: true });
const entryPath = join(OUTPUT_DIR, ENTRY_FILE);
const expected = Buffer.from(`${facts.entry}\n`, "utf8");
writeFileSync(entryPath, expected);
const written = readFileSync(entryPath);
if (!written.equals(expected)) fail("entry.txt does not match the bytes written");

process.stdout.write(
  `path: ${entryPath}\ncharacters: ${facts.characters}\nbytes: ${facts.bytes}\nhasDefinition: ${facts.hasDefinition}\n`,
);
