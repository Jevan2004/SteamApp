import { games, userStats, deleteGame, updateGameStats, deleteGameStats } from '../src/app/games';
import { jest } from '@jest/globals';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = String(value);
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

// Mock window and dispatchEvent
const dispatchEventMock = jest.fn();

beforeAll(() => {
  global.window = {
    localStorage: localStorageMock,
    dispatchEvent: dispatchEventMock,
  };
});

beforeEach(() => {
  // Reset mocks and localStorage before each test
  localStorageMock.clear();
  dispatchEventMock.mockClear();
  
  // Initialize with test data that matches your actual initial data
  const testGames = [
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

  const testStats = {
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

  localStorageMock.setItem('games', JSON.stringify(testGames));
  localStorageMock.setItem('userStats', JSON.stringify(testStats));
});

describe('Game Data Management', () => {
  test('should load initial games from localStorage', () => {
    expect(games.length).toBe(5);
    expect(games[0].title).toBe("Counter Strike 2");
    expect(games[1].title).toBe("Dark Souls III");
  });

  test('should load initial user stats from localStorage', () => {
    expect(Object.keys(userStats).length).toBe(2);
    expect(userStats[1].score).toBe(8.5);
  });

  test('should update games and save to localStorage', () => {
    const newGame = {
      id: 6,
      title: "Test Game 6",
      bannerImage: "/test6-banner.jpg",
      image: "/test6.jpg",
      description: "Test description 6",
      developer: "Test Dev 6",
      releaseDate: "6 Jun 2020",
      averageReviews: "3/5",
      tags: ["Adventure"],
      price: "$30",
    };

    games.push(newGame);
    
    expect(games.length).toBe(6);
    expect(games[5].title).toBe("Test Game 6");
    
    // Verify localStorage was updated
    expect(localStorageMock.setItem).toHaveBeenCalledWith('games', expect.any(String));
    const storedGames = JSON.parse(localStorageMock.setItem.mock.calls.find(call => call[0] === 'games')[1]);
    expect(storedGames.length).toBe(6);
    
    // Verify event was dispatched
    expect(dispatchEventMock).toHaveBeenCalledWith(expect.objectContaining({ type: "gamesUpdated" }));
  });

  test('should update userStats and save to localStorage', () => {
    const newStats = {
      achievements: 5,
      hoursPlayed: 10,
      finished: false,
      score: 7.5,
      review: "Not bad",
    };

    userStats[3] = newStats;
    
    expect(Object.keys(userStats).length).toBe(3);
    expect(userStats[3].score).toBe(7.5);
    
    // Verify localStorage was updated
    expect(localStorageMock.setItem).toHaveBeenCalledWith('userStats', expect.any(String));
    const storedStats = JSON.parse(localStorageMock.setItem.mock.calls.find(call => call[0] === 'userStats')[1]);
    expect(Object.keys(storedStats).length).toBe(3);
    
    // Verify event was dispatched
    expect(dispatchEventMock).toHaveBeenCalledWith(expect.objectContaining({ type: "statsUpdated" }));
  });

  test('deleteGame should remove game and its stats', () => {
    const initialGameCount = games.length;
    deleteGame(1);
    
    expect(games.length).toBe(initialGameCount - 1);
    expect(games.find(g => g.id === 1)).toBeUndefined();
    expect(userStats[1]).toBeUndefined();
    
    // Verify localStorage was updated
    expect(localStorageMock.setItem).toHaveBeenCalledWith('games', expect.any(String));
    expect(localStorageMock.setItem).toHaveBeenCalledWith('userStats', expect.any(String));
  });

  test('updateGameStats should merge new stats with existing', () => {
    updateGameStats(1, {
      hoursPlayed: 60,
      finished: false,
      newField: "test",
    });

    expect(userStats[1].hoursPlayed).toBe(60);
    expect(userStats[1].finished).toBe(false);
    expect(userStats[1].score).toBe(8.5); // Existing field remains
    expect(userStats[1].newField).toBe("test"); // New field added
  });

  test('deleteGameStats should remove stats for a game', () => {
    deleteGameStats(1);
    
    expect(userStats[1]).toBeUndefined();
    
    // Verify localStorage was updated
    expect(localStorageMock.setItem).toHaveBeenCalledWith('userStats', expect.any(String));
  });

  test('should handle missing localStorage data by using initial data', () => {
    localStorageMock.clear();
    localStorageMock.getItem.mockImplementation(() => null);
    
    // Need to re-import after clearing localStorage to trigger the fallback
    jest.resetModules();
    const { games: resetGames, userStats: resetStats } = require('../src/app/games');
    
    expect(resetGames.length).toBeGreaterThan(0);
    expect(Object.keys(resetStats).length).toBeGreaterThan(0);
  });
});

describe('Non-browser environment', () => {
  let originalWindow;

  beforeAll(() => {
    // Simulate non-browser environment
    originalWindow = global.window;
    delete global.window;
  });

  afterAll(() => {
    // Restore window for other tests
    global.window = originalWindow;
  });

  test('should work without window object', () => {
    jest.resetModules();
    const { games: serverGames, userStats: serverStats } = require('../src/app/games');
    
    expect(serverGames.length).toBeGreaterThan(0);
    expect(Object.keys(serverStats).length).toBeGreaterThan(0);
    
    // Verify no localStorage interactions
    serverGames.push({ id: 100, title: "Server Game" });
    expect(localStorageMock.setItem).not.toHaveBeenCalled();
  });
});