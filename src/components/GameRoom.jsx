import {
  Button,
  Flex,
  Icon,
  IconButton,
  Spinner,
  Text
} from '@chakra-ui/react';
import dayjs from 'dayjs';
import {
  arrayUnion, doc,
  serverTimestamp,
  setDoc,
  updateDoc
} from 'firebase/firestore';
import React, { useContext, useState } from 'react';
import {
  useDocumentData
} from 'react-firebase-hooks/firestore';
import {
  FaRegHandPaper, FaRegHandRock, FaRegHandScissors, FaReply
} from 'react-icons/fa';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../firebase/context';
import { firestore } from '../firebase/firebase';
import { gameDataConverter } from '../firebase/gameDataConverter';

// Game Room:
// after started, disable join, enable move,
// then waiting for each player move, after each player move (private field), show waiting & disable move
// after all players move
// firebase function determine result(win/lose/draw), enable players to move if game not end
// if someone loses, show loser & disable all move

export const GameRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user, authLoading } = useContext(AuthContext);
  const gameRef = doc(firestore, 'game', roomId).withConverter(
    gameDataConverter
  );

  // listen for game data change, refresh if change
  const [game, loading] = useDocumentData(gameRef);
  const [updateLoading, setUpdateLoading] = useState(false);

  if (authLoading)
    return (
      <Flex justify="center">
        <Spinner />
      </Flex>
    );
  // if not login, redirect to login page
  if (!user) return <Navigate to="/login" replace />;
  if (loading)
    return (
      <Flex justify="center">
        <Spinner />
      </Flex>
    );

  const { taskName, players, started, createdAt, host, round, loser, draw } =
    game;
  const roundRef = doc(game.ref, 'private', `round-${round}`);
  const playerList = Object.keys(players);
  // sort playerlist by join time
  const sortedPlayerList = playerList.sort(
    (a, b) => players[a].joinTime?.toDate() - players[b].joinTime?.toDate()
  );

  const createdTime = dayjs.unix(createdAt.seconds);
  const createdTimeString = dayjs().isSame(createdTime, 'day')
    ? 'Today ' + createdTime.format('HH:mm')
    : createdTime.format('DD/MM HH:mm');

  // start game, create round document
  const startGame = async () => {
    setUpdateLoading(true);
    await updateDoc(game.ref, {
      started: true,
    });
    await setDoc(roundRef, {
      rock: [],
      paper: [],
      scissors: [],
    });
    setUpdateLoading(false);
  };

  // todo able to exit game if not started
  const joinGame = async () => {
    setUpdateLoading(true);
    await updateDoc(game.ref, {
      [`players.${user.uid}`]: {
        email: user.email,
        moved: false,
        win: false,
        lastRoundMove: null,
        joinTime: serverTimestamp(),
      },
    });
    setUpdateLoading(false);
  };

  // add move to round document (private, players have no read access)
  const performMove = async move => {
    await updateDoc(game.ref, {
      [`players.${user.uid}.moved`]: true,
      draw: false,
    });
    await updateDoc(roundRef, {
      [move]: arrayUnion(user.uid),
    });
  };

  return (
    <Flex flexDir="column" align="center">
      <Flex flexDir="column" gap={3} w={['full', 'full', '750px']}>
        <Flex align="center" justify="space-between" pr={3}>
          <IconButton
            icon={<Icon as={FaReply} />}
            onClick={() => {
              navigate('/');
            }}
          />
          <Text color="gray" fontSize="sm">
            Created: {createdTimeString}
          </Text>
        </Flex>

        <Text fontSize="larger" fontWeight="bold" noOfLines={2} px={3}>
          Task: {taskName}
        </Text>

        {host === user.uid ? (
          <Flex alignItems={'center'}>
            <Button
              onClick={startGame}
              isDisabled={playerList.length === 1 || started}
              w="150px"
            >
              {started ? 'Game started' : 'Start the game'}
            </Button>
            {updateLoading && <Spinner />}
          </Flex>
        ) : (
          <Flex alignItems={'center'}>
            <Button
              onClick={joinGame}
              isDisabled={playerList.includes(user.uid) || started}
              w="150px"
            >
              {playerList.includes(user.uid) ? 'Joined' : 'Join the game'}
            </Button>
            {updateLoading && <Spinner />}
          </Flex>
        )}

        <Flex
          flexDir="column"
          border="1px"
          borderColor="gray"
          borderRadius={[0, 0, 5]}
          p={3}
        >
          <Flex pb={3} align="center" h="50px" justify="space-between">
            <Text>Players: </Text>
            {draw && (
              <Text bg="gray.400" p={1}>
                Draw
              </Text>
            )}
            <Text>{started ? `Round: ${round}` : 'Waiting to start'}</Text>
          </Flex>

          {sortedPlayerList.map(uid => (
            <Flex key={uid} flexDir="column" gap={1} py={3} borderTop="1px">
              <Flex gap={3} align="center" flexWrap="wrap" h="40px">
                <Text w="190px" isTruncated>
                  {players[uid].email}
                </Text>
                {players[uid].win && !loser && (
                  <Text bg="green.400" p={1} fontSize="sm" borderRadius={5}>
                    Win
                  </Text>
                )}
                {loser === uid && (
                  <Text bg="gray.400" p={1} fontSize="sm" borderRadius={5}>
                    Lose
                  </Text>
                )}
                {started && !players[uid].moved && (
                  <Text bg="yellow" p={1} fontSize="sm" borderRadius={5}>
                    thinking...
                  </Text>
                )}
              </Flex>
              <Flex gap={5} align="center" h="40px">
                {user.uid === uid && (
                  <>
                    <IconButton
                      icon={<Icon as={FaRegHandRock} />}
                      disabled={
                        !started ||
                        players[user.uid].moved ||
                        uid !== user.uid ||
                        players[user.uid].win
                      }
                      onClick={() => {
                        performMove('rock');
                      }}
                    />
                    <IconButton
                      icon={<Icon as={FaRegHandPaper} />}
                      disabled={
                        !started ||
                        players[user.uid].moved ||
                        uid !== user.uid ||
                        players[user.uid].win
                      }
                      onClick={() => {
                        performMove('paper');
                      }}
                    />
                    <IconButton
                      icon={<Icon as={FaRegHandScissors} />}
                      disabled={
                        !started ||
                        players[user.uid].moved ||
                        uid !== user.uid ||
                        players[user.uid].win
                      }
                      onClick={() => {
                        performMove('scissors');
                      }}
                    />
                  </>
                )}
                <Flex
                  ml="auto"
                  mr={4}
                  border="1px"
                  borderRadius={5}
                  borderColor="gray"
                  h="40px"
                  w="40px"
                  justifyContent="center"
                  alignItems="center"
                >
                  {players[uid].lastRoundMove && (
                    <Icon
                      as={
                        players[uid].lastRoundMove === 'rock'
                          ? FaRegHandRock
                          : players[uid].lastRoundMove === 'paper'
                          ? FaRegHandPaper
                          : FaRegHandScissors
                      }
                      boxSize="24px"
                    />
                  )}
                </Flex>
              </Flex>
            </Flex>
          ))}
        </Flex>
      </Flex>
    </Flex>
  );
};
