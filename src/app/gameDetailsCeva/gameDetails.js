"use client"
import { useState, useEffect } from "react"
import Image from "next/image"
import "./gameDetails.css"

export default function GameDetails({ game, userStat = {}, updateUserStat, deleteUserStat, deleteGame }) {
  const [achievements, setAchievements] = useState(userStat.achievements || 0)
  const [hoursPlayed, setHoursPlayed] = useState(userStat.hoursPlayed || 0)
  const [score, setScore] = useState(userStat.score || 0)
  const [review, setReview] = useState(userStat.review || "")
  const [finished, setFinished] = useState(userStat.finished || false)
  const [editing, setEditing] = useState(false)

  // Update local state when userStat changes
  useEffect(() => {
    setAchievements(userStat.achievements || 0)
    setHoursPlayed(userStat.hoursPlayed || 0)
    setScore(userStat.score || 0)
    setReview(userStat.review || "")
    setFinished(userStat.finished || false)
  }, [userStat])

  const handleSave = () => {
    const updatedStats = {
      achievements: Number(achievements),
      hoursPlayed: Number(hoursPlayed),
      score: Number(score),
      review,
      finished,
    }
    updateUserStat(updatedStats)
    setEditing(false)
  }

  const handleDelete = () => {
    if (typeof deleteUserStat === "function") {
      deleteUserStat(game.id)
    }
  }

  const handleDeleteGame = () => {
    if (typeof deleteGame === "function") {
      deleteGame()
    }
  }

  return (
    <div className="game-details-page">
      <div className="game-details-container">
        <h1 className="game-title">{game.title}</h1>

        <div className="game-content">
          <div className="game-banner">
            <Image
              src={game.bannerImage || "/placeholder.svg"}
              alt={game.title}
              width={500}
              height={300}
              className="banner-image"
            />
          </div>

          <div className="game-info">
            <p className="game-description">{game.description}</p>
            <div className="info-row">
              <span className="info-label">Developer:</span>
              <span className="info-value">{game.developer}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Release Date:</span>
              <span className="info-value">{game.releaseDate}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Average Reviews:</span>
              <span className="info-value">{game.averageReviews}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Tags:</span>
              <div className="tags-container">
                {game.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="player-stats">
          <div className="stats-header">
            {Object.keys(userStat).length > 0 ? "You Played This Game" : "Add Your Stats"}
          </div>
          <div className="stats-grid">
            <div className="stats-row">
              <span className="stats-label">Number of Achievements:</span>
              {editing ? (
                <input type="number" value={achievements} onChange={(e) => setAchievements(e.target.value)} />
              ) : (
                <span className="stats-value">{achievements || "N/A"}</span>
              )}
            </div>
            <div className="stats-row">
              <span className="stats-label">Hours Played:</span>
              {editing ? (
                <input type="number" value={hoursPlayed} onChange={(e) => setHoursPlayed(e.target.value)} />
              ) : (
                <span className="stats-value">{hoursPlayed || "N/A"}</span>
              )}
            </div>
            <div className="stats-row">
              <span className="stats-label">Game Finished:</span>
              {editing ? (
                <input type="checkbox" checked={finished} onChange={(e) => setFinished(e.target.checked)} />
              ) : (
                <span className="stats-value">{finished ? "Yes" : "No"}</span>
              )}
            </div>
            <div className="stats-row">
              <span className="stats-label">Your Score:</span>
              {editing ? (
                <input type="number" value={score} min="0" max="10" onChange={(e) => setScore(e.target.value)} />
              ) : (
                <span className="stats-value">{score || "N/A"}</span>
              )}
            </div>
            <div className="stats-row full-width">
              <span className="stats-label">Your Review:</span>
              {editing ? (
                <textarea value={review} onChange={(e) => setReview(e.target.value)} />
              ) : (
                <p>{review || "No review yet"}</p>
              )}
            </div>
          </div>
          <div className="button-container">
            {editing ? (
              <button className="save-button" onClick={handleSave}>
                Save
              </button>
            ) : (
              <>
                <button className="edit-button" onClick={() => setEditing(true)}>
                  {Object.keys(userStat).length > 0 ? "Edit" : "Add Stats"}
                </button>
                {Object.keys(userStat).length > 0 && (
                  <button className="delete-button" onClick={handleDelete}>
                    Delete Stats
                  </button>
                )}
              </>
            )}
            <button className="delete-game-button" onClick={handleDeleteGame}>
              Remove Game
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

