import type { Category } from "@/lib/types";

/**
 * Hand-written content pools used when no API key is configured (or an upstream
 * API fails). Kept realistic so the demo still looks and feels like a real product.
 */

type Story = [title: string, description: string];

export const NEWS_POOL: Record<Category, Story[]> = {
  technology: [
    ["Open-source AI models close the gap with proprietary giants", "New benchmarks show community-built language models now match commercial systems on reasoning tasks at a fraction of the cost."],
    ["Chipmakers race to build 2nm processors as demand surges", "Foundries are expanding capacity worldwide as smartphone and data-centre customers compete for next-generation silicon."],
    ["Browsers ship passkeys by default, signalling the end of passwords", "Major browsers now prompt users to create passkeys at sign-up, a move security experts call long overdue."],
    ["India's UPI crosses 20 billion monthly transactions", "The real-time payments network continues record growth as new credit-on-UPI features roll out nationwide."],
    ["Quantum startup demonstrates error-corrected logical qubits", "Researchers report a milestone that could bring practical quantum computers years closer than expected."],
    ["Web developers embrace server components for faster sites", "Frameworks are shifting rendering back to the server, cutting JavaScript bundles and improving Core Web Vitals."],
    ["Satellite internet reaches remote Himalayan villages", "Low-earth-orbit constellations are bringing broadband to schools and clinics previously cut off from the web."],
    ["Electric scooters get smarter with on-device AI", "New models predict battery range and detect potholes in real time using compact neural networks."],
    ["Robotics firms unveil humanoids for warehouse work", "General-purpose robots are being piloted in logistics hubs to handle repetitive picking and packing jobs."],
    ["Developers report productivity jump with AI pair programmers", "A survey of 30,000 engineers finds coding assistants now help with tests, reviews and documentation."],
  ],
  business: [
    ["Markets rally as inflation cools for a third straight month", "Equities climbed to record highs as investors bet on interest-rate cuts later this year."],
    ["Startups shift focus from growth to profitability", "Founders are trimming burn rates and prioritising sustainable revenue as venture funding stays selective."],
    ["Rupee steadies as foreign investment returns to Indian bonds", "Inclusion in global bond indices has drawn billions in inflows, supporting the currency."],
    ["Retailers bet on quick commerce with 10-minute delivery", "Dark stores are multiplying in metros as consumers embrace ultra-fast grocery delivery."],
    ["Green hydrogen projects attract record investment", "Energy majors are committing billions to electrolyser plants as costs continue to fall."],
    ["Gold hits all-time high amid global uncertainty", "Central-bank buying and safe-haven demand pushed the precious metal past a new milestone."],
    ["Remote-first companies report lower attrition", "A new study links flexible work policies to stronger retention and employee satisfaction."],
    ["Semiconductor stocks lead tech earnings season", "Strong guidance from chip designers lifted the broader technology sector."],
  ],
  sports: [
    ["India seal series win with a thrilling final-over finish", "A composed knock from the middle order guided the hosts home with two balls to spare."],
    ["Underdogs stun champions in a Champions League classic", "A late header completed a remarkable comeback in one of the most dramatic nights of the season."],
    ["Neeraj Chopra opens season with a world-leading throw", "The Olympic champion set the tone for the year with a commanding performance in Doha."],
    ["Formula 1 rookies shake up the grid in a wet-weather race", "Changing conditions produced a surprise podium and a fresh twist in the championship battle."],
    ["Pro Kabaddi League breaks viewership records", "The tournament's opening week drew its largest audience yet across streaming and TV."],
    ["Tennis legend announces farewell tour", "The 20-time major winner will play a final season of exhibition matches around the world."],
    ["Women's cricket league signs record broadcast deal", "The new agreement more than doubles the value of the previous contract."],
    ["Marathon runners embrace carbon-plated super shoes", "Elite and amateur athletes alike are posting personal bests thanks to new footwear technology."],
  ],
  entertainment: [
    ["Indie film sweeps major awards at international festival", "The low-budget drama took home best picture, director and screenplay honours."],
    ["Streaming platforms bet big on regional language originals", "Kannada, Tamil and Malayalam series are finding global audiences through subtitles and dubbing."],
    ["Concert tour becomes the highest-grossing of all time", "The pop superstar's stadium run has surpassed every previous record for ticket sales."],
    ["Animated sequel delights critics and families alike", "The follow-up to the beloved hit is being praised for its heart, humour and stunning visuals."],
    ["Classic sitcom reunion special announced", "The original cast will return for a one-night event celebrating the show's anniversary."],
    ["Video game adaptation tops the global box office", "Fans turned out in force for the long-awaited big-screen version of the hit franchise."],
    ["Music producers experiment with AI-assisted composition", "Artists are using new tools to sketch melodies while debating questions of authorship."],
    ["Bollywood thriller earns rave reviews at premiere", "Audiences praised the twist-filled screenplay and standout lead performances."],
  ],
  science: [
    ["Space telescope spots water vapour on a distant exoplanet", "Astronomers say the discovery makes the planet a prime target in the search for habitable worlds."],
    ["Chandrayaan data reveals new details about lunar south pole", "Scientists have mapped sulphur and other elements that could support future missions."],
    ["Researchers grow functional mini-livers in the lab", "The organoids could transform drug testing and reduce the need for animal trials."],
    ["Coral reefs show signs of recovery in protected zones", "Marine biologists report encouraging regrowth where fishing and tourism are restricted."],
    ["Physicists measure gravity at the smallest scale yet", "A tabletop experiment brings scientists closer to reconciling gravity with quantum mechanics."],
    ["Ancient DNA rewrites the story of early human migration", "Genetic analysis suggests populations crossed continents thousands of years earlier than thought."],
    ["New battery chemistry promises safer, cheaper storage", "Sodium-ion cells could make grid-scale renewable storage more affordable."],
  ],
  health: [
    ["Short daily walks linked to longer life, study finds", "Just 20 minutes of brisk walking per day was associated with a significant drop in mortality risk."],
    ["New malaria vaccine rollout expands across Africa", "Health officials hope the shot will save tens of thousands of children every year."],
    ["Doctors warn about the hidden costs of poor sleep", "Chronic sleep deprivation is tied to heart disease, diabetes and weakened immunity."],
    ["Wearables detect early signs of illness before symptoms", "Changes in heart-rate variability can flag infections days in advance, researchers say."],
    ["Millets make a comeback as a healthy staple", "Nutritionists highlight the ancient grains' fibre, protein and low glycaemic index."],
    ["Mental-health apps see surge in use among students", "Universities are partnering with digital platforms to expand access to counselling."],
    ["Air-quality alerts help cities cut pollution exposure", "Real-time warnings encourage residents to limit outdoor activity on high-smog days."],
  ],
};

