/* ─────────────────────────────────────────────────────────────
   THE MONTH'S CONTENT.
   Next month: edit this one file, re-upload the folder. Nothing
   else changes — the link, the ticks, the notes and every
   reference shot already uploaded all stay put.

   A post's shot list is an array of shot objects:

     {a:"CLOSE", h:"tripod", n:"Shot name", do:"how to shoot it", s:8}

       a     camera angle  — WIDE · MEDIUM · CLOSE · MIRROR · POV · PHOTO
                             leave it out for a step that isn't a shot
       h     how it's held — "tripod" or "hand"
       n     THE SHOT NAME — what the shot IS, in three or four words.
             Every real shot has one. It is the line she reads first.
       do    how to shoot it — the short direction underneath the name
       s     seconds of footage to get
       have  true = this footage ALREADY EXISTS. The row turns green and
             says so, instead of asking her to film it again.
       file  which clip on the drive, when we have it

   Never write "nothing to film" as a shot. If there is nothing to
   film, either it is a step (no `a`, no `n`) or the shot already
   exists and gets have:true — so it is obvious at a glance which
   shots still need shooting and which are sitting on the drive.

   Shot counts are deliberately uneven. One reel is a single take
   with text over it; another needs eight. The video decides, not
   a template.
   ───────────────────────────────────────────────────────────── */

/* label = what the header shows.  start/end = the real dates, used to draw the
   calendar.  storeKey = change it and next month starts with empty tick boxes. */
window.PLAN_META = {
  label: "15 Sept – 14 Oct",
  start: "2026-09-15",
  end:   "2026-10-14",
  storeKey: "sep15"
};

