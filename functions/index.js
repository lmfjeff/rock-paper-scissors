const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { FieldValue } = require('firebase-admin/firestore');
admin.initializeApp();
const firestore = admin.firestore();

// run every time player perform move
// Purpose: determine result of every round
exports.onPerformMove = functions.firestore
  .document('game/{roomId}/private/{round}')
  .onUpdate(async (change, context) => {
    const roomId = context.params.roomId;
    const roundData = change.after.data();
    // get all the players and round of the game, and game ref
    const gameRef = firestore.doc('game/' + roomId);
    const game = (await gameRef.get()).data();

    // filter out players who already won, the remaining who are still playing
    const players = Object.keys(game.players);
    const remainingPlayers = players.filter(
      uid => game.players[uid].win === false
    );
    const remainingPlayerNum = remainingPlayers.length;
    const wonPlayers = players.filter(uid => game.players[uid].win === true);

    const movedPlayerNum = Object.values(roundData).flat().length;

    // only after all players perform move, result is calcualted
    if (remainingPlayerNum !== movedPlayerNum) {
      return;
    } else {
      // record last round move of players
      const allPlayersObject = {};
      for (const move in roundData) {
        roundData[move].forEach(player => {
          allPlayersObject[`players.${player}.lastRoundMove`] = move;
        });
      }
      wonPlayers.forEach(player => {
        allPlayersObject[`players.${player}.lastRoundMove`] = null;
      });

      // decide win/lose/draw
      const gameResult = decideResult(roundData);
      // if loser exists, game end
      if (gameResult.loser) {
        await gameRef.update({
          loser: gameResult.loser,
          ...allPlayersObject,
        });
        return;
      }
      // if no loser, set winners, reset all remaining players' moved to false, round +1
      const winOrDrawObject = {};
      if (gameResult.winners.length > 0) {
        gameResult.winners.forEach(winner => {
          winOrDrawObject[`players.${winner}.win`] = true;
        });
      } else {
        winOrDrawObject['draw'] = true;
      }

      const lostOrDrawObject = {};
      const lostOrDrawPlayers = remainingPlayers.filter(
        uid => !gameResult.winners.includes(uid)
      );
      lostOrDrawPlayers.forEach(player => {
        lostOrDrawObject[`players.${player}.moved`] = false;
      });

      await gameRef.update({
        round: FieldValue.increment(1),
        ...allPlayersObject,
        ...lostOrDrawObject,
        ...winOrDrawObject,
      });
      // create new round
      const newRoundRef = firestore.doc(
        `game/${roomId}/private/round-${game.round + 1}`
      );
      await newRoundRef.set({
        rock: [],
        paper: [],
        scissors: [],
      });
    }
  });

// calculate result based on all players' move, return { loser: uid || null, winners: uid[] }
function decideResult(roundData) {
  const rockPlayers = roundData['rock'];
  const paperPlayers = roundData['paper'];
  const scissorsPlayers = roundData['scissors'];
  const rockNum = rockPlayers.length;
  const paperNum = paperPlayers.length;
  const scissorsNum = scissorsPlayers.length;
  const totalNum = rockNum + paperNum + scissorsNum;
  // if contains all 3 moves or all same move, draw
  if (rockNum > 0 && paperNum > 0 && scissorsNum > 0)
    return { winners: [], loser: null };
  if (rockNum === totalNum || paperNum === totalNum || scissorsNum === totalNum)
    return { winners: [], loser: null };
  // else, if loser number is 1, game end
  // else, more than 1 lose, add winning players to array, game continue
  if (rockNum === 0) {
    if (paperNum === 1) return { winners: [], loser: paperPlayers[0] };
    return { winners: scissorsPlayers, loser: null };
  }
  if (paperNum === 0) {
    if (scissorsNum === 1) return { winners: [], loser: scissorsPlayers[0] };
    return { winners: rockPlayers, loser: null };
  }
  if (scissorsNum === 0) {
    if (rockNum === 1) return { winners: [], loser: rockPlayers[0] };
    return { winners: paperPlayers, loser: null };
  }
}
