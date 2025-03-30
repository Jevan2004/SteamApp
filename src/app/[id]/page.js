"use client"
import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import GameDetails from "../gameDetailsCeva/gameDetails"
import { games, userStats, deleteGame, updateGameStats, deleteGameStats } from "../games.js"

export default function GamePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const gameId = Number.parseInt(searchParams.get("id") || "1")

  const [selectedGame, setSelectedGame] = useState(null)
  // This state is just to force a re-render when stats change
  const [, forceUpdate] = useState({})
  // Add a mounted state to prevent hydration mismatch
  const [isMounted, setIsMounted] = useState(false)

  // Set mounted state after component mounts
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Find the selected game after mounting
  useEffect(() => {
    if (isMounted) {
      const game = games.find((g) => g.id === gameId)

      if (game) {
        setSelectedGame(game)
      } else {
        // Game not found, redirect to home
        router.push("/")
      }
    }
  }, [gameId, router, isMounted])

  // Listen for changes to games and stats
  useEffect(() => {
    const handleUpdated = () => {
      // Force a re-render
      forceUpdate({})

      // Check if the game still exists
      const game = games.find((g) => g.id === gameId)
      if (!game) {
        router.push("/")
      } else {
        setSelectedGame(game)
      }
    }

    window.addEventListener("gamesUpdated", handleUpdated)
    window.addEventListener("statsUpdated", handleUpdated)

    return () => {
      window.removeEventListener("gamesUpdated", handleUpdated)
      window.removeEventListener("statsUpdated", handleUpdated)
    }
  }, [gameId, router])

  const handleUpdateStat = (updatedStats) => {
    if (!selectedGame) return
    updateGameStats(selectedGame.id, updatedStats)
  }

  const handleDeleteStat = (gameId) => {
    deleteGameStats(gameId)
  }

  const handleDeleteGame = () => {
    if (!selectedGame) return
    deleteGame(selectedGame.id)
    router.push("/")
  }

  if (!isMounted) {
    return <div className="loading">Loading...</div>
  }

  if (!selectedGame) {
    return <div className="loading">Loading game details...</div>
  }

  return (
    <div>
      <GameDetails
        game={selectedGame}
        userStat={userStats[selectedGame.id] || {}}
        updateUserStat={handleUpdateStat}
        deleteUserStat={handleDeleteStat}
        deleteGame={handleDeleteGame}
      />
    </div>
  )
}

