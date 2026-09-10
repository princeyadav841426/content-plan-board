# Swatti content plan — putting it live

Two jobs. The first gets her a working link in about three minutes. The second turns on
live sharing. **You can do the first tonight and the second whenever.**

---

## 1 · Put it online (3 min)

1. Go to **Cloudflare dashboard → Workers & Pages → Create → Pages → Upload assets**
2. Name it `swatti-plan`
3. Drag this whole **`swatti-plan-site` folder** into the upload box
4. **Deploy**

You get a link like `swatti-plan.pages.dev`. It already works — she can open it on her
iPhone or MacBook, read everything, tick things off and leave notes. At this stage each
person's ticks stay on their own device.

**Put it on your own domain** (worth doing, it's a client-facing link):
Pages project → **Custom domains** → **Set up a domain** → type `swatti.cutlume.com` → Cloudflare
adds the DNS record itself because it already runs that zone.

---

## 2 · Turn on live sharing (10 min)

Right now the two of you can't see each other's ticks. This fixes that, and moves photos
and voice notes off the device into real storage.

1. **supabase.com → New project.** Name it `swatti-plan`. Pick the region closest to
   Dubai. Save the database password somewhere — you won't need it here, but don't lose it.
2. Wait for it to finish setting up (about two minutes).
3. **SQL Editor → New query.** Open `schema.sql` from this folder, paste the whole thing
   in, press **Run**. It should say Success.
4. **Project Settings → API.** Copy two things:
   - **Project URL** — looks like `https://abcdefgh.supabase.co`
   - **anon public** key — the long one labelled `anon` `public`
5. Open **`config.js`** in this folder and paste them between the quotes:
   ```js
   window.SWATTI_CONFIG = {
     SUPABASE_URL:      "https://abcdefgh.supabase.co",
     SUPABASE_ANON_KEY: "eyJhbGciOi......"
   };
   ```
6. Re-upload the folder to Cloudflare Pages (same project → **Create new deployment** →
   drag the folder again).

Reload the page. The line under the tabs should now read **"Live — everything you change
shows up on both your screens."**

> The anon key is *meant* to be public — it sits in the page's code and Supabase is built
> for that. There is nothing secret in `config.js`.

---

## Using it

**Her side.** Opens the link. Sees this week. Taps a post, reads the shot list, films it,
ticks it. Leaves a note on anything that didn't work. Writes or records what her week
looks like in the box at the top.

**Your side.** Tap **"Prince: edit"** in the header. Then:

- **Reference shots** — drag photos straight onto the strip inside any post. Several at
  once is fine. Or tap the **+** to browse, or copy an image and press ⌘V with a post open.
- **Shot lists, titles, on-screen text** — all editable inline. Saves as you type.
- Tap **Done editing** and it goes back to her clean view.

Photos are shrunk in the browser before they upload, so the page stays fast no matter how
many you add. Landscape references are shown whole, never cropped or squashed.

---

## Next month

Open **`plan-data.js`**, replace the content, re-upload the folder. Same link, and every
tick and note stays where it is. Change `storeKey` at the top of that file if you want the
new month to start with a clean set of tick boxes.

---

## If something's wrong

**"Saving on this device" won't go away.** `config.js` has a typo, or step 3 didn't run.
Open the page, press ⌥⌘I → Console, and look for a red Supabase line.

**Voice recording says the microphone is blocked.** The browser needs permission — Safari:
`aA` in the address bar → Website Settings → Microphone → Allow. It only works on the
https link, never on a preview or a local file. There's an **"or choose an audio file"**
button next to it that always works, and WhatsApp is always fine too.

**A photo won't upload.** Anything that isn't an image is ignored. If live sharing is off,
photos are stored in the browser, so keep them to a handful until step 2 is done.
