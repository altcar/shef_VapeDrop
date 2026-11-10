import { View, Text, Button } from 'react-native'
import React from 'react';

import { AppleButton } from '@invertase/react-native-apple-authentication';
import { onAppleButtonPress } from "./comp/appleaction.jsx";
import { onGoogleButtonPress } from "./comp/googleaction.jsx";

const Page = () => {
  return (
    <View>
      <Text>Page</Text>
      <AppleButton
      buttonStyle={AppleButton.Style.WHITE}
      buttonType={AppleButton.Type.SIGN_IN}
      style={{
        width: 160,
        height: 45,
      }}
      onPress={() => onAppleButtonPress().then(() => console.log('Apple sign-in complete!'))}
    />
    <Text>Hi</Text>
    <Button title='no way'></Button>
    <Button
      title="Google Sign-In"
      onPress={() => onGoogleButtonPress().then(() => console.log('Signed in with Google!'))}
    />
    </View>
  )
}

export default Page