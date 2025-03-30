"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { games, updateGameStats } from "../games.js"
import "./addGame.css"

export default function AddGamePage() {
  const router = useRouter()
  const [gameId, setGameId] = useState("")
  const [achievements, setAchievements] = useState("")
  const [hoursPlayed, setHoursPlayed] = useState("")
  const [score, setScore] = useState("")
  const [review, setReview] = useState("")
  const [finished, setFinished] = useState(false)
  const [errors, setErrors] = useState({
    gameId: "",
    achievements: "",
    hoursPlayed: "",
    score: "",
  })
  const [successMessage, setSuccessMessage] = useState("")

  const validateForm = () => {
    let valid = true
    const newErrors = { ...errors }

    if (!gameId.trim()) {
      newErrors.gameId = "Game ID is required."
      valid = false
    } else if (isNaN(Number(gameId)) || Number(gameId) <= 0) {
      newErrors.gameId = "Game ID must be a valid positive number."
      valid = false
    } else {
      // Check if the ID already exists
      const gameExists = games.some((game) => game.id === Number(gameId))
      if (gameExists) {
        newErrors.gameId = "A game with this ID already exists."
        valid = false
      }
    }

    if (!achievements.trim() || isNaN(Number(achievements)) || Number(achievements) < 0) {
      newErrors.achievements = "Enter a valid number of achievements (positive)."
      valid = false
    }

    if (!hoursPlayed.trim() || isNaN(Number(hoursPlayed)) || Number(hoursPlayed) < 0) {
      newErrors.hoursPlayed = "Enter a valid number of hours played (positive)."
      valid = false
    }

    if (!score.trim()) {
      newErrors.score = "Score is required."
      valid = false
    } else if (isNaN(Number(score)) || Number(score) < 0 || Number(score) > 10) {
      newErrors.score = "Score must be a valid number between 0 and 10."
      valid = false
    }

    setErrors(newErrors)
    return valid
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      const numericId = Number(gameId)

      // Create a new game
      const newGame = {
        id: numericId,
        title: `Game #${numericId}`,
        bannerImage: "/images/placeholder.jpg",
        image: "/images/placeholder.jpg",
        description: "No description available.",
        developer: "Unknown",
        releaseDate: "N/A",
        averageReviews: "0",
        tags: ["Unknown"],
        price: "N/A",
      }

      // Add the new game to the games array
      games.push(newGame)

      // Add the game stats
      const gameStats = {
        achievements: Number(achievements),
        hoursPlayed: Number(hoursPlayed),
        finished,
        score: Number(score),
        review,
      }

      updateGameStats(numericId, gameStats)

      // Show success message
      setSuccessMessage("Game added successfully!")

      // Reset form
      setGameId("")
      setAchievements("")
      setHoursPlayed("")
      setScore("")
      setReview("")
      setFinished(false)

      // Redirect after a short delay
      setTimeout(() => {
        router.push(`/game-details?id=${numericId}`)
      }, 1500)
    }
  }

  return (
    <div className="container">
      <div className="form-container">
        <h1>Add a New Game</h1>

        {successMessage && <div className="success-message">{successMessage}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label>Game ID</label>
            <input
              type="text"
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              placeholder="Enter a unique game ID (number)"
              required
            />
            {errors.gameId && <p className="error">{errors.gameId}</p>}
            <p className="help-text">A game with title "Game #{gameId || "[ID]"}" will be created</p>
          </div>

          <div className="form-row">
            <label>Number of Achievements</label>
            <input
              type="text"
              value={achievements}
              onChange={(e) => setAchievements(e.target.value)}
              placeholder="Enter number of achievements"
              required
            />
            {errors.achievements && <p className="error">{errors.achievements}</p>}
          </div>

          <div className="form-row">
            <label>Hours Played</label>
            <input
              type="text"
              value={hoursPlayed}
              onChange={(e) => setHoursPlayed(e.target.value)}
              placeholder="Enter number of hours played"
              required
            />
            {errors.hoursPlayed && <p className="error">{errors.hoursPlayed}</p>}
          </div>

          <div className="form-row">
            <label>Game Finished?</label>
            <input type="checkbox" checked={finished} onChange={(e) => setFinished(e.target.checked)} />
          </div>

          <div className="form-row">
            <label>Score (0-10)</label>
            <input
              type="text"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder="Enter score"
              required
            />
            {errors.score && <p className="error">{errors.score}</p>}
          </div>

          <div className="form-row">
            <label>Write a Review</label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Write your review here..."
            />
          </div>

          <div className="button-group">
            <button type="submit" className="btn-primary">
              Add Game
            </button>
            <button type="button" className="btn-secondary" onClick={() => router.push("/")}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}