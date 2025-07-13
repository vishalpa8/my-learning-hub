// --- Playlists and Video Data ---

/**
 * @typedef {object} VideoData
 * @property {string} id - Unique ID for the video.
 * @property {string} title - Title of the video.
 * @property {string} [duration] - Optional: Duration of the video (e.g., "15:30").
 * @property {string} [thumbnailUrl] - Optional: URL to the video thumbnail.
 */

/**
 * @typedef {object} PlaylistData
 * @property {string} title - Title of the playlist.
 * @property {string} playlistUrl - URL to the YouTube playlist or single video.
 * @property {string} focusArea - Description of the playlist's focus.
 * @property {VideoData[]} videos - Array of video objects within the playlist.
 */

/** @type {Object.<string, PlaylistData>} */
// -------- 1400 - 1700 Elo Playlists (quality-checked) --------
export const playlistVideoData = {
  // 1. Core principles
  elo1400_fundamentals_bartholomew_1: {
    title: "Chess Fundamentals - IM John Bartholomew",
    playlistUrl:
      "https://www.youtube.com/playlist?list=PLl9uuRYQ-6MBwqkmwT42l1fI7Z0bYuwwO",
    focusArea:
      "Five crisp lessons that nail the bedrock of solid club-level chess: piece safety, coordination, typical errors to avoid, pawn play and trading decisions.",
    videos: [
      { id: "cf_jb_01", title: "Undefended Pieces" },
      { id: "cf_jb_02", title: "Coordination" },
      { id: "cf_jb_03", title: "Typical Mistakes" },
      { id: "cf_jb_04", title: "Pawn Play" },
      { id: "cf_jb_05", title: "Trades" },
    ],
  },

  // 2. Tactical finishing patterns
  elo1400_checkmates_gotham_1: {
    title: "6 Checkmate Patterns You MUST Know - GothamChess",
    playlistUrl: "https://www.youtube.com/watch?v=iBZLU1FXhcI",
    focusArea:
      "One evergreen video: Levy Rozman teaches the six mate nets that appear in thousands of club games. Memorise them - then spot them over the board!",
    videos: [
      { id: "cm_gc_01", title: "6 Essential Checkmates (Boden, Anastasia…)" },
    ],
  },

  // 3. Low-theory openings
  elo1400_openings_hangingpawns_1: {
    title:
      "3 Best Chess Openings for <1300 Elo (No Memorisation) - Hanging Pawns",
    playlistUrl: "https://www.youtube.com/watch?v=vwucXn9MtNc",
    focusArea:
      "Simple systems (London, Italian, Scandinavian) explained through ideas - perfect for players who still blunder pieces and can’t juggle long theory trees.",
    videos: [
      { id: "open_hp_01", title: "Opening #1 - The London System" },
      { id: "open_hp_02", title: "Opening #2 - The Italian Game" },
      { id: "open_hp_03", title: "Opening #3 - The Scandinavian Defence" },
    ],
  },

  // 4. Building middlegame sense
  elo1400_middlegame_matojelic_1: {
    title: "Chess Middlegame Strategy - Mato Jelic",
    playlistUrl: "https://www.youtube.com/playlist?list=PL03F54EB032CE6C7E",
    focusArea:
      "Classic Mato commentary on pawn structures, piece activity and fundamental tactical motifs. Each clip is a stand-alone lesson built around an instructive master game.",
    videos: [
      { id: "mid_mato_01", title: "Open vs. Closed Games" },
      { id: "mid_mato_02", title: "Pins & Skewers" },
      { id: "mid_mato_03", title: "Good vs. Bad Bishops" },
      { id: "mid_mato_04", title: "Using Outposts" },
      { id: "mid_mato_05", title: "When to Trade - Part 1" },
      { id: "mid_mato_06", title: "When to Trade - Part 2" },
      { id: "mid_mato_07", title: "Mating Patterns - Part 1" },
      { id: "mid_mato_08", title: "Mating Patterns - Part 2" },
      { id: "mid_mato_09", title: "X-Ray Tactics" },
      { id: "mid_mato_10", title: "Deflection Tactics" },
    ],
  },

  // 5. Endgame foundations
  elo1400_endgames_bartholomew_1: {
    title: "Chess Endgames - IM John Bartholomew",
    playlistUrl:
      "https://www.youtube.com/playlist?list=PLl9uuRYQ-6MDzm-bs8kbyHdYEmRGUauot",
    focusArea:
      "King-and-pawn basics thru Lucena, Philidor & Réti. Teaches the must-know techniques that decide half your rapid games once pieces come off.",
    videos: [
      { id: "eg_jb_01", title: "K+P vs King - The Square & Opposition" },
      { id: "eg_jb_02", title: "Opposition Exercise" },
      { id: "eg_jb_03", title: "Lucena Bridge Technique" },
      { id: "eg_jb_04", title: "Philidor Third-Rank Defence" },
      { id: "eg_jb_05", title: "First-Rank Defence vs Rook Pawn" },
      { id: "eg_jb_06", title: "Safe Squares (Outside Passer)" },
      { id: "eg_jb_07", title: "Vancura Draw Method" },
      { id: "eg_jb_08", title: "Short-/Long-Side Defence" },
      { id: "eg_jb_09", title: "Réti Study Explained" },
    ],
  },

  // 6. Rook endings (most common)
  elo1400_rookendgames_chessfactor_1: {
    title: "Essential Rook Endgames - ChessFactor",
    playlistUrl:
      "https://www.youtube.com/playlist?list=PL9RQPxG_e-LmVskyIV0oqFjBeDncqn3NQ",
    focusArea:
      "GM Alex Ipatov drills the three textbook rook endings every 1500 must convert or hold: Lucena, Philidor and Vancura.",
    videos: [
      { id: "re_cf_01", title: "Lucena - Building a Bridge" },
      { id: "re_cf_02", title: "Philidor - Third-Rank Defence" },
      { id: "re_cf_03", title: "Vancura - Cutting Off the King" },
    ],
  },

  // 7. Model thinking process
  elo1400_climbing_bartholomew_1: {
    title: "Climbing the Rating Ladder - IM John Bartholomew",
    playlistUrl:
      "https://www.youtube.com/playlist?list=PLl9uuRYQ-6MCBnhtCk_bTZsD8GxeWP6BV",
    focusArea:
      "John plays viewers from ~800 to 1800, verbalising every calculation. Watch how he spots tactics, builds plans and punishes common club-level errors.",
    videos: [
      { id: "crl_jb_01", title: "Episode 1 - Intro & Mind-set" },
      { id: "crl_jb_02", title: "Episode 2 - Undefended Pieces" },
      { id: "crl_jb_03", title: "Episode 3 - Coordination Tactics" },
      { id: "crl_jb_04", title: "Episode 4 - King Safety Blunders" },
      { id: "crl_jb_05", title: "Episode 5 - Punishing Passive Play" },
      { id: "crl_jb_06", title: "Episode 6 - Turning an Edge into a Win" },
    ],
  },

  // 8. Second end-game voice
  elo1400_endgames_hangingpawns_1: {
    title: "Chess Endgames Explained - Hanging Pawns",
    playlistUrl:
      "https://www.youtube.com/playlist?list=PLssNbVBYrGcAcadywNlkAGpO1-kLfy0y2",
    focusArea:
      "Stjepan reinforces pawn-endgame concepts and introduces rook-vs-pawn saves. Complements Bartholomew with slower, diagram-heavy explanations.",
    videos: [
      { id: "eg_hp_01", title: "King Opposition Basics" },
      { id: "eg_hp_02", title: "Pawn Breakthrough Patterns" },
      { id: "eg_hp_03", title: "Rook vs Pawn - Intro Principles" },
      { id: "eg_hp_04", title: "Shouldering & Shouldn’t-ering Kings" },
      { id: "eg_hp_05", title: "Triangulation & Tempo Plays" },
    ],
  },
  // =====================
  // Elo 1700-2000 ELO
  // =====================
  elo1700_speedrun_naroditsky_1: {
    title: "The Sensei Speedrun - GM Daniel Naroditsky",
    playlistUrl:
      "https://www.youtube.com/playlist?list=PLT1F2nOxLHOeyyw85utYJpWtSmxvA-2WR",
    focusArea:
      "Naroditsky climbs the rating ladder from 1000 → GM live, outlining calculation shortcuts, tactical motifs and conversion technique against stronger foes.",
    videos: [
      { id: "sr_dn_01", title: "Episode 1 - Crushing the London System" },
      {
        id: "sr_dn_02",
        title: "Episode 2 - Navigating Tactical Complications",
      },
      { id: "sr_dn_03", title: "Episode 3 - Endgame Technique Master-class" },
      { id: "sr_dn_04", title: "Episode 4 - Converting a Small Edge" },
      { id: "sr_dn_05", title: "Episode 5 - Exploiting Weak Kings" },
    ],
  },

  // 2. Strategic thinking & pawn-structure plans
  elo1700_meditations_hangingpawns_1: {
    title: "Chess Meditations - Hanging Pawns",
    playlistUrl:
      "https://www.youtube.com/playlist?list=PLssNbVBYrGcBWNWaOcC_GTx7Op05J_hO1",
    focusArea:
      "Stjepan dives into IQP, French, Carlsbad and other key structures, teaching prophylaxis, plan-making and improving piece activity for advanced club players.",
    videos: [
      { id: "med_hp_01", title: "Prophylactic Thinking" },
      { id: "med_hp_02", title: "Isolated Queen-Pawn Strategy" },
      { id: "med_hp_03", title: "King’s Indian vs. Benoni Structures" },
      { id: "med_hp_04", title: "Typical Breaks in the Carlsbad" },
      { id: "med_hp_05", title: "Transforming Advantages" },
    ],
  },

  // 3. Instinct & time-management training
  elo1700_instincts_naroditsky_1: {
    title: "Develop Your Instincts Speedrun - GM Daniel Naroditsky",
    playlistUrl:
      "https://www.youtube.com/playlist?list=PLT1F2nOxLHOdrvOyOXb_l2yGJrkwLA72Z",
    focusArea:
      "Fast-paced commentary games where Danya limits deep calculation, showing how pattern recognition and practical decision-making win under time pressure.",
    videos: [
      { id: "inst_dn_01", title: "#1 - Opening Traps & Tactics" },
      { id: "inst_dn_02", title: "#2 - Middlegame Manoeuvring" },
      { id: "inst_dn_03", title: "#3 - Converting an Advantage" },
      { id: "inst_dn_04", title: "#4 - Defensive Resourcefulness" },
      { id: "inst_dn_05", title: "#5 - Practical Endgames on Low Clock" },
    ],
  },

  // 4. Structured master lectures
  elo1700_intermediate_stlcc_1: {
    title: "Level: Intermediate - Saint Louis Chess Club",
    playlistUrl:
      "https://www.youtube.com/playlist?list=PLVWaFpMwtaGhJ9r9f0ikKI0rwGNtKMS-F",
    focusArea:
      "STL Chess Club’s classroom series for ~1600-1900: modern openings, tactical themes and strategic classics taught by IMs/GMs in white-board style sessions.",
    videos: [
      { id: "stl_int_01", title: "Nimzo-Indian: Core Ideas" },
      { id: "stl_int_02", title: "Benko Gambit Practical Plans" },
      {
        id: "stl_int_03",
        title: "Building an Attack on Opposite-Side Castles",
      },
      { id: "stl_int_04", title: "Exploiting the Weak Back Rank" },
      { id: "stl_int_05", title: "Dynamic Exchange Sacrifices" },
    ],
  },

  // 5. Plan-making & imbalance logic
  elo1700_stepbystep_chessexplained_1: {
    title: "Step-by-Step - IM Christof Sielecki (Chessexplained)",
    playlistUrl:
      "https://www.youtube.com/playlist?list=PLpbSCK-lQ8KeBXYvI1s1ru9e0_vaDg1a8",
    focusArea:
      "Christof walks through entire games, pausing at critical moments to weigh imbalances, formulate plans and illustrate prophylaxis - a blueprint for positional play.",
    videos: [
      { id: "sbs_ce_01", title: "Spotting Imbalances in the Middlegame" },
      { id: "sbs_ce_02", title: "Creating Winning Plans: A Case Study" },
      { id: "sbs_ce_03", title: "Prophylaxis & Piece Coordination" },
      { id: "sbs_ce_04", title: "Converting Queenside Space Advantage" },
      { id: "sbs_ce_05", title: "Handling the Two Bishops vs Knight & Bishop" },
    ],
  },

  // 6. GM insight mini-lessons
  elo1700_powerplay_danielking_1: {
    title: "Power Play (Selected Intros) - GM Daniel King",
    playlistUrl:
      "https://www.youtube.com/playlist?list=PLhyM8toCZs_q89MK8KupOxebPtasl6kHP",
    focusArea:
      "Short Grandmaster primers on piece improvement, deep calculation and pawn play - bite-size concepts to raise a strong club player’s ceiling.",
    videos: [
      { id: "pp_dk_01", title: "Improve Your Pieces - Intro" },
      { id: "pp_dk_02", title: "Calculation Principles - Intro" },
      { id: "pp_dk_03", title: "Pawn Power - Intro" },
      { id: "pp_dk_04", title: "Attack vs. Defence - Intro" },
      { id: "pp_dk_05", title: "Strategic Tests - Intro" },
    ],
  },

  // 7. Serious opening depth for e4 players
  elo1700_e4theory_hangingpawns_1: {
    title: "1.e4 Opening Theory - Hanging Pawns",
    playlistUrl:
      "https://www.youtube.com/playlist?list=PLssNbVBYrGcCa4bJH7JqmUZs3qNdSWUkG",
    focusArea:
      "Deep-dive guides to the Ruy Lopez, Sicilian and French. Ideal once you can already calculate tactics and now need solid main-line weapons.",
    videos: [
      { id: "e4_hp_01", title: "Ruy Lopez - Main Ideas & Plans" },
      { id: "e4_hp_02", title: "Sicilian Defence - Core Variations for White" },
      { id: "e4_hp_03", title: "French Defence - Typical Pawn Structures" },
      { id: "e4_hp_04", title: "Carro-Kann - Creating Space Advantage" },
      { id: "e4_hp_05", title: "Playing Against the Pirc/Modern" },
    ],
  },

  // 8. Advanced rook endings (practical conversion)
  elo1700_rookendgames_chessfactor_1: {
    title: "Advanced Rook Endgames - ChessFactor",
    playlistUrl:
      "https://www.youtube.com/playlist?list=PL9RQPxG_e-LmVskyIV0oqFjBeDncqn3NQ",
    focusArea:
      "GM Ipatov moves beyond textbook to show rook+minor-piece synergy, fortress ideas and multi-pawn races - skills that score points at expert level.",
    videos: [
      { id: "adv_re_cf_01", title: "Rook vs. 2 Pawns: Winning Technique" },
      { id: "adv_re_cf_02", title: "Rook & Knight vs. Rook: Philidor’s Draw" },
      { id: "adv_re_cf_03", title: "Building a Fortress in Rook Endgames" },
      { id: "adv_re_cf_04", title: "Cutting Off the King & Checking Distance" },
      { id: "adv_re_cf_05", title: "Transitioning to Theoretical Positions" },
    ],
  },

  // =====================
  // Elo 2000-2400 ELO
  // =====================
  elo2000_calculation_naroditsky_1: {
    title:
      "Want to Calculate Like a Grandmaster? Clearance Sacrifice - GM Daniel Naroditsky",
    playlistUrl: "https://www.youtube.com/watch?v=9Ga9dP3bvN8",
    focusArea:
      "One high-impact lecture on clearance themes: forcing lines open, spotting invisible resources and finishing tactics - perfect for sharpening GM-style calculation.",
    videos: [
      {
        id: "calc_dn_01",
        title:
          "Calculate Like a GM - The Power of Clearance Sacrifices (full lesson)",
      },
    ],
  },

  // 2. Elite attacking technique
  elo2000_kinghunt_shankland_1: {
    title: "King-Hunting Mastery - GM Sam Shankland (Master Method)",
    playlistUrl: "https://www.youtube.com/watch?v=hELzLhucKkY",
    focusArea:
      "Shankland dissects classic attacking games, showing move-by-move how to build, maintain and convert a kingside assault at master level.",
    videos: [
      { id: "kh_ss_01", title: "Creating a Pawn Storm & Opening Lines" },
      { id: "kh_ss_02", title: "Targeting Weak Squares Around the King" },
      { id: "kh_ss_03", title: "Sacrifices to Rip Open the Shelter" },
    ],
  },

  // 3. Structured GM classroom
  elo2000_advanced_stlcc_1: {
    title: "Level: Advanced - Saint Louis Chess Club",
    playlistUrl:
      "https://www.youtube.com/playlist?list=PLVWaFpMwtaGiMPN3WXi1igKC5bLkeRO7_",
    focusArea:
      "Grandmaster lectures on deep strategy, complex endgames and modern opening ideas - the STL ‘Expert’ classroom series.",
    videos: [
      {
        id: "adv_stl_01",
        title: "Positional Exchange Sacrifices - GM Akobian",
      },
      { id: "adv_stl_02", title: "Practical Rook Endgames - GM Finegold" },
      { id: "adv_stl_03", title: "Modern Benoni Ideas - GM Shankland" },
      { id: "adv_stl_04", title: "Handling Opposite-Colored Bishops" },
    ],
  },

  // 4. Bite-size GM strategy boosters
  elo2000_powerplay_danielking_1: {
    title: "Power Play (Advanced Intros) - GM Daniel King",
    playlistUrl:
      "https://www.youtube.com/playlist?list=PLhyM8toCZs_q89MK8KupOxebPtasl6kHP",
    focusArea:
      "Five 10-minute mini-lessons packing GM King’s best tips on attack, calculation and strategic tests - perfect daily brain-food for 2100-rated players.",
    videos: [
      { id: "pp_dk_01", title: "Power Play 17 - Attack: Key Principles" },
      { id: "pp_dk_02", title: "Power Play 20 - Strategic Test Positions" },
      { id: "pp_dk_03", title: "Power Play 26 - Typical Mistakes to Avoid" },
      { id: "pp_dk_04", title: "Power Play 32 - King Safety Diagnostics" },
      { id: "pp_dk_05", title: "Power Play 37 - Pawn Power Advanced" },
    ],
  },

  // 5. Advanced middlegame mastery
  elo2000_middlegame_hangingpawns_1: {
    title: "Chess Middlegame Ideas - Hanging Pawns",
    playlistUrl:
      "https://www.youtube.com/playlist?list=PLssNbVBYrGcD2mB7JrHbpP5qyT_ncxCRj",
    focusArea:
      "In-depth breakdown of prophylaxis, weak-color complexes and master game models - ideal for turning strong tactics into grandmaster-like plans.",
    videos: [
      { id: "mid_hp_01", title: "Art of Prophylaxis" },
      { id: "mid_hp_02", title: "Exploiting Weak Color Complexes" },
      { id: "mid_hp_03", title: "Converting a Positional Edge" },
      { id: "mid_hp_04", title: "Centralization vs. Flank Play" },
      { id: "mid_hp_05", title: "Transitioning to Favorable Endgames" },
    ],
  },

  // 6. Serious opening preparation: Sicilian
  elo2000_sicilian_hangingpawns_1: {
    title: "Sicilian Defence - Complete Guide (Hanging Pawns)",
    playlistUrl:
      "https://www.youtube.com/playlist?list=PLssNbVBYrGcDUDYiWilH-mQxXM4ixS2z6",
    focusArea:
      "Comprehensive Najdorf, Dragon and Anti-Sicilian coverage with plans, pawn breaks and modern theory - a free repertoire for aspiring masters.",
    videos: [
      { id: "sic_hp_01", title: "Najdorf - Positional vs. Tactical Lines" },
      { id: "sic_hp_02", title: "Dragon - Yugoslav Attack Essentials" },
      { id: "sic_hp_03", title: "Classical Scheveningen Structures" },
      { id: "sic_hp_04", title: "Anti-Sicilian Weapons for Black" },
      { id: "sic_hp_05", title: "Practical Repertoire Building Tips" },
    ],
  },

  // 7. Complete endgame upgrade
  elo2000_endgames_naroditsky_1: {
    title: "Principles of Chess Endgames - GM Daniel Naroditsky",
    playlistUrl:
      "https://www.youtube.com/playlist?list=PLT1F2nOxLHOfQI_hFiDnnWj4lb5KsviJ_",
    focusArea:
      "Systematic course from basic pawn races to complex knight-vs-bishop and rook endgames - fills every master-candidate’s endgame gaps.",
    videos: [
      { id: "end_dn_01", title: "Passed Pawns & Outside Majority" },
      { id: "end_dn_02", title: "Knight vs Bishop Technical Endings" },
      { id: "end_dn_03", title: "Defensive Fortress Ideas" },
      { id: "end_dn_04", title: "Queen Endgames - Perpetual Checks" },
      { id: "end_dn_05", title: "Practical Endgame Calculation" },
    ],
  },

  // =====================
  // Elo 2400+ ELO
  // =====================
  elo2400_candidates_agadmator_1: {
    title: "Candidates 2024 - agadmator’s Chess Channel",
    playlistUrl:
      "https://www.youtube.com/playlist?list=PLDnx7w_xuguHj3vAOI5wpu0yOrqTBi5Ls",
    focusArea:
      "Antonio Radić (agadmator) breaks down every Candidates 2024 clash in an accessible yet incisive style - perfect nightly recap material for masters tracking top-level novelties.",
    videos: [
      {
        id: "cand_aga_01",
        title: "Nepomniachtchi vs Nakamura - Round 1",
      },
      {
        id: "cand_aga_02",
        title: "Gukesh D vs Fabiano Caruana - Tactical Fireworks",
      },
      {
        id: "cand_aga_03",
        title: "Pragg vs Vidit - A Thrilling Battle",
      },
    ],
  },

  // 2. Grandmaster wisdom classroom
  elo2400_lectures_stlcc_1: {
    title: "Lectures with GM Yasser Seirawan - Saint Louis Chess Club",
    playlistUrl:
      "https://www.youtube.com/playlist?list=PLVWaFpMwtaGj-HHi0t6P02s5X5GLtvaIN",
    focusArea:
      "Legendary GM Seirawan delivers long-form sessions on openings, middlegame plans and classical endgames, laced with historical anecdotes and ‘why’-behind-the-move depth.",
    videos: [
      { id: "lec_yas_01", title: "Opening Principles & Common Mistakes" },
      { id: "lec_yas_02", title: "Strategic Masterpieces Explained" },
      { id: "lec_yas_03", title: "Endgame Insights & Practical Tips" },
      { id: "lec_yas_04", title: "The Power of Pawn Structure" },
      { id: "lec_yas_05", title: "Historical Games Every Master Should Know" },
    ],
  },

  // 3. Elite self-analysis & tournament prep
  elo2400_recaps_gmhikaru_1: {
    title: "Tournament Recaps - GM Hikaru Nakamura",
    playlistUrl:
      "https://www.youtube.com/playlist?list=PL4KCWZ5Ti2H5aW-tyM5ebikCNkPF9HGA3",
    focusArea:
      "Hikaru shares real-time reflections on his own games and major events, revealing top-GM thought processes, prep tweaks and critical practical decisions.",
    videos: [
      { id: "rec_hn_01", title: "My Thoughts on the Latest Super-Tournament" },
      { id: "rec_hn_02", title: "Critical Moments - Speed Chess Championship" },
      { id: "rec_hn_03", title: "Analyzing My Game vs Magnus Carlsen" },
      { id: "rec_hn_04", title: "Dramatic Turnaround vs Nepomniachtchi" },
      { id: "rec_hn_05", title: "Opening Prep for Titled Tuesday" },
    ],
  },

  // 4. Deep Candidates analysis with elite commentary
  elo2400_candidates_chess24_1: {
    title: "Candidates 2024 Expert Breakdowns - chess24",
    playlistUrl:
      "https://www.youtube.com/playlist?list=PLAwlxGCJB4NfxSrDo3gfvI-9NdzWRH9dj",
    focusArea:
      "Super-GMs Peter Svidler, Anish Giri & Peter Leko dissect each round’s critical positions, engine lines and novelties - a masterclass in modern theory and evaluation.",
    videos: [
      { id: "cand24_01", title: "Round 1 - GM Svidler Full Breakdown" },
      { id: "cand24_02", title: "Anish Giri’s Key Insights - Mid-Event" },
      { id: "cand24_03", title: "GM Leko - Deep Dive into a Pivotal Clash" },
      { id: "cand24_04", title: "Round 8 Highlights with GM Svidler" },
      { id: "cand24_05", title: "Final-Round Drama & Opening Novelties" },
    ],
  },

  // 5. Practical GM prep & strategy
  elo2400_gmprep_chessbaseindia_1: {
    title: "Strategic Mastery - GM Ankit Rajpara (ChessBase India)",
    playlistUrl:
      "https://www.youtube.com/playlist?list=PL9WYcwsWaJ7ovfCOS2TR1Fd9MltCt1-0f",
    focusArea:
      "Rajpara shares advanced repertoire tweaks, opponent-specific prep and cutting-edge strategic concepts - insights straight from a 2600-level training diary.",
    videos: [
      { id: "gmprep_ar_01", title: "Modern Trends in the Sicilian Najdorf" },
      { id: "gmprep_ar_02", title: "Advanced Concepts in the Ruy Lopez" },
      { id: "gmprep_ar_03", title: "Preparing vs Specific Opponents" },
      { id: "gmprep_ar_04", title: "Beating the Petroff with 3.d4" },
      { id: "gmprep_ar_05", title: "Handling the Grünfeld with 5.Bd2" },
    ],
  },

  // 6. Legendary attacking insights
  elo2400_juditpolgar_juditpolgarchess_1: {
    title: "Judit Polgar Teaches Chess - Judit Polgar Chess",
    playlistUrl:
      "https://www.youtube.com/playlist?list=PLBLIrbY4oUyHsvVqd4ZcZ79Qy5OchL8fA",
    focusArea:
      "The strongest female player in history reveals her aggressive philosophy, calculation habits and signature attacking motifs through personal game narratives.",
    videos: [
      { id: "polgar_01", title: "Attacking Masterclass with GM Judit Polgar" },
      { id: "polgar_02", title: "Dynamic Decision-Making in Chess" },
      { id: "polgar_03", title: "Judit Polgar on Her Most Memorable Games" },
      { id: "polgar_04", title: "Punishing Passive Play with Tactical Flair" },
      { id: "polgar_05", title: "Calculating Like a Champion" },
    ],
  },

  // 7. STLCC advanced deep-dives (part 2)
  elo2400_advanced_stlcc_2: {
    title: "Level: Advanced - Saint Louis Chess Club (Part 2)",
    playlistUrl:
      "https://www.youtube.com/playlist?list=PLVWaFpMwtaGh2TGoOGKH10SZvM0Rg8ucq",
    focusArea:
      "Additional STLCC expert lectures: cutting-edge opening theory, complex middlegames and specialist endgames to keep 2500-aspirants razor sharp.",
    videos: [
      { id: "adv2_stl_01", title: "Advanced Endgame Principles - GM Lecture" },
      { id: "adv2_stl_02", title: "Mastering Complex Middlegame Positions" },
      { id: "adv2_stl_03", title: "Theoretical Discussions for Master Level" },
      { id: "adv2_stl_04", title: "Practical Calculation Workshops" },
      { id: "adv2_stl_05", title: "Evolving Opening Theory at 2700+" },
    ],
  },
};

