import { Button, Flex, Spinner, Text } from "@chakra-ui/react";
import { signInWithPopup } from "firebase/auth";
import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../firebase/context";
import { firebaseAuth, googleAuthProvider } from "../firebase/firebase";

export const LoginPage = () => {
  const { user, authLoading } = useContext(AuthContext);
  if (authLoading) return <Spinner />
  if (user) return <Navigate to='/' replace />
  return (
    <Flex  flexDir="column" alignItems="center" gap={5} pt={5}>
      <Text>Please login to play</Text>
      <Button
        onClick={() => {
          signInWithPopup(firebaseAuth, googleAuthProvider);
        }}
      >
        Login in with google
      </Button>
    </Flex>
  );
};