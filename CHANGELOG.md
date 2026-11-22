# Changelog

## 2026-11-22 — Calmer tree on phones
- On phones, story chapters now change their highlighting while the tree is faded out, and the pulsing glows on faces and the twinkling memory stars inside the tree hold still, so the phone isn't constantly redrawing the whole tree.
- The theater sign is drawn on its own layer so it no longer flickers when things change behind it.

## 2026-11-22 — Story steps on phones, smaller sign
- On phones, moving between story chapters now fades the tree out and back in at its new spot instead of sliding, which stops the flickering "double picture".
- The theater sign is smaller on phones, leaving more room for the tree.
- Ending the story on a phone returns to the usual close-up of the family instead of the whole tree.

## 2026-11-22 — Smoother story on phones
- Moving between story chapters now glides the tree as one picture instead of redrawing it frame by frame, so the leaves and faces move together without stuttering or jumping. The highlighting of each chapter's people now happens once the move has finished.

## 2026-11-22 — Family photos on the opening card
- The slowly scrolling family photos are back on the opening screen, now inside the card only, softly faded so the words stay easy to read. The curtains around it stay clean.

## 2026-11-22 — More hanging stars
- About twice as many gold stars now hang from the curtain, in different sizes and at different drops, filling the open sky beside the tree (and the gap under the sign on phones) without covering any faces.

## 2026-11-22 — Sign at the top, buttons at the bottom
- The marquee sign and the newest-memory line now sit at the very top of the stage, hanging over the curtain.
- The buttons moved to a row along the stage edge at the bottom; the Program menu opens upward.
- The whole family now fits between the sign and the buttons when the tree opens or you press Fit.

## 2026-11-22 — Smoother curtain opening
- The curtains no longer jump or bounce before they open. They now wait for the screen to finish going full screen, and the curtain frame no longer changes shape as the phone's bars slide away.

## 2026-11-22 — Everything on stage
- The tree now stays full screen; there's no way to accidentally leave the stage.
- A "Program" menu at the top opens the Chart, Map, Timeline and Sources, and a "Can you help?" button opens the family questions. Each opens as a page over the stage; "Back to the tree" (or Escape) closes it.

## 2026-11-22 — Opening curtain
- The opening screen is now a closed red stage curtain, with the dedication, title, faces and both buttons on a gold-edged card in front.
- The tree is already standing behind the curtain. Choosing either button pulls the curtains open to reveal it — no more growing animation, so it opens smoothly on phones.

## 2026-11-22 — The stage
- The tree now stands on a little theater stage: red curtains with gold fringe, a painted backdrop with cut-out clouds and gold stars on strings, footlights along the bottom, gold-rimmed sun and moon, and engraved shading on the trunk and planet.
- The family name is a lit marquee sign fixed at the top, with the newest memories just under it.
- The tree always opens at night. The sky button still switches to sunset during a visit.
- Simpler controls: the search box, zoom buttons and larger-text button are gone (pinch or scroll to zoom).

## 2026-11-22 — Worn paper name scrolls
- Name scrolls and the family banner now look like old, worn paper: slightly rough, torn edges, aged colouring that darkens toward the edges, a faint stain here and there, and shaded ribbon ends that fold behind.
- Fixed the dotted outline that showed around the scrolls when zoomed in.

## 2026-11-22 — Constellations off, banner raised
- The G and H constellations beside the banner are hidden for now.
- The family banner and the newest-memory line sit higher in the sky, with clear space between them and the top of the tree.

## 2026-11-22 — In the sky: title banner, newest memory, family constellation
- A large paper banner above the tree reads "The Graham & Harper Family".
- Just under it, a small line shows the newest memories as they're shared ("Pam shared a memory about Ed · 2 hours ago"), changing every few seconds. Tap it to read the memory. Before anyone has posted, it invites people to tap a face and share one.
- Two constellations flank the banner: a G for the Grahams on the left and an H for the Harpers on the right. Tap either one to read how Ed and Renee joined the two families, with a button to start the whole story.

## 2026-11-22 — Leaves on twigs
- Every leaf now grows from a twig or branch, in little sprigs, so no leaves float loose in the sky. The canopy is just as full as before.

## 2026-11-22 — Sun behind the trunk
- The setting sun now sits right behind the trunk when the tree first opens and whenever you press Fit, on any screen size.

## 2026-11-22 — Names centered under every photo
- Every name scroll now sits centered under its photo. Where two people were crowded, both the photo and the name move apart together, and their branches follow.
- More room along the planet for the brothers, their wives and the grandchildren, so their names no longer crowd each other.

## 2026-11-21 — Smoother tree growth on phones
- The leaves no longer flash while the tree grows on Android phones. The canopy is now painted in one smooth sweep as the tree grows.

## 2026-11-21 — No more jump after the tree grows
- The leaves no longer blink or shift sideways once the tree has finished growing.
- Name scrolls that were nudged apart no longer slide into place after they appear.

## 2026-11-21 — Tree grows in full
- When the tree first appears, the full painted canopy now grows out together with the branches, instead of a bare tree appearing first and the leaves filling in afterwards.

## 2026-11-21 — New painted tree
- The tree is now a full, hand-painted tree with a thick canopy of leaves and a sturdy trunk planted on the planet. The sky, moon, planet and hometown roots are unchanged.
- Names sit on small paper scrolls; neighbouring names no longer run into each other.
- Memory stars are bigger and brighter, and each one now twinkles in the leaves right beside the person the memory is about. Tap a star to read it.
- The printable poster uses the new tree too.

## 2026-11-21 — "For Mom"
- The dedication now reads "For Mom" everywhere: the welcome screen, the intro line, the poster, the last story chapter, and the note hidden in the moon and sun.

## 2026-11-21 — New background music
- New background song. It starts right away (no silent gap), plays its opening once, then loops smoothly without the ending fade-out.

## 2026-11-21 — Voice memories and safer posting
- Record a voice memory (up to 2 minutes) when sharing a story; typing is optional when there's a recording. Music pauses while recording and fades down during playback.
- Voice memories play from the person's card and from memory stars on the tree.
- Photo uploads are back — the option to add a photo was hidden after the move to GitHub.
- After too many wrong passcodes, adding is paused for 15 minutes.
- Posts can only be removed from the phone or computer that added them; the code that identifies a device is no longer visible in the shared data.
- Behind the scenes: the page is now built from separate source files.

## 2026-11-21 — Moved to GitHub Pages
- The tree now opens for anyone with the link — no account or sign-in.
- Shared memories, photos and answers are saved to Mat's Google Sheet. Adding something asks for the family passcode once per device.
- Search engines are asked not to list the site.
- Poster QR code now points to artificialfear.github.io/family-tree.

## 2026-11-21 — Smoother on phones
- Dragging and pinching now slide a ready-made picture of the tree instead of redrawing it every frame, then sharpen it when you let go.
- Moving updates are bundled into one per screen refresh; the page no longer re-measures itself while you drag.
- Lighter effects: fewer stars on phones, softer clouds without blur, no glowing shadows on hometown markers, no swaying foliage on phones, smaller background image on phones. Animations pause while dragging.
- Ending the story no longer pops open Renee's details over the tree.

## 2026-11-21 — Android fixes
- Lifting one finger after a pinch no longer makes the tree jump to a different spot.
- The tree's picture layers stay ready all the time, so starting or ending a drag no longer flashes.
- Long, fast drags refresh the picture before its pre-drawn edges run out, instead of showing blank patches.
- The phone's address bar appearing/disappearing mid-drag no longer snaps the view.