// --- Daily Chess Nuggets ---
export const nuggets = [
  {
    quote:
      '"The blunders are all there on the board, waiting to be made." - Savielly Tartakower',
    focus: "Tactical Awareness",
    description:
      'Always double-check for tactical possibilities for both yourself and your opponent before making a move. Solve 3 puzzles on <a href="https://lichess.org/training/mateIn2" target="_blank" rel="noopener noreferrer">Lichess Mate in 2</a>.',
    emoji: "💥",
  },
  {
    quote:
      '"The ability to play chess is the sign of a gentleman. The ability to play chess well is the sign of a wasted life." - Paul Morphy (Humorous quote!)',
    focus: "Endgame Principles",
    description:
      'Mastering King and Pawn endgames is crucial. Today, review the concept of "Opposition". A key resource for this is <a href="https://www.youtube.com/playlist?list=PLssNbVBYrGc74gS0m8i_g2a2a_F1-1f_F" target="_blank" rel="noopener noreferrer">Hanging Pawns - Chess Endgames</a> (focus on K+P videos).',
    emoji: "💡",
  },
  {
    quote:
      '"When you see a good move, look for a better one." - Emanuel Lasker',
    focus: "Calculation",
    description:
      'Always double-check your calculations and consider alternative lines. Try solving 5 tactical puzzles on <a href="https://lichess.org/training" target="_blank" rel="noopener noreferrer">Lichess Puzzles</a> today.',
    emoji: "🎯",
  },
  {
    quote:
      '"Play the opening like a book, the middlegame like a magician, and the endgame like a machine." - Rudolph Spielmann',
    focus: "Phase-Specific Skills",
    description:
      "Understand that different phases of the game require different approaches and skill sets. Balance your study accordingly.",
    emoji: "♟️",
  },
  {
    id: "nugget_5",
    quote:
      '"The passed pawn is a criminal, who should be kept under lock and key." - Aron Nimzowitsch',
    focus: "Pawn Play",
    description:
      "Recognize the power and danger of passed pawns. Learn how to create them for yourself and blockade your opponent's.",
    emoji: "♟️",
  },
];

