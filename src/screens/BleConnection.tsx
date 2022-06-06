import React, {useState, useEffect} from 'react';
import {
  Button,
  PermissionsAndroid,
  StyleSheet,
  Text,
  Platform,
  TextInput,
  View,
  Linking,
} from 'react-native';

import {BleManager} from 'react-native-ble-plx';
import {PrettyPrintJSON} from '../globals/utils/helperfunctions';
import messaging from '@react-native-firebase/messaging';

import {HandleNotification, handlePushNotification} from '../services';

const BleConnection: React.FC = ({navigation}) => {
  const [macID, setMacID] = useState('');

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android' && Platform.Version >= 23) {
      PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ).then(result => {
        if (result) {
          console.log('Permission is OK');
          handleConnect();
        } else {
          PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          ).then(result => {
            if (result) {
              console.log('User accept');
              handleConnect();
            } else {
              console.log('User refuse');
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
        device
        //  &&
        // (device.name === 'TI BLE Sensor Tag' || device.name === 'SensorTag')
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
      <Button
        title="go to profile"
        onPress={() => navigation.navigate('profile')}></Button>
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