window.PLAN = [
{w:1,head:"Week 1",sub:"15 – 21 Sept",note:"Your introduction. Two of these carry your voice for the first time.",
 shoot:"<b>Sat 13 Sept</b> — one block before launch covers Friday, Saturday and Sunday. Tuesday's reel is already filmed.",posts:[

 {id:"r1",date:"Tue 15",type:"REEL",series:"6AM 01",pillar:"Lifestyle",vo:true,film:"filmed 11 Sept",edit:"12–14 Sept",
  title:"My 6am morning — the introduction reel",
  what:"All seven shots are already filmed and on the drive. All that's left is your voice over the top. Around 40 seconds.",
  shots:[
   {a:"WIDE",h:"tripod",have:true,file:"24 Wide shot waking up in bed.mp4",
    n:"Waking up in bed",
    do:"Whole bed in frame, morning light coming in. You sit up slowly. Also on the drive: the version staying under the blanket.",s:4},
   {a:"WIDE",h:"tripod",have:true,file:"28 Wide walking shot from behind.mp4",
    n:"Walking through the house",
    do:"From behind, down the hallway. There is a second hallway take and a door opening to cut between.",s:4},
   {a:"MEDIUM",h:"tripod",have:true,file:"04 Medium shot bathroom mirror.mp4",
    n:"Bathroom — mirror and taps",
    do:"At the mirror, then the tap running and the toothbrush in the tumbler. Three separate clips on the drive.",s:6},
   {a:"CLOSE",h:"tripod",have:true,file:"31 Close-up skincare application.mp4",
    n:"Skincare on the shelf",
    do:"Pump bottle, cream jar in your hand, product going onto skin. Three close-ups.",s:5},
   {a:"CLOSE",h:"tripod",have:true,file:"08 Close-up coffee machine grinding.mp4",
    n:"Coffee, start to finish",
    do:"The longest run on the drive — grinder, dial, espresso pulling, steam wand, milk pour, cup on the counter. Nine clips.",s:10},
   {a:"MEDIUM",h:"tripod",have:true,file:"21 Medium shot cooking at stove.mp4",
    n:"Breakfast on the stove",
    do:"Reaching into the fridge, egg cracking into the pan, top-down on the stove, plated up. Six clips.",s:8},
   {a:"WIDE",h:"tripod",have:true,file:"23 Wide breakfast table shot.mp4",
    n:"Sitting down to eat",
    do:"The wide of the laid table, and the living-room stretch to close on.",s:4},
   {do:"<b>Record the voiceover at home</b> — phone close to your mouth, quietest room in the house. Sit down, don't stand."},
   {do:"<b>Don't perform it.</b> Say it the way you'd say it to a friend on the phone. A small stumble or an 'um' is fine — that take is usually the one we use."},
   {do:"Record it <b>five or six times</b>. We pick the best one, so there is no bad take."}],
  say:"Hi. I've had this page for years and I've posted almost nothing on it. Not because I didn't want to. I'd start, life would get busy, and that would be that. So this time I'm doing it properly. Three months, posting regularly, no disappearing. My mornings, my home, the interior design course I just started. The days that actually look like my life, not the perfect version of it. I don't know how it's going to go. But if that's something you'd want to watch, stay.",
  note:"<b>The three months is the promise</b>, and the promise is what makes someone follow instead of just watching. Admitting you've been quiet for years is what makes the rest of it believable — nobody follows a page that claims it was always perfect. No mention of the children here; that comes later, and only partly. <b>All 32 clips are in the Morning Ritual folder on the drive</b> — the seven rows above are how they group up."},

 {id:"c1",date:"Wed 16",type:"CAROUSEL",series:"Who she is",pillar:"Lifestyle",film:"photos by 13 Sept",edit:"14 Sept",
  title:"Nine things about me — photo post",
  what:"Eight photos you already have on your phone. No filming for this one.",
  shots:[
   {a:"PHOTO",n:"Eight photos you already love",
    do:"Send Prince eight from your camera roll — the horse, a Dubai evening, India, your coffee, a corner of your home, your drawing, your perfumes, one of you."},
   {do:"That's the whole job. We build the post and write the list."}],
  note:"The caption is the real post. One page we studied grew to 67,000 followers in two months on almost nothing else — nice pictures, and the value written underneath."},

 {id:"r2",date:"Fri 18",type:"REEL",series:"Soft Life Notes 01",pillar:"Lifestyle",film:"Sat 13 Sept",edit:"15–17 Sept",
  title:"The boring thing, every day — home reset with one line of text",
  what:"Quiet footage of you resetting the living room. One sentence sits on screen the whole time.",
  shots:[
   {a:"WIDE",h:"tripod",n:"The living room reset",
    do:"Whole living room in frame. You fold a throw over the sofa arm and straighten the cushions. Move at normal speed — don't rush for the camera.",s:15},
   {a:"CLOSE",h:"hand",n:"Watering the plant",
    do:"Get right down to the leaves so you can hear the water.",s:10},
   {a:"CLOSE",h:"tripod",n:"Lighting the candle",
    do:"Your hands only. Nothing else in frame.",s:8},
   {a:"MEDIUM",h:"tripod",n:"The finished room",
    do:"Step back. The room, still, with you out of shot.",s:8},
   {do:"<b>No music playing while you film.</b> We want the real sound of the room."}],
  say:"nobody tells you the 'soft life' is mostly just doing the boring thing every single day, before anyone else is awake.",
  note:"That line sits at the top of the screen for the whole video — the format from the two reels you sent."},

 {id:"r3",date:"Sat 19",type:"REEL",series:"Getting Ready 01",pillar:"Fashion",vo:true,film:"Sat 13 Sept",edit:"15–17 Sept",
  title:"Getting ready — what this page is actually for (voiceover)",
  what:"Your second voiceover reel. Getting dressed, while your voice explains what the page is for. 30 to 40 seconds.",
  shots:[
   {a:"MEDIUM",h:"tripod",n:"Opening the wardrobe",
    do:"Tripod facing the wardrobe. You open it and take one outfit out.",s:10},
   {a:"CLOSE",h:"tripod",n:"The outfit on its own",
    do:"Hanging against a plain wall. Nobody in frame.",s:6},
   {a:"CLOSE",h:"tripod",n:"Jewellery going on",
    do:"Your hands only. Earrings, then a ring or a watch.",s:8},
   {a:"CLOSE",h:"hand",n:"The perfume spray",
    do:"Window behind it so the mist catches the light. Film this three or four times — it's the shot people stop scrolling for.",s:6},
   {a:"MIRROR",h:"hand",n:"Dressed, at the mirror",
    do:"Adjusting a sleeve or your hair. Your face can be in this one.",s:8},
   {a:"WIDE",h:"tripod",n:"Walking out",
    do:"From behind — you walk out and close the door.",s:6},
   {do:"Record the voiceover at home afterwards, same way as the first one."}],
  say:"People hear soft life and think it means doing nothing. Mine isn't that. I'm up before everyone else, I train, I'm back in a classroom learning interior design, and I still take the twenty minutes to get ready properly instead of running out the door in whatever's clean. That's it. That's the whole thing. Strong enough to carry the day. Soft enough to actually enjoy it.",
  note:"Your bio line — <b>Strong body. Soft life.</b> — lands here, spoken, inside your own explanation of what it means. That's stronger than putting it on a graphic. After this you've introduced yourself twice and never once spoken to camera. That's the whole point of doing it this way."},

 {id:"r4",date:"Sun 20",type:"REEL",series:"6AM 02",pillar:"Lifestyle",film:"Sat 13 Sept",edit:"16–18 Sept",
  title:"Sunday reset — no talking, real sound only",
  what:"The home reset. Real sound, no music, nothing said.",
  shots:[
   {a:"CLOSE",h:"hand",n:"Water into the plant pot",
    do:"Get the sound of it.",s:10},
   {a:"CLOSE",h:"tripod",n:"Trimming the flowers",
    do:"Cutting the stems and putting them into a vase.",s:15},
   {a:"CLOSE",h:"tripod",n:"Coffee, all of it",
    do:"Kettle, pour, stir. Phone close, sound recording.",s:15},
   {a:"MEDIUM",h:"tripod",n:"Folding laundry",
    do:"On the bed. Hands and fabric, you can be half in frame.",s:12},
   {a:"WIDE",h:"tripod",n:"The tidy room, candle lit",
    do:"Hold it and don't move.",s:8}],
  note:"<b>Sound on, nothing playing in the background.</b> The pouring, the trimming, the folding — that sound is why these get watched twice."}]},

{w:2,head:"Week 2",sub:"22 – 28 Sept",note:"The gym and the skincare shelf arrive. Two of the pillars we'll run every month.",
 shoot:"<b>Thu 17 Sept</b> — course morning, grab the studio footage on your way in. <b>Sat 19 Sept</b> — main block, about two hours.",posts:[

 {id:"r5",date:"Tue 22",type:"REEL",series:"Studio Days",pillar:"Interiors",film:"Thu 17 Sept",edit:"19–21 Sept",
  title:"Interior design school, week one — the announcement",
  what:"The course, filmed as it happens. You're going anyway — just film it.",
  shots:[
   {a:"CLOSE",h:"tripod",n:"The bag, before you leave",
    do:"Notebook, pencils and bag laid out on the table.",s:8},
   {a:"POV",h:"hand",n:"The drive in",
    do:"From the driver's seat — the road ahead. Phone propped, both hands on the wheel, film while parked or ask someone else to hold it.",s:10},
   {a:"POV",h:"hand",n:"Walking into the building",
    do:"Phone low, just walk normally.",s:8},
   {a:"CLOSE",h:"hand",n:"Opening the notebook",
    do:"Your hands, to a blank page.",s:8},
   {a:"CLOSE",h:"tripod",n:"Your hand sketching",
    do:"This is the shot that matters — film it twice.",s:15},
   {a:"CLOSE",h:"hand",n:"Coffee on the desk",
    do:"Next to the work.",s:6}],
  say:"6 months of interior design school. with two kids at home.",
  note:"<b>The only interiors reel this month</b>, and it's here because a milestone beats an ordinary day on every page we studied. The course shows up again in the month-end carousel, and that's enough — you're on the page to be a person, not a student."},

 {id:"c2",date:"Wed 23",type:"CAROUSEL",series:"Beauty",pillar:"Beauty",film:"photos by 19 Sept",edit:"21 Sept",
  title:"What's actually on my bathroom shelf — photo post",
  what:"Photos of your real products. The honest list in the caption is the real post.",
  shots:[
   {a:"PHOTO",n:"Six or seven products, one each",
    do:"Only the ones you genuinely use. On the shelf or the counter, daylight, no flash."},
   {a:"PHOTO",n:"The whole shelf",
    do:"One wider photo, as it actually is. Don't tidy it first."},
   {do:"Tell Prince, in one line each, <b>why you keep using them</b> — that line is what makes people save the post."}],
  note:"Beauty lists get saved and sent to friends, and saves are what keep a post surfacing for weeks. This is also the first post a fragrance or skincare brand would look at."},

 {id:"r6",date:"Fri 25",type:"REEL",series:"Getting Ready 02",pillar:"Beauty",film:"Sat 19 Sept",edit:"22–24 Sept",
  title:"Skincare, in order — hands and bottles, no face needed",
  what:"Your real routine. Hands, bottles, texture, mirror. Say nothing.",
  shots:[
   {a:"CLOSE",h:"tripod",n:"The products lined up",
    do:"On the shelf, in the order you use them.",s:8},
   {a:"CLOSE",h:"tripod",n:"Cleanser",
    do:"Hands only, at the sink.",s:8},
   {a:"CLOSE",h:"tripod",n:"Serum",
    do:"The dropper, then it going onto your skin.",s:8},
   {a:"CLOSE",h:"tripod",n:"Moisturiser",
    do:"Being warmed between your fingers.",s:8},
   {a:"CLOSE",h:"hand",n:"The texture shot",
    do:"One very close shot of the cream on your fingertips.",s:6},
   {a:"MIRROR",h:"hand",n:"Finished skin",
    do:"Last shot in the mirror, nothing else done yet.",s:8}],
  note:"Say nothing. This is a watch-and-relax video, and that's exactly why it works."},

 {id:"r7",date:"Sat 26",type:"REEL",series:"Strong Body 01",pillar:"Fitness",film:"Sat 19 Sept",edit:"22–24 Sept",
  title:"The gym was never about the body — one honest line over gym footage",
  what:"Your gym morning with one honest line on screen. The 'strong body' half of your bio, finally on the page.",
  shots:[
   {a:"CLOSE",h:"tripod",n:"Packing the gym bag",
    do:"Shoes, bottle, headphones going in one at a time.",s:10},
   {a:"POV",h:"hand",n:"Walking in the doors",
    do:"Phone low, just walk.",s:8},
   {a:"CLOSE",h:"tripod",n:"Hands on the bar",
    do:"Chalking up or gripping. Only your hands — nothing else has to be in frame.",s:10},
   {a:"MEDIUM",h:"tripod",n:"One set, from the side",
    do:"Whatever you're actually training that day.",s:12},
   {a:"CLOSE",h:"hand",n:"After the set",
    do:"Water bottle, out of breath, towel.",s:8},
   {a:"WIDE",h:"hand",n:"Walking out with coffee",
    do:"Straight out the door.",s:8}],
  say:"the gym was never about the body. it was the one hour a day nobody could ask me for anything.",
  note:"The most shareable line in the month. Every mother who sees it will feel it, and a lot will send it to a friend. <b>Ask the gym first</b> — most are fine with filming before 8am when it's empty."},

 {id:"r8",date:"Sun 27",type:"REEL",series:"6AM 03",pillar:"Lifestyle",kids:true,film:"Sat 19 Sept",edit:"23–25 Sept",
  title:"Slow Sunday breakfast — family morning, no faces",
  what:"A slow family Sunday morning. Real sound, no talking.",
  shots:[
   {a:"CLOSE",h:"tripod",n:"Cutting the fruit",
    do:"On the board. Close, sound on.",s:12},
   {a:"CLOSE",h:"tripod",n:"Pouring the juice",
    do:"Into glasses.",s:8},
   {a:"MEDIUM",h:"tripod",n:"Laying the table",
    do:"Plates, napkins, flowers.",s:10},
   {a:"CLOSE",h:"tripod",n:"A small hand reaching in",
    do:"Just the hand, nothing above the wrist.",s:6},
   {a:"WIDE",h:"tripod",n:"The table from behind",
    do:"Everyone sitting down. Backs of heads only.",s:8}],
  note:"<b>One of only two posts this month with the children in.</b> Hands, backs and backs of heads only — never faces, never the focus. You're the main character; they're part of the room."}]},

{w:3,head:"Week 3",sub:"29 Sept – 5 Oct",note:"Beauty week. Makeup, one outfit in a single take, and the fragrances.",
 shoot:"<b>Thu 24 Sept</b> — course morning, photograph your work for the recap. <b>Sat 26 Sept</b> — main block: makeup, outfit, fragrance and the long 6am film.",posts:[

 {id:"r9",date:"Tue 29",type:"REEL",series:"Getting Ready 03",pillar:"Beauty",film:"Sat 26 Sept",edit:"26–28 Sept",
  title:"Everyday makeup, start to finish — the five things I actually use",
  what:"Your real everyday face, done at normal speed. No tutorial voice, no talking.",
  shots:[
   {a:"CLOSE",h:"tripod",n:"The five products in a row",
    do:"On the counter, in the order you use them.",s:8},
   {a:"MIRROR",h:"tripod",n:"Bare skin, before anything",
    do:"At the mirror, hair tied back.",s:6},
   {a:"CLOSE",h:"tripod",n:"Base going on",
    do:"Fingers or sponge, one side of the face, phone completely still.",s:10},
   {a:"CLOSE",h:"tripod",n:"Brows, then lashes",
    do:"Keep the phone in exactly the same place.",s:10},
   {a:"CLOSE",h:"tripod",n:"Lip colour",
    do:"Straight to the lips, no brush.",s:8},
   {a:"MIRROR",h:"hand",n:"The finished face",
    do:"One small turn toward the window light, then done.",s:8}],
  say:"ten minutes. the same five things every single day.",
  note:"Beauty is the biggest half of your niche and until now the page has only shown skincare. This is the post that tells the algorithm what you are, and it's the format brands look for first."},

 {id:"r10",date:"Fri 2",type:"REEL",series:"Fashion 01",pillar:"Fashion",film:"Sat 26 Sept",edit:"29 Sept–1 Oct",
  title:"One outfit, one take — a single 15-second mirror shot",
  what:"One shot. That's the whole video. The text on screen does the rest.",
  shots:[
   {a:"MIRROR",h:"hand",n:"The one continuous mirror take",
    do:"Fully dressed, phone in hand. Look up, turn once slowly, look back down. Don't cut, don't stop. Film it four or five times and we take the best one.",s:15}],
  say:"the outfit costs less than everyone assumes. the fit is the whole trick.",
  note:"<b>Deliberately one shot.</b> When the outfit is the point and a line of text carries the idea, more angles make it worse, not better. Some reels need eight shots — this one needs one, filmed five times."},

 {id:"r11",date:"Sat 3",type:"REEL",series:"Fragrance 01",pillar:"Fragrance",film:"Sat 26 Sept",edit:"29 Sept–1 Oct",
  title:"The three I actually wear — fragrance reel",
  what:"Your perfumes, shot properly. Light and mist do all the work here.",
  shots:[
   {a:"CLOSE",h:"tripod",n:"Three bottles in the light",
    do:"On the shelf in morning light. Move them until the light comes through the glass.",s:8},
   {a:"CLOSE",h:"tripod",n:"Picking one up",
    do:"Your hand taking the cap off.",s:8},
   {a:"CLOSE",h:"tripod",n:"The spray, backlit",
    do:"Window directly behind it so the mist shows. Film this four times — it is the shot the whole reel is built on.",s:6},
   {a:"CLOSE",h:"hand",n:"Wrist to the neck",
    do:"The way you actually put it on.",s:6},
   {a:"MEDIUM",h:"tripod",n:"Picking up your bag",
    do:"And leaving the room.",s:6}],
  say:"one for the school run, one for class, one for when i'm actually going somewhere.",
  note:"Fragrance is the easiest paid category on Instagram and the one your reference pages earn from most. This post exists so there's something to show a brand in month two."},

 {id:"c3",date:"Wed 30",type:"CAROUSEL",series:"Travel",pillar:"Travel",film:"photos by 26 Sept",edit:"28 Sept",
  title:"Dubai, away from the malls — photo post",
  what:"Photos from your own phone of the parts of Dubai you actually like.",
  shots:[
   {a:"PHOTO",n:"Eight Dubai photos you took yourself",
    do:"Quiet spots, a café, evening light, the water. Not the tourist ones."},
   {do:"Nothing new to shoot for this unless you want to — the camera roll covers it."}],
  note:"Place posts get saved by people planning trips, so they keep working for months. Every one of your reference pages leans on this."},

 {id:"r12",date:"Sun 4",type:"REEL",series:"6AM 04",pillar:"Lifestyle",film:"Sat 26 Sept",edit:"30 Sept–2 Oct",
  title:"The whole morning, start to finish — the long one",
  what:"The longest and best-looking version of your morning. Same routine as post one, a month better.",
  shots:[
   {a:"MEDIUM",h:"tripod",n:"Curtains opening",
    do:"Stand to one side so the light comes in past you.",s:8},
   {a:"WIDE",h:"tripod",n:"Making the bed",
    do:"Whole bed in frame, normal speed.",s:15},
   {a:"CLOSE",h:"tripod",n:"Bathroom, hands only",
    do:"Water running, face wash.",s:12},
   {a:"CLOSE",h:"tripod",n:"The coffee, all of it",
    do:"Kettle, pour, stir.",s:20},
   {a:"WIDE",h:"tripod",n:"Out to the balcony",
    do:"From behind.",s:8},
   {a:"MEDIUM",h:"tripod",n:"The first sip",
    do:"City behind you.",s:10}],
  note:"Deliberately the same shots as the first post of the month. In a month you'll see how much better you've got — and so will everyone watching."}]},

{w:4,head:"Week 4",sub:"6 – 12 Oct",note:"Closing the month: the honest one, the hard gym morning, the recap and the reflection.",
 shoot:"<b>Thu 1 Oct</b> — course morning, last photos for the recap. <b>Sat 3 Oct</b> — main block. Light week, mostly photos.",posts:[

 {id:"r13",date:"Tue 6",type:"REEL",series:"Soft Life Notes 02",pillar:"Lifestyle",kids:true,film:"Sat 3 Oct",edit:"4–5 Oct",
  title:"8:31am, and the house is quiet — school run and the silence after",
  what:"The school-run morning and the silence right after it. The most honest post of the month.",
  shots:[
   {a:"CLOSE",h:"tripod",n:"Two lunchboxes closing",
    do:"Close, on the counter.",s:8},
   {a:"CLOSE",h:"tripod",n:"Small shoes by the door",
    do:"Just the shoes.",s:6},
   {a:"CLOSE",h:"tripod",n:"Hand on the door handle",
    do:"Door opening.",s:6},
   {a:"POV",h:"hand",n:"The drive back home",
    do:"From the driver's seat. Parked, or filmed by someone else.",s:10},
   {a:"WIDE",h:"tripod",n:"Alone with coffee, quiet house",
    do:"You sitting down. Set the tripod, start it, and don't move it.",s:15}],
  say:"8:31am. the house is quiet. this is the part nobody films.",
  note:"<b>The second and last post with the children in</b>, and only their shoes and a lunchbox. Post this and read the comments — this is the kind of video that finds the exact audience you want."},

 {id:"c4",date:"Wed 7",type:"CAROUSEL",series:"Personal growth",pillar:"Lifestyle",film:"photos by 3 Oct",edit:"5 Oct",
  title:"Six things I'm unlearning — written photo post",
  what:"A written post over simple images. This replaces quote graphics.",
  shots:[
   {a:"PHOTO",n:"Six quiet photos",
    do:"Hands, coffee, a window, your desk, anything calm. From the camera roll is fine."},
   {do:"If any of the six things are yours, tell Prince and we write them in your words."}],
  note:"Real thoughts in your own words always beat a quote on a coloured background. That's why quote posts came out of the plan."},

 {id:"r14",date:"Fri 9",type:"REEL",series:"Strong Body 02",pillar:"Fitness",film:"Sat 3 Oct",edit:"6–8 Oct",
  title:"Gym on the mornings I don't want to go — the honest one",
  what:"The 6am gym morning when it isn't glamorous. Low light, one line of text.",
  shots:[
   {a:"CLOSE",h:"tripod",n:"Alarm on the phone screen",
    do:"Still dark in the room.",s:6},
   {a:"CLOSE",h:"tripod",n:"Gym clothes being picked up",
    do:"Laid out the night before.",s:8},
   {a:"POV",h:"hand",n:"The walk in, before sunrise",
    do:"The car park or the door, before the sun's properly up.",s:8},
   {a:"MEDIUM",h:"tripod",n:"One set",
    do:"Nothing dramatic — whatever you're actually doing.",s:12},
   {a:"MIRROR",h:"hand",n:"After — flushed and tired",
    do:"Not posed. This is the shot that makes people believe the rest.",s:8}],
  say:"i don't feel like it most mornings either. i just stopped letting that be the deciding vote.",
  note:"<b>This is the flexible slot.</b> If you travel or go out this month, we swap this reel for whatever you actually got — and you already have two gym posts up by then."},

 {id:"c5",date:"Sat 10",type:"CAROUSEL",series:"Month one recap",pillar:"Interiors",film:"photos by 3 Oct",edit:"8 Oct",
  title:"One month of design school — work-in-progress photo post",
  what:"Everything from the course so far, in one post. The month's milestone.",
  shots:[
   {a:"PHOTO",n:"Every sketch so far",
    do:"One photo each, flat on the table, daylight, no flash."},
   {a:"PHOTO",n:"Your desk or the studio",
    do:"One wide photo of where you work."},
   {a:"PHOTO",n:"One of you there",
    do:"Only if you're comfortable."}],
  note:"Milestone posts beat ordinary posts on all six pages we studied. This one also sets up month two."},

 {id:"r15",date:"Sun 11",type:"REEL",series:"6AM 05",pillar:"Lifestyle",vo:true,film:"Sat 3 Oct",edit:"8–10 Oct",
  title:"One month in — the closing voiceover reel",
  what:"The morning ritual one last time, with a short voiceover looking back.",
  shots:[
   {a:"MEDIUM",h:"tripod",n:"Curtains, bed, coffee, balcony",
    do:"The same four beats as post one, filmed again. You'll notice you're much better at it now.",s:40},
   {do:"Record a short voiceover at home. Under 30 seconds."}],
  say:"So that's a month. I said three, and honestly I thought I'd have quietly stopped by now. I haven't. Same alarm, same coffee, same balcony. I've just filmed it enough times now that I don't overthink it. The only thing that really changed is I stopped waiting until I felt ready. Two more months. Same time tomorrow.",
  note:"The post that turns four weeks of content into a story with a beginning and an end. Also the strongest thing we can show anyone who asks what we do."}]},

{w:5,head:"Buffer",sub:"13 – 14 Oct",note:"Two spare days. Nothing scheduled on purpose.",
 shoot:"No shoot. These days exist so nothing is ever rushed.",posts:[

 {id:"b1",date:"Tue 13",type:"PHOTO",series:"Flexible",pillar:"Travel",film:"—",edit:"—",
  title:"Photo post — whatever actually happened this month",
  what:"A dinner, a staycation, an event. Only if there was one.",
  shots:[
   {a:"PHOTO",n:"Anywhere you went this month",
    do:"Nothing planned for this one. If you took photos somewhere you liked, send them."},
   {do:"If not, we skip it. An empty slot beats a filler post."}],
  note:"Every calendar needs slack. If any post above slipped, it lands here instead."},

 {id:"b2",date:"Wed 14",type:"REVIEW",series:"Month close",pillar:"—",film:"—",edit:"—",
  title:"Month one review — numbers and what month two changes",
  what:"Prince pulls the numbers on all 20 posts and we decide what month two doubles down on.",
  shots:[
   {do:"Nothing for you to do on this one — it's ours."},
   {do:"You get a short summary: what worked, what didn't, and what we do more of next month."}],
  note:"Then the next 30 days go up on this same link — 15 Oct to 14 Nov."}]}
];
