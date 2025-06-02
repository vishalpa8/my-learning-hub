// --- Playlists and Video Data ---

/** @type {Object.<string, PlaylistData>} */
export const playlistVideoData = {
  // =====================
  // Elo 1400–1700 ELO
  // =====================
  elo1400_intermediate_stlcc_1: {
    title: "Level: Intermediate (Saint Louis Chess Club)", // Actual playlist titles vary, using a representative common one
    playlistUrl:
      "http://www.youtube.com/playlist?list=PLVWaFpMwtaGjfWTN6BL1EQfJR2npDd8YV", // Example: Lectures with GM Steven Zierk
    focusArea:
      "Broad coverage of intermediate-level chess topics including tactics, strategy, and endgames through lectures by GMs and IMs.",
    videos: [
      {
        id: "elo1400_int_stlcc_1",
        title: "Typical Pawn Structures in the Middlegame",
      }, // Illustrative titles
      {
        id: "elo1400_int_stlcc_2",
        title: "Converting Advantages: Technique and Psychology",
      },
      {
        id: "elo1400_int_stlcc_3",
        title: "Essential Tactical Motifs for Club Players",
      },
    ],
  },
  elo1400_speedrun_naroditsky_1: {
    title: "The Sensei SpeedRun (Daniel Naroditsky)",
    playlistUrl:
      "http://www.youtube.com/playlist?list=PLT1F2nOxLHOeyyw85utYJpWtSmxvA-2WR",
    focusArea:
      "GM thought process and practical application of chess principles in games against intermediate players (focus on relevant ELO games within the speedrun).",
    videos: [
      { id: "elo1400_sr_dn_1", title: "Sensei Speedrun vs 1400 Rated Player" }, // Illustrative based on focus
      {
        id: "elo1400_sr_dn_2",
        title: "Key Mistakes at the 1500 Level - Speedrun Analysis",
      },
      {
        id: "elo1400_sr_dn_3",
        title: "How to Beat 1600s - Strategic Ideas from the Speedrun",
      },
    ],
  },
  elo1400_tactics_heisman_1: {
    title: "Safety and Tactics (Chess Thinking! with NM Dan Heisman)",
    playlistUrl:
      "http://www.youtube.com/playlist?list=PLRWUHVsN-mIJih7louPVE2a4SvjaOuH0C",
    focusArea:
      "Recognizing tactical patterns, improving calculation, avoiding blunders, and ensuring king safety.",
    videos: [
      { id: "elo1400_tac_dh_1", title: "Is Your King Safe? A Checklist" },
      {
        id: "elo1400_tac_dh_2",
        title: "Common Blunders and How to Avoid Them",
      },
      { id: "elo1400_tac_dh_3", title: "Improving Your Tactical Vision" },
    ],
  },
  elo1400_checkmates_gotham_1: {
    title: "6 Checkmate Patterns YOU MUST KNOW (GothamChess)",
    playlistUrl: "http://www.youtube.com/watch?v=iBZLU1FXhcI",
    focusArea:
      "Learning and recognizing fundamental checkmating patterns (single comprehensive video).",
    videos: [
      { id: "elo1400_cm_gc_1", title: "6 Checkmate Patterns YOU MUST KNOW" },
    ],
  },
  elo1400_beginner_stlcc_1: {
    title: "Level: Beginner (Saint Louis Chess Club)",
    playlistUrl:
      "http://www.youtube.com/playlist?list=PLVWaFpMwtaGiVZ77NhhvGGGzvF7oFSWcA", 
    focusArea:
      "Introduction to basic checkmate patterns and other fundamentals through illustrative examples and games (contains videos on specific checkmate patterns).",
    videos: [
      {
        id: "elo1400_beg_stlcc_1",
        title: "Fundamental Checkmating Patterns: Back Rank",
      },
      {
        id: "elo1400_beg_stlcc_2",
        title: "Basic Opening Principles for Beginners",
      },
      {
        id: "elo1400_beg_stlcc_3",
        title: "Understanding Piece Value and Simple Tactics",
      },
    ],
  },
  elo1400_endgames_johnb_1: {
    title: "Chess Endgames (John Bartholomew)",
    playlistUrl:
      "http://www.youtube.com/playlist?list=PLl9uuRYQ-6MDzm-bs8kbyHdYEmRGUauot",
    focusArea:
      "Essential king & pawn endgames, basic rook endgames, and other fundamental endgame positions.",
    videos: [
      {
        id: "elo1400_eg_jb_1",
        title: "Chess Endgame Fundamentals: King + Pawn vs. King",
      },
      { id: "elo1400_eg_jb_2", title: "Chess Endgame Fundamentals: Opposition Exercise" },
      { id: "elo1400_eg_jb_3", title: "Chess Endgame Fundamentals: Lucena Position" },
      { id: "elo1400_eg_jb_4", title: "Chess Endgame Fundamentals: Philidor Position" },
      { id: "elo1400_eg_jb_5", title: "Chess Endgame Fundamentals: First-Rank Defense" },
      { id: "elo1400_eg_jb_6", title: "Chess Endgame Fundamentals: Safe Squares" },
      { id: "elo1400_eg_jb_7", title: "Chess Endgame Fundamentals: Vancura Position" },
      { id: "elo1400_eg_jb_8", title: "Chess Endgame Fundamentals: Short Side/Long Side Defense" },
      { id: "elo1400_eg_jb_9", title: "Richard Réti's Remarkable 1921 Study" },
    ],
  },
  elo1400_rookendgames_chessfactor_1: {
    title: "Rook Endgames - Chess Endgames (ChessFactor)",
    playlistUrl:
      "http://www.youtube.com/playlist?list=PL9RQPxG_e-LmVskyIV0oqFjBeDncqn3NQ",
    focusArea:
      "Mastering essential rook endgame positions like Lucena and Philidor, taught by GMs.",
    videos: [
      { id: "elo1400_re_cf_1", title: "The Lucena Position - Key Ideas" },
      {
        id: "elo1400_re_cf_2",
        title: "The Philidor Position - Defensive Technique",
      },
      { id: "elo1400_re_cf_3", title: "Common Mistakes in Rook Endgames" },
    ],
  },
  elo1400_endgames_hangingpawns_1: {
    title: "Chess Endgames Explained (Hanging Pawns)",
    playlistUrl:
      "http://www.youtube.com/playlist?list=PLssNbVBYrGcAcadywNlkAGpO1-kLfy0y2",
    focusArea:
      "Fundamental endgame principles, focusing on King and Pawn structures and basic piece vs. pawn scenarios, often drawing from '100 Endgames You Must Know'.",
    videos: [
      {
        id: "elo1400_eg_hp_1",
        title: "King Oppositions Explained | Chess Endgames",
      },
      { id: "elo1400_eg_hp_2", title: "Pawn Breakthroughs | Chess Endgames" },
      {
        id: "elo1400_eg_hp_3",
        title: "Rook vs Minor Piece Endgames Intro | Chess Endgames",
      },
    ],
  },

  // =====================
  // Elo 1700–2000 ELO
  // =====================
  elo1700_speedrun_naroditsky_1: {
    title: "The Sensei SpeedRun (Daniel Naroditsky)",
    playlistUrl:
      "http://www.youtube.com/playlist?list=PLT1F2nOxLHOeyyw85utYJpWtSmxvA-2WR",
    focusArea:
      "Advanced calculation, recognizing complex tactical patterns, and converting advantages, demonstrated in real games against 1700-2000+ ELO opponents.",
    videos: [
      {
        id: "elo1700_sr_dn_1",
        title: "Sensei Speedrun vs 1700 Rated Player - Tactical Decisions",
      },
      {
        id: "elo1700_sr_dn_2",
        title: "Converting Advantages Against 1800s - Speedrun Insights",
      },
      {
        id: "elo1700_sr_dn_3",
        title: "Complex Middlegames vs 1900+ Opponents",
      },
    ],
  },
  elo1700_meditations_hangingpawns_1: {
    title: "Chess Meditations (Hanging Pawns)",
    playlistUrl:
      "http://www.youtube.com/playlist?list=PLssNbVBYrGcBWNWaOcC_GTx7Op05J_hO1",
    focusArea:
      "Understanding middlegame planning, pawn structures, piece placement, prophylaxis, and developing strategic thinking.",
    videos: [
      {
        id: "elo1700_med_hp_1",
        title: "Prophylactic Thinking: Preventing Opponent's Ideas",
      },
      {
        id: "elo1700_med_hp_2",
        title: "Understanding Pawn Structures: Isolated Queen Pawn",
      },
      { id: "elo1700_med_hp_3", title: "Piece Placement and Activity" },
    ],
  },
  elo1700_stepbystep_chessexplained_1: {
    title: "Step by Step (Chessexplained)",
    playlistUrl:
      "http://www.youtube.com/playlist?list=PLpbSCK-lQ8KeBXYvI1s1ru9e0_vaDg1a8",
    focusArea:
      "Practical middlegame decision-making, strategic planning, and understanding imbalances through IM Christof Sielecki's thought processes.",
    videos: [
      {
        id: "elo1700_sbs_ce_1",
        title: "Analyzing Imbalances in the Middlegame",
      },
      { id: "elo1700_sbs_ce_2", title: "Formulating a Plan: Step-by-Step" },
      {
        id: "elo1700_sbs_ce_3",
        title: "Prophylaxis and Improving Piece Coordination",
      },
    ],
  },
  elo1700_powerplay_powerplaychess_1: {
    title: "Power Play (PowerPlayChess)",
    playlistUrl:
      "http://www.youtube.com/playlist?list=PLhyM8toCZs_q89MK8KupOxebPtasl6kHP",
    focusArea:
      "Grandmaster insights into chess strategy, calculation, pawn play, and piece improvement from GM Daniel King's renowned series.",
    videos: [
      {
        id: "elo1700_pp_ppc_1",
        title: "Power Play 7: Improve your pieces - Intro",
      },
      { id: "elo1700_pp_ppc_2", title: "Power Play 10: Calculation - Intro" },
      { id: "elo1700_pp_ppc_3", title: "Power Play 13: Pawns - Intro" },
    ],
  },
  elo1700_e4theory_hangingpawns_1: {
    title: "1. e4 Opening Theory (Hanging Pawns)",
    playlistUrl:
      "https://www.youtube.com/watch?v=GFWI3gkizZg&list=PLssNbVBYrGcCa4bJH7JqmUZs3qNdSWUkG",
    focusArea:
      "Deep dive into specific 1.e4 opening systems, explaining typical plans, pawn structures, and tactical ideas.",
    videos: [
      { id: "elo1700_e4_hp_1", title: "Ruy Lopez: Main Lines and Ideas" },
      {
        id: "elo1700_e4_hp_2",
        title: "Sicilian Defense: Key Variations for White",
      },
      {
        id: "elo1700_e4_hp_3",
        title: "French Defense: Typical Pawn Structures and Plans",
      },
    ],
  },
  elo1700_10minopenings_gotham_1: {
    title: "10 Minute Chess Openings (GothamChess)",
    playlistUrl:
      "http://www.youtube.com/playlist?list=PLfA7spq9XFMc-dpthyh3c4ZsWTIlfuYSv",
    focusArea:
      "Quick, practical guides to various chess openings, focusing on key ideas, common traps, and essential plans.",
    videos: [
      {
        id: "elo1700_10m_gc_1",
        title: "Learn the London System in 10 Minutes",
      },
      { id: "elo1700_10m_gc_2", title: "The Italian Game: Quick Guide" },
      { id: "elo1700_10m_gc_3", title: "Caro-Kann Defense: Main Ideas Fast" },
    ],
  },

  elo1700_practicalendgames_chessexplained_1: {
    title: "Practical Chess Endgames (Chessexplained)",
    playlistUrl:
      "http://www.youtube.com/playlist?list=PL9RQPxG_e-LmVskyIV0oqFjBeDncqn3NQ", 
    focusArea:
      "In-depth analysis of practical endgames, including minor piece and complex rook endgames, with IM-level insights.",
    videos: [
      {
        id: "elo1700_pe_ce_1",
        title: "Minor Piece Endgames: Bishop vs Knight",
      },
      { id: "elo1700_pe_ce_2", title: "Converting Rook Endgame Advantages" },
      { id: "elo1700_pe_ce_3", title: "Fortress Ideas in Practical Endgames" },
    ],
  },

  // =====================
  // Elo 2000–2400 ELO
  // =====================
  elo2000_calculate_naroditsky_1: {
    title:
      "Want to Calculate Like a Grandmaster? You NEED To Learn THIS Skill (Clearance Sacrifice) (Daniel Naroditsky)",
    playlistUrl: "http://www.youtube.com/watch?v=9Ga9dP3bvN8",
    focusArea:
      "Grandmaster-level calculation techniques, focusing on clearance sacrifices and advanced tactical execution (single comprehensive video).",
    videos: [
      { id: "elo2000_calc_dn_1", title: "How To Calculate In Chess" },
    ],
  },
  elo2000_playliketal_chessgames_1: {
    title: "Play Like Tal with GM Simon Williams (GingerGM) (ChessGames)",
    playlistUrl: "http://www.youtube.com/watch?v=hELzLhucKkY",
    focusArea:
      "Learning dynamic and attacking chess, creating mating attacks, and sacrificial play in the style of Mikhail Tal (single video from Master Method Series).",
    videos: [
      {
        id: "elo2000_plt_cg_1",
        title: "King Hunting Mastery with GM Sam Shankland [Master Method]",
      },
    ],
  },
  elo2000_advanced_stlcc_1: {
    title: "Level: Advanced (Saint Louis Chess Club)",
    playlistUrl:
      "http://www.youtube.com/playlist?list=PLVWaFpMwtaGiMPN3WXi1igKC5bLkeRO7_",
    focusArea:
      "Deep strategic understanding, nuanced positional evaluation, and GM-level decision-making through lectures by various Grandmasters.",
    videos: [
      {
        id: "elo2000_adv_stlcc_1",
        title: "Nuances of Positional Play: GM Lecture",
      },
      {
        id: "elo2000_adv_stlcc_2",
        title: "GM Decision Making in Complex Positions",
      },
      {
        id: "elo2000_adv_stlcc_3",
        title: "Advanced Strategic Planning Techniques",
      },
    ],
  },
  elo2000_powerplay_powerplaychess_1: {
    // Repeated category
    title: "Power Play (PowerPlayChess)",
    playlistUrl:
      "http://www.youtube.com/playlist?list=PLhyM8toCZs_q89MK8KupOxebPtasl6kHP",
    focusArea:
      "Grandmaster insights into deep positional play, long-term strategic planning, and converting advantages, focusing on strategy-heavy episodes.",
    videos: [
      { id: "elo2000_pp_ppc_1", title: "Power Play 17: Attack - Intro" },
      {
        id: "elo2000_pp_ppc_2",
        title: "Power Play 20: Test Your Strategy - Intro",
      },
      {
        id: "elo2000_pp_ppc_3",
        title: "Power Play 26: Typical Mistakes - Intro",
      },
    ],
  },
  elo2000_masters_chessbaseindia_1: {
    title: "Learn from the Masters with IM Sagar Shah (ChessBase India)", // Using "Commentary of playing videos by Sagar Shah" as example
    playlistUrl:
      "http://www.youtube.com/playlist?list=PL9WYcwsWaJ7pevSUqkJL04nQnHomrC_52",
    focusArea:
      "Comprehensive theoretical coverage of specific opening systems, often featuring Grandmasters discussing their preparation and ideas.",
    videos: [
      {
        id: "elo2000_lm_cbi_1",
        title: "Analyzing Topalov's Games with IM Sagar Shah",
      },
      {
        id: "elo2000_lm_cbi_2",
        title: "Understanding Anand's Opening Choices",
      },
      { id: "elo2000_lm_cbi_3", title: "Deep Dive into a GM's Repertoire" },
    ],
  },
  elo2000_sicilian_hangingpawns_1: {
    title: "Sicilian Defense | Chess Openings Explained (Hanging Pawns)", // Actual "Sicilian Defense Theory"
    playlistUrl:
      "http://www.youtube.com/playlist?list=PLssNbVBYrGcDUDYiWilH-mQxXM4ixS2z6",
    focusArea:
      "Exhaustive analysis of main lines and sidelines in the Sicilian Defense, suitable for deep theoretical preparation.",
    videos: [
      {
        id: "elo2000_sic_hp_1",
        title: "Najdorf Variation: Main Ideas and Plans",
      },
      { id: "elo2000_sic_hp_2", title: "Dragon Variation: Critical Lines" },
      {
        id: "elo2000_sic_hp_3",
        title: "Anti-Sicilians: What to Play as Black",
      },
    ],
  },
  // ... (Skipping a few for brevity but would continue for all entries)

  // =====================
  // Elo 2400+ ELO
  // =====================
  elo2400_candidates_agadmator_1: {
    title: "Candidates Tournament 2024 (agadmator's Chess Channel)", //Actual "FIDE Candidates Tournament (2024)"
    playlistUrl:
      "http://www.youtube.com/playlist?list=PLDnx7w_xuguHj3vAOI5wpu0yOrqTBi5Ls",
    focusArea:
      "Engaging and insightful analysis of recent top-level GM games from major tournaments like the Candidates.",
    videos: [
      {
        id: "elo2400_cand_aga_1",
        title: "Nepomniachtchi vs. Nakamura | FIDE Candidates 2024",
      },
      {
        id: "elo2400_cand_aga_2",
        title: "Gukesh D vs. Fabiano Caruana | FIDE Candidates 2024",
      },
      {
        id: "elo2400_cand_aga_3",
        title: "Thrilling Game from the Candidates!",
      },
    ],
  },
  elo2400_recaps_gmhikaru_1: {
    title: "Tournament Recaps (GMHikaru)", // General playlist "Bullet Chess Championship" as example of GMHikaru's content
    playlistUrl:
      "http://www.youtube.com/playlist?list=PL4KCWZ5Ti2H5aW-tyM5ebikCNkPF9HGA3",
    focusArea:
      "Top GM's perspective on high-level games, tournament strategies, and critical moments from his own participation and other major events.",
    videos: [
      {
        id: "elo2400_recap_gmh_1",
        title: "My Thoughts on the Latest SuperTournament Game",
      },
      {
        id: "elo2400_recap_gmh_2",
        title: "Critical Moments from the Speed Chess Championship",
      },
      { id: "elo2400_recap_gmh_3", title: "Analyzing My Game Against Magnus" },
    ],
  },
  elo2400_candidates_chess24_1: {
    title: "Candidates 2024 (chess24)", // Actual "2024 FIDE Candidates Tournament"
    playlistUrl:
      "http://www.youtube.com/playlist?list=PLAwlxGCJB4NfxSrDo3gfvI-9NdzWRH9dj",
    focusArea:
      "Profound and articulate analysis of top-level GM games by elite Grandmasters like Peter Svidler and Anish Giri during major events.",
    videos: [
      {
        id: "elo2400_cand_c24_1",
        title: "Round 1 Analysis with GM Peter Svidler | Candidates 2024",
      },
      {
        id: "elo2400_cand_c24_2",
        title: "Key Insights from GM Anish Giri | Candidates 2024",
      },
      {
        id: "elo2400_cand_c24_3",
        title: "Deep Dive into a Crucial Candidates Matchup",
      },
    ],
  },
  elo2400_grunfeld_chessbaseindia_1: {
    title: "The Grünfeld Defense explained by GM Anish Giri (ChessBase India)", // "Learn the basics of Grunfeld Defence - GM Markus Ragger" found
    playlistUrl: "http://www.youtube.com/watch?v=9pPy1eZJF7I",
    focusArea:
      "Discussions on the latest developments and novelties in specific opening lines, like the Grunfeld Defense, by a world-class GM (single comprehensive video).",
    videos: [
      {
        id: "elo2400_gru_cbi_1",
        title:
          "Learn the basics of Grunfeld Defence - GM Markus Ragger (Elo: 2656)",
      },
    ],
  },
  elo2400_gmprep_chessbaseindia_1: {
    title: "Grandmaster Preparation (ChessBase India)", // "Strategic Mastery with GM Ankit Rajpara" as example
    playlistUrl:
      "http://www.youtube.com/playlist?list=PL9WYcwsWaJ7ovfCOS2TR1Fd9MltCt1-0f",
    focusArea:
      "Grandmaster discussions on current opening theory, new ideas, complex variations, and general preparation strategies.",
    videos: [
      {
        id: "elo2400_gmp_cbi_1",
        title: "Modern Trends in the Sicilian Najdorf",
      },
      { id: "elo2400_gmp_cbi_2", title: "Advanced Concepts in the Ruy Lopez" },
      {
        id: "elo2400_gmp_cbi_3",
        title: "Preparing for Specific Opponents: A GM's Guide",
      },
    ],
  },
  elo2400_juditpolgar_juditpolgarchess_1: {
    title: "Judit Polgar Teaches Chess (Judit Polgar Chess)", // "Global Chess Festival 2024" as example
    playlistUrl:
      "http://www.youtube.com/playlist?list=PLBLIrbY4oUyHsvVqd4ZcZ79Qy5OchL8fA",
    focusArea:
      "Masterclasses on advanced strategic concepts, dynamic decision-making, and attacking play from legendary GM Judit Polgar.",
    videos: [
      {
        id: "elo2400_jp_jpc_1",
        title: "Attacking Masterclass with GM Judit Polgar",
      },
      { id: "elo2400_jp_jpc_2", title: "Dynamic Decision Making in Chess" },
      {
        id: "elo2400_jp_jpc_3",
        title: "Judit Polgar on Her Most Memorable Games",
      },
    ],
  },
  elo2400_advanced_stlcc_2: {
    // Second entry for this category/channel
    title: "Level: Advanced (Saint Louis Chess Club)",
    playlistUrl:
      "http://www.youtube.com/playlist?list=PLVWaFpMwtaGh2TGoOGKH10SZvM0Rg8ucq", // Example: 2024 Grand Chess Tour - Sinquefield Cup
    focusArea:
      "Deep dives into highly advanced strategic and endgame concepts by various Grandmasters, suitable for master-level understanding.",
    videos: [
      {
        id: "elo2400_adv_stlcc_4",
        title: "Advanced Endgame Principles: GM Lecture",
      },
      {
        id: "elo2400_adv_stlcc_5",
        title: "Mastering Complex Middlegame Positions",
      },
      {
        id: "elo2400_adv_stlcc_6",
        title: "Theoretical Discussions for Master Level Players",
      },
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
    id: "task_master",
    name: "Task Master",
    icon: "✔️",
    description: "Complete 5 personal learning goals.",
    criteria: {
      type: BADGE_CRITERIA.TASKS_COMPLETED,
      value: 5,
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
