import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import {PrettyPrintJSON} from '../globals/utils/helperfunctions';

interface NotifData {
    url: string,
}

async function RequestUserPermission():
  Promise<false | FirebaseMessagingTypes.AuthorizationStatus> {

  const authStatus = await messaging().requestPermission();
  // messaging().ios.registerForRemoteNotifications();

  console.log({authStatus});

  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  console.log({enabled});

  if (enabled) {
    console.log('Authorization status:', authStatus);
    return authStatus;
  }
  return false;
}

export const HandleNotification = async () : Promise<NotifData | null> => {
  return new Promise(async (resolve, reject) => {
    const isPushNotificationPermitted = await RequestUserPermission();

    console.log({isPushNotificationPermitted});

    if (isPushNotificationPermitted) {
      messaging().onMessage(async remoteMessage => {
        console.log('will not redirect in foreground state...');
        PrettyPrintJSON({remoteMessage});
        const notifData = handlePushNotification(remoteMessage);

        resolve(notifData);
      });
      messaging().onNotificationOpenedApp(remoteMessageBG => {
        PrettyPrintJSON({remoteMessageBG});
        handlePushNotification(remoteMessageBG);
        const notifData = handlePushNotification(remoteMessageBG);

        resolve(notifData);
      });
      messaging()
        .getInitialNotification()
        .then(remoteMessageQ => {
          PrettyPrintJSON({remoteMessageQ});

          if (remoteMessageQ) {
            handlePushNotification(remoteMessageQ);

            const notifData = handlePushNotification(remoteMessageQ);

            resolve(notifData);
          }
          reject('no notif')
        });
    }
  });
};

export const handlePushNotification = (
  notification: FirebaseMessagingTypes.RemoteMessage,
) => {
  if (notification && notification.data && notification.data.url) {
     
    // if(notification.data.url=='profile'){
    //   Navigation.navigate('profile')
    // }

    const item = {
      url: notification.data.url,
    };

    PrettyPrintJSON({item});

    return item;
  }

  return null;
};
