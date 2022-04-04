import { Flex, Icon, IconButton, Text } from '@chakra-ui/react';
import { signOut } from 'firebase/auth';
import React, { useContext } from 'react';
import { FaSignOutAlt } from 'react-icons/fa';
import { AuthContext } from '../firebase/context';
import { firebaseAuth } from '../firebase/firebase';

export const Navbar = () => {
  const { user } = useContext(AuthContext);
  return (
    <Flex
      w="full"
      justify="space-between"
      bg="blue.100"
      align="center"
      h='50px'
    >
      <Text ml={3} fontSize="larger">Rock Paper Scissors</Text>
      {user && (
        <IconButton
          icon={<Icon as={FaSignOutAlt} />}
          variant="ghost"
          color="current"
          onClick={() => {
            signOut(firebaseAuth);
          }}
        />
      )}
    </Flex>
  );
};
