import React, {useState} from 'react';
import {
  View,
  Button,
  Text,
  Alert,
  StyleSheet,
  PermissionsAndroid,
} from 'react-native';
import AudioRecorderPlayer, {
  AudioEncoderAndroidType,
  AudioSourceAndroidType,
  OutputFormatAndroidType,
} from 'react-native-audio-recorder-player';
import Sound from 'react-native-sound';
import RNFS from 'react-native-fs';

const audioRecorderPlayer = new AudioRecorderPlayer();

const customPath = `${RNFS.ExternalStorageDirectoryPath}/Music/MyAppRecordings`;

const App = () => {
  const [audioPath, setAudioPath] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [lastRecordedTime, setLastRecordedTime] = useState('');
  const [isLoading, setLoading] = useState(true);

  const startTimer = () => {
    const interval = setInterval(() => {
      setRecordingTime(prevTime => prevTime + 1);
    }, 1000);
    setTimerInterval(interval);
  };

  const stopTimer = () => {
    clearInterval(timerInterval);
    setRecordingTime(0);
  };

  const onStartRecord = async () => {
    const currentDate = new Date();

    // Format the date and time as per your requirement
    const formattedDate = `${currentDate.getFullYear()}-${
      currentDate.getMonth() + 1
    }-${currentDate.getDate()}`;
    const formattedTime = `${currentDate.getHours()}-${currentDate.getMinutes()}-${currentDate.getSeconds()}`;
    // const fileName = `${customPath}/myrecording_${formattedDate}_${formattedTime}.mp3`;
    const fileName = `${customPath}/myrecording.mp3`;

    const path = fileName;
    const result = await audioRecorderPlayer.startRecorder(path, {
      source: AudioSourceAndroidType.MIC,
      encoder: AudioEncoderAndroidType.AAC,
      outputFormat: OutputFormatAndroidType.MPEG_4,
    });
    console.log('Recording started with result:', {
      result,
      path,
    });
    console.log('Recording started with -> audioRecorderPlayer:', {
      audioRecorderPlayer,
    });
    setIsRecording(true); // Set isRecording to true when recording starts
    startTimer(); // Start the timer when recording starts
  };

  const onStopRecord = async () => {
    const result = await audioRecorderPlayer.stopRecorder();
    console.log('Recording stopped with result:', result);
    setAudioPath(result);
    setIsRecording(false); // Set isRecording to false when recording stops
    stopTimer(); // Stop the timer when recording stops
    setLastRecordedTime(`Last Recorded Time: ${recordingTime} seconds`);
  };

  const onClearRecording = () => {
    setAudioPath('');
    setLastRecordedTime('');
  };

  const onPreviewRecord = () => {
    if (!audioPath) {
      Alert.alert('Error', 'No recorded audio found!');
      return;
    }

    const newSound = new Sound(audioPath, '', error => {
      if (error) {
        console.log('Failed to load the sound', error);
        Alert.alert('Error', 'Failed to load audio file!');
        return;
      }
      newSound.play(success => {
        if (!success) {
          Alert.alert('Error', 'Failed to play audio!');
        }
      });
    });
  };

  const onStoragePermissionRequest = async () => {
    console.log('customPath ', customPath);
    if (!(await RNFS.exists(customPath))) {
      console.log('creating--- ', customPath);

      await RNFS.mkdir(customPath);
      console.log('creating done--- ', customPath);
    }

    console.log('customPath end ', customPath);

    const res = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.MANAGE_EXTERNAL_STORAGE,
    );
    console.log('result MANAGE_EXTERNAL_STORAGE', res);
  };

  const uploadRecording = async () => {
    try {
      const _filePath = customPath + '/myrecording.mp3';
      // Read the file from the device's filesystem
      const fileData = await RNFS.readFile(_filePath, 'base64');

      console.log('uploading data', fileData);
      // Create a FormData object and append the file data
      const formData = new FormData();
      // formData.append('audio', fileData, 'audio.mp3');
      formData.append('senderName', 'abhijeet khire');

      // Send the FormData object to the server
      const response = await fetch(
        'http://192.168.100.143:3000/api/dummyAudio',
        {
          method: 'POST',
          body: formData,
        },
      );

      console.log('API after data', fileData);

      if (!response.ok) {
        throw new Error('Failed to upload recording');
      }

      const responseData = await response.json();
      console.log('Upload successful:', responseData);
      // Handle the response from the server, if needed
    } catch (error) {
      console.error('Error uploading recording:', error);
      // Handle errors, such as displaying an error message to the user
    }
  };

  const getMovies = async () => {
    try {
      const response = await fetch('https://reactnative.dev/movies.json');
      const json = await response.json();
      console.log('json', json);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AUDIO RECORDING APP</Text>
      <Text style={styles.title}>Recording: {recordingTime}</Text>
      <View style={styles.previewClearButtonContainer}>
        <Button
          title="Start Recording"
          onPress={onStartRecord}
          disabled={isRecording} // Disable if recording is in progress
          style={styles.button}
        />
        <Button
          title="Stop Recording"
          onPress={onStopRecord}
          disabled={!isRecording} // Disable if recording is not in progress
          style={styles.button}
        />
      </View>

      <Text style={styles.recordingTime}>{lastRecordedTime}</Text>

      <View style={styles.previewClearButtonContainer}>
        <Button
          title="Clear Recording"
          onPress={onClearRecording}
          style={styles.button}
          disabled={!audioPath}
        />
        <Button
          title="Preview Recording"
          onPress={onPreviewRecord}
          disabled={!audioPath}
          style={styles.button}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Upload Recording"
          onPress={uploadRecording}
          style={styles.button}
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title="GET getMoviesFromApiAsync"
          onPress={getMovies}
          style={styles.button}
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title="Create Storage"
          onPress={onStoragePermissionRequest}
          style={styles.button}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  buttonContainer: {
    marginBottom: 20,
    marginTop: 20,
  },
  button: {
    marginTop: 10,
  },
  recordingTime: {
    marginTop: 10,
    marginBottom: 10,
    fontSize: 18,
  },
  previewClearButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
});

export default App;
