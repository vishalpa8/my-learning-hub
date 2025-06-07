// --- Playlists and Video Data ---

/** @type {Object.<string, PlaylistData>} */
export const playlistVideoData = {
  // =====================
  // Elo 1400–1700 ELO
  // =====================
  elo1400_intermediate_stlcc_1: {
    title: "Chess Fundamentals - John Bartholomew",
    playlistUrl:
      "https://www.youtube.com/playlist?list=PLl9uuRYQ-6MBwqkmwT42l1fI7Z0bYuwwO",
    focusArea:
      "Comprehensive coverage of fundamental chess principles including opening, middlegame strategy, tactics, and basic endgames by IM John Bartholomew.",
    videos: [
      {
        id: "elo1400_cf_jb_1", // CF for Chess Fundamentals, JB for John Bartholomew
        title: "Chess Fundamentals #1: Undefended Pieces",
      },
      {
        id: "elo1400_cf_jb_2",
        title: "Chess Fundamentals #2: Coordination",
      },
      {
        id: "elo1400_cf_jb_3",
        title: "Chess Fundamentals #3: Typical Mistakes",
      },
      {
        id: "elo1400_cf_jb_4",
        title: "Chess Fundamentals #4: Pawn Play",
      },
      {
        id: "elo1400_cf_jb_5",
        title: "Chess Fundamentals #5: Trades",
      },
    ],
  },

  elo1400_checkmates_gotham_1: {
    title: "6 Checkmate Patterns YOU MUST KNOW (GothamChess)",
    playlistUrl: "http://www.youtube.com/watch?v=iBZLU1FXhcI",
    focusArea:
      "A concise guide to six essential checkmating patterns that every chess player should recognize and execute, by IM Levy Rozman (GothamChess).",
    videos: [
      { id: "elo1400_cm_gc_1", title: "6 Checkmate Patterns YOU MUST KNOW" },
    ],
  },
  elo1400_opening_Hanging_1: {
    title:
      "3 Best Chess Openings For Players Under 1300 ELO (No Memorisation Needed)",
    playlistUrl: "https://www.youtube.com/watch?v=vwucXn9MtNc",
    focusArea:
      "Presents three easy-to-learn chess openings for beginners, focusing on understanding principles rather than memorizing long lines, by Hanging Pawns.",
    videos: [
      {
        id: "elo1400_open_hp_1",
        title: "3 Best Chess Openings For Players Under 1300 ELO",
      }, // HP for Hanging Pawns
    ],
  },
  elo1400_beginner_middlegame_1: {
    title: "Chess Middle Game Strategy (MatoJelic)", // Clarified channel
    playlistUrl: "https://www.youtube.com/playlist?list=PL03F54EB032CE6C7E",
    focusArea:
      "Covers essential middlegame strategies including pawn structures, piece activity, weak squares, and planning by MatoJelic.",
    videos: [
      {
        id: "elo1400_mid_mato_1", // Mato for MatoJelic
        title: "Chess Strategy- Open vs Closed Games",
      },
      {
        id: "elo1400_mid_mato_2",
        title: "Chess Strategies- Skewers and Pins",
      },
      {
        id: "elo1400_mid_mato_3",
        title: "Chess Strategy- Good and Bad Bishops",
      },
      {
        id: "elo1400_mid_mato_4",
        title: "Chess Strategy- Outposts",
      },
      {
        id: "elo1400_mid_mato_5",
        title: "Chess Strategy- Trading Part 1",
      },
      {
        id: "elo1400_mid_mato_6",
        title: "Chess Strategy- Trading Part 2",
      },
      {
        id: "elo1400_mid_mato_7",
        title: "Chess Mating Patterns Part 1",
      },
      {
        id: "elo1400_mid_mato_8",
        title: "Chess Mating Patterns Part 2",
      },
      {
        id: "elo1400_mid_mato_9",
        title: "Chess Tactics: XRay",
      },
      {
        id: "elo1400_mid_mato_10",
        title: "Chess Tactics: Deflection",
      },
      {
        id: "elo1400_mid_mato_11",
        title: "Chess Tactics: Decoy",
      },
    ],
  },
  elo1400_endgames_johnb_1: {
    title: "Chess Endgames (John Bartholomew)",
    playlistUrl:
      "http://www.youtube.com/playlist?list=PLl9uuRYQ-6MDzm-bs8kbyHdYEmRGUauot",
    focusArea:
      "IM John Bartholomew explains crucial endgame concepts, focusing on King & Pawn endgames, opposition, Lucena, Philidor, and other key positions.",
    videos: [
      {
        id: "elo1400_eg_jb_1",
        title: "Chess Endgame Fundamentals: King + Pawn vs. King",
      },
      {
        id: "elo1400_eg_jb_2",
        title: "Chess Endgame Fundamentals: Opposition Exercise",
      },
      {
        id: "elo1400_eg_jb_3",
        title: "Chess Endgame Fundamentals: Lucena Position",
      },
      {
        id: "elo1400_eg_jb_4",
        title: "Chess Endgame Fundamentals: Philidor Position",
      },
      {
        id: "elo1400_eg_jb_5",
        title: "Chess Endgame Fundamentals: First-Rank Defense",
      },
      {
        id: "elo1400_eg_jb_6",
        title: "Chess Endgame Fundamentals: Safe Squares",
      },
      {
        id: "elo1400_eg_jb_7",
        title: "Chess Endgame Fundamentals: Vancura Position",
      },
      {
        id: "elo1400_eg_jb_8",
        title: "Chess Endgame Fundamentals: Short Side/Long Side Defense",
      },
      { id: "elo1400_eg_jb_9", title: "Richard Réti's Remarkable 1921 Study" },
    ],
  },
  elo1400_rookendgames_chessfactor_1: {
    title: "Rook Endgames - Chess Endgames (ChessFactor)",
    playlistUrl:
      "http://www.youtube.com/playlist?list=PL9RQPxG_e-LmVskyIV0oqFjBeDncqn3NQ",
    focusArea:
      "Detailed instruction on rook endgames by ChessFactor, covering essential positions like Lucena, Philidor, Vancura, and practical play.",
    videos: [
      {
        id: "elo1400_re_cf_1",
        title: "Rook Endgame: Lucena Position - The Bridge",
      }, // CF for ChessFactor
      {
        id: "elo1400_re_cf_2",
        title: "Rook Endgame: Philidor Position - Third Rank Defense",
      },
      { id: "elo1400_re_cf_3", title: "Rook Endgame: Vancura Position" },
    ],
  },

  elo1400_tactics_heisman_1: {
    title: "Climbing the Rating Ladder - John Bartholomew", // Corrected to match URL content
    playlistUrl:
      "https://www.youtube.com/watch?v=U2huVf1l4UE&list=PLl9uuRYQ-6MCBnhtCk_bTZsD8GxeWP6BV",
    focusArea:
      "Improving tactical skills, calculation, blunder checking, and king safety, aimed at players looking to increase their rating, by IM John Bartholomew.",
    videos: [
      {
        id: "elo1400_climb_jb_1",
        title: "Climbing the Rating Ladder #1: Introduction",
      }, // JB for John Bartholomew
      {
        id: "elo1400_climb_jb_2",
        title: "Climbing the Rating Ladder #2: Undefended Pieces",
      },
      {
        id: "elo1400_climb_jb_3",
        title: "Climbing the Rating Ladder #3: Coordination",
      },
    ],
  },
  elo1400_endgames_hangingpawns_1: {
    title: "Chess Endgames Explained (Hanging Pawns)",
    playlistUrl:
      "http://www.youtube.com/playlist?list=PLssNbVBYrGcAcadywNlkAGpO1-kLfy0y2",
    focusArea:
      "Hanging Pawns explains fundamental endgame principles, including King and Pawn structures, basic piece vs. pawn scenarios, often referencing '100 Endgames You Must Know'.",
    videos: [
      {
        id: "elo1400_eg_hp_1", // HP for Hanging Pawns
        title: "King Oppositions Explained | Chess Endgames",
      },
      { id: "elo1400_eg_hp_2", title: "Pawn Breakthroughs | Chess Endgames" },
      {
        id: "elo1400_eg_hp_3",
        title: "Rook vs Pawn Endgames Intro | Chess Endgames",
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
      "GM Daniel Naroditsky's speedrun series, showcasing advanced calculation, tactical pattern recognition, and advantage conversion against progressively stronger opponents.",
    videos: [
      {
        id: "elo1700_sr_dn_1", // DN for Daniel Naroditsky
        title: "Sensei Speedrun #1: Crushing the London System",
      },
      {
        id: "elo1700_sr_dn_2",
        title: "Sensei Speedrun #2: Navigating Tactical Complications",
      },
      {
        id: "elo1700_sr_dn_3",
        title: "Sensei Speedrun #3: Endgame Technique Masterclass",
      },
    ],
  },
  elo1700_meditations_hangingpawns_1: {
    title: "Chess Meditations (Hanging Pawns)",
    playlistUrl:
      "http://www.youtube.com/playlist?list=PLssNbVBYrGcBWNWaOcC_GTx7Op05J_hO1",
    focusArea:
      "Hanging Pawns' series on middlegame planning, pawn structures, piece placement, prophylactic thinking, and overall strategic development.",
    videos: [
      {
        id: "elo1700_med_hp_1", // HP for Hanging Pawns
        title: "Prophylactic Thinking: Preventing Opponent's Ideas",
      },
      {
        id: "elo1700_med_hp_2",
        title: "Understanding Pawn Structures: Isolated Queen Pawn",
      },
      { id: "elo1700_med_hp_3", title: "Piece Placement and Activity" },
    ],
  },
  elo1700_instincts_naroditsky_1: {
    title: "DYI Develop Your Instincts Speedrun",
    playlistUrl:
      "https://www.youtube.com/playlist?list=PLT1F2nOxLHOdrvOyOXb_l2yGJrkwLA72Z",
    focusArea:
      "GM Daniel Naroditsky's speedrun focused on improving chess intuition, pattern recognition, and rapid decision-making through commented games.",
    videos: [
      {
        id: "elo1700_inst_dn_1", // DN for Daniel Naroditsky
        title: "Develop Your Instincts Speedrun #1: Opening Traps & Tactics",
      },
      {
        id: "elo1700_inst_dn_2",
        title: "Develop Your Instincts Speedrun #2: Middlegame Maneuvering",
      },
      {
        id: "elo1700_inst_dn_3",
        title: "Develop Your Instincts Speedrun #3: Converting an Advantage",
      },
    ],
  },
  elo1700_beginner_stlcc_1: {
    title: "Level: Beginner (Saint Louis Chess Club)",
    playlistUrl:
      "http://www.youtube.com/playlist?list=PLVWaFpMwtaGiVZ77NhhvGGGzvF7oFSWcA",
    focusArea:
      "Fundamental chess concepts from the Saint Louis Chess Club, including piece movement, basic tactics, checkmates, and opening principles.",
    videos: [
      {
        id: "elo1700_beg_stlcc_1", // STLCC for Saint Louis Chess Club
        title: "Learn the Rules of Chess: How the Pieces Move",
      },
      {
        id: "elo1700_beg_stlcc_2",
        title: "Basic Checkmates: King and Queen vs King",
      },
      {
        id: "elo1700_beg_stlcc_3",
        title: "Introduction to Opening Principles",
      },
    ],
  },
  elo1700_stepbystep_chessexplained_1: {
    title: "Step by Step (Chessexplained)",
    playlistUrl:
      "http://www.youtube.com/playlist?list=PLpbSCK-lQ8KeBXYvI1s1ru9e0_vaDg1a8",
    focusArea:
      "IM Christof Sielecki (Chessexplained) demonstrates practical middlegame decision-making, strategic planning, and understanding imbalances.",
    videos: [
      {
        id: "elo1700_sbs_ce_1", // CE for Chessexplained
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
      "GM Daniel King's 'Power Play' series, offering Grandmaster insights into chess strategy, calculation, pawn play, and piece improvement.",
    videos: [
      {
        id: "elo1700_pp_dk_1", // DK for Daniel King (PowerPlayChess)
        title: "Power Play 7: Improve your pieces - Intro",
      },
      { id: "elo1700_pp_dk_2", title: "Power Play 10: Calculation - Intro" },
      { id: "elo1700_pp_dk_3", title: "Power Play 13: Pawns - Intro" },
    ],
  },
  elo1700_e4theory_hangingpawns_1: {
    title: "1. e4 Opening Theory (Hanging Pawns)",
    playlistUrl:
      "https://www.youtube.com/watch?v=GFWI3gkizZg&list=PLssNbVBYrGcCa4bJH7JqmUZs3qNdSWUkG",
    focusArea:
      "Hanging Pawns provides a deep dive into specific 1.e4 opening systems, explaining typical plans, pawn structures, and tactical ideas.",
    videos: [
      {
        id: "elo1700_e4_hp_1",
        title: "1. e4 Openings: The Ruy Lopez - Main Lines and Ideas",
      }, // HP for Hanging Pawns
      {
        id: "elo1700_e4_hp_2",
        title: "1. e4 Openings: Sicilian Defense - Key Variations for White",
      },
      {
        id: "elo1700_e4_hp_3",
        title:
          "1. e4 Openings: French Defense - Typical Pawn Structures and Plans",
      },
    ],
  },
  elo1700_10minopenings_gotham_1: {
    title: "10 Minute Chess Openings (GothamChess)",
    playlistUrl:
      "http://www.youtube.com/playlist?list=PLfA7spq9XFMc-dpthyh3c4ZsWTIlfuYSv",
    focusArea:
      "GothamChess offers quick, practical guides to various chess openings, focusing on key ideas, common traps, and essential plans in 10 minutes.",
    videos: [
      {
        id: "elo1700_10min_gc_1", // GC for GothamChess
        title: "Learn the London System in 10 Minutes",
      },
      { id: "elo1700_10min_gc_2", title: "The Italian Game: Quick Guide" },
      { id: "elo1700_10min_gc_3", title: "Caro-Kann Defense: Main Ideas Fast" },
    ],
  },
  elo1700_practicalendgames_chessexplained_1: {
    title: "Rook Endgames - Chess Endgames (ChessFactor)", // Title and URL point to ChessFactor Rook Endgames
    playlistUrl:
      "http://www.youtube.com/playlist?list=PL9RQPxG_e-LmVskyIV0oqFjBeDncqn3NQ", // This is ChessFactor's Rook Endgames
    focusArea:
      "Advanced rook endgame concepts by ChessFactor, including complex positions, fortress ideas, and converting small advantages.",
    videos: [
      {
        id: "elo1700_re_cf_1", // CF for ChessFactor
        title: "Advanced Rook vs Pawns Endgames",
      },
      {
        id: "elo1700_re_cf_2",
        title: "Rook and Minor Piece Endgames: Key Principles",
      },
      { id: "elo1700_re_cf_3", title: "Building a Fortress in Rook Endgames" },
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
      {
        id: "elo2000_calc_dn_1",
        title:
          "Want to Calculate Like a Grandmaster? You NEED To Learn THIS Skill (Clearance Sacrifice)",
      },
    ],
  },
  elo2000_playliketal_chessgames_1: {
    title:
      "King Hunting Mastery with GM Sam Shankland (iChess.net / ChessGames)", // URL is Shankland's video
    playlistUrl: "http://www.youtube.com/watch?v=hELzLhucKkY",
    focusArea:
      "GM Sam Shankland teaches how to create powerful mating attacks and hunt the opponent's king, from the Master Method series.",
    videos: [
      {
        id: "elo2000_plt_cg_1", // CG for ChessGames or iChess
        title: "King Hunting Mastery with GM Sam Shankland [Master Method]",
      },
    ],
  },
  elo2000_advanced_stlcc_1: {
    title: "Level: Advanced (Saint Louis Chess Club)",
    playlistUrl:
      "http://www.youtube.com/playlist?list=PLVWaFpMwtaGiMPN3WXi1igKC5bLkeRO7_",
    focusArea:
      "Advanced lectures from the Saint Louis Chess Club by various Grandmasters, covering deep strategic understanding, positional evaluation, and GM-level decision-making.",
    videos: [
      {
        id: "elo2000_adv_stlcc_1", // STLCC for Saint Louis Chess Club
        title: "Nuances of Positional Play: GM Lecture",
      },
      {
        id: "elo2000_adv_stlcc_2",
        title: "GM Decision Making in Complex Positions",
      },
      {
        id: "elo2000_adv_stlcc_3",
        title: "Advanced Strategic Planning Techniques by GM Varuzhan Akobian",
      },
    ],
  },
  elo2000_powerplay_powerplaychess_1: {
    title: "Power Play (PowerPlayChess)",
    playlistUrl:
      "http://www.youtube.com/playlist?list=PLhyM8toCZs_q89MK8KupOxebPtasl6kHP",
    focusArea:
      "GM Daniel King's 'Power Play' series, focusing on advanced strategy, attack, and common mistakes for experienced players.",
    videos: [
      { id: "elo2000_pp_dk_1", title: "Power Play 17: Attack - Intro" }, // DK for Daniel King
      {
        id: "elo2000_pp_dk_2",
        title: "Power Play 20: Test Your Strategy - Intro",
      },
      {
        id: "elo2000_pp_dk_3",
        title: "Power Play 26: Typical Mistakes - Intro",
      },
    ],
  },
  elo2000_masters_middlegame_hanging_1: {
    title: "Chess Middlegame Ideas (Hanging Pawns)", // URL is Hanging Pawns
    playlistUrl:
      "https://www.youtube.com/playlist?list=PLssNbVBYrGcD2mB7JrHbpP5qyT_ncxCRj",
    focusArea:
      "Hanging Pawns explores advanced middlegame concepts, strategic motifs, and analysis of classical and modern master games.",
    videos: [
      {
        id: "elo2000_mid_hp_1", // HP for Hanging Pawns
        title: "The Art of Prophylaxis in the Middlegame",
      },
      {
        id: "elo2000_mid_hp_2",
        title: "Exploiting Weak Color Complexes",
      },
      {
        id: "elo2000_mid_hp_3",
        title: "Converting Positional Advantages: Master Class",
      },
    ],
  },
  elo2000_sicilian_hangingpawns_1: {
    title: "Sicilian Defense | Chess Openings Explained (Hanging Pawns)",
    playlistUrl:
      "http://www.youtube.com/playlist?list=PLssNbVBYrGcDUDYiWilH-mQxXM4ixS2z6",
    focusArea:
      "Hanging Pawns provides an exhaustive analysis of main lines and sidelines in the Sicilian Defense, suitable for deep theoretical preparation.",
    videos: [
      {
        id: "elo2000_sic_hp_1", // HP for Hanging Pawns
        title: "Najdorf Variation: Main Ideas and Plans",
      },
      { id: "elo2000_sic_hp_2", title: "Dragon Variation: Critical Lines" },
      {
        id: "elo2000_sic_hp_3",
        title: "Anti-Sicilians: What to Play as Black",
      },
    ],
  },

  // =====================
  // Elo 2400+ ELO
  // =====================
  elo2400_candidates_agadmator_1: {
    title: "Candidates Tournament 2024 (agadmator's Chess Channel)",
    playlistUrl:
      "http://www.youtube.com/playlist?list=PLDnx7w_xuguHj3vAOI5wpu0yOrqTBi5Ls",
    focusArea:
      "Agadmator's engaging and insightful analysis of recent top-level GM games from major tournaments like the FIDE Candidates.",
    videos: [
      {
        id: "elo2400_cand_aga_1", // AGA for Agadmator
        title: "Nepomniachtchi vs. Nakamura | FIDE Candidates 2024",
      },
      {
        id: "elo2400_cand_aga_2",
        title: "Gukesh D vs. Fabiano Caruana | FIDE Candidates 2024",
      },
      {
        id: "elo2400_cand_aga_3",
        title:
          "Praggnanandhaa vs Vidit | A Thrilling Clash! | FIDE Candidates 2024",
      },
    ],
  },
  elo2400_candidates_middlegame_1: {
    title: "Lectures with GM Yasser Seirawan (Saint Louis Chess Club)",
    playlistUrl:
      "https://www.youtube.com/playlist?list=PLVWaFpMwtaGj-HHi0t6P02s5X5GLtvaIN", // Example Yasser Seirawan lecture playlist
    focusArea:
      "In-depth chess wisdom covering openings, middlegames, endgames, and chess history from legendary GM Yasser Seirawan.",
    videos: [
      {
        id: "elo2400_lec_yas_1", // YAS for Yasser Seirawan
        title: "Yasser Seirawan on Opening Principles and Common Mistakes",
      },
      {
        id: "elo2400_lec_yas_2",
        title: "Strategic Masterpieces Explained by Yasser Seirawan",
      },
      {
        id: "elo2400_lec_yas_3",
        title: "Endgame Insights and Practical Tips from GM Seirawan",
      },
    ],
  },
  elo2400_recaps_gmhikaru_1: {
    title: "Tournament Recaps (GMHikaru)",
    playlistUrl:
      "http://www.youtube.com/playlist?list=PL4KCWZ5Ti2H5aW-tyM5ebikCNkPF9HGA3",
    focusArea:
      "GM Hikaru Nakamura provides his perspective on high-level games, tournament strategies, and critical moments from his own play and other major events.",
    videos: [
      {
        id: "elo2400_recap_hn_1", // HN for Hikaru Nakamura
        title: "My Thoughts on the Latest SuperTournament Game",
      },
      {
        id: "elo2400_recap_hn_2",
        title: "Critical Moments from the Speed Chess Championship",
      },
      {
        id: "elo2400_recap_hn_3",
        title: "Analyzing My Game Against Magnus Carlsen",
      },
    ],
  },
  elo2400_candidates_chess24_1: {
    title: "Candidates 2024 (chess24)",
    playlistUrl:
      "http://www.youtube.com/playlist?list=PLAwlxGCJB4NfxSrDo3gfvI-9NdzWRH9dj",
    focusArea:
      "Profound and articulate analysis of top-level GM games by elite Grandmasters like Peter Svidler and Anish Giri during major events.",
    videos: [
      {
        id: "elo2400_cand_c24_1", // C24 for chess24
        title: "Round 1 Analysis with GM Peter Svidler | Candidates 2024",
      },
      {
        id: "elo2400_cand_c24_2",
        title: "Key Insights from GM Anish Giri | Candidates 2024",
      },
      {
        id: "elo2400_cand_c24_3",
        title: "Deep Dive into a Crucial Candidates Matchup with GM Leko",
      },
    ],
  },
  elo2400_grunfeld_chessbaseindia_1: {
    title:
      "Learn the basics of Grunfeld Defence - GM Markus Ragger (ChessBase India)", // URL is for GM Markus Ragger
    playlistUrl: "http://www.youtube.com/watch?v=9pPy1eZJF7I",
    focusArea:
      "GM Markus Ragger explains the fundamental principles and key ideas of the Grünfeld Defense in this comprehensive video from ChessBase India.",
    videos: [
      {
        id: "elo2400_grun_cbi_mr_1", // CBI for ChessBase India, MR for Markus Ragger
        title:
          "Learn the basics of Grunfeld Defence - GM Markus Ragger (Elo: 2656)",
      },
    ],
  },
  elo2400_gmprep_chessbaseindia_1: {
    title: "Strategic Mastery with GM Ankit Rajpara (ChessBase India)", // Playlist is "Strategic Mastery with GM Ankit Rajpara"
    playlistUrl:
      "http://www.youtube.com/playlist?list=PL9WYcwsWaJ7ovfCOS2TR1Fd9MltCt1-0f",
    focusArea:
      "GM Ankit Rajpara from ChessBase India shares insights on strategic thinking, opening preparation, and improving overall chess understanding.",
    videos: [
      {
        id: "elo2400_gmp_cbi_ar_1", // AR for Ankit Rajpara
        title: "Modern Trends in the Sicilian Najdorf",
      },
      {
        id: "elo2400_gmp_cbi_ar_2",
        title: "Advanced Concepts in the Ruy Lopez",
      },
      {
        id: "elo2400_gmp_cbi_ar_3",
        title: "Preparing for Specific Opponents: A GM's Guide",
      },
    ],
  },
  elo2400_juditpolgar_juditpolgarchess_1: {
    title: "Judit Polgar Teaches Chess (Judit Polgar Chess)",
    playlistUrl:
      "http://www.youtube.com/playlist?list=PLBLIrbY4oUyHsvVqd4ZcZ79Qy5OchL8fA",
    focusArea:
      "Legendary GM Judit Polgar delivers masterclasses on advanced strategic concepts, dynamic decision-making, and attacking play.",
    videos: [
      {
        id: "elo2400_jp_jp_1", // JP for Judit Polgar
        title: "Attacking Masterclass with GM Judit Polgar",
      },
      { id: "elo2400_jp_jp_2", title: "Dynamic Decision Making in Chess" },
      {
        id: "elo2400_jp_jp_3",
        title: "Judit Polgar on Her Most Memorable Games",
      },
    ],
  },
  elo2400_advanced_stlcc_2: {
    title: "Level: Advanced (Saint Louis Chess Club)",
    playlistUrl:
      "http://www.youtube.com/playlist?list=PLVWaFpMwtaGh2TGoOGKH10SZvM0Rg8ucq",
    focusArea:
      "Further deep dives from Saint Louis Chess Club into highly advanced strategic and endgame concepts by various Grandmasters, for master-level players.",
    videos: [
      {
        id: "elo2400_adv_stlcc_4", // STLCC for Saint Louis Chess Club
        title: "Advanced Endgame Principles: GM Lecture",
      },
      {
        id: "elo2400_adv_stlcc_5",
        title: "Mastering Complex Middlegame Positions",
      },
      {
        id: "elo2400_adv_stlcc_6", // Index kept as per original data, assuming uniqueness across all stlcc entries or specific reason.
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
