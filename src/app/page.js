"use client"

import { useState, useEffect } from "react"
import { Plus, Settings, ArrowUpDown } from "lucide-react"
import Link from "next/link"
import { games } from "./games.js"
import { sortGamesByName } from "./sorting.js"

export default function GamingPlatform() {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortOrder, setSortOrder] = useState("asc")
  // This state is just to force a re-render when games change
  const [, forceUpdate] = useState({})
  // Add a mounted state to prevent hydration mismatch
  const [isMounted, setIsMounted] = useState(false)

  // Set mounted state after component mounts
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Listen for changes to games
  useEffect(() => {
    const handleGamesUpdated = () => {
      // Force a re-render
      forceUpdate({})
    }

    window.addEventListener("gamesUpdated", handleGamesUpdated)
    window.addEventListener("statsUpdated", handleGamesUpdated)

    return () => {
      window.removeEventListener("gamesUpdated", handleGamesUpdated)
      window.removeEventListener("statsUpdated", handleGamesUpdated)
    }
  }, [])

  // Only filter games on the client side after mounting
  const filteredGames = isMounted
    ? sortGamesByName(
        games.filter((game) => game.title.toLowerCase().includes(searchQuery.toLowerCase())),
        sortOrder,
      )
    : [] // Empty array during server rendering

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
  }

  return (
    <div className="gaming-platform">
      <div className="container">
        {/* Profile Card */}
        <div className="profile-card">
          <div className="profile-image-container">
            <img
              src="/images/profile.png"
              alt="Profile picture of a cat"
              width={220}
              height={220}
              className="profile-image"
            />
          </div>
          <div className="profile-info">
            <h1 className="profile-name">Username</h1>
            <p className="profile-location">Nationality/hometown</p>
            <p className="profile-description">Short profile description: I am a cat meow</p>
          </div>
        </div>

        <div className="library-section">
          <div className="library-header">
            <h2 className="library-title">Your library</h2>
            <div className="search-container">
              <img src="/images/search.png" className="search-icon" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <Settings className="settings-icon" />
              <button className="sort-button" onClick={toggleSortOrder}>
                <ArrowUpDown className="sort-icon" />
              </button>
            </div>
          </div>

          <div className="games-grid">
            {!isMounted ? (
              // Show loading state during server rendering and hydration
              <div className="loading-games">Loading your games...</div>
            ) : filteredGames.length > 0 ? (
              // Show games after client-side hydration
              filteredGames.map((game) => (
                <div key={game.id} className="game-card">
                  <Link href={`/game-details?id=${game.id}`}>
                    <div className="game-image-container">
                      {game.image ? (
                        <div className="game-image-wrapper">
                          <img src={game.image || "/placeholder.svg"} alt={game.title} className="game-image" />
                          <div className="game-overlay">
                            <div className="game-title-overlay">{game.title}</div>
                            <div className="game-price-overlay">{game.price}</div>
                          </div>
                        </div>
                      ) : (
                        <div className="game-placeholder">N/A</div>
                      )}
                    </div>
                    <div className="game-info">
                      <p className="game-title">{game.title}</p>
                      <p className="game-price">{game.price}</p>
                    </div>
                  </Link>
                </div>
              ))
            ) : (
              // Show no games message
              <div className="no-games-message">No games found. Add some games to your library!</div>
            )}
          </div>

          <div className="add-button-container">
            <Link href="/add">
              <button className="add-button">
                <Plus className="add-icon" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
