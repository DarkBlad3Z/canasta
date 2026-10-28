TITLE = "Canasta Made Easy"
SUBTITLE = "A beginner's guide and table reference for Modern American Canasta"
TAGLINE = "Based on our library group's house rules"

# Block types: h2, p, ul, ol, table(header, rows), note(kind, text)
# kinds: tip, check (confirm with group), warn, remember
# Inline **bold** supported.

CH = []

def ch(title, *blocks):
    CH.append((title, list(blocks)))

# ---------------------------------------------------------------- Intro
ch("How to use this booklet",
    ("p", "This booklet takes you from \"I have never touched a Canasta card\" to playing a full round. Read chapters 1 to 5 once, play a hand, then use chapters 6 to 11 as you go. Chapter 12 is a one-page cheat sheet to keep at the table."),
    ("p", "The rules here come from notes taken during classes at the library. Where those notes match the official Modern American Canasta rules (Canasta League of America), the booklet uses them as written. Where they differ, the booklet keeps your group's version and shows the official rule beside it. All differences are summarized in chapter 14."),
    ("h2", "Look for these boxes"),
    ("note", "tip", "**Tip.** A friendly hint that makes the game easier."),
    ("note", "remember", "**Remember.** A rule that is easy to forget and costs points."),
    ("note", "warn", "**Penalty alert.** A mistake that loses points."),
    ("note", "diff", "**Differs from official rules.** Your group's notes and the official rules disagree here. Both versions are shown. Decide with your group which to follow."),
    ("note", "check", "**Check with your group.** The original notes were unclear here, and the official rules did not settle it. Collected in chapter 13."),
)

# ---------------------------------------------------------------- 1
ch("1. The game at a glance",
    ("h2", "Goal"),
    ("p", "Canasta is a card game for two partnerships (four players, partners sit across from each other). Each round, your team tries to **score as many points as possible and keep the other team from scoring**. The first team to reach **8,500 points** wins the game."),
    ("h2", "What is a canasta?"),
    ("p", "A **canasta** is a set of **7 or more cards of the same number** laid out together on the table. It is the main way to score. There are two kinds:"),
    ("ul", [
        "**Clean (natural) canasta:** seven or more cards of one number with **no wild cards**. Worth 500 points.",
        "**Dirty (mixed) canasta:** seven or more cards of one number that **include wild cards** (five natural cards plus up to two wilds). Worth 300 points.",
    ]),
    ("h2", "The big picture of a round"),
    ("ol", [
        "Deal 13 cards to each player.",
        "Take turns: draw, make melds (lay down sets), and discard.",
        "Make your team's **opening meld** (the first time you lay cards down). It must reach a minimum point total.",
        "Build more sets and complete canastas.",
        "The round ends when a player \"goes out\" (needs two canastas and partner's permission) or the draw pile runs out.",
        "Count points. Play more rounds until a team reaches 8,500.",
    ]),
)

# ---------------------------------------------------------------- 2
ch("2. Cards and key words",
    ("h2", "The deck"),
    ("p", "Use **two standard decks plus four jokers** (108 cards)."),
    ("h2", "Wild cards"),
    ("p", "**All 2s (called \"deuces\") and all jokers are wild.** A wild card can stand in for any natural card in a set. Wild cards are powerful, but there are many limits on when you can use them and when you can throw them away."),
    ("h2", "The special 3s"),
    ("p", "3s are **bonus cards**. You never meld them in sets. Whenever you get one, lay it sideways at the top of your play area at the start of your turn, then draw a replacement. They earn points if your team has two canastas, and cost points if you have none (see chapter 8)."),
    ("h2", "Glossary"),
    ("table", ["Word", "Meaning"], [
        ["Meld", "Laying down cards from your hand onto the table as a set."],
        ["Opening (initial) meld", "Your team's first meld of the round. It must reach 125, 155 or 180 points (chapter 5)."],
        ["Set", "Three or more cards of the same number laid together."],
        ["Natural / clean", "A real card of that number, not a wild."],
        ["Dirty", "A set or canasta that includes wild cards."],
        ["Canasta", "A set of 7 or more cards. Clean = 500 points, dirty = 300."],
        ["Closing a canasta", "Completing the set to 7 cards. You mark it by putting a red card on top (clean) or a black card on top (dirty)."],
        ["Dead card / dead number", "A number that already has a canasta. It cannot be melded again."],
        ["Draw pile (stock)", "The face-down pile you draw from."],
        ["Turn card", "The card turned sideways in the draw pile during setup. It sits on top of the bottom 8 cards. Talons are only given while 9 or more cards remain (chapter 5)."],
        ["Pack / discard tray", "The face-up pile where discards go."],
        ["Going out", "Ending the round by finishing your hand with a final discard."],
        ["Deuce", "A 2 (wild card)."],
    ]),
)

