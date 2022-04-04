# Rock, Paper, Scissor (Multiplayer)

Simple rock, paper, scissors game

## Used tech stack

| **Package**       | **Usage**             |
| ----------------- | --------------------- |
| firestore         | database              |
| firebase auth     | google authentication |
| firebase function | backend api           |
| chakra ui         | component library     |
| react router      | client-side routing   |


## firebase function

- calculate every round result

## firestore / data structure

For game data

- game/{roomId}
  - createdAt: timestamp
  - draw: bool
  - host: uid
  - taskName: string
  - started: bool
  - loser: uid
  - round: int
  - players: object
    - uid: object
      - email: string
      - moved: bool
      - win: bool
      - joinTime: timestamp
      - lastRoundMove: 'rock' | 'paper' | 'scissors'

For round data

- game/{roomId}/private/{round-N}
  - rock: uid[]
  - paper: uid[]
  - scissors: uid[]

## Page layout

- login
- room list
- room/[roomId]

## Database call:

- room list:
  - fetch room list once (limit: 10), infinite query
  - create game
- room/[roomId]: 
  - listen for update of the game data, refresh if change
  - update game data (start game, join game, perform move)
  - create/update round data

## Local development

```bash
# install npm package
npm install

# install package for firebase functions
cd /functions
npm install

# local firestore / firebase function can be used
firebase emulators:start

# run react in development mode
cd ..
npm start
```

## Possible improvement:

- implement more firestore security rule to prevent unwanted database call, e.g.
  - join game: verify not started yet
  - perform move: verify whether is players
- animaton?
