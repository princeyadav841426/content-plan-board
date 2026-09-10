# Swatti content plan — the live link

## It's already online

**https://princeyadav841426.github.io/content-plan-board/**

Nothing to install, nothing to upload. Open it on any phone, iPad or laptop. Swatti opens the
same link — she doesn't need an account, a login, or the Claude app.

It's hosted on GitHub Pages from your own GitHub account (`princeyadav841426`), out of the repo
`content-plan-board`. The page carries `noindex` and a blocking `robots.txt`, so Google won't
list it — but treat it like any unlisted link: whoever has it can read it.

---

## Using it

**Her side.** Opens the link. Sees this week. Taps a post, reads the shot list, films it, ticks
it. Leaves a note on anything that didn't work. Writes or records what her week looks like in
the box at the top.

**Your side.** Tap **"Prince: edit"** in the header. Then:

- **Reference shots** — drag photos straight onto the strip inside any post. Several at once is
  fine. Or tap the **+** to browse, or copy an image and press ⌘V with a post open.
- **Shot lists, titles, on-screen text** — all editable inline. Saves as you type.
- Tap **Done editing** and it goes back to her clean view.

Photos are shrunk in the browser before they're stored, so the page stays fast. Landscape
references are shown whole, never cropped or squashed.

Voice notes record straight in the page — it's an https link, so the microphone works. Safari
asks for permission the first time. There's always an **"or choose an audio file"** button
beside it if she'd rather send a file.

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

**Next month:** open `plan-data.js`, replace the content, push. Every tick and note stays where
it is. Change `storeKey` at the top of that file if you want the new month to start with a
clean set of tick boxes.

**Own domain later:** the link can move to `swatti.cutlume.com` — it needs one DNS record in
Cloudflare, which is your account. Say the word and I'll give you the exact record.

---

## If something's wrong

**"Saving on this device" won't go away.** That's expected until the Supabase step above is
done. After it, it means `config.js` has a typo — tell me and I'll check.

**Voice recording says the microphone is blocked.** Safari: `aA` in the address bar → Website
Settings → Microphone → Allow. It only works on the real https link — never on a preview pane,
a Claude artifact, or a file opened from the Mac.

**A photo won't upload.** Anything that isn't an image is ignored. Until live sharing is on,
photos are held in the browser, so keep them to a handful.