export const NEWS_SOURCES = ["The Daily Byte", "Global Wire", "Metro Times", "The Ledger", "Pulse Report", "Orbit News"];

type Movie = [title: string, overview: string, rating: number, year: number];

/** Movies grouped by the user category they best match. */
export const MOVIE_POOL: Record<Category, Movie[]> = {
  technology: [
    ["Interstellar", "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.", 8.4, 2014],
    ["The Social Network", "The story of how a Harvard student built a social network that changed the way we connect.", 7.7, 2010],
    ["Ex Machina", "A programmer evaluates the human qualities of a breathtaking humanoid A.I.", 7.6, 2014],
    ["Her", "A lonely writer develops an unlikely relationship with an operating system designed to meet his every need.", 7.9, 2013],
    ["Blade Runner 2049", "A young blade runner's discovery of a long-buried secret leads him to track down a former blade runner.", 7.6, 2017],
    ["The Matrix", "A hacker learns the shocking truth about his reality and his role in the war against its controllers.", 8.2, 1999],
  ],
  business: [
    ["The Big Short", "Four outsiders foresee the credit and housing bubble collapse and decide to take on the big banks.", 7.4, 2015],
    ["Moneyball", "An Oakland A's general manager uses data analytics to assemble a competitive team on a budget.", 7.6, 2011],
    ["Rocketry: The Nambi Effect", "The life of a brilliant ISRO scientist who was falsely accused of espionage.", 8.0, 2022],
    ["The Wolf of Wall Street", "The rise and fall of a stockbroker living the high life through fraud and corruption.", 8.0, 2013],
    ["Air", "A shoe salesman and his team chase a deal with a rookie basketball player that will change the industry.", 7.1, 2023],
  ],
  sports: [
    ["Lagaan", "Villagers in colonial India stake their future on a cricket match against their British rulers.", 8.1, 2001],
    ["Dangal", "A former wrestler trains his daughters to become world-class wrestlers.", 8.3, 2016],
    ["Ford v Ferrari", "American car designer Carroll Shelby and driver Ken Miles build a race car to defeat Ferrari at Le Mans.", 8.0, 2019],
    ["Rush", "The merciless 1970s rivalry between Formula 1 drivers James Hunt and Niki Lauda.", 7.7, 2013],
    ["83", "The story of India's historic victory at the 1983 Cricket World Cup.", 7.4, 2021],
    ["Creed", "The son of Apollo Creed seeks out Rocky Balboa to become his trainer and mentor.", 7.3, 2015],
  ],
  entertainment: [
    ["Everything Everywhere All at Once", "An exhausted laundromat owner discovers she must connect with parallel universe versions of herself.", 7.8, 2022],
    ["La La Land", "A jazz pianist and an aspiring actress fall in love while pursuing their dreams in Los Angeles.", 7.9, 2016],
    ["RRR", "A fictional tale of two legendary revolutionaries and their journey far from home.", 7.8, 2022],
    ["Spider-Man: Across the Spider-Verse", "Miles Morales catapults across the multiverse and encounters a team of Spider-People.", 8.4, 2023],
    ["Kantara", "A Kambala champion clashes with an upright forest officer in a village steeped in folklore.", 8.2, 2022],
    ["Coco", "A young musician enters the Land of the Dead to uncover his family's history.", 8.2, 2017],
  ],
  science: [
    ["Oppenheimer", "The story of J. Robert Oppenheimer's role in the development of the atomic bomb.", 8.1, 2023],
    ["The Martian", "An astronaut stranded on Mars must rely on his ingenuity to survive.", 7.7, 2015],
    ["Arrival", "A linguist works with the military to communicate with alien lifeforms after mysterious spacecraft appear.", 7.6, 2016],
    ["Hidden Figures", "Three brilliant African-American women at NASA serve as the brains behind a historic launch.", 8.0, 2016],
    ["Mission Mangal", "Scientists at ISRO overcome the odds to send a satellite to Mars.", 6.9, 2019],
  ],
  health: [
    ["Inside Out 2", "Joy, Sadness and the other emotions welcome some unexpected new arrivals.", 7.6, 2024],
    ["Soul", "A musician who has lost his passion for music is transported out of his body.", 8.0, 2020],
    ["Taare Zameen Par", "A teacher helps a dyslexic boy discover his true potential.", 8.3, 2007],
    ["Patch Adams", "A medical student uses humour to treat patients, defying medical conventions.", 6.8, 1998],
    ["Wonder", "A boy with facial differences enters fifth grade, attending a mainstream school for the first time.", 7.9, 2017],
  ],
};