# ---------------------------------------------------------------- 3
ch("3. Setting up and dealing",
    ("ol", [
        "**Pick the first dealer.** Each player draws a card. Highest card deals. After that, the deal passes **clockwise** each round.",
        "**Shuffle** the cards.",
        "**Cut.** The player to the dealer's right cuts the deck in half and keeps the **top half**.",
        "**Make the draw pile.** From the bottom of that half, count off **8 cards** and place them face down. Turn the **ninth card sideways** on top of them. This sideways card is the **turn card**. The rest of that half joins the draw pile.",
        "**Deal 13 cards** to each player, one at a time, clockwise. The dealer deals while the cutter builds the draw pile.",
        "Play starts and continues **clockwise**.",
    ]),
)

# ---------------------------------------------------------------- 4
ch("4. Taking a turn",
    ("p", "Every turn follows the same steps."),
    ("ol", [
        "**Lay down any 3s.** Place each 3 sideways at the top of your play area. Draw one card from the draw pile for each 3 to replace it.",
        "**Draw** one card from the draw pile.",
        "**Meld** if you want to and are able to (chapters 5 and 6).",
        "**Discard** one card face up onto the discard tray. Your turn ends.",
    ]),
    ("h2", "Discard rules"),
    ("ul", [
        "**You cannot discard a 3**, except as your final card when going out.",
        "**You cannot discard a wild card** unless it is your very last card, or all you have left are wild cards.",
        "**The first card into an empty tray** cannot be a 7, an Ace or a wild card. This also applies any time the tray is empty (for example, after someone picks up the pack).",
        "**Dead cards** (numbers that already have a canasta) also cannot go into an empty tray.",
    ]),
    ("note", "diff", "**Differs from official rules.** *Group notes:* always lay 3s down at the start of your turn, and a 3 may be your final discard when going out. *Official:* you may hold 3s while going for a special hand, and a 3 is never discarded, even when going out."),
    ("h2", "Hand size after you open"),
    ("p", "After your team has opened, you must keep **two cards in hand** at the end of your turn: one to hold and one to discard next time. **If you have two cards or fewer, tell your partner.**"),
    ("note", "diff", "**Differs from official rules.** *Group notes:* keep two cards in hand after opening (one to hold, one to discard). *Official:* keep at least one card (the one you discard), unless you go out or have just picked up the pack."),
    ("note", "tip", "**Tip.** Say \"I have two\" out loud every time. It helps your partner decide whether to ask you to go out."),
)

# ---------------------------------------------------------------- 5
ch("5. Your opening meld",
    ("p", "Before your team can lay down anything else, one partner must make the **opening meld**. It has to meet two tests."),
    ("h2", "Test 1: enough points"),
    ("p", "The cards you lay down must add up to a minimum. The minimum goes up as your team's overall score grows:"),
    ("table", ["Your team's total score", "Opening meld needs"], [
        ["Under 3,000", "125 points"],
        ["3,000 to 4,999", "155 points"],
        ["5,000 and up", "180 points"],
    ]),
    ("h2", "Card values for meld points"),
    ("p", "These are the point values used when adding up a meld:"),
    ("table", ["Card", "Points"], [
        ["Joker", "50"],
        ["2 (deuce) and Ace", "20"],
        ["K, Q, J, 10, 9, 8", "10"],
        ["7, 6, 5, 4", "5"],
    ]),
    ("h2", "Test 2: a clean set"),
    ("p", "Your opening meld must include **at least one set of three or more natural cards** (no wilds). The partner who opens may add up to **two wild cards** to a set of natural cards. **This is the only time wilds can go onto a set before it has five natural cards.**"),
    ("h2", "The one exception: deuces and jokers only"),
    ("p", "You may open with a meld made **only of deuces and/or jokers**. This is the only way to open without a clean natural set. It must still reach the point minimum (125, 155 or 180). See chapter 7 for how to score and close these."),
    ("note", "diff", "**Differs from official rules.** *Group notes:* you may open with deuces and/or jokers only. *Official:* the opening meld must include a clean triple of natural cards, so a wilds-only opening is not allowed."),
    ("h2", "After you open: the talon"),
    ("ul", [
        "The **first team** to open takes **4 cards** (a talon) from the draw pile and places them face down in front of the player who opened. Use them on your next turn.",
        "The **second team** to open takes **3 cards**.",
        "**Only early in the round:** you get a talon only if **at least 9 cards** are left in the draw pile when your team opens. With 8 or fewer, no talon is given.",
        "If you are picking up the pack as part of your opening meld, you do **not** get a talon.",
    ]),
    ("note", "check", "**Check with your group.** The notes say the second team can use wilds \"at the time one partner melds\" even if they have fewer than five natural cards. Confirm exactly what that exception allows."),
)

# ---------------------------------------------------------------- 6
ch("6. After you have opened",
    ("h2", "Adding to melds"),
    ("ul", [
        "Any **new** number you lay down must be a set of **three or more natural cards** (no wilds).",
        "You may add **wild cards to a set only once it has five natural cards**. You can add up to **two wilds** to that set, making a seven-card dirty canasta.",
        "Natural cards of the same number can always be added to a set you have already melded.",
    ]),
    ("h2", "Closing a canasta"),
    ("p", "When a set reaches seven cards, it is a canasta. **Close it** by squaring up the pile and placing a card on top:"),
    ("ul", [
        "**Clean canasta:** put a **red** card on top.",
        "**Dirty canasta:** put a **black** card on top.",
    ]),
    ("p", "Move the closed canasta to the top of your play area, next to your 3s."),
    ("note", "tip", "**Tip.** When a set has six cards, turn the sixth card **sideways at the bottom** of the pile. Everyone can then see you need just one more card."),
    ("h2", "Special numbers: 7s and Aces"),
    ("p", "These two numbers are high risk."),
    ("ul", [
        "**7s must always be played clean.** If the round ends and your 7s are not closed into a canasta, that is **-2,500 points**.",
        "**Aces can be played clean or dirty.** But if you meld them clean, they **must stay clean and must be closed** before the round ends or you lose **2,500 points**.",
        "Keeping **two or fewer** 7s and Aces in your hand at the end of the round is safe. Holding **three or more** costs **-1,500 points**, plus their face value.",
        "A **natural canasta of 7s or Aces** is worth **+2,500 points**.",
    ]),
    ("note", "warn", "**Penalty alert.** Do not start 7s or clean Aces unless you are confident you can finish them. Discard extra 7s and Aces once your team has opened."),
    ("h2", "Picking up the pack"),
    ("p", "On your turn, you may take the whole discard pile. To do so you must:"),
    ("ul", [
        "have **already opened** (melded), and",
        "hold **two natural cards** of the same number as the **top card** of the pack. You cannot pick up the pack if the top card is a wild.",
    ]),
    ("p", "**Opening exception:** if you have not opened, you may still pick up the pack if you can make your full opening meld **without** using the top card or the two cards in your hand that match it. Set that top card and your pair aside. The rest of your hand must make the 125/155/180-point meld. You get **no talon** in this case, and you must discard onto an empty tray (so no Ace, 7, wild or dead card)."),
    ("note", "diff", "**Differs from official rules.** *Group notes:* you must have already opened and hold a natural pair that matches the top card. *Official:* take the top card and use it at once, either with two matching naturals from your hand or by adding it to an existing meld. Then the rest of the pack is yours. You cannot take the pack if your team already has five or more cards in that rank."),
)

# ---------------------------------------------------------------- 7
ch("7. Deuce and joker melds",
    ("p", "A meld made only of deuces and/or jokers is a high-reward, high-risk play. The rules come from the January 21 and 28 class notes."),
    ("h2", "When you can meld them"),
    ("ul", [
        "As your **opening meld** (if the points reach 125, 155 or 180), or",
        "**Any time after your opening meld.**",
    ]),
    ("h2", "Scoring for deuce and joker canastas"),
    ("table", ["Canasta of", "Points"], [
        ["Only deuces (7 or more)", "+3,000"],
        ["All four jokers plus three 2s", "+2,500"],
        ["Deuces with one to three jokers", "+2,000"],
        ["Not closed when the round ends", "-2,000"],
    ]),
    ("h2", "Close them first"),
    ("p", "Once you start a deuce and/or joker meld, **you cannot add wilds to any other meld until that wild canasta is complete.** Close it first. Closing it is worth at least +2,000, and leaving it open costs -2,000."),
    ("note", "warn", "**Penalty alert.** An unfinished deuce or joker meld at the end of the round is a **-2,000** swing. Do not open with it unless you can complete it."),
)

# ---------------------------------------------------------------- 8
ch("8. Ending the round and scoring",
    ("h2", "How a round ends"),
    ("ul", [
        "A player **goes out**, or",
        "the **draw pile runs out**.",
    ]),
    ("h2", "How to go out"),
    ("p", "You can go out only if all three are true:"),
    ("ol", [
        "Your team has completed **two canastas**.",
        "You can meld all but one card and **discard your last card**.",
        "Your **partner agrees**.",
    ]),
    ("ul", [
        "**Ask your partner first.** You may ask only **once** per round.",
        "You **cannot** go out by melding your whole hand. You must have a card left to discard.",
        "The final discard goes **face down**. This is the only time you may discard a wild card or a 3.",
    ]),
    ("note", "diff", "**Differs from official rules.** *Group notes:* ask your partner (once). The last discard is face down and may be a wild or a 3. *Official:* partner permission is not mentioned. The last discard can be any card except a 3. You cannot go out with an unfinished meld of Aces, 7s or wilds on the table. The team that goes out gets a +100 bonus."),
    ("h2", "What counts toward your score"),
    ("table", ["Item", "Points"], [
        ["Clean canasta", "+500"],
        ["Dirty canasta", "+300"],
        ["Natural canasta of 7s or Aces", "+2,500"],
        ["Cards on the table (including cards in canastas)", "Face value (see chapter 5)"],
        ["One red or black 3", "100"],
        ["Two 3s", "300"],
        ["Three 3s", "500"],
        ["Four 3s", "1,000"],
        ["Deuce/joker canastas", "See chapter 7"],
    ]),
    ("h2", "The 3s rule"),
    ("ul", [
        "**Two canastas** at round end: your 3s **add** to your score.",
        "**One canasta**: your 3s are **neutral** (they do not count).",
        "**No canastas**: your 3s **count against you**.",
        "Any 3s still **in your hand** at the end count against you, scored as if they were on the table.",
    ]),
    ("h2", "No canastas at all"),
    ("note", "warn", "**Penalty alert.** If your team has **no canastas** when the round ends, **every card in your hand and on the table counts as negative points.**"),
    ("h2", "Calculating your round score"),
    ("ul", [
        "**Team that went out:** add up canasta bonuses, 3s, and the value of all melded cards. Subtract the value of cards left in your hand.",
        "**Other team:** add up the value of your melded cards and canasta bonuses, then subtract the value of cards left in your hand. Then apply any 3, 7 and Ace penalties.",
        "If the other team goes out and you still have an **untouched talon**, those cards are **neutral**. They do not count against you.",
    ]),
)

