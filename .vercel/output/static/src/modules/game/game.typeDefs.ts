export const gameTypeDefs = `
  type GameResult {
    id: String!
    correctChars: Int!
    wrongAttempts: Int!
    rawTimeMs: Int!        
    penaltyMs: Int!         
    totalTimeMs: Int!        
    accuracy: Float!        
    wpmTimeline: [Float!]!   
    characterTimeline: [Int!]
    createdAt: String!
  }

  type LeaderboardEntry {
    rank: Int!
    playerName: String!
    bestTimeMs: Int!
  }

input SubmitGameResultInput {
  correctChars: Int!
  wrongAttempts: Int!
  rawTimeMs: Int!          
  wpmTimeline: [Float!]!  
  characterTimeline: [Int!]!
}

  extend type Query {
    myGameHistory: [GameResult!]!
    myBestScore: GameResult
    leaderboard(limit: Int = 10): [LeaderboardEntry!]!
  }

  extend type Mutation {
    submitGameResult(input: SubmitGameResultInput!): GameResult!
  }
`;