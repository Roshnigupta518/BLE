import React, {useState} from 'react';
import {
  Button,
  PermissionsAndroid,
  StyleSheet,
  Text,Platform,
  TextInput,
  View,
} from 'react-native';

import {BleManager} from 'react-native-ble-plx';
import {PrettyPrintJSON} from '../globals/utils/helperfunctions';

const BleConnection: React.FC = () => {
  const [macID, setMacID] = useState('');

  const requestCameraPermission = async () => {
    // try {
    //   const grantedLocation = await PermissionsAndroid.request(
    //     PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    //     {
    //       title: 'fine location Permission',
    //       message:
    //         'fine location App needs access to your fine location ' +
    //         'so you can connect to bot.',
    //       buttonNeutral: 'Ask Me Later',
    //       buttonNegative: 'Cancel',
    //       buttonPositive: 'OK',
    //     },
    //   );

    //   if (grantedLocation !== PermissionsAndroid.RESULTS.GRANTED) {
    //     console.log('location permission  ot granted');
    //     return;
    //   }

    //   const granted = await PermissionsAndroid.request(
    //     PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
    //     {
    //       title: 'Bluetooth Permission',
    //       message:
    //         'Bluetooth App needs access to your bluetooth ' +
    //         'so you can connect to bot.',
    //       buttonNeutral: 'Ask Me Later',
    //       buttonNegative: 'Cancel',
    //       buttonPositive: 'OK',
    //     },
    //   );

    //   console.log({granted});

    //   if (granted === PermissionsAndroid.RESULTS.GRANTED) {
    //     console.log('You can use the bluetooth');
    //     handleConnect();
    //   } else {
    //     console.log('bluetooth permission denied');
    //   }
    // } catch (err) {
    //   console.warn(err);
    // }

    if (Platform.OS === 'android' && Platform.Version >= 23) {
      PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((result) => {
          if (result) {
            console.log("Permission is OK");
            handleConnect();
          } else {
            PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((result) => {
              if (result) {
                console.log("User accept");
                handleConnect();
              } else {
                console.log("User refuse");
              }
            });
          }
      });
    } 
  };

  const handleConnect = () => {
    const bleManager = new BleManager();

    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        // Handle error (scanning will be stopped automatically);
        console.log({error, msg: 'error in device scan'});
        return;
      }

      PrettyPrintJSON({
        device,
      });

      // Check if it is a device you are looking for based on advertisement data
      // or other criteria.
      if (
        device &&
        (device.name === 'TI BLE Sensor Tag' || device.name === 'SensorTag')
      ) {
        // Stop scanning as it's not necessary if you are scanning for one device.
        bleManager.stopDeviceScan();

        // Proceed with connection.
      }
    });
  };

  return (
    <View style={styles.cont}>
      <TextInput
        value={macID}
        onChangeText={val => setMacID(val)}
        placeholder={'Enter your mac id here'}
      />
      <Button title="Connect" onPress={requestCameraPermission} />
    </View>
  );
};

export default BleConnection;

const styles = StyleSheet.create({
  cont: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