# ---------------------------------------------------------------- 9
ch("9. Strategy tips for new players",
    ("ol", [
        "**Count 7s and Aces every turn.** Keep no more than two in hand and discard extras once your team has opened.",
        "**Get a canasta on the table early.** One canasta turns the 3s neutral. Two canastas also let you go out.",
        "**Never end a round with zero canastas.** Everything turns negative.",
        "**Do not open with deuces or jokers unless you can close them.** An open deuce meld is -2,000.",
        "**Save your wilds.** Use natural cards first. Wilds are most valuable on a set that already has five naturals.",
        "**Watch the draw pile.** Talons are only given while 9 or more cards remain, so opening early earns you extra cards.",
        "**Track dead numbers.** Once a number has a canasta, you can neither meld it nor safely discard it into an empty tray.",
        "**Talk to your partner.** Announce when you hold two cards. Ask to go out only when you are sure, since you get just one ask.",
        "**Discard safely.** Prefer low-value cards and numbers the other team has not melded.",
        "**Hold pairs.** Two natural cards of the same number let you pick up the pack when the top card matches.",
    ]),
)

# ---------------------------------------------------------------- 10
ch("10. A sample round",
    ("note", "check", "**Illustrative only.** The numbers below use the standard card values from chapter 5 to show how a round flows."),
    ("h2", "Setup"),
    ("p", "Our team has 0 points, so the opening meld needs **125**. After your draw you hold 14 cards: K K K, Q Q Q, J J J, a joker, and a 4, 5, 7 and 9."),
    ("h2", "Your turn"),
    ("ol", [
        "No 3s to lay down. You draw a card.",
        "You check the opening meld: three Ks (30) + three Qs (30) + three Js (30) + a joker added to the Js (50) = **140 points**. There are clean sets, and only one wild is used. That beats 125.",
        "You lay those ten cards down. This is your opening meld.",
        "You discard the 4. You now hold 5, 7 and 9, which is more than the two-card minimum.",
        "As the **first team to open**, you take a **4-card talon** and place it face down. Use it next turn.",
    ]),
    ("h2", "Later in the round"),
    ("ol", [
        "Your partner adds natural Ks to your King set until it has seven. They close it with a **red card** on top: a **clean canasta**.",
        "Later your team builds a dirty canasta of Qs (five natural plus two wilds) and closes it with a **black card**.",
        "With two canastas, a player asks their partner: \"May I go out?\" Partner says yes. The player melds all but one card and discards it **face down**.",
    ]),
    ("h2", "Scoring (illustrative)"),
    ("table", ["Item", "Points"], [
        ["Clean canasta", "+500"],
        ["Dirty canasta", "+300"],
        ["Two 3s", "+300"],
        ["Cards on the table (example total)", "+1,200"],
        ["Cards left in the other partner's hand", "-85"],
        ["Round total", "2,215"],
    ]),
)