export const SOCIAL_AUTHORS: [name: string, handle: string][] = [
  ["Priya Sharma", "priyacodes"],
  ["Arjun Rao", "arjun_builds"],
  ["Maya Chen", "mayadesigns"],
  ["Rahul Verma", "rahulonmarkets"],
  ["Sara Ali", "sarafitlife"],
  ["Leo Martins", "leo.films"],
  ["Ananya Iyer", "ananya_science"],
  ["Kabir Singh", "kabirsports"],
  ["Nina Patel", "ninareads"],
  ["Dev Kapoor", "devkapoor"],
];

export const SOCIAL_POOL: Record<Category, { text: string; tags: string[] }[]> = {
  technology: [
    { text: "Just shipped dark mode for our dashboard using CSS custom properties. Zero runtime cost and it feels buttery smooth.", tags: ["webdev", "css"] },
    { text: "Hot take: the best performance optimisation is the JavaScript you never send to the browser.", tags: ["javascript", "performance"] },
    { text: "Spent the weekend building a side project with Next.js + Redux Toolkit. RTK Query removes so much boilerplate!", tags: ["nextjs", "redux"] },
    { text: "Accessibility is not a feature, it's a baseline. Test your app with only a keyboard today.", tags: ["a11y", "frontend"] },
    { text: "AI pair-programming tip: write the test first, then let the assistant draft the implementation.", tags: ["ai", "testing"] },
  ],
  business: [
    { text: "Compounding is boring for 10 years and magical after 20. Start your SIP early.", tags: ["investing", "finance"] },
    { text: "Every great startup I know obsesses over one metric: retention. Growth follows.", tags: ["startups", "product"] },
    { text: "Markets at all-time highs. Reminder: asset allocation matters more than timing.", tags: ["markets", "stocks"] },
    { text: "Customer interviews > dashboards. Talk to five users this week.", tags: ["founders", "growth"] },
  ],
  sports: [
    { text: "That final over was pure cinema. What a time to be a cricket fan!", tags: ["cricket", "TeamIndia"] },
    { text: "Morning 10K done before sunrise. Consistency beats intensity.", tags: ["running", "fitness"] },
    { text: "Football is the only place where 90 minutes can feel like 9 seconds.", tags: ["football", "UCL"] },
    { text: "Kabaddi deserves way more global attention. The athleticism is unreal.", tags: ["kabaddi", "PKL"] },
  ],
  entertainment: [
    { text: "Rewatched Kantara last night and the final 20 minutes still give me goosebumps.", tags: ["movies", "kannada"] },
    { text: "Drop your comfort-show recommendations, I need something new to binge this weekend.", tags: ["tv", "streaming"] },
    { text: "The soundtrack of this year's biggest film is on repeat at my desk.", tags: ["music", "film"] },
    { text: "Animation in 2026 is on another level. Studios are taking real creative risks.", tags: ["animation", "cinema"] },
  ],
  science: [
    { text: "The universe is under no obligation to make sense to you — but it's so fun trying.", tags: ["space", "astronomy"] },
    { text: "Tonight: clear skies and Saturn's rings visible through a small telescope. Go look up!", tags: ["stargazing", "science"] },
    { text: "Every element heavier than iron was forged in a dying star. You are literally stardust.", tags: ["physics", "cosmos"] },
  ],
  health: [
    { text: "Small habit that changed my life: no screens for the first 30 minutes after waking up.", tags: ["wellness", "habits"] },
    { text: "Hydration check! Have you had a glass of water in the last hour?", tags: ["health", "selfcare"] },
    { text: "Strength training isn't just for athletes. Your future self will thank you.", tags: ["fitness", "longevity"] },
  ],
};

/** Free, key-less placeholder imagery seeded per item so images stay stable. */
export function placeholderImage(seed: string, w = 800, h = 500): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;
}