// --- Badge Criteria Types ---
export const BADGE_CRITERIA = {
  POINTS_EARNED: "points_earned",
  LEARNING_STREAK: "learning_streak",
  TASKS_COMPLETED: "tasks_completed",
  STAGE_CLEARED: "stage_cleared",
  VIDEOS_WATCHED: "videos_watched",
};

// --- Badge Definitions ---
/**
 * Badge definitions for chess achievements.
 * Each badge has: id, name, icon, description, and criteria.
 */
export const chess_badges_definitions = [
  {
    id: "beginner_learner",
    name: "Beginner Learner",
    icon: "🎓",
    description: "Earn 50 points.",
    criteria: {
      type: BADGE_CRITERIA.POINTS_EARNED,
      value: 50,
    },
  },
  {
    id: "consistent_student",
    name: "Consistent Student",
    icon: "📚",
    description: "Achieve a 3-day learning streak.",
    criteria: {
      type: BADGE_CRITERIA.LEARNING_STREAK,
      value: 3,
    },
  },

  {
    id: "feedback_hero",
    name: "Feedback Hero",
    icon: "💬",
    description: "Earn 150 points.",
    criteria: {
      type: BADGE_CRITERIA.POINTS_EARNED,
      value: 150,
    },
  },
  {
    id: "note_taker",
    name: "Diligent Note-Taker",
    icon: "📝",
    description: "Earn 75 points.",
    criteria: {
      type: BADGE_CRITERIA.POINTS_EARNED,
      value: 75,
    },
  },
  {
    id: "star_rater",
    name: "Star Rater",
    icon: "🌟",
    description: "Earn 120 points.",
    criteria: {
      type: BADGE_CRITERIA.POINTS_EARNED,
      value: 120,
    },
  },
  {
    id: "nugget_enthusiast",
    name: "Nugget Enthusiast",
    icon: "💡",
    description: "Earn 60 points.",
    criteria: {
      type: BADGE_CRITERIA.POINTS_EARNED,
      value: 60,
    },
  },
  {
    id: "week_streak",
    name: "Weekly Warrior",
    icon: "📅",
    description: "Achieve a 7-day learning streak.",
    criteria: {
      type: BADGE_CRITERIA.LEARNING_STREAK,
      value: 7,
    },
  },
  {
    id: "point_collector_1",
    name: "Point Collector I",
    icon: "💰",
    description: "Collect 200 points.",
    criteria: {
      type: BADGE_CRITERIA.POINTS_EARNED,
      value: 200,
    },
  },
  {
    id: "point_collector_2",
    name: "Point Collector II",
    icon: "🏆",
    description: "Collect 500 points.",
    criteria: {
      type: BADGE_CRITERIA.POINTS_EARNED,
      value: 500,
    },
  },
  {
    id: "stage_clear_1400",
    name: "Intermediate Graduate",
    icon: "📈",
    description: "Complete all topics in the 1400-1700 ELO stage.",
    criteria: {
      type: BADGE_CRITERIA.STAGE_CLEARED,
      value: "elo1400",
    },
  },
  {
    id: "video_buff",
    name: "Video Buff",
    icon: "🎬",
    description: "Watch 20 individual videos from playlists.",
    criteria: {
      type: BADGE_CRITERIA.VIDEOS_WATCHED,
      value: 20,
    },
  },
];
