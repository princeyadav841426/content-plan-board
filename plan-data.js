/* ─────────────────────────────────────────────────────────────
   THE MONTH'S CONTENT.
   Next month: edit this one file, re-upload the folder. Nothing
   else changes — the link, the ticks, the notes and every
   reference shot already uploaded all stay put.

   A post's shot list is an array of shot objects:

     {a:"CLOSE", h:"tripod", do:"what she actually does", s:8}

       a   camera angle  — WIDE · MEDIUM · CLOSE · MIRROR · POV · PHOTO
                           leave it out for a step that isn't a shot
       h   how it's held — "tripod" or "hand"
       do  what she does in that shot, in plain words
       s   seconds of footage to get

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
  what:"Already filmed. All that's left is your voice over the top. Around 40 seconds.",
  shots:[
   {do:"Nothing to film. This one is already shot."},
   {do:"<b>Record the voiceover at home</b> — phone close to your mouth, quietest room in the house. Sit down, don't stand."},
   {do:"<b>Don't perform it.</b> Say it the way you'd say it to a friend on the phone. A small stumble or an 'um' is fine — that take is usually the one we use."},
   {do:"Record it <b>five or six times</b>. We pick the best one, so there is no bad take."}],
  say:"Hi. I've had this page for years and I've posted almost nothing on it. Not because I didn't want to. I'd start, life would get busy, and that would be that. So this time I'm doing it properly. Three months, posting regularly, no disappearing. My mornings, my home, the interior design course I just started. The days that actually look like my life, not the perfect version of it. I don't know how it's going to go. But if that's something you'd want to watch, stay.",
  note:"<b>The three months is the promise</b>, and the promise is what makes someone follow instead of just watching. Admitting you've been quiet for years is what makes the rest of it believable — nobody follows a page that claims it was always perfect. No mention of the children here; that comes later, and only partly."},

 {id:"c1",date:"Wed 16",type:"CAROUSEL",series:"Who she is",pillar:"Lifestyle",film:"photos by 13 Sept",edit:"14 Sept",
  title:"Nine things about me — photo post",
  what:"Eight photos already on your phone. Nothing to shoot.",
  shots:[
   {a:"PHOTO",do:"Send Prince <b>eight photos you already love</b> — the horse, a Dubai evening, India, your coffee, a corner of your home, your drawing, your perfumes, one of you."},
   {do:"That's the whole job. We build the post and write the list."}],
  note:"The caption is the real post. One page we studied grew to 67,000 followers in two months on almost nothing else — nice pictures, and the value written underneath."},

 {id:"r2",date:"Fri 18",type:"REEL",series:"Soft Life Notes 01",pillar:"Lifestyle",film:"Sat 13 Sept",edit:"15–17 Sept",
  title:"The boring thing, every day — home reset with one line of text",
  what:"Quiet footage of you resetting the living room. One sentence sits on screen the whole time.",
  shots:[
   {a:"WIDE",h:"tripod",do:"Whole living room in frame. You fold a throw over the sofa arm and straighten the cushions. Move at normal speed — don't rush for the camera.",s:15},
   {a:"CLOSE",h:"hand",do:"Watering a plant. Get right down to the leaves so you can hear the water.",s:10},
   {a:"CLOSE",h:"tripod",do:"Your hands lighting a candle. Nothing else in frame.",s:8},
   {a:"MEDIUM",h:"tripod",do:"Step back. The finished room, still, with you out of shot.",s:8},
   {do:"<b>No music playing while you film.</b> We want the real sound of the room."}],
  say:"nobody tells you the 'soft life' is mostly just doing the boring thing every single day, before anyone else is awake.",
  note:"That line sits at the top of the screen for the whole video — the format from the two reels you sent."},

 {id:"r3",date:"Sat 19",type:"REEL",series:"Getting Ready 01",pillar:"Fashion",vo:true,film:"Sat 13 Sept",edit:"15–17 Sept",
  title:"Getting ready — what this page is actually for (voiceover)",
  what:"Your second voiceover reel. Getting dressed, while your voice explains what the page is for. 30 to 40 seconds.",
  shots:[
   {a:"MEDIUM",h:"tripod",do:"Tripod facing the wardrobe. You open it and take one outfit out.",s:10},
   {a:"CLOSE",h:"tripod",do:"The outfit hanging on its own against a plain wall. Nobody in frame.",s:6},
   {a:"CLOSE",h:"tripod",do:"Your hands putting jewellery on. Earrings, then a ring or a watch.",s:8},
   {a:"CLOSE",h:"hand",do:"Spray perfume with a window behind it so the mist catches the light. Film this three or four times — it's the shot people stop scrolling for.",s:6},
   {a:"MIRROR",h:"hand",do:"You in the mirror, dressed, adjusting a sleeve or your hair. Your face can be in this one.",s:8},
   {a:"WIDE",h:"tripod",do:"From behind — you walk out and close the door.",s:6},
   {do:"Record the voiceover at home afterwards, same way as the first one."}],
  say:"People hear soft life and think it means doing nothing. Mine isn't that. I'm up before everyone else, I train, I'm back in a classroom learning interior design, and I still take the twenty minutes to get ready properly instead of running out the door in whatever's clean. That's it. That's the whole thing. Strong enough to carry the day. Soft enough to actually enjoy it.",
  note:"Your bio line — <b>Strong body. Soft life.</b> — lands here, spoken, inside your own explanation of what it means. That's stronger than putting it on a graphic. After this you've introduced yourself twice and never once spoken to camera. That's the whole point of doing it this way."},

 {id:"r4",date:"Sun 20",type:"REEL",series:"6AM 02",pillar:"Lifestyle",film:"Sat 13 Sept",edit:"16–18 Sept",
  title:"Sunday reset — no talking, real sound only",
  what:"The home reset. Real sound, no music, nothing said.",
  shots:[
   {a:"CLOSE",h:"hand",do:"Water going into a plant pot. Get the sound of it.",s:10},
   {a:"CLOSE",h:"tripod",do:"Trimming flower stems and putting them into a vase.",s:15},
   {a:"CLOSE",h:"tripod",do:"Coffee, all of it — kettle, pour, stir. Phone close, sound recording.",s:15},
   {a:"MEDIUM",h:"tripod",do:"Folding laundry on the bed. Hands and fabric, you can be half in frame.",s:12},
   {a:"WIDE",h:"tripod",do:"The tidy room with the candle lit. Hold it and don't move.",s:8}],
  note:"<b>Sound on, nothing playing in the background.</b> The pouring, the trimming, the folding — that sound is why these get watched twice."}]},

{w:2,head:"Week 2",sub:"22 – 28 Sept",note:"The gym and the skincare shelf arrive. Two of the pillars we'll run every month.",
 shoot:"<b>Thu 17 Sept</b> — course morning, grab the studio footage on your way in. <b>Sat 19 Sept</b> — main block, about two hours.",posts:[

 {id:"r5",date:"Tue 22",type:"REEL",series:"Studio Days",pillar:"Interiors",film:"Thu 17 Sept",edit:"19–21 Sept",
  title:"Interior design school, week one — the announcement",
  what:"The course, filmed as it happens. You're going anyway — just film it.",
  shots:[
   {a:"CLOSE",h:"tripod",do:"Before you leave: notebook, pencils and bag laid out on the table.",s:8},
   {a:"POV",h:"hand",do:"From the driver's seat — the road ahead. Phone propped, both hands on the wheel, film while parked or ask someone else to hold it.",s:10},
   {a:"POV",h:"hand",do:"Walking into the building. Phone low, just walk normally.",s:8},
   {a:"CLOSE",h:"hand",do:"Your hands opening the notebook to a blank page.",s:8},
   {a:"CLOSE",h:"tripod",do:"Your hand sketching. This is the shot that matters — film it twice.",s:15},
   {a:"CLOSE",h:"hand",do:"Coffee on the desk next to the work.",s:6}],
  say:"6 months of interior design school. with two kids at home.",
  note:"<b>The only interiors reel this month</b>, and it's here because a milestone beats an ordinary day on every page we studied. The course shows up again in the month-end carousel, and that's enough — you're on the page to be a person, not a student."},

 {id:"c2",date:"Wed 23",type:"CAROUSEL",series:"Beauty",pillar:"Beauty",film:"photos by 19 Sept",edit:"21 Sept",
  title:"What's actually on my bathroom shelf — photo post",
  what:"Photos of your real products. The honest list in the caption is the real post.",
  shots:[
   {a:"PHOTO",do:"Photograph <b>six or seven products you genuinely use</b>. One per photo, on the shelf or the counter, daylight, no flash."},
   {a:"PHOTO",do:"One wider photo of the whole shelf as it actually is."},
   {do:"Tell Prince, in one line each, <b>why you keep using them</b> — that line is what makes people save the post."}],
  note:"Beauty lists get saved and sent to friends, and saves are what keep a post surfacing for weeks. This is also the first post a fragrance or skincare brand would look at."},

 {id:"r6",date:"Fri 25",type:"REEL",series:"Getting Ready 02",pillar:"Beauty",film:"Sat 19 Sept",edit:"22–24 Sept",
  title:"Skincare, in order — hands and bottles, no face needed",
  what:"Your real routine. Hands, bottles, texture, mirror. Say nothing.",
  shots:[
   {a:"CLOSE",h:"tripod",do:"Products lined up on the shelf in the order you use them.",s:8},
   {a:"CLOSE",h:"tripod",do:"Cleanser — hands only, at the sink.",s:8},
   {a:"CLOSE",h:"tripod",do:"Serum — the dropper, then it going onto your skin.",s:8},
   {a:"CLOSE",h:"tripod",do:"Moisturiser being warmed between your fingers.",s:8},
   {a:"CLOSE",h:"hand",do:"One very close shot of the cream's texture on your fingertips.",s:6},
   {a:"MIRROR",h:"hand",do:"Last shot in the mirror, skin finished, nothing else done yet.",s:8}],
  note:"Say nothing. This is a watch-and-relax video, and that's exactly why it works."},

 {id:"r7",date:"Sat 26",type:"REEL",series:"Strong Body 01",pillar:"Fitness",film:"Sat 19 Sept",edit:"22–24 Sept",
  title:"The gym was never about the body — one honest line over gym footage",
  what:"Your gym morning with one honest line on screen. The 'strong body' half of your bio, finally on the page.",
  shots:[
   {a:"CLOSE",h:"tripod",do:"Gym bag being packed — shoes, bottle, headphones going in one at a time.",s:10},
   {a:"POV",h:"hand",do:"Walking in through the gym doors. Phone low, just walk.",s:8},
   {a:"CLOSE",h:"tripod",do:"Your hands chalking up or gripping the bar. Only your hands — nothing else has to be in frame.",s:10},
   {a:"MEDIUM",h:"tripod",do:"One set, filmed from the side. Whatever you're actually training that day.",s:12},
   {a:"CLOSE",h:"hand",do:"Water bottle, out of breath, towel.",s:8},
   {a:"WIDE",h:"hand",do:"Walking out with a coffee.",s:8}],
  say:"the gym was never about the body. it was the one hour a day nobody could ask me for anything.",
  note:"The most shareable line in the month. Every mother who sees it will feel it, and a lot will send it to a friend. <b>Ask the gym first</b> — most are fine with filming before 8am when it's empty."},

 {id:"r8",date:"Sun 27",type:"REEL",series:"6AM 03",pillar:"Lifestyle",kids:true,film:"Sat 19 Sept",edit:"23–25 Sept",
  title:"Slow Sunday breakfast — family morning, no faces",
  what:"A slow family Sunday morning. Real sound, no talking.",
  shots:[
   {a:"CLOSE",h:"tripod",do:"Fruit being cut on the board. Close, sound on.",s:12},
   {a:"CLOSE",h:"tripod",do:"Pouring juice into glasses.",s:8},
   {a:"MEDIUM",h:"tripod",do:"The table being laid — plates, napkins, flowers.",s:10},
   {a:"CLOSE",h:"tripod",do:"A small hand reaching in for something. Just the hand, nothing above the wrist.",s:6},
   {a:"WIDE",h:"tripod",do:"The whole table from behind, everyone sitting down. Backs of heads only.",s:8}],
  note:"<b>One of only two posts this month with the children in.</b> Hands, backs and backs of heads only — never faces, never the focus. You're the main character; they're part of the room."}]},

{w:3,head:"Week 3",sub:"29 Sept – 5 Oct",note:"Beauty week. Makeup, one outfit in a single take, and the fragrances.",
 shoot:"<b>Thu 24 Sept</b> — course morning, photograph your work for the recap. <b>Sat 26 Sept</b> — main block: makeup, outfit, fragrance and the long 6am film.",posts:[

 {id:"r9",date:"Tue 29",type:"REEL",series:"Getting Ready 03",pillar:"Beauty",film:"Sat 26 Sept",edit:"26–28 Sept",
  title:"Everyday makeup, start to finish — the five things I actually use",
  what:"Your real everyday face, done at normal speed. No tutorial voice, no talking.",
  shots:[
   {a:"CLOSE",h:"tripod",do:"The five products laid out in a row on the counter, in the order you use them.",s:8},
   {a:"MIRROR",h:"tripod",do:"You at the mirror before anything — bare skin, hair tied back.",s:6},
   {a:"CLOSE",h:"tripod",do:"Base going on. Fingers or sponge, one side of the face, phone completely still.",s:10},
   {a:"CLOSE",h:"tripod",do:"Brows, then lashes. Keep the phone in exactly the same place.",s:10},
   {a:"CLOSE",h:"tripod",do:"Lip colour going on, straight to the lips, no brush.",s:8},
   {a:"MIRROR",h:"hand",do:"The finished face. One small turn toward the window light, then done.",s:8}],
  say:"ten minutes. the same five things every single day.",
  note:"Beauty is the biggest half of your niche and until now the page has only shown skincare. This is the post that tells the algorithm what you are, and it's the format brands look for first."},

 {id:"r10",date:"Fri 2",type:"REEL",series:"Fashion 01",pillar:"Fashion",film:"Sat 26 Sept",edit:"29 Sept–1 Oct",
  title:"One outfit, one take — a single 15-second mirror shot",
  what:"One shot. That's the whole video. The text on screen does the rest.",
  shots:[
   {a:"MIRROR",h:"hand",do:"Fully dressed, phone in hand at the mirror. Look up, turn once slowly, look back down. Don't cut, don't stop — one continuous take. Film it four or five times and we take the best one.",s:15}],
  say:"the outfit costs less than everyone assumes. the fit is the whole trick.",
  note:"<b>Deliberately one shot.</b> When the outfit is the point and a line of text carries the idea, more angles make it worse, not better. Some reels need eight shots — this one needs one, filmed five times."},

 {id:"r11",date:"Sat 3",type:"REEL",series:"Fragrance 01",pillar:"Fragrance",film:"Sat 26 Sept",edit:"29 Sept–1 Oct",
  title:"The three I actually wear — fragrance reel",
  what:"Your perfumes, shot properly. Light and mist do all the work here.",
  shots:[
   {a:"CLOSE",h:"tripod",do:"Three bottles on the shelf in morning light. Move them until the light comes through the glass.",s:8},
   {a:"CLOSE",h:"tripod",do:"Your hand picking one up and taking the cap off.",s:8},
   {a:"CLOSE",h:"tripod",do:"The spray, with a window directly behind it so the mist shows. Film this four times — it is the shot the whole reel is built on.",s:6},
   {a:"CLOSE",h:"hand",do:"Wrist to the neck, the way you actually put it on.",s:6},
   {a:"MEDIUM",h:"tripod",do:"You picking up your bag and leaving the room.",s:6}],
  say:"one for the school run, one for class, one for when i'm actually going somewhere.",
  note:"Fragrance is the easiest paid category on Instagram and the one your reference pages earn from most. This post exists so there's something to show a brand in month two."},

 {id:"c3",date:"Wed 30",type:"CAROUSEL",series:"Travel",pillar:"Travel",film:"photos by 26 Sept",edit:"28 Sept",
  title:"Dubai, away from the malls — photo post",
  what:"Photos from your own phone of the parts of Dubai you actually like.",
  shots:[
   {a:"PHOTO",do:"Send <b>eight photos of Dubai you've taken yourself</b> — quiet spots, a café, evening light, the water. Not the tourist ones."},
   {do:"Nothing new to shoot unless you want to."}],
  note:"Place posts get saved by people planning trips, so they keep working for months. Every one of your reference pages leans on this."},

 {id:"r12",date:"Sun 4",type:"REEL",series:"6AM 04",pillar:"Lifestyle",film:"Sat 26 Sept",edit:"30 Sept–2 Oct",
  title:"The whole morning, start to finish — the long one",
  what:"The longest and best-looking version of your morning. Same routine as post one, a month better.",
  shots:[
   {a:"MEDIUM",h:"tripod",do:"Curtains opening. Stand to one side so the light comes in past you.",s:8},
   {a:"WIDE",h:"tripod",do:"Making the bed. Whole bed in frame, normal speed.",s:15},
   {a:"CLOSE",h:"tripod",do:"Bathroom — water running, face wash. Hands only.",s:12},
   {a:"CLOSE",h:"tripod",do:"The coffee, all of it — kettle, pour, stir.",s:20},
   {a:"WIDE",h:"tripod",do:"Walking out to the balcony, from behind.",s:8},
   {a:"MEDIUM",h:"tripod",do:"The first sip, city behind you.",s:10}],
  note:"Deliberately the same shots as the first post of the month. In a month you'll see how much better you've got — and so will everyone watching."}]},

{w:4,head:"Week 4",sub:"6 – 12 Oct",note:"Closing the month: the honest one, the hard gym morning, the recap and the reflection.",
 shoot:"<b>Thu 1 Oct</b> — course morning, last photos for the recap. <b>Sat 3 Oct</b> — main block. Light week, mostly photos.",posts:[

 {id:"r13",date:"Tue 6",type:"REEL",series:"Soft Life Notes 02",pillar:"Lifestyle",kids:true,film:"Sat 3 Oct",edit:"4–5 Oct",
  title:"8:31am, and the house is quiet — school run and the silence after",
  what:"The school-run morning and the silence right after it. The most honest post of the month.",
  shots:[
   {a:"CLOSE",h:"tripod",do:"Two lunchboxes being closed.",s:8},
   {a:"CLOSE",h:"tripod",do:"Small shoes by the front door. Just the shoes.",s:6},
   {a:"CLOSE",h:"tripod",do:"A hand on the door handle, door opening.",s:6},
   {a:"POV",h:"hand",do:"From the driver's seat — the drive back home, parked or filmed by someone else.",s:10},
   {a:"WIDE",h:"tripod",do:"You sitting down alone with coffee in the quiet house. Set the tripod, start it, and don't move it.",s:15}],
  say:"8:31am. the house is quiet. this is the part nobody films.",
  note:"<b>The second and last post with the children in</b>, and only their shoes and a lunchbox. Post this and read the comments — this is the kind of video that finds the exact audience you want."},

 {id:"c4",date:"Wed 7",type:"CAROUSEL",series:"Personal growth",pillar:"Lifestyle",film:"photos by 3 Oct",edit:"5 Oct",
  title:"Six things I'm unlearning — written photo post",
  what:"A written post over simple images. This replaces quote graphics.",
  shots:[
   {a:"PHOTO",do:"No filming. Send <b>six quiet photos</b> — hands, coffee, a window, your desk, anything calm."},
   {do:"If any of the six things are yours, tell Prince and we write them in your words."}],
  note:"Real thoughts in your own words always beat a quote on a coloured background. That's why quote posts came out of the plan."},

 {id:"r14",date:"Fri 9",type:"REEL",series:"Strong Body 02",pillar:"Fitness",film:"Sat 3 Oct",edit:"6–8 Oct",
  title:"Gym on the mornings I don't want to go — the honest one",
  what:"The 6am gym morning when it isn't glamorous. Low light, one line of text.",
  shots:[
   {a:"CLOSE",h:"tripod",do:"Alarm on the phone screen, still dark in the room.",s:6},
   {a:"CLOSE",h:"tripod",do:"Gym clothes laid out the night before, being picked up.",s:8},
   {a:"POV",h:"hand",do:"The car park or the walk in, before the sun's properly up.",s:8},
   {a:"MEDIUM",h:"tripod",do:"One set. Nothing dramatic — whatever you're actually doing.",s:12},
   {a:"MIRROR",h:"hand",do:"After. Flushed, tired, not posed. This is the shot that makes people believe the rest.",s:8}],
  say:"i don't feel like it most mornings either. i just stopped letting that be the deciding vote.",
  note:"<b>This is the flexible slot.</b> If you travel or go out this month, we swap this reel for whatever you actually got — and you already have two gym posts up by then."},

 {id:"c5",date:"Sat 10",type:"CAROUSEL",series:"Month one recap",pillar:"Interiors",film:"photos by 3 Oct",edit:"8 Oct",
  title:"One month of design school — work-in-progress photo post",
  what:"Everything from the course so far, in one post. The month's milestone.",
  shots:[
   {a:"PHOTO",do:"Photograph <b>every sketch and piece of work</b> so far. One each, flat on the table, daylight, no flash."},
   {a:"PHOTO",do:"One photo of your desk or the studio."},
   {a:"PHOTO",do:"One of you there, if you're comfortable."}],
  note:"Milestone posts beat ordinary posts on all six pages we studied. This one also sets up month two."},

 {id:"r15",date:"Sun 11",type:"REEL",series:"6AM 05",pillar:"Lifestyle",vo:true,film:"Sat 3 Oct",edit:"8–10 Oct",
  title:"One month in — the closing voiceover reel",
  what:"The morning ritual one last time, with a short voiceover looking back.",
  shots:[
   {do:"<b>Film the same morning routine as post one</b> — curtains, bed, coffee, balcony. You'll notice you're much better at it now."},
   {do:"Record a short voiceover at home. Under 30 seconds."}],
  say:"So that's a month. I said three, and honestly I thought I'd have quietly stopped by now. I haven't. Same alarm, same coffee, same balcony. I've just filmed it enough times now that I don't overthink it. The only thing that really changed is I stopped waiting until I felt ready. Two more months. Same time tomorrow.",
  note:"The post that turns four weeks of content into a story with a beginning and an end. Also the strongest thing we can show anyone who asks what we do."}]},

{w:5,head:"Buffer",sub:"13 – 14 Oct",note:"Two spare days. Nothing scheduled on purpose.",
 shoot:"No shoot. These days exist so nothing is ever rushed.",posts:[

 {id:"b1",date:"Tue 13",type:"PHOTO",series:"Flexible",pillar:"Travel",film:"—",edit:"—",
  title:"Photo post — whatever actually happened this month",
  what:"A dinner, a staycation, an event. Only if there was one.",
  shots:[
   {a:"PHOTO",do:"Nothing planned. If you took photos somewhere this month you liked, send them."},
   {do:"If not, we skip it. An empty slot beats a filler post."}],
  note:"Every calendar needs slack. If any post above slipped, it lands here instead."},

 {id:"b2",date:"Wed 14",type:"REVIEW",series:"Month close",pillar:"—",film:"—",edit:"—",
  title:"Month one review — numbers and what month two changes",
  what:"Prince pulls the numbers on all 20 posts and we decide what month two doubles down on.",
  shots:[
   {do:"Nothing for you to do."},
   {do:"You get a short summary: what worked, what didn't, and what we do more of next month."}],
  note:"Then the next 30 days go up on this same link — 15 Oct to 14 Nov."}]}
];
