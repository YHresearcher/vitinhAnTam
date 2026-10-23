-- English translations for the first 3 blog posts (2026-10-23)
-- Run in the Supabase SQL Editor, project xcntykeeeapidreqiueg
-- NOTE: Post 1 reflects the live corrections (uniform 6-month warranty wording
-- in criterion 7, FAQ #3 and meta description), not the original seed text.

UPDATE public.blog_posts SET
  title_en = 'Buying a Used Office Computer: 7 Checks to Pick a Durable Machine at a Good Price',
  excerpt_en = 'Used office computers save 40–60% versus buying new, but a bad pick becomes a money pit of constant breakdowns. Below are the 7 criteria the technicians at Vi Tinh An Tam use to select every machine — checks you can easily run yourself before you pay.',
  content_en = $html$
<p>A brand-new office computer costs VND 10–15 million, while a used business-class machine (Dell OptiPlex, HP EliteDesk, Lenovo ThinkCentre) starts at just VND 3–6 million yet is actually more durable than a new budget machine in the same price range. The question is whether a used machine is a gamble — and that depends entirely on how carefully it is checked. This article sums up the 7 core criteria to help you pick a machine that runs reliably for the next 3–5 years.</p>

<h2>Why should small businesses consider used office computers?</h2>
<p>Business desktop lines are designed to run 8–12 hours a day in large office environments, with components built to a much higher standard than cheap assembled machines. When corporations upgrade their systems, these machines reach the market at only 30–40% of their original price, with most of their lifespan still ahead of them. If you know how to check them, they are excellent value for accounting, sales, cashier work and office staff.</p>

<h2>7 checks to run when buying a used computer</h2>

<h3>1. The mainboard must be original and never repaired</h3>
<p>This is the most important criterion. A mainboard that has been soldered, had capacitors replaced or had its power circuitry "modified" will develop intermittent faults that are very hard to diagnose. Ask the seller to open the machine up: the board must be clean, with no suspicious solder marks and no bulging capacitors. Every machine at Vi Tinh An Tam is hand-picked by exactly this standard: <strong>100% original mainboards that have never been repaired or patched</strong>.</p>

<h3>2. SSD health must be 90% or higher</h3>
<p>The SSD is the component where wear over time shows most clearly. Use CrystalDiskInfo to check the Health Status: below 80%, the drive is badly worn, with a real risk of slowdowns and data loss. A good machine should read 95–100%, with Total Host Writes low relative to the drive's rated lifespan.</p>

<h3>3. CPU and RAM matched to real work</h3>
<p>For office work (Word, Excel, accounting and point-of-sale software, many browser tabs), the sweet spot is an Intel Core i5, 8th generation or newer, with 8–16GB of RAM. Don't pay extra for power you will never use — but don't buy 4GB of RAM either: Windows 11 and Chrome will make the machine hang constantly.</p>

<h3>4. A stable, correctly rated power supply</h3>
<p>A weak or failing power supply is the leading cause of random restarts and freezes. Prefer business desktops with the manufacturer's original PSU; for assembled machines, the PSU should deliver a genuine 400W or more from a reputable brand.</p>

<h3>5. Temperature and noise under load</h3>
<p>Run the machine for 15–20 minutes with heavy tasks (many tabs open, video playing, real software running). A good machine stays quiet, with CPU temperature stable below 75°C. A howling fan and a hot case are signs the thermal paste has dried out or the cooling system has problems.</p>

<h3>6. Windows must be a clean digital license</h3>
<p>Many used machines on the market run Windows activated with cracking tools — a malware risk, a risk of activation being revoked mid-use, and especially dangerous on machines holding accounting data and e-invoices. Choose a machine that is <strong>activated with a Microsoft digital license bound to the machine itself</strong> — you can verify it in Settings, which shows the line "Windows is activated with a digital license".</p>

<h3>7. A clear warranty policy you can look up</h3>
<p>No matter how good a used machine is, it still needs a real warranty. The standard to choose is a used computer with a uniform 6-month warranty on the entire machine, with a warranty slip or lookups available by serial number (S/N) and phone number — this is also the policy Vi Tinh An Tam applies to every machine it sells. Steer clear of sellers who only offer a "7-day test" — most faults in used machines appear after a few weeks of use. At Vi Tinh An Tam, customers can <a href="/tra-cuu-bao-hanh">look up their warranty online</a> at any time using the machine's serial number.</p>

<h2>Recommended configurations by need</h2>
<ul>
<li><strong>Accounting, sales, cashier:</strong> Core i5 Gen 8–10, 8GB RAM, 256GB SSD — smooth for MISA, KiotViet and multiple Excel files.</li>
<li><strong>Office staff, customer support:</strong> Core i5 Gen 8, 16GB RAM, 256GB SSD — comfortably handles 20–30 browser tabs.</li>
<li><strong>Light design work, engineering:</strong> Core i7, 16–32GB RAM, 512GB SSD; consider adding a dedicated graphics card.</li>
</ul>

<h2>Where to buy a used office computer you can trust in Tay Ninh?</h2>
<p>Choosing where to buy matters as much as choosing the machine: look for a clear shop address, the chance to inspect the machine in person, a written warranty and after-sales technical support. Vi Tinh An Tam (52 Nguyen Cuu Van Street, Long An Ward, Tay Ninh Province) specializes in hand-picked business desktops and laptops — every machine passes hardware inspection, cleaning and fresh thermal paste before delivery, with a proper warranty and on-site support when needed.</p>
<p>See the machines currently in stock at <a href="/#san-pham">Vi Tinh An Tam's inventory</a> or call hotline <strong>0909.053.058</strong> for advice on the right configuration for your needs and budget.</p>
$html$,
  meta_title_en = 'What Should You Check When Buying a Used Office PC? 7 Key Criteria',
  meta_description_en = 'How to choose a used office computer with a 6-month warranty: 7 checks covering the mainboard, SSD health, battery and the warranty terms to confirm before you buy — in Tay Ninh.',
  faq_schema_en = '[{"question":"Are used office computers durable?","answer":"Yes, if you choose the right business desktop lines (Dell OptiPlex, HP EliteDesk, Lenovo ThinkCentre) with an original mainboard and a healthy SSD. These lines are designed to run reliably for 5–7 years in office environments."},{"question":"What configuration should I choose for accounting and sales staff?","answer":"A Core i5, 8th generation or newer, with 8–16GB of RAM and a 256GB SSD is the most balanced configuration: it runs accounting software, point-of-sale software and many browser tabs smoothly."},{"question":"How long is the warranty on a used computer at Vi Tinh An Tam?","answer":"Every computer at Vi Tinh An Tam carries a uniform 6-month warranty covering the whole machine, and you can check it online by serial number (S/N) or phone number on the Warranty Lookup page."}]'::jsonb
WHERE slug = 'mua-may-tinh-van-phong-cu-7-tieu-chi-kiem-tra';

UPDATE public.blog_posts SET
  title_en = 'Computer Running Slow and Freezing? 5 Signs Your SSD Is About to Fail and How to Check Drive Health',
  excerpt_en = 'Takes 5 minutes to boot into Windows, freezes when you open Excel, the occasional blue screen? Your SSD may well be worn out and about to fail completely. Spot these 5 signs early and you can rescue your data before it''s too late.',
  content_en = $html$
<p>An SSD does not fail suddenly the way many people think — it "warns" you through a string of small signs we usually ignore: the machine gradually slows down, files stutter when opened, it restarts itself now and then. By the time the SSD dies completely, the accounting data, photos and documents inside are almost impossible to recover. This article helps you recognize the signs early and <strong>check your SSD health</strong> yourself at home.</p>

<h2>Why do SSDs wear out over time?</h2>
<p>Each memory cell in an SSD can only withstand a limited number of write/erase cycles. After a few years of use, the cells gradually wear out and the controller has to constantly "dodge" faulty areas, so read and write speeds drop sharply. High temperatures and unstable power accelerate the decline — especially on office machines running continuously 8–12 hours a day.</p>

<h2>5 signs your SSD is about to fail</h2>

<h3>1. Abnormally slow startup and app loading</h3>
<p>A machine that used to reach Windows in 15 seconds now takes 2–3 minutes, and Word and Excel take forever to open even though the specifications are not weak. This is the classic sign of a worn-out SSD: random read speeds have fallen dramatically.</p>

<h3>2. Frequent brief freezes, then it recovers</h3>
<p>While you work, the mouse pointer locks up and software shows "Not Responding" for a few seconds to a few dozen seconds. That is the SSD hitting a faulty memory area and having to retry the read multiple times.</p>

<h3>3. File errors and blue screens appear</h3>
<p>Files suddenly report as corrupted, Windows occasionally blue-screens (BSOD) while accessing data, or the machine reports a "disk read error" at startup. At this stage, your data is genuinely in danger.</p>

<h3>4. Checking software reports low Health and bad sectors</h3>
<p>This is the clearest evidence of all: Health Status below 80%, or yellow and red warnings appear. Below 50%, replace the drive within the week — do not wait.</p>

<h3>5. The machine runs hotter and the fan is louder than usual</h3>
<p>A failing SSD forces the system to keep retrying tasks, heating up both the CPU and the drive. If your machine suddenly gets loud and hot even while just browsing the web, get it checked over right away.</p>

<h2>How to check SSD health yourself with CrystalDiskInfo</h2>
<ul>
<li>Download <strong>CrystalDiskInfo</strong> (free) and open it — your drive information appears right on the main screen.</li>
<li>Look at <strong>Health Status</strong>: "Good 100%" means healthy; below 80% means badly worn; below 50% means replace it urgently.</li>
<li>Also check <strong>Temperature</strong> (it should stay below 50°C in normal use) and <strong>Total Host Writes</strong> (the total data written — the higher it is, the "older" the drive).</li>
<li>If the status shows Caution or Bad, or the Reallocated Sectors count is rising, <strong>back up your important data immediately</strong>.</li>
</ul>

<h2>Will replacing the SSD lose my data? How long does it take?</h2>
<p>If the old SSD is still readable, the technician will clone the entire operating system, software and data to the new SSD — you get your machine back exactly as it was, only much faster, usually completed within 30–60 minutes. If the SSD is already completely dead, the chances of data recovery depend on the extent of the damage and the cost is considerably higher — which is why you should replace the drive at the first signs.</p>
<p>Is your machine unusually slow? Bring it to Vi Tinh An Tam (52 Nguyen Cuu Van Street, Long An Ward, Tay Ninh Province) for a <strong>free drive health check</strong>, or <a href="/dat-lich">book a technician to visit you on-site</a>. Hotline: <strong>0909.053.058</strong>.</p>
$html$,
  meta_title_en = '5 Signs Your SSD Is Failing & How to Check Drive Health at Home',
  meta_description_en = 'Slow boot times, files that freeze on open, the occasional blue screen? Your SSD may be worn out. See the 5 signs of a failing SSD and how to check your drive''s health percentage before you lose data.',
  faq_schema_en = '[{"question":"At what Health percentage should I replace my SSD?","answer":"Below 80%, plan a replacement and back up your data regularly. Below 50%, or once bad sectors appear, replace it right away to avoid sudden data loss."},{"question":"Will a new SSD lose my data and software?","answer":"No, as long as the old drive is still readable. The technician clones all of Windows, your software and your data to the new drive, and you carry on using the machine as before."},{"question":"Does an SSD health check at Vi Tinh An Tam cost anything?","answer":"Checks and advice are completely free at the shop, 52 Nguyen Cuu Van Street, Long An Ward, Tay Ninh Province, or by appointment with an on-site technician."}]'::jsonb
WHERE slug = 'dau-hieu-ssd-sap-hong-cach-kiem-tra-suc-khoe-o-cung';

UPDATE public.blog_posts SET
  title_en = 'What Are Genuine Windows and Office Keys? The Different Key Types and How to Choose for Your Office',
  excerpt_en = 'A Windows key permanently bound to the mainboard, a perpetual Office key activated online, Microsoft 365 as a yearly subscription — how do these three types differ, and which should your office choose? This article explains it plainly, with no confusing jargon.',
  content_en = $html$
<p>A great many office computers in Vietnam still run "cracked" Windows and Office — activated with pirated tools. The consequences usually arrive without warning: the key gets blocked in the middle of tax season, malware sneaks in through the cracking tool, accounting data gets encrypted. Meanwhile, genuine <strong>Windows license keys</strong> and authentic Office have become much cheaper than a few years ago. The problem is that there are 3 different types of key, and they are not all the same.</p>

<h2>What is a genuine license key?</h2>
<p>A genuine license key is an activation code issued by Microsoft, certifying that the software on your machine is legal. A properly activated machine receives full security patches, has no feature restrictions, shows no "Activate Windows" warnings, and is safe for work data, e-invoices and banking transactions.</p>

<h2>The 3 common key types, distinguished</h2>

<h3>1. Windows keys — a perpetual digital license bound to the mainboard</h3>
<p>Windows 10/11 Pro and Home in <strong>Digital License</strong> form: activate once, and the digital license is bound to the machine's mainboard with permanent validity. Reinstalling Windows on the same machine reactivates automatically, with no need to enter a key. This is the best-suited key type for office machines used over the long term.</p>

<h3>2. Office keys — a perpetual license, activated online</h3>
<p>Office 2019, 2021 and 2024 Pro Plus in Retail form: buy once and use Word, Excel, PowerPoint and Outlook forever — <strong>with no recurring renewal fees</strong>. The key is activated online once during installation. An important note: an Office key is <em>not</em> bound to the mainboard like Windows — the two key types work by different mechanisms, so do not let a less-than-reputable seller blur them together when advising you.</p>

<h3>3. Microsoft 365 — a yearly subscription</h3>
<p>Microsoft 365 (Family/Personal) is not a perpetual key: it is a <strong>12-month subscription</strong> that must be renewed when it expires. In return, you always get the latest Office version plus 1TB of OneDrive cloud storage. It is a good fit if you need documents synced across multiple devices and like always using the newest release.</p>

<h2>The risks of suspiciously cheap keys and cracked software</h2>
<ul>
<li><strong>Keys getting revoked:</strong> "gray-market" keys are usually bulk keys resold illegally, and Microsoft can block them at any time — your machine loses activation right when you need it most.</li>
<li><strong>Malware from cracking tools:</strong> activation-cracking tools are the most common source of viruses and trojans that steal banking passwords and encrypt data for ransom on office machines.</li>
<li><strong>Missing security patches:</strong> a machine used for accounting and e-invoices that misses updates is a direct risk to the business.</li>
</ul>

<h2>Which type should your office choose?</h2>
<ul>
<li>Fixed machines used long-term: <strong>a Windows digital license + perpetual Office</strong> — one single cost, years of peace of mind.</li>
<li>People who change machines often and need cloud storage and the latest version: <strong>Microsoft 365</strong> by the year.</li>
<li>Buying a used machine: prefer one that already has a Windows digital license installed on the machine, so you do not pay extra for a key.</li>
</ul>
<p>At Vi Tinh An Tam, Windows and Office keys are genuine products, with a <strong>1-for-1 replacement warranty</strong> if activation fails. See the keys currently on sale in the <a href="/#san-pham">Software &amp; License Keys section</a> or call <strong>0909.053.058</strong> for advice on the right key type for your needs — buying right the first time is always cheaper than buying cheap and buying again.</p>
$html$,
  meta_title_en = 'What Are Genuine Windows & Office Keys? Windows vs Office vs Microsoft 365 Explained',
  meta_description_en = 'A Windows digital license permanently bound to the mainboard, perpetual Office activated online, Microsoft 365 as a subscription — how do they differ, and which should an office choose?',
  faq_schema_en = '[{"question":"How long does a genuine Windows key last?","answer":"A Windows key in digital license form (Digital License) is valid permanently, bound to the mainboard of the machine. Reinstalling Windows on the same machine reactivates automatically, at no extra cost."},{"question":"How do Office keys and Microsoft 365 differ?","answer":"An Office key (2019/2021/2024) is a perpetual license: buy once, activate online, no recurring fees. Microsoft 365 is a 12-month subscription that includes 1TB of OneDrive and always uses the latest Office version."},{"question":"Are keys bought at Vi Tinh An Tam covered by a warranty?","answer":"Yes. Genuine Windows and Office keys at the shop come with a 1-for-1 replacement warranty if an activation error occurs."}]'::jsonb
WHERE slug = 'key-windows-office-ban-quyen-la-gi-phan-biet-cac-loai-key';
