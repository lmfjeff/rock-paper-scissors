import {
  Box, Flex, Icon,
  IconButton,
  Input,
  Spinner,
  Text
} from '@chakra-ui/react';
import {
  addDoc,
  collection, serverTimestamp
} from 'firebase/firestore';
import React, { useContext, useState } from 'react';
import { FaPlus, FaUndo } from 'react-icons/fa';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Navigate, useNavigate } from 'react-router-dom';
import { AuthContext } from '../firebase/context';
import { firestore } from '../firebase/firebase';
import { gameDataConverter } from '../firebase/gameDataConverter';
import { useGameListQuery } from '../hooks/useGameListQuery';

export const RoomList = () => {
  const { user, authLoading } = useContext(AuthContext);

  const gameListRef = collection(firestore, 'game').withConverter(
    gameDataConverter
  );

  // infinite scroll
  const { data, fetchNextPage, hasNextPage, isFetching, refetch } =
    useGameListQuery(gameListRef, !!user);
  const gameList = data?.pages.map(({ gameList }) => gameList).flat() || [];

  const [newTask, setNewTask] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  const navigate = useNavigate();

  if (authLoading)
    return (
      <Flex justify="center">
        <Spinner />
      </Flex>
    );
  // if not login, redirect to login page
  if (!user) return <Navigate to="/login" replace />;

  const addNewTask = async e => {
    if (!newTask) {
      console.log('need non-empty task name');
      return;
    }

    setCreateLoading(true);
    await addDoc(gameListRef, {
      createdAt: serverTimestamp(),
      taskName: newTask,
      host: user.uid,
      started: false,
      players: {
        [user.uid]: {
          email: user.email,
          moved: false,
          win: false,
          lastRoundMove: null,
          joinTime: serverTimestamp(),
        },
      },
      round: 1,
    });
    setNewTask('');
    refetch();
    setCreateLoading(false);
  };

  return (
    <Flex flexDir="column" alignItems="center" gap={5} pt={5}>
      <Text fontSize="larger">Loser take the task!</Text>

      <Flex alignItems="center" gap={3} wrap="wrap" mx={3}>
        <Text>Create New Game:</Text>
        <Flex alignItems="center">
          <Input
            value={newTask}
            width={'auto'}
            placeholder="Task Name"
            onChange={e => {
              setNewTask(e.target.value);
            }}
            onKeyDown={e => {
              if (e.code === 'Enter' || e.code === 'NumpadEnter') {
                addNewTask();
              }
            }}
          />
          <IconButton
            aria-label="add task"
            onClick={addNewTask}
            icon={<Icon as={FaPlus} />}
          />
        </Flex>
      </Flex>

      <Flex
        flexDir="column"
        border="1px"
        borderColor="gray"
        borderRadius={[0, 0, 5]}
        w={['full', 'full', '750px']}
        mb={5}
      >
        <Flex align="center" justify="space-between">
          <Text fontSize="larger" fontWeight="bold" ml={3}>
            Task List
          </Text>
          <IconButton
            icon={<Icon as={FaUndo} />}
            onClick={refetch}
            isLoading={isFetching || createLoading}
            variant="ghost"
          />
        </Flex>

        <InfiniteScroll
          dataLength={gameList.length}
          next={fetchNextPage}
          hasMore={!!hasNextPage}
          scrollThreshold={0.95}
          loader={<Spinner />}
          endMessage={
            !isFetching && (
              <Text textAlign="center" borderTop="1px" borderColor="gray">
                End
              </Text>
            )
          }
        >
          {gameList &&
            gameList.map(game => (
              <Box
                key={game.id}
                p={5}
                borderTop="1px"
                borderColor="gray"
                cursor="pointer"
                _hover={{ bg: 'gray.100' }}
                onClick={() => {
                  navigate(`/room/${game.id}`);
                }}
              >
                <Text noOfLines={2} mb={2}>
                  {game.taskName}
                </Text>
                <Text fontSize="sm" color="gray">
                  Loser: {game.loser ? game.players[game.loser].email : 'TBD'}
                </Text>
              </Box>
            ))}
        </InfiniteScroll>

      </Flex>
    </Flex>
  );
};
