# Wallbound Prototype: Start Here

Open `index.html` in a browser to play the current prototype.

This version is now a wall defence roguelite instead of a standard path tower defence game.

## Current Development Goal

The current goal is a short, satisfying 3-battle prototype loop.

The game should feel playable before adding large new systems. Prioritise balance, readability, and clear feedback over new content.

Do not add bosses, save data, large skill trees, or mobile packaging until the basic battle loop feels fun.

## Do Not Add Yet

Avoid adding these until the core loop feels good:

- Full save system.
- Boss battles.
- Large hero skill trees.
- Multiple maps.
- Online features.
- Complex animations.
- Mobile app packaging.

These are later features. For now, improve the prototype loop.

The current game has:

- Enemies starting at the top and pushing toward the wall.
- Most enemies move straight downward.
- Zigzag enemies move in readable phases: straight, lean/prep, weave, then recovery.
- Ranged enemies stop and shoot the wall.
- Brawler enemies hit the wall and bounce back.
- Armoured enemies reduce direct damage until Earth breaks their armour.
- Elemental enemy immunity: some enemies resist Fire, Ice, or Storm.
- Enemies show letter markers and small trait badges so their role is easier to read.
- Brawlers are drawn heavier, zigzag enemies have a motion slash, and immunity badges appear above enemies.
- Armoured enemies show an `A` marker, which changes to cracked/broken when Earth breaks armour.
- Trainable party members: Fire, Ice, Storm, Poison, and Earth.
- Poison and Earth are first-pass party members for combo testing.
- One simple mainstay Archer stands in the centre of the wall lineup and fires neutral physical arrows.
- The wall lineup is a 5-slot formation: Party, Party, Main Hero, Party, Party.
- If fewer than four party members are selected, empty party slots are shown as inactive placeholders.
- Fire starts as a single bolt with burn damage over time.
- Ice starts as a single freeze and slow.
- Storm starts as a single lightning strike.
- Temporary battle upgrades that can add fire spread, ice splash, lightning chain, or lightning pierce.
- Temporary upgrades are stronger and clearly marked as battle-only.
- Upgrade choices are labelled by role, such as Fire, Ice, Storm, Poison, Earth, Archer, Wall, Combo, or All.
- Upgrade choices use plain numeric wording where possible.
- Archer temporary upgrades are limited to damage and attack speed for now.
- Temporary combo upgrades appear only when the matching party members are selected.
- Permanent hero training bought with loot secured from battles.
- Permanent wall upgrades bought with loot between battles.
- Fortify increases maximum wall strength.
- Spikes damage melee enemies when they reach the wall.
- A capped 3-battle loop with 5 waves per battle.
- Battle 1 starts simple, battle 2 adds more pressure, and later waves introduce tougher enemy traits.
- Battle results explain why you won or lost, how loot was calculated, and what pressure to answer next.
- A small `gameSpeed` multiplier keeps the prototype moving faster while testing.
- Enemy previews appear before each wave so the player can see expected enemy types and traits.
- The first wave preview lets the player go back to training before committing to the battle.
- Between waves, the planning screen shows the upcoming preview above the temporary upgrade choices.
- Between waves, the player chooses one upgrade, then starts the previewed wave.

## Character Structure

Wallbound is moving toward a 5-character wall party:

`Party Member | Party Member | Main Hero | Party Member | Party Member`

For this prototype:

- Main Hero: Archer.
- Archer is always in the centre slot.
- Archer deals neutral Physical damage.
- Archer is tuned as steady baseline damage, not the whole build.
- Archer only has modest temporary damage and attack speed upgrades.
- Party Members: choose up to four from Fire, Ice, Storm, Poison, and Earth.
- If fewer than four party members are selected, empty party slots are shown as inactive placeholders.

Do not add selectable main heroes, roster screens, gear, critical hits, special arrows, or skill trees yet.

## Damage Types

The planned full damage roster is:

- Physical: reliable neutral damage, mainly Archer for now.
- Fire: burn damage over time and future spread effects.
- Ice: freeze, slow, and control.
- Storm: lightning burst, chain effects, and pierce.
- Poison: damage over time, weakening, and attrition pressure.
- Holy: defensive support, cleansing, anti-corruption damage, and shielding.
- Shadow: curses, life drain, fear, ramping damage, and debuffs.
- Arcane: raw magic, resistance piercing, unstable blasts, and random magical effects.
- Earth: armour breaking, stun, heavy impact, barriers, and terrain slow.
- Wind: knockback, speed manipulation, multi-hit slicing, and pushing enemies away.
- Blood: bleed damage, lifesteal, executes, and bonus damage against wounded enemies.

Physical, Fire, Ice, Storm, Poison, and Earth are active in the current prototype. The other damage types are documented for later.

## Upgrade Rules

Permanent upgrades are predictable individual training buttons:

- Fire, Ice, Storm, Poison, and Earth can be trained from the bottom controls.
- Permanent training can apply to any unlocked party member, but only selected party members appear in the current battle formation.
- Archer is not part of the training controls yet; the Main Hero remains simple for this phase.

Temporary upgrades are battle-only and can create synergy:

- Some upgrades improve one party member for the current battle.
- Some combo upgrades only appear when the required party members are selected.
- Examples currently include Fire plus Poison, Ice plus Earth, Storm plus Poison, and Earth helping Archer.

## Enemy Counterplay

Zigzag enemies:

- Move slower than before.
- Use a readable movement cycle: straight, prep/lean, active weave, recovery.
- During active weave, direct projectiles such as Archer arrows can miss.
- If Fire narrowly misses during the weave, it applies a weaker graze burn instead of doing nothing.

Armoured enemies:

- Reduce incoming direct damage while armour is active.
- Earth prioritises armoured enemies in range.
- Earth hits break armour for a short time and reduce armour.
- While armour is broken, Archer and other direct damage are much more effective.
- Current armoured enemies: Ashguard and Brawler.

Party targeting direction:

- Earth currently has the first role-based targeting rule.
- Earth checks for active-armour enemies in range first.
- If no armoured enemy is in range, Earth falls back to normal closest-to-wall targeting.
- Future party members may get targeting personalities later, but they are not implemented yet.

## The Best Place To Start Learning

Start with `game.js`.

Read it in this order:

1. `heroConfig`
   This defines Fire, Ice, Storm, Poison, Earth, and the simple Archer base damage, cooldown, range, and effects.

2. `damageTypeRoster`
   This lightly documents the current and future damage types without implementing a full damage system yet.

3. `enemyConfig`
   This defines enemy health, markers, movement pattern, wall damage, ranged attacks, bounce behaviour, and immunities.

4. `tempUpgradePool`
   This is where the battle-only upgrades live, including Archer upgrades and selected-party combo upgrades.

5. `state`
   This is the current run: battle number, wave, loot, wall health, hero formation, enemies, projectiles, and temporary upgrades.

6. `mainHeroKind` and `partyMemberSlots`
   These define the simple 5-slot party formation. Archer is the current Main Hero.

7. `partyRosterKinds`, `showPartySelection`, `refreshPartyPickerButtons`, and `selectedPartyKinds`
   These power the simple pre-battle party picker.

8. `layoutHeroes`
   This turns the formation into five visible wall slots.

9. `wallLevels`, `wallUpgradeCost`, and `wallSpikeDamage`
   These are the first permanent wall upgrade systems.

10. `spawnEnemy`
   This chooses which enemies appear during each wave and controls the 3-battle difficulty curve.

11. `chooseEnemyKind`, `wavePreview`, `buildWavePreview`, `showWavePreview`, and `enemyTraitText`
   These build the enemy preview shown before each wave.

12. `showTempUpgradeChoices` and `upgradeAvailable`
   This is the between-wave planning screen: next-wave preview first, temporary upgrades underneath, then Start Wave after an upgrade is chosen.

13. `updateEnemies`, `updateHeroes`, and `applyHeroHit`
   These are the heart of the game logic.

14. `findTarget`, `findArmouredTarget`, and `hasActiveArmor`
   These contain the first role-based targeting rule: Earth prioritises active armour.

15. `updateZigzagMovement`, `projectileMissedEvasiveTarget`, and `applyFireGrazeBurn`
   These make zigzag enemies evasive in a readable, phase-based way.

16. `directDamageAfterArmor`, `poisonEnemy`, `earthImpact`, and combo helper logic near `applyHeroHit`
   These are the first-pass Poison, Earth, and combo behaviours.

17. `endBattle`, `battleOutcomeText`, and `showBattleResult`
   These explain the reward and why the player won or lost.

18. `drawHeroes`, `drawFormationLabels`, and `drawEmptyHeroSlot`
   These draw the 5-slot party formation, Main Hero label, Party labels, and inactive empty slot.

19. `drawEnemies`, `drawZigzagMark`, `drawArmorMarker`, and `drawEnemyTraitBadges`
   These make enemy roles and traits visible during play.

20. `battleLesson`
   This turns battle pressure into a short teaching note after a win or loss.

21. `drawGame`
   This is the visual rendering.

## First Good Changes To Try

Try changing only numbers first:

- Make Fire burn longer.
- Make Ice freeze longer.
- Make Storm shoot faster.
- Increase wall health.
- Make Fortify add more wall strength.
- Make Spikes deal more contact damage.
- Make ranged enemies shoot slower.
- Make brawlers hit harder.
- Adjust the clear bonus in `battleClearBonus`.
- Change which enemies appear in battles 1, 2, and 3.

## Small Code Rule

Keep hero and effect colors as six-digit hex values like `#f95738`.

The `withAlpha` helper in `game.js` expects hex colors. Named colors like `red` or CSS strings like `rgba(...)` should not be passed into hero/effect color fields unless `withAlpha` is updated first.

Next prototype improvements should stay focused on feel:

- Make upgrade choices easier to compare.
- Improve enemy readability during busy waves.
- Tune battle length.
- Tune loot costs and rewards.
- Adjust `gameSpeed` while testing.
- Make the Archer feel satisfying without overpowering party members.
- Make the empty party slot visually clear without feeling broken.
- Improve the between-wave planning screen layout.
