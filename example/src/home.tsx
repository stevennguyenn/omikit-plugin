import { StyleSheet, View, Platform } from 'react-native';
import {
  CustomButton,
  CustomCheckBox,
  CustomTextField,
  KeyboardAvoid,
} from './components';
import React, { useCallback, useEffect, useState } from 'react';
import {
  // getInitialCall,
  OmiCallEvent,
  omiEmitter,
  startCall,
  logout,
  // startCallWithUuid,
  systemAlertWindow,
  openSystemAlertSetting,
  OmiCallState,
  getInitialCall,
  OmiStartCallStatus,
} from 'omikit-plugin';
import { useNavigation } from '@react-navigation/native';
import { prepareForUpdateToken } from './notification';
import { LiveData } from './livedata';
import { localStorage } from './local_storage';
// import RNPermissions, {
//   Permission,
//   PERMISSIONS,
// } from 'react-native-permissions';

export const HomeScreen = () => {
  ///need add call phone
  // var [phone, setPhone] = useState(
  //   Platform.OS === 'android' ? '123aaa' : '124aaa'
  // );
  var [phone, setPhone] = useState(Platform.OS === 'android' ? '100' : '100');
  const navigation = useNavigation();
  const [callVideo, setCallVideo] = useState(true);

  const checkInitCall = useCallback(async () => {
    const callingInfo = await getInitialCall();
    if (callingInfo !== null && callingInfo !== false) {
      const { callerNumber } = callingInfo;
      console.log(callerNumber);
    }
  }, []);

  useEffect(() => {
    prepareForUpdateToken();
    checkInitCall();
    checkSystemAlert();
  }, [checkInitCall]);

  const checkSystemAlert = async () => {
    if (Platform.OS === 'android') {
      const isAllow = await systemAlertWindow();
      if (!isAllow) {
        openSystemAlertSetting();
      }
    }
  };

  const _videoTrigger = useCallback(() => {
    setCallVideo(!callVideo);
  }, [callVideo]);

  const onCallStateChanged = useCallback(
    (data: any) => {
      const { status, transactionId, callerNumber, isVideo } = data;
      console.log(transactionId);
      if (status === OmiCallState.incoming) {
        const input = {
          callerNumber: callerNumber,
          status: status,
          isOutGoingCall: false,
        };
        console.log(isVideo);
        if (isVideo === true) {
          navigation.navigate('VideoCall' as never, input as never);
        } else {
          navigation.navigate('DialCall' as never, input as never);
        }
      }
      if (status === OmiCallState.confirmed) {
        if (LiveData.isOpenedCall === true) {
          return;
        }
        const input = {
          callerNumber: callerNumber,
          status: status,
          isOutGoingCall: false,
        };
        if (isVideo === true) {
          navigation.navigate('VideoCall' as never, input as never);
        } else {
          navigation.navigate('DialCall' as never, input as never);
        }
      }
    },
    [navigation]
  );

  const callWithParam = useCallback(
    async (data: any) => {
      const { callerNumber, isVideo } = data;
      const result = await startCall({
        phoneNumber: callerNumber,
        isVideo: isVideo,
      });
      if (result === OmiStartCallStatus.startCallSuccess) {
        const param = {
          callerNumber: callerNumber,
          status: OmiCallState.calling,
          isOutGoingCall: true,
        };
        if (isVideo === true) {
          navigation.navigate('VideoCall' as never, param as never);
        } else {
          navigation.navigate('DialCall' as never, param as never);
        }
      }
    },
    [navigation]
  );

  const clickMissedCall = useCallback(
    (data: any) => {
      if (LiveData.isOpenedCall === true) {
        return;
      }
      callWithParam(data);
    },
    [callWithParam]
  );

  useEffect(() => {
    omiEmitter.addListener(OmiCallEvent.onCallStateChanged, onCallStateChanged);
    omiEmitter.addListener(OmiCallEvent.onClickMissedCall, clickMissedCall);
    return () => {
      omiEmitter.removeAllListeners(OmiCallEvent.onCallStateChanged);
      omiEmitter.removeAllListeners(OmiCallEvent.onClickMissedCall);
    };
  }, [onCallStateChanged, clickMissedCall]);

  const call = async () => {
    // navigation.navigate('Call' as never);
    if (phone.trim().length === 0) {
      return;
    }
    const result = await startCall({ phoneNumber: phone, isVideo: callVideo });
    if (result) {
      const data = {
        callerNumber: phone,
        status: OmiCallState.calling,
        isOutGoingCall: true,
      };
      if (callVideo === true) {
        navigation.navigate('VideoCall' as never, data as never);
      } else {
        navigation.navigate('DialCall' as never, data as never);
      }
    }
  };

  // const call = async () => {
  //   // navigation.navigate('Call' as never);
  //   if (phone.trim().length === 0) {
  //     return;
  //   }
  //   const result = await startCallWithUuid({
  //     usrUuid: phone,
  //     isVideo: callVideo,
  //   });
  //   console.log(result);
  //   if (result === OmiStartCallStatus.startCallSuccess) {
  //     const data = {
  //       callerNumber: phone,
  //       status: CallStatus.calling,
  //     };
  //     if (callVideo === true) {
  //       navigation.navigate('VideoCall' as never, data as never);
  //     } else {
  //       navigation.navigate('DialCall' as never, data as never);
  //     }
  //   } else {
  //   }
  // };

  // const showAlert = (message: string) =>
  //   Alert.alert('Notification', message, [
  //     {
  //       text: 'Cancel',
  //     },
  //   ]);

  const logoutCB = async () => {
    await logout();
    localStorage.clearAll();
    // navigation.reset({ index: 0, routes: [{ name: 'LoginAPIKey' as never }] });
    navigation.reset({ index: 0, routes: [{ name: 'Login' as never }] });
  };

  return (
    <KeyboardAvoid>
      <View style={styles.background}>
        <CustomTextField
          placeHolder="Phone number/Usr Uuid"
          ///need add call phone
          value={phone}
          returnKey={'done'}
          onChange={(text: string) => {
            setPhone(text);
          }}
        />
        <CustomCheckBox
          title="Video call"
          checked={callVideo}
          callback={_videoTrigger}
          style={styles.checkbox}
        />
        <CustomButton title="CALL" callback={call} style={styles.button} />
        <CustomButton
          title="LOG OUT"
          callback={logoutCB}
          style={styles.button}
        />
      </View>
    </KeyboardAvoid>
  );
};

const styles = StyleSheet.create({
  background: {
    padding: 24,
    flex: 1,
  },
  checkbox: {
    marginTop: 24,
  },
  button: {
    marginTop: 24,
  },
});
