// Utility functions
const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

const validateGame = (game) => {
  if (!game || typeof game !== 'object') throw new Error("Game must be an object");
  if (!game.id || typeof game.id !== 'number') throw new Error("Game must have a numeric id");
  if (!game.title || typeof game.title !== 'string') throw new Error("Game must have a string title");
  // Add more validations as needed
};

const validateStats = (stats) => {
  if (!stats || typeof stats !== 'object') throw new Error("Stats must be an object");
  if (typeof stats.score !== 'number') throw new Error("Stats must have a numeric score");
  // Add more validations as needed
};

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined";

// Constants
const DATA_VERSION = 1;
const LOCALSTORAGE_KEYS = {
  GAMES: "games",
  STATS: "userStats",
  VERSION: "data_version"
};

// Initial data
const initialGames = [
  {
    id: 1,
    title: "Counter Strike 2",
    bannerImage: "/images/Cs2-banner.png",
    image: "/images/Cs2.jpg",
    description: "For over two decades, Counter-Strike has offered an elite competitive experience...",
    developer: "Valve",
    releaseDate: "1 July 2023",
    averageReviews: "3/5",
    tags: ["FPS", "Multiplayer", "Shooter"],
    price: "Free",
  },
  {
    id: 2,
    title: "Dark Souls III",
    bannerImage: "/images/header.jpg",
    image: "/images/ds3cover.jpg",
    description: "As fires fade and the world falls into ruin...",
    developer: "FromSoftware",
    releaseDate: "11 Apr 2016",
    averageReviews: "5/5",
    tags: ["Souls-like", "Rpg", "Dark Fantasy"],
    price: "40$",
  },
  ...Array(3).fill().map((_, index) => ({
    id: index + 3,
    title: `Game ${index + 3}`,
    bannerImage: "/images/placeholder.jpg",
    image: "/images/placeholder.jpg",
    description: "No description available.",
    developer: "Unknown",
    releaseDate: "N/A",
    averageReviews: "0",
    tags: ["Unknown"],
    price: "N/A",
  })),
];

const initialUserStats = {
  1: {
    achievements: 15,
    hoursPlayed: 50,
    finished: true,
    score: 8.5,
    review: "Amazing game, lots of fun!",
  },
  2: {
    achievements: 25,
    hoursPlayed: 130,
    finished: true,
    score: 10,
    review: "Praise the sun!",
  },
};

// Initialize data
let gamesData = deepClone(initialGames);
let userStatsData = deepClone(initialUserStats);

// Data loading and saving with error handling
const loadData = () => {
  if (!isBrowser) return;

  try {
    // Check data version
    const storedVersion = parseInt(localStorage.getItem(LOCALSTORAGE_KEYS.VERSION)) || 0;
    if (storedVersion !== DATA_VERSION) {
      localStorage.clear();
      localStorage.setItem(LOCALSTORAGE_KEYS.VERSION, DATA_VERSION.toString());
    }

    // Load games
    const storedGames = localStorage.getItem(LOCALSTORAGE_KEYS.GAMES);
    if (storedGames) {
      const parsed = JSON.parse(storedGames);
      if (Array.isArray(parsed)) {
        gamesData = parsed;
      }
    } else {
      localStorage.setItem(LOCALSTORAGE_KEYS.GAMES, JSON.stringify(gamesData));
    }

    // Load stats
    const storedStats = localStorage.getItem(LOCALSTORAGE_KEYS.STATS);
    if (storedStats) {
      const parsed = JSON.parse(storedStats);
      if (typeof parsed === 'object' && parsed !== null) {
        userStatsData = parsed;
      }
    } else {
      localStorage.setItem(LOCALSTORAGE_KEYS.STATS, JSON.stringify(userStatsData));
    }
  } catch (error) {
    console.error("Error loading data:", error);
    // Fallback to initial data
    gamesData = deepClone(initialGames);
    userStatsData = deepClone(initialUserStats);
  }
};

loadData();

// Proxy handlers
const createArrayHandler = (key) => {
  let saveTimeout;

  const saveData = (target) => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(target));
        if (isBrowser) window.dispatchEvent(new Event(`${key}Updated`));
      } catch (error) {
        console.error(`Error saving ${key}:`, error);
      }
    }, 100);
  };

  return {
    get(target, prop) {
      // Handle array methods
      if (typeof target[prop] === 'function' && Array.prototype[prop]) {
        return new Proxy(target[prop], {
          apply: (method, thisArg, args) => {
            const result = Reflect.apply(method, thisArg, args);
            saveData(target);
            return result;
          }
        });
      }
      return Reflect.get(target, prop);
    },
    set(target, prop, value) {
      if (!isNaN(prop)) validateGame(value); // Validate when setting game objects
      const result = Reflect.set(target, prop, value);
      saveData(target);
      return result;
    },
    deleteProperty(target, prop) {
      const result = Reflect.deleteProperty(target, prop);
      saveData(target);
      return result;
    }
  };
};

const createStatsHandler = () => {
  let saveTimeout;

  const saveData = (target) => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      try {
        localStorage.setItem(LOCALSTORAGE_KEYS.STATS, JSON.stringify(target));
        if (isBrowser) window.dispatchEvent(new Event("statsUpdated"));
      } catch (error) {
        console.error("Error saving stats:", error);
      }
    }, 100);
  };

  return {
    set(target, prop, value) {
      validateStats(value); // Validate stats
      const result = Reflect.set(target, prop, value);
      saveData(target);
      return result;
    },
    deleteProperty(target, prop) {
      const result = Reflect.deleteProperty(target, prop);
      saveData(target);
      return result;
    }
  };
};

// Create proxies
const gamesProxy = isBrowser 
  ? new Proxy(gamesData, createArrayHandler(LOCALSTORAGE_KEYS.GAMES))
  : {
      ...gamesData,
      push: () => console.warn("Cannot modify games during SSR"),
      // Add other array methods as needed
    };

const userStatsProxy = isBrowser
  ? new Proxy(userStatsData, createStatsHandler())
  : { ...userStatsData };

// Export the proxies
export const games = gamesProxy;
export const userStats = userStatsProxy;

// Helper functions
export function deleteGame(gameId) {
  const index = games.findIndex((game) => game.id === gameId);
  if (index !== -1) {
    games.splice(index, 1);
    delete userStats[gameId];
  }
}

export function updateGameStats(gameId, newStats) {
  userStats[gameId] = { ...(userStats[gameId] || {}), ...newStats };
}

export function deleteGameStats(gameId) {
  delete userStats[gameId];
}

// SSR-compatible initialization function
export function initializeClientSide() {
  if (!isBrowser) {
    console.warn("initializeClientSide should only be called in browser environment");
    return;
  }
  loadData();
}