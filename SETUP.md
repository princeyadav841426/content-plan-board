# Swatti content plan — the live link

## It's already online

**https://swatti.cutlume.com**

Nothing to install, nothing to upload. Open it on any phone, iPad or laptop. Swatti opens the
same link — she doesn't need an account, a login, or the Claude app.

Hosted on GitHub Pages from your own GitHub account (`princeyadav841426`), repo
`content-plan-board`, with `swatti.cutlume.com` pointed at it by a CNAME in your Cloudflare
zone. `princeyadav841426.github.io/content-plan-board/` still works and redirects here. The
page carries `noindex` and a blocking `robots.txt`, so Google won't list it — but treat it like
any unlisted link: whoever has it can read it.

---

## Two views, one link

Top right of the header: **Swatti** / **Studio**. Same page, two interfaces. The choice is
remembered on that device and is never shared — switching to Studio on your laptop cannot
change what she sees on her phone. She opens the link and lands in her view every time.
`swatti.cutlume.com/#studio` opens straight into yours.

**Swatti's view.** This week, in order. Each post opens to a **shot table**: one row per shot,
left column saying how close to stand (WIDE · MEDIUM · CLOSE · MIRROR · POV), whether the phone
is on the tripod or in her hand, what she actually does and how many seconds to film it — right
column a 9:16 frame holding the reference photo or clip for that exact shot. Then the line to
say or put on screen, and a note box. One tick box per post. Plus the weekly "what does your
week look like" box she types or records into. Nothing about the pipeline, no counts, no
editing.

Shot counts are deliberately uneven. The Friday 2 Oct outfit reel is **one** shot filmed five
times; the 6am films run to six or seven. The video decides, not a template.

**Posted turns green.** Set a post to Posted in the pipeline and the card, the calendar chip and
the sidebar dot all go green — the one place a second colour is used on the page, and it means
exactly one thing: this is live on her account.

**Studio (yours).** Everything above, plus:

- **Where it is** — a five-step pipeline on every post: Planned · Filmed · Edited · Approved ·
  Posted. Tap a step to set it. Her tick box sets Filmed; the rest is yours.
- **From Swatti** — a sidebar inbox collecting everything she's sent: week notes, voice notes,
  per-post comments. Tap one to jump to it.
- **Edit the words** — a button inside each post opens the title, one-liner, shot list and
  on-screen text for editing. Saves as you type. To make something bold, put `*stars*` around
  it — no HTML, and the tags never appear in the box. The shot list is one shot per line:
  `ANGLE | tripod or hand | what she does | seconds`. A line with no bars is a step that isn't
  a shot (the voiceover instructions, for instance).
- The month calendar carries the pipeline stage, the counts and the full schedule table.

Down the left on a laptop: the month's progress, a mini calendar of every post (a corner mark
is a filming morning), and the week list. On a phone that sidebar moves into **Full month**.

---

## Adding reference shots and clips

**Photos and video, both.** Clips are capped at **15 seconds** each — long enough to show an
angle, short enough that the page stays quick. Anything longer is refused with the actual
length in the message, so you know exactly what to trim.

Available in **both views**, on every post, with no mode to switch on first. Each one goes into
**the row of the shot it belongs to**, not one pile at the top of the post.

- **Drag photos or clips onto a row's frame.** Several at once is fine, mixed is fine.
- **Tap the frame** to browse — this is the one that works on a phone or iPad.
- **⌘V** pastes a copied image into whichever row the pointer is over.

Every message under a frame says what happened and how many references that shot now holds.
If a drop arrives as a link rather than a file — which is what dragging out of a browser tab or
a chat window does — it says so and tells you to tap instead, rather than failing silently.

Photos are re-sized in the browser to fit inside **720 × 1280** before they're stored; the shape
is never touched, so a landscape photo just becomes a smaller landscape photo. Clips are kept as
they are. Every frame is a fixed 9:16 box with `object-fit: contain`, so a square screenshot, a
wide photo and a vertical clip all sit in identically-sized frames and **none of them are ever
stretched**. Everything is held as a real file in the browser's own media store, not squeezed
into text storage — which is why photos used to silently vanish on reload once you'd added a
dozen, and no longer do.

**Nothing is ever removed on its own.** A reference, a note, a voice note or an edited line
stays until somebody presses its delete button. Re-editing the shot list is the one thing that
moves references: adding or removing a line shifts the frames below it, because a frame belongs
to a row number.

Until live sync is on, those files live on **that device only** — she won't see yours and you
won't see hers. That's the one remaining reason to do the Supabase step below.

## Voice notes

Record straight in the page — it's an https link, so the microphone works. Safari asks for
permission the first time.

- **Throw this one away** appears while recording, if it started badly.
- After it saves: **Record again** replaces it, **Delete** removes it. As many retakes as she
  wants — only the last one is kept.
- **"or choose an audio file"** is always there if she'd rather send a file.

---

## The one thing still missing: live sharing

Right now every person's ticks, notes, photos and voice notes stay **on their own device**.
She won't see your reference shots and you won't see her ticks.

Fixing it needs a free Supabase project, and creating an account is something only you can do.
It's about two minutes, and then I wire up the rest.

1. **supabase.com → New project.** Name it `swatti-plan`, pick the region closest to Dubai.
   Save the database password somewhere.
2. Wait for it to finish (about two minutes).
3. **Project Settings → API.** Copy two things and paste them to me in chat:
   - **Project URL** — looks like `https://abcdefgh.supabase.co`
   - **anon public** key — the long one labelled `anon` `public`

That's your whole part. I run the schema, put the keys in, redeploy, and test it. The line
under the tabs then reads **"Live — everything you change shows up on both your screens."**

> The anon key is *meant* to be public — it sits in the page's code and Supabase is built for
> that. There's nothing secret in `config.js`.

---

## Updating it

Everything lives in this folder, and the folder is the GitHub repo. Any change goes live with:

```
cd "/Users/mac/VSS Media/Swatti Tomar/Common/Tools/swatti-plan-site" && git add -A && git commit -m "update" && git push
```

GitHub rebuilds in about a minute. Same link, every time.

**Next month:** open `plan-data.js`, replace the content, push. At the top of that file set
`start` and `end` to the new month's real dates — that's what draws the calendar — and change
`storeKey` if you want the new month to start with a clean set of tick boxes.

**The domain:** `swatti.cutlume.com` is a DNS-only (grey cloud) CNAME to
`princeyadav841426.github.io` in your Cloudflare zone. Leave it unproxied — turning the orange
cloud on breaks GitHub's certificate renewal.

---

## If something's wrong

**"Saving on this device" won't go away.** That's expected until the Supabase step above is
done. After it, it means `config.js` has a typo — tell me and I'll check.

**Voice recording says the microphone is blocked.** Safari: `aA` in the address bar → Website
Settings → Microphone → Allow. It only works on the real https link — never on a preview pane,
a Claude artifact, or a file opened from the Mac.

**A photo won't upload.** Anything that isn't an image is ignored. Until live sharing is on,
photos are held in the browser, so keep them to a handful.