ch("11. Special hands (Modern American Canasta)",
    ("p", "Modern American Canasta adds **9 special hands and 2 dream hands**. Each one uses **all 14 cards** in your hand (your 13 plus the card you draw) in a particular pattern, with **no discard**. A special hand pays a big bonus, from 2,000 up to 8,500 points."),
    ("h2", "Rules that apply to every special hand"),
    ("ul", [
        "**No 3s are allowed**, except in the Straight (which must use a 3).",
        "**All 14 cards must be used.** You cannot discard.",
        "A \"shape\" such as 4,3,3,2,2 means the sizes of your groups of same-number cards. Add them up and you get 14.",
        "\"Matching wilds\" are wild cards that match each other (for example, two 2s or two jokers).",
    ]),
    ("h2", "The 9 special hands"),
    ("table", ["Hand", "Shape", "What you need", "Points"], [
        ["Pairs with 1 wild", "7 pairs", "7 pairs, including deuces OR jokers (one kind of wild), and Aces and 7s", "2,000"],
        ["Pairs without wilds", "7 pairs", "7 pairs, no wilds", "2,500"],
        ["Miami pairs", "7 pairs", "7 pairs including jokers, deuces, Aces and 7s", "2,500"],
        ["Zip code", "4-3-3-2-2", "No wilds, OR with 1 or more matching wilds in any position (anything goes)", "2,500"],
        ["Straight", "A to K + joker", "One of every rank, Ace through King, plus a joker. Must use a 3", "3,000"],
        ["Garbage", "4-4-3-3", "Two sets of four and two sets of three. No wilds", "3,000"],
        ["Blast off", "5-4-3-2", "May use 1 matching wild in any position", "3,000"],
        ["Triples", "4-4-4 + 2 wilds", "Three sets of four of a kind, plus a pair of matching wilds", "3,500"],
        ["Quads", "3-3-3-3 + 2 wilds", "Four sets of three of a kind, plus a pair of matching wilds", "3,500"],
    ]),
    ("h2", "The 2 dream hands"),
    ("table", ["Hand", "Shape", "What you need", "Points"], [
        ["Dream hand +4", "5-5 + 4 wilds", "Two sets of five of a kind, plus 4 matching wilds", "8,500"],
        ["Dream hand +5", "5-4 + 5 wilds", "One set of five, one set of four, plus 5 wilds of any kind", "8,500"],
    ]),
    ("note", "check", "**Check with your group.** A second printout lists Miami Pairs at **3,000** (the reference card and the official rules say 2,500). It also shows a single Dream Hand of five, four and five of a kind (5-4-5) for 8,500, with no wild-card requirement, instead of two dream hands. This booklet follows the reference card."),
    ("note", "tip", "**Tip.** Check your starting 13 cards for a pattern. Many pairs, or several groups of three or four, can point to a special hand. A hand with a lot of wilds may be a better fit for a dream hand."),
    ("h2", "When and how to declare one (official rule)"),
    ("p", "The reference card shows the patterns and points. The official rules add how a special hand is played:"),
    ("ul", [
        "**When:** before your team's opening meld, or on your **first turn after your partner opens**. After that, the chance is gone for the round.",
        "**Last card:** your 14th card must come from the **draw pile**. You cannot pick up the pack to complete a special hand.",
        "**Dead cards** may be used in a special hand.",
        "**Result:** you lay down your whole hand and **the round ends at once**. You score the flat points only, with no card count, no going-out bonus and no penalty for cards in your partner's hand. The other team scores its own hand normally.",
        "**Dream hands** (8,500) equal the winning score, so they **win the game outright**.",
    ]),
    ("note", "diff", "**Differs from official rules.** *Reference card:* Blast Off allows 1 matching wild, and Dream hand +5 uses 5 wilds of any kind. *Official:* Blast Off allows matching wilds, and the wild set in Dream hand +5 may be mixed or matching. All other patterns and points agree."),
)

