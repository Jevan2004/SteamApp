// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined"

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
  ...Array(3)
    .fill()
    .map((_, index) => ({
      id: index + 3,
      title: `Game ${index + 3}`,
      bannerImage: "/images/placeholder.jpg", // Use a placeholder image
      image: "/images/placeholder.jpg", // Same placeholder for main image
      description: "No description available.",
      developer: "Unknown",
      releaseDate: "N/A",
      averageReviews: "0",
      tags: ["Unknown"],
      price: "N/A",
    })),
]

// Initial user stats
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
}

// Initialize data
let gamesData = [...initialGames] // Create a copy to avoid modifying the original
let userStatsData = { ...initialUserStats } // Create a copy to avoid modifying the original

// Only try to load from localStorage on the client side
if (isBrowser) {
  try {
    const storedGames = localStorage.getItem("games")
    if (storedGames) {
      gamesData = JSON.parse(storedGames)
    } else {
      localStorage.setItem("games", JSON.stringify(initialGames))
    }

    const storedStats = localStorage.getItem("userStats")
    if (storedStats) {
      userStatsData = JSON.parse(storedStats)
    } else {
      localStorage.setItem("userStats", JSON.stringify(initialUserStats))
    }
  } catch (error) {
    console.error("Error loading data from localStorage:", error)
  }
}

// Create a proxy for games that saves to localStorage on changes
const gamesProxy = isBrowser
? new Proxy(gamesData, {
  set: (target, property, value) => {
    target[property] = value;
    localStorage.setItem("games", JSON.stringify(target));
    window.dispatchEvent(new CustomEvent("gamesUpdated", {
      detail: { updatedGames: target }
    }));
    return true;
  },
      deleteProperty: (target, property) => {
        delete target[property]
        localStorage.setItem("games", JSON.stringify(target))
        window.dispatchEvent(new Event("gamesUpdated"))
        return true
      },
    })
  : gamesData

// Create a proxy for userStats that saves to localStorage on changes
const userStatsProxy = isBrowser
  ? new Proxy(userStatsData, {
      set: (target, property, value) => {
        target[property] = value
        localStorage.setItem("userStats", JSON.stringify(target))
        window.dispatchEvent(new Event("statsUpdated"))
        return true
      },
      deleteProperty: (target, property) => {
        delete target[property]
        localStorage.setItem("userStats", JSON.stringify(target))
        window.dispatchEvent(new Event("statsUpdated"))
        return true
      },
    })
  : userStatsData

// Export the proxies
export const games = gamesProxy
export const userStats = userStatsProxy

// Helper functions
export function deleteGame(gameId) {
  const index = games.findIndex((game) => game.id === gameId)
  if (index !== -1) {
    games.splice(index, 1)
    delete userStats[gameId]
  }
}

export function updateGameStats(gameId, newStats) {
  userStats[gameId] = { ...(userStats[gameId] || {}), ...newStats }
}

export function deleteGameStats(gameId) {
  delete userStats[gameId]
}

function generateRandomGame() {
  const titles = [
    "Epic Adventure", "Space Explorer", "Dragon Quest", "Cyber Punk", "Fantasy Kingdom",
    "Zombie Survival", "Racing Legends", "Sports Challenge", "Puzzle Master", "Battle Royale"
  ];
  const tags = [
    ["RPG", "Adventure"], ["FPS", "Action"], ["Strategy", "Simulation"], 
    ["Sports", "Racing"], ["Puzzle", "Casual"], ["Horror", "Survival"]
  ];
  const prices = ["Free", "$9.99", "$19.99", "$29.99", "$49.99", "$59.99"];

  return {
    id: Date.now() + Math.floor(Math.random() * 1000),
    title: titles[Math.floor(Math.random() * titles.length)],
    image: "/images/placeholder.svg",
    description: "Randomly generated game",
    developer: "Random Studio",
    releaseDate: new Date().toLocaleDateString(),
    averageReviews: `${Math.floor(Math.random() * 5)}/5`,
    tags: tags[Math.floor(Math.random() * tags.length)],
    price: prices[Math.floor(Math.random() * prices.length)]
  };
}

export function addRandomGame() {
  const newGame = generateRandomGame();
  games.push(newGame);
  
  // Generate random user stats for the new game
  userStats[newGame.id] = {
    achievements: Math.floor(Math.random() * 50), // 0-49 achievements
    hoursPlayed: Math.floor(Math.random() * 200), // 0-199 hours
    finished: Math.random() > 0.7, // 30% chance of being finished
    score: (Math.random() * 5).toFixed(1), // Random score 0.0-5.0
    review: getRandomReview()
  };
  
  // Trigger updates for both games and stats
  window.dispatchEvent(new Event("gamesUpdated"));
  window.dispatchEvent(new Event("statsUpdated"));
}

// Helper function for random reviews
function getRandomReview() {
  const reviews = [
    "Absolutely amazing!",
    "Really enjoyed my time with this one",
    "Pretty good overall",
    "Could use some improvements",
    "Not my favorite",
    "Worth playing",
    "A masterpiece",
    "Just okay",
    "Would recommend",
    "Needs more content"
  ];
  return reviews[Math.floor(Math.random() * reviews.length)];
}