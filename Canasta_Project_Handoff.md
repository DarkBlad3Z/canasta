# Canasta Project: Handoff Notes

Upload this file (plus the files listed below) to a new chat and say: "Continue the Canasta project from these notes."
Last updated: 2026-10-31. Owner: Vince Nguyen. Footer author on booklet: "J. Lee".

## 1. What exists

| Item | File | Notes |
|---|---|---|
| Booklet "Canasta Made Easy" (Modern American Canasta) | `Canasta_Made_Easy.docx`, `Canasta_Made_Easy.pdf` (22 pages, letter), `Canasta_Made_Easy_online.html` | Built from `build/content.py` + `build/make.py` (python-docx; PDF via LibreOffice). Footer: "Created by J. Lee | Modern American Canasta". |
| Printable booklet | `Canasta_Made_Easy_Booklet_Print.pdf` | 12 landscape letter sheets, saddle-stitch order (pypdf imposition of the PDF). Print double-sided, flip on short edge, fold. |
| Practice game | `Canasta_Practice_Game.html` = `index.html` (identical single file) | Published as Cowork artifact id `canasta-practice-game`. Deploy to GitHub Pages by uploading `index.html`. |
| Game source | `game_build/` : `template.html`, `engine.js`, `drills.js`, `guide.js`, `scenarios.js` (26 tests), `bot.js` | Assemble: replace markers `/*ENGINE*/`, `/*DRILLS*/`, `/*GUIDE*/` in `template.html` with the contents of `engine.js`, `drills.js`, `guide.js`; write to `game.html`; copy to the two published names. |

Booklet rebuilt Oct 31 with the house rules and the J. Lee footer (docx, PDF, booklet-print PDF and online page).

## 2. Game features (all done)

- Home page, Settings (player name, pace, difficulty Beginner/Intermediate/Advanced default Beginner, narration on/off, voice picker, music on/off/volume/style), Leaderboard, How-to-play guide (15 chapters from booklet), Rules used, Special hands reference (color coded), Practice drills.
- You + AI partner North vs AI West/East. Seats: You=0, West=1, North=2, East=3.
- Audio narration (WebSpeech) with sync: the next AI move waits for narration; lit seat and highlights follow the voice. Skip button (stays visible): cuts narration of the move being described, or the pause before a move.
- 10 procedural music styles (favorites: "cute and bouncy", "sunny strum").
- Wide screen (window at least 1000px): real-table layout (melds/3s beside the player who started them), right column = header buttons, scores, running game log; fixed-height play area with hand pinned at the bottom; compact cards; green table auto-shrinks contents to fit (no scrolling). Phones keep the original stacked layout.
- Auto-sorted hand, new cards flash, double-click to discard, highlights per move (melds, added cards, discards, 3s) with caption.
- "Ask partner to go out" (once per round; partner yes/no).
- Round results pop-up: draggable by title, "Hide this box" button, and a winning special hand is shown (14 cards grouped by rank) in the pop-up and on the page.
- Round ends automatically when the draw pile is empty and the next player cannot take the pack.

## 3. Rule decisions

- Where official rules and group notes differ, the game generally used official rules, EXCEPT these (decided by Vince):
  - **House rules (confirmed by the group, Oct 31)**: the game and booklet follow the library group's house rules; the booklet shows "Differs from official rules" notes beside each.
    - Opening: a meld of only 2s/jokers (3+ cards) can open if its own points cover 125/155/180 (no clean needed); otherwise a clean triple is required. Open with as many cards as needed; only one card to discard is required when a talon is coming (talon set aside, joins hand next turn). Not when opening with the pack (no talon).
    - Pack after opening: hold two natural cards matching the top card; the top card AND the pair go on the meld; blocked if the meld already has 5+ cards.
    - Open with the pack: three natural cards of the top rank in the staged opening meld; the opening (points + clean) must stand without the top card; the top card is then added to that meld as an extra, not counted for points. No talon.
    - Going out: ask partner once per round; not with an unfinished Ace/7/wild canasta; last card may be wild only if it is all you have.
    - 3s: laid down as soon as received (talon 3s on next turn); Straight special hand is the exception.
    - Blast Off and Dream Hand 5 need no wilds (a group of 2s or jokers may be one set; Dream 5 = any 5-5-4); Dream Hand 4 needs four matching wilds.
- Special hand points range 2,000 to 3,500; Dream hands 8,500. Special hand colors: blue = no wilds allowed (Pairs no wilds, Garbage); light yellow = must include wilds (Pairs with wilds, Miami pairs, Straight, Triples, Quads, Dream hand 4); light pink = wilds or no wilds (Zip code, Blast off, Dream hand 5).
- First to 8,500 wins. Opening meld 125 / 155 (at 3,000+) / 180 (at 5,000+).

## 4. Open questions (waiting on Vince's friend/group)

1. **Dream Hand 5**: shown as two open interpretations (5 wilds, or any 5-4-5 combination). Needs an answer.
2. **Miami Pairs**: 2,500 vs 3,000 points.
Any change needs the group's go-ahead.

## 5. Technical notes for future edits

- Single-file vanilla JS, no external dependencies; settings and history in localStorage (`canastaSettings`, `canastaHistory`) inside try/catch.
- Engine (`engine.js`): rules/AI, exports for node tests. Key functions: `packInfo`, `pickPack`, `keepAfter`, `goOutCheck`, `declareSpecial` (ends round with `rs.end.special.cards`), `aiTurn`, `endRound`.
- UI (`template.html`): `render()`, `paint()` (+ `fitTable()`), `loop()` (AI timing), `finishRound()`, `roundModal()`, `speak()/cancelSpeech()/whenQuiet()`, `isWide()`.
- QA approach: jsdom bots clicking real buttons, 26 scripted scenarios (`scenarios.js`, expects `game_build/game.html`), AI-vs-AI sims. Run with `NODE_PATH=<folder with jsdom>/node_modules node scenarios.js` (install jsdom with `npm i jsdom`).
- Not verified on a real screen: the wide layout was checked only by emulation and simulation. Audio was never verified with a real voice by me (Vince reported one mid-game audio dropout; mitigations added, cause not confirmed).
- Cowork tools cannot give a public URL; Vince shares via the app or GitHub Pages.

## 6. Vince's preferences

- Short, direct answers; he tests in his own browser and reports what he sees.
- Keep the booklet frozen unless he asks; game changes go to the game only.
- Always republish the artifact (`update_artifact`) and show the game file after changes.
