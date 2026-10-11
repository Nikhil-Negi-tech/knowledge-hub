"use client";

import { useState } from "react";

type Character = { name: string; icon: string };

const EMOJIS: Character[] = [
  { name: "Superman", icon: "S" }, { name: "Batman", icon: "🦇" }, { name: "Wonder Woman", icon: "⚔️" },
  { name: "The Flash", icon: "⚡" }, { name: "Aquaman", icon: "🔱" }, { name: "Green Lantern", icon: "🟢" },
  { name: "Green Arrow", icon: "🏹" }, { name: "Cyborg", icon: "🤖" }, { name: "Shazam", icon: "⚡" },
  { name: "Supergirl", icon: "✦" }, { name: "Batgirl", icon: "🦇" }, { name: "Nightwing", icon: "🪽" },
  { name: "Robin", icon: "🟥" }, { name: "Harley Quinn", icon: "🃏" }, { name: "Joker", icon: "🃏" },
  { name: "Catwoman", icon: "🐈‍⬛" }, { name: "Poison Ivy", icon: "🌿" }, { name: "Raven", icon: "🔮" },
  { name: "Starfire", icon: "🔥" }, { name: "Deathstroke", icon: "⚔️" },
  { name: "Spider-Man", icon: "🕷️" }, { name: "Iron Man", icon: "🦾" }, { name: "Captain America", icon: "🛡️" },
  { name: "Thor", icon: "🔨" }, { name: "Hulk", icon: "💥" }, { name: "Black Widow", icon: "🕷️" },
  { name: "Hawkeye", icon: "🎯" }, { name: "Doctor Strange", icon: "🌀" }, { name: "Black Panther", icon: "🐾" },
  { name: "Captain Marvel", icon: "✦" }, { name: "Scarlet Witch", icon: "🔴" }, { name: "Vision", icon: "💎" },
  { name: "Ant-Man", icon: "🐜" }, { name: "Wasp", icon: "🐝" }, { name: "Groot", icon: "🌱" },
  { name: "Rocket", icon: "🦝" }, { name: "Star-Lord", icon: "🎧" }, { name: "Gamora", icon: "⚔️" },
  { name: "Daredevil", icon: "😈" }, { name: "Deadpool", icon: "⚔️" }, { name: "Wolverine", icon: "🦞" },
  { name: "Storm", icon: "🌩️" }, { name: "Cyclops", icon: "🔴" }, { name: "Jean Grey", icon: "🔥" },
  { name: "Magneto", icon: "🧲" }, { name: "Professor X", icon: "🧠" }, { name: "Mystique", icon: "🎭" },
  { name: "Silver Surfer", icon: "🌊" }, { name: "Venom", icon: "🕸️" }, { name: "Loki", icon: "🐍" },
  { name: "Harry Potter", icon: "⚡" }, { name: "Hermione", icon: "📚" }, { name: "Ron Weasley", icon: "♟️" },
  { name: "Dumbledore", icon: "🪄" }, { name: "Snape", icon: "🖤" }, { name: "McGonagall", icon: "🐈" },
  { name: "Hagrid", icon: "🧔" }, { name: "Luna Lovegood", icon: "🌙" }, { name: "Draco Malfoy", icon: "🐍" },
  { name: "Cedric Diggory", icon: "🏆" }, { name: "Sirius Black", icon: "🐕‍🦺" }, { name: "Voldemort", icon: "🗝️" }
] as const;

const GROUPS = [
  ["DC", EMOJIS.slice(0, 20)],
  ["Marvel", EMOJIS.slice(20, 50)],
  ["Wizarding world", EMOJIS.slice(50)]
] as const;

export function EmojiPicker() {
  const [selected, setSelected] = useState(EMOJIS[0]);
  return <div className="emoji-picker"><p>Choose your profile character</p>{GROUPS.map(([group, choices]) => <section className="emoji-group" key={group}><h3>{group}</h3><div className="emoji-options">{choices.map(choice => <button type="button" className={selected.name === choice.name ? "selected" : ""} key={choice.name} onClick={() => setSelected(choice)} aria-label={`Choose ${choice.name}`} title={choice.name}><span aria-hidden="true">{choice.icon}</span><small>{choice.name}</small></button>)}</div></section>)}<input type="hidden" name="emoji" value={`${selected.icon} ${selected.name}`} /><span className="emoji-preview" aria-label={`Selected ${selected.name}`}>{selected.icon}</span><strong className="selected-character">{selected.name}</strong></div>;
}
