# My Learning Hub - Personalized Progress Tracker

A React application to track learning progress in DSA and Chess.
My Learning Hub is a comprehensive web application built with React, designed to help users track their learning progress across various domains, including Data Structures & Algorithms (DSA), Chess, and daily tasks. It features interactive dashboards, progress visualization, and a motivational reward system, all with data persisted locally in your browser using IndexedDB.

**Live Site:** [my-learning-hub](https://my-learning-hub.netlify.app/)

## ✨ Features

- **🏠 Homepage Dashboard:**
  - Overview of progress in DSA and Chess.
  - Quick links to different learning modules.
  - Section for important features and tips.
  - Option to reset all learning progress.
- **📚 DSA Module:**
  - Track solved problems from various lists (e.g., NeetCode 150, Striver SDE Sheet).
  - Filter problems by difficulty, topic, status, and pattern.
  - Visualize progress with doughnut charts showing solved counts by difficulty.
  - View overall statistics: total problems, completed, remaining, and streak.
  - Detailed problem list view: problem titles link to external statements; problems can be sorted and their completion status toggled.
- **♟️ Chess Module:**
  - Track completed chess videos across different ELO stages.
  - Visualize overall and per-stage progress.
  - View playlists and mark individual videos as complete/incomplete.
  - Earn badges based on achievements (videos watched, ELO milestones, streaks).
  - User profile with ELO rating, points, and learning streaks.
- **📅 Engagement Module:**
  - Daily task list to manage learning activities.
  - Activity calendar to visualize daily engagement and task completion history.
  - Color-coded days based on activity levels.
- **🏆 Reward System:**
  - Earn rewards based on combined progress in DSA and Chess.
  - Customizable reward messages.
  - Modal display for earned rewards.
- **💾 Persistent Storage:**
  - All user progress and data are saved locally in the browser's IndexedDB, ensuring data persistence across sessions.
- **🎨 Theming:**
  - Consistent UI with CSS custom properties for easy theming.
- **📱 Responsive Design:**
  - User interface adapts to different screen sizes for a good experience on desktop and mobile.

## 🛠️ Tech Stack

- **Frontend:** React (Vite)
- **Language:** JavaScript (ES6+)
- **State Management:** React Context API, Custom Hooks (`useState`, `useMemo`, `useCallback`, `useEffect`)
- **Database:** IndexedDB (via Dexie.js)
- **Charting:** Chart.js (for DSA statistics)
- **Styling:** CSS3 with Custom Properties (BEM-like naming conventions)
- **Routing:** React Router

## 📂 Project Structure

```plaintext
my-learning-hub/
├── public/
├── src/

│   ├── components/     # Reusable UI components
│   │   ├── chess/
│   │   ├── dsa/
│   │   ├── engagement/
│   │   └── shared/     # Common components (Navbar, Footer, Modal, etc.)
│   ├── contexts/       # React Context providers (e.g., RewardContext)
│   ├── data/           # Static data (DSA problems, Chess playlists/badges)
│   ├── hooks/          # Custom React hooks (e.g., useIndexedDb, useDsaData)
│   ├── pages/          # Top-level page components
│   ├── styles/         # Global and page-specific CSS files
│   ├── utils/          # Utility functions (dsaUtils, chessUtils)
│   ├── App.jsx         # Main application component with routing
│   └── main.jsx        # Entry point of the application
├── .eslintrc.cjs
├── .gitignore
├── index.html
├── package.json
├── README.md
└── vite.config.js
```

plaintext

## 🚀 Getting Started

### Prerequisites

- Node.js (v18.x or later recommended)
- npm (v9.x or later) or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/vishalpa8/my-learning-hub.git
    cd my-learning-hub
    ```
2.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```

### Running the Development Server

```bash
npm run dev
# or
yarn dev
```

Open http://localhost:5173 (or the port specified in your terminal output) to view it in the browser.

### Building for Production

```bash
npm run build
# or
yarn build
```

This will create an optimized production build in the dist folder.

### Deploying to GitHub Pages (Optional)

If you have set up GitHub Pages for your repository, you can deploy the production build using:

```bash
npm run deploy

# or

yarn deploy
```
This script (defined in package.json) typically uses gh-pages to push the contents of your dist folder to the gh-pages branch of your repository. Make sure your vite.config.js has the correct base path set (e.g., base: '/my-learning-hub/' if your repository is named my-learning-hub).

💡 Key Architectural Concepts
Local-First Data: User data is primarily stored and managed in the browser's IndexedDB, making the application fast and usable offline (for viewing existing data).
Custom Hooks for Data Logic: Hooks like useIndexedDb, useDsaData, and useChessUserData encapsulate data fetching, persistence, and transformation logic, keeping components focused on presentation.
Context for Global State: The RewardContext manages the state for the cross-cutting reward feature.
Utility-Driven Data Processing: Helper functions in the utils directory handle complex data manipulations, such as structuring chess data by ELO stages or grouping and sorting DSA problems.
🤝 Contributing
Contributions are welcome! If you have suggestions for improvements or new features, feel free to open an issue or submit a pull request.

📄 License
This project is licensed under the MIT License. (Consider adding a LICENSE file in the root of your project with the MIT License text if you intend to use it).

Happy Learning! 🎉

```

```
