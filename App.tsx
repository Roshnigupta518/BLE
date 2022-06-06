/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, {useEffect} from 'react';

import {LinkingOptions, NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import messaging from '@react-native-firebase/messaging';

import {HandleNotification, handlePushNotification} from './src/services';

import Main from './src/screens/Main';
import Settings from './src/screens/Settings';
import Profile from './src/screens/Profile';
import {Linking, Text} from 'react-native';
import BleConnection from './src/screens/BleConnection';
import { navigationRef,
  navigate} from './src/screens/Navigation_service';

const Stack = createNativeStackNavigator();

const App: React.FC = () => {
  const config = {
    screens: {
      Home: 'home',
      Settings: 'settings',
      profile: 'profile',
    },
  };

  const linking: LinkingOptions<{}> = {
    prefixes: ['rnlearningproject://', 'https://app.rnlearningproject.com'],
    config: config,
    async getInitialURL() {
      // Check if app was opened from a deep link
      const url = await Linking.getInitialURL();

      console.log({url});

      if (url != null) {
        return url;
      }

      // Check if there is an initial firebase notification
      const message = await messaging().getInitialNotification();

      let notifData;

      if (message) {
        notifData = handlePushNotification(message);
        
      }

      console.log({
        path: notifData?.url,
        returnRep: notifData ? notifData.url : notifData,
      });

      // const notifData = await HandleNotification().catch(err =>
      //   console.log({
      //     msg: 'error in HandleNotification',
      //     err,
      //   }),
      // );

      // Get deep link from data
      // if this is undefined, the app will open the default/home page
      return notifData ? notifData.url : notifData;
    },

    subscribe(listener) {
      const onReceiveURL = ({url}: {url: string}) => listener(url);

      // Listen to incoming links from deep linking
      const listner = Linking.addEventListener('url', onReceiveURL);

      // Listen to firebase push notifications
      const unsubscribeNotification = messaging().onNotificationOpenedApp(
        message => {
          const url = message?.data?.url;

          if (url) {
            // Any custom logic to check whether the URL needs to be handled

            console.log({subscribe: url});

            // Call the listener to let React Navigation handle the URL
            listener(url);
          }
        },
      );

      return () => {
        // Clean up the event listeners
        listner.remove();
        unsubscribeNotification();
      };
    },
  };

  return (
    <NavigationContainer linking={linking} fallback={<Text>Loading...</Text>}
  //   ref = {
  //     navigationRef
  // }
  >
      <Stack.Navigator>
        <Stack.Screen name="BleConnection" component={BleConnection} />
        <Stack.Screen name="Home" component={Main} />
        <Stack.Screen name="Settings" component={Settings} />
        <Stack.Screen name="profile" component={Profile} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
