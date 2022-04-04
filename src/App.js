import React from 'react';
import {
  ChakraProvider,
  Box,
  theme,
} from '@chakra-ui/react';
import { RoomList } from './components/RoomList';
import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom';
import { GameRoom } from './components/GameRoom';
import { LoginPage } from './components/LoginPage';
import { Navbar } from './components/Navbar';
import { QueryClient, QueryClientProvider } from 'react-query';

// chakra provider: for ui
// react router: for client-side routing
// react query provider: for using infinte query for game list
// todo gen pwa assets, remove unused import

function App() {
  const queryClient = new QueryClient()
  return (
    <ChakraProvider theme={theme}>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <Box
            minH='100vh'
          >
            <Navbar />
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<RoomList />} />
              <Route path="/room/:roomId" element={<GameRoom />} />
            </Routes>
          </Box>
        </QueryClientProvider>
      </BrowserRouter>
    </ChakraProvider>
  );
}

export default App;
