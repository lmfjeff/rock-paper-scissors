import { getDocs, limit, orderBy, query, startAfter } from 'firebase/firestore';
import { useInfiniteQuery } from 'react-query';

// infinite query to get game list
export function useGameListQuery(gameListRef, enabled) {
  const queryKey = ['gameList'];
  const batchSize = 10;

  const fetchGameList = async ({ pageParam = null }) => {
    const constraints = [];
    if (pageParam) {
      constraints.push(startAfter(pageParam));
    }
    const gameListQuery = query(
      gameListRef,
      orderBy('createdAt', 'desc'),
      limit(batchSize),
      ...constraints
    );
    // const [gameList] = useCollectionDataOnce(gameListQuery);
    const gameListSnapshot = await getDocs(gameListQuery);
    const gameListDocs = gameListSnapshot.docs;
    const gameList = gameListDocs.map(gameListDoc => gameListDoc.data());
    return {
      gameList,
      nextCursor: gameListDocs[gameListDocs.length - 1],
    };
  };

  return useInfiniteQuery(queryKey, fetchGameList, {
    getNextPageParam: lastPage => {
      return lastPage.gameList.length < batchSize ? null : lastPage.nextCursor;
    },
    enabled,
  });
}
