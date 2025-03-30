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

