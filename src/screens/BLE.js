import React, {useState} from 'react';
import {
  PermissionsAndroid,
  StyleSheet,
  Text,
  Platform,
  TextInput,
  View,
  Alert,
  StatusBar,
  Dimensions,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
} from 'react-native';

import Buffer from 'buffer';

import BleManager from 'react-native-ble-manager';
import {PrettyPrintJSON} from '../globals/utils/helperfunctions';
import {theme} from '../globals/Theme';

const THEME = theme.light;

interface serviceUUID {
  uuid: string;
}

BleManager.start({showAlert: true}).then(() => {
  console.log('Module initialized');
});

const BleConnection: React.FC = () => {
  const [macID, setMacID] = useState<string>('');
  const [deviceID, setDeviceID] = useState<string>('');
  const [serviceIDs, setServiceIDs] = useState<serviceUUID[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const requestPermission = async () => {
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

  const handleConnect = async () => {
    if (!macID) {
      Alert.alert('Please enter mac id of the device');
      return;
    }

    Keyboard.dismiss();

    setLoading(true);

    await BleManager.enableBluetooth().catch(error => {
      // Failure code
      setLoading(false);
      setError('Please turn on bluetooth in order to connect to the bot!');
      console.log('The user refuse to enable bluetooth');
    });

    if (error) {
      return;
    }

    const scanResp = await scanDevice().catch(error => {
      // Failure code
      setLoading(false);
      setError(
        'Some error occured please make sure the macID provided is correct',
      );
    });

    if (error) {
      return;
    }

    PrettyPrintJSON({scanResp, macID});

    await BleManager.connect(macID).catch(error => {
      console.log({error});

      setError(
        'Some error occured make sure your the macID you entered is correct',
      );
      setLoading(false);
    });

    if (error) {
      return;
    }

    const services = await BleManager.retrieveServices(macID);

    // PrettyPrintJSON({services});

    const readData = await BleManager.read(
      macID,
      '68caa2fb-aee8-46b8-84fc-ff2791b391ba',
      '51578d5e-779a-4e25-983d-6645bb44e743',
    ).catch(err => console.log({readError: err}));

    const buffer = Buffer.Buffer.from(readData);

    const sensorData = buffer.join('');

    // PrettyPrintJSON({readData, sensorData});

    setDeviceID(services.advertising.localName || '');
    setServiceIDs(services.services || []);

    setLoading(false);
  };

  const scanDevice = async () => {
    await BleManager.scan([], 5, true);

    await BleManager.stopScan().then(() => {
      // Success code
      console.log('Scan stopped');
    });
    // bleManager.startDeviceScan(null, null, (error, device) => {
    //   if (error) {
    //     // Handle error (scanning will be stopped automatically);
    //     console.log({error, msg: 'error in device scan'});
    //     return;
    //   }
    //   PrettyPrintJSON({
    //     device,
    //   });
    //   device
    //     ?.connect()
    //     .then(device => {
    //       return device.discoverAllServicesAndCharacteristics();
    //     })
    //     .then(device => {
    //       // Do work on device with services and characteristics
    //       PrettyPrintJSON({
    //         characteristics: device,
    //       });
    //     })
    //     .catch(error => {
    //       // Handle errors
    //       console.log({error, msg: 'error in connecting to device'});
    //     });
    //   // Check if it is a device you are looking for based on advertisement data
    //   // or other criteria.
    //   if (
    //     device &&
    //     (device.name === 'TI BLE Sensor Tag' || device.name === 'SensorTag')
    //   ) {
    //     // Stop scanning as it's not necessary if you are scanning for one device.
    //     bleManager.stopDeviceScan();
    //     // Proceed with connection.
    //   }
    // });
  };

  const handleInput = (val: string) => {
    val = val.replace(/\s/gi, ':');

    console.log({val});

    setMacID(val);
  };

  // Renderers
  const RenderHeader: React.FC = () => {
    return (
      <View style={styles.headCont}>
        <Image
          source={require('../globals/images/navbar_logo.png')}
          style={styles.logo}
        />
      </View>
    );
  };

  const RenderBotInfo: React.FC = () => {
    return (
      <View style={styles.infoCont}>
        {!deviceID ? (
          <Text style={[styles.heading, styles.warn]}>
            {error || "Nothing to show, please insert bot's macID"}
          </Text>
        ) : (
          <>
            <View style={styles.flexRow}>
              <Text style={styles.heading}>Device Name:</Text>
              <Text style={styles.text}>{deviceID}</Text>
            </View>
            <View>
              <Text style={styles.heading}>Service IDs:</Text>
              <View>
                {serviceIDs.map((services, key) => (
                  <Text style={styles.text} key={key}>
                    {services.uuid}
                  </Text>
                ))}
              </View>
            </View>
          </>
        )}
      </View>
    );
  };

  PrettyPrintJSON({deviceID, serviceIDs})

  return (
    <View style={styles.cont}>
      <StatusBar backgroundColor={THEME.primary} barStyle={'light-content'} />
      <RenderHeader />
      <View style={styles.formCont}>
        <TextInput
          value={macID}
          onChangeText={handleInput}
          placeholder={"Please enter device's mac id"}
          style={styles.input}
          placeholderTextColor={'#666'}
        />
        <TouchableOpacity style={styles.btn} onPress={requestPermission}>
          {loading ? (
            <ActivityIndicator color={THEME.primary} />
          ) : (
            <Text style={styles.btnTitle}>Connect</Text>
          )}
        </TouchableOpacity>
      </View>
      <RenderBotInfo />
    </View>
  );
};

export default BleConnection;

const styles = StyleSheet.create({
  cont: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  headCont: {
    backgroundColor: THEME.primary,
    width: '100%',
    height: Dimensions.get('screen').height * 0.13,
    elevation: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    alignSelf: 'center',
    width: '40%',
    height: Dimensions.get('screen').height * 0.1,
    resizeMode: 'contain',
  },
  formCont: {
    width: '100%',
    height: Dimensions.get('screen').height * 0.15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 5,
    borderColor: THEME.primary,
    borderWidth: 1,
    paddingHorizontal: 15,
    color: '#000',
  },
  btn: {
    width: '25%',
    backgroundColor: THEME.secondary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnTitle: {
    color: THEME.primary,
    fontWeight: '800',
  },

  infoCont: {
    backgroundColor: '#fff',
    width: '90%',
    height: Dimensions.get('screen').height * 0.5,
    alignSelf: 'center',
    borderColor: THEME.primary,
    borderWidth: 0.7,
    borderRadius: 20,
    elevation: 3,
    padding: 20,
  },

  flexRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },

  heading: {
    fontWeight: '900',
    marginRight: 10,
    marginBottom: 10,
    fontSize: 16,
    color: '#000',
  },

  text: {
    fontSize: 16,
    color: THEME.primary,
  },

  warn: {
    color: '#ef5561',
    alignSelf: 'center',
    textAlign: 'center',
  },
});
