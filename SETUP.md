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

**Swatti's view.** This week, in order. Each post opens to a step-by-step shot list, the line to
say or put on screen, and a note box. One tick box per post. Plus the weekly "what does your
week look like" box she types or records into. Nothing about the pipeline, no counts, no
editing.

**Studio (yours).** Everything above, plus:

- **Where it is** — a five-step pipeline on every post: Planned · Filmed · Edited · Approved ·
  Posted. Tap a step to set it. Her tick box sets Filmed; the rest is yours.
- **From Swatti** — a sidebar inbox collecting everything she's sent: week notes, voice notes,
  per-post comments. Tap one to jump to it.
- **Edit the words** — a button inside each post opens the title, one-liner, shot list and
  on-screen text for editing. Saves as you type.
- The month calendar carries the pipeline stage, the counts and the full schedule table.

Down the left on a laptop: the month's progress, a mini calendar of every post (a corner mark
is a filming morning), and the week list. On a phone that sidebar moves into **Full month**.

---

## Adding reference shots

Available in **both views**, on every post, with no mode to switch on first — that was the thing
that used to be hidden.

- **Drag photos onto the strip.** Several at once is fine.
- **Tap the box** to browse — this is the one that works on a phone or iPad.
- **⌘V** pastes a copied image into whichever post is open.

Photos are shrunk in the browser before they're stored, so the page stays fast. Landscape
references are shown whole, never cropped or squashed. Drop a video and it says so rather than
silently ignoring it — video references need live sync (below) switched on.

If a photo doesn't stick, the page now tells you why instead of failing quietly. Almost always
that means the browser's storage is full, which live sync fixes.

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