# ---------------------------------------------------------------- 12 cheat sheet
ch("12. One-page cheat sheet",
    ("h2", "Your turn"),
    ("p", "1. Lay down 3s and replace them.  2. Draw.  3. Meld.  4. Discard (never a 3 or a wild)."),
    ("h2", "Opening meld"),
    ("table", ["Team score", "Points needed", "Must include"], [
        ["Under 3,000", "125", "A clean set of 3+"],
        ["3,000 to 4,999", "155", "A clean set of 3+"],
        ["5,000+", "180", "A clean set of 3+"],
    ]),
    ("p", "Exception: deuces/jokers only, if points are enough. Talon: **4** cards if first to open, **3** if second, only if 9+ cards are left in the draw pile."),
    ("h2", "Canastas"),
    ("table", ["Type", "Cards", "Top card", "Points"], [
        ["Clean", "7 natural", "Red", "+500"],
        ["Dirty", "5 natural + up to 2 wild", "Black", "+300"],
        ["Deuces only", "7+ deuces", "-", "+3,000"],
        ["4 jokers + three 2s", "7", "-", "+2,500"],
        ["Deuces + 1 to 3 jokers", "7+", "-", "+2,000"],
        ["Natural 7s or Aces", "7 natural", "Red", "+2,500"],
    ]),
    ("h2", "Penalties"),
    ("table", ["Mistake", "Cost"], [
        ["Deuce/joker canasta not closed", "-2,000"],
        ["7s not closed", "-2,500"],
        ["Clean Aces not closed", "-2,500"],
        ["3 or more 7s/Aces in hand", "-1,500 + card value"],
        ["No canastas", "Everything counts negative"],
    ]),
    ("h2", "3s"),
    ("p", "1 = 100, 2 = 300, 3 = 500, 4 = 1,000. Two canastas: you gain them. One canasta: neutral. None: you lose them."),
    ("h2", "Going out"),
    ("p", "Two canastas + partner says yes (ask once) + discard last card face down. First team to 8,500 wins."),
    ("h2", "Special hands"),
    ("p", "All 14 cards, no 3s (except Straight), no discard. 2,000 to 3,500 for the 9 special hands, 8,500 for the 2 dream hands. Full list in chapter 11."),
)

# ---------------------------------------------------------------- 12
ch("13. Questions to confirm with your group",
    ("p", "The official rules settled most of the unclear points in the original notes. These remain open."),
    ("ol", [
        "**Wilds in the opening meld.** The notes say the second team can use wilds when one partner melds, even without five natural cards. The official rules do not mention this. Confirm what it allows.",
        "**Differences from the official rules.** Review chapter 14 and decide, rule by rule, whether your group follows its own notes or the official rule.",
    ]),
)

# ---------------------------------------------------------------- 14
ch("14. Our notes vs. the official rules",
    ("p", "Your notes match the official Modern American Canasta rules (Canasta League of America, canastaleague.org) on the opening thresholds, card values, canasta and 3s scoring, the 7s and Aces penalties, the deuce and joker canasta values, and every special-hand point value. These are the places that differ. The booklet follows your group's notes for now."),
    ("table", ["Topic", "Our group's notes", "Official rules"], [
        ["Opening with deuces/jokers only", "Allowed", "Not allowed. The opening meld needs a clean triple"],
        ["Going out", "Ask partner once. Final discard face down, may be a wild or a 3", "No partner permission mentioned. Final discard is any card except a 3. Cannot go out with unfinished Ace, 7 or wild melds. +100 bonus"],
        ["Cards kept after melding", "Two", "At least one"],
        ["Picking up the pack", "Must have opened and hold a natural pair", "Use the top card right away, with a natural pair or on an existing meld. Not allowed if you already have 5+ of that rank"],
        ["3s", "Always laid down at the start of your turn. May be the final discard", "May be held for a special hand. Never discarded"],
        ["Blast Off and Dream +5 wilds", "Blast Off: 1 matching wild. Dream +5: 5 wilds of any kind", "Blast Off: matching wilds. Dream +5: mixed or matching wild set"],
    ]),
    ("p", "The official rules also say that if you hold only Sevens, Wilds, Aces or dead cards when the discard tray is empty, you must take back melded cards (most recent first) until you have a legal discard."),
    ("p", "Table habits that appear only in your notes: the red or black topper card on a canasta, the sideways sixth card, announcing two cards, and an unseen talon counting as neutral."),
)
