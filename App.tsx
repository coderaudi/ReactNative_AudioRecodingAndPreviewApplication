import React, {useState} from 'react';
import {View, Button, Text, Alert, StyleSheet} from 'react-native';
import AudioRecorderPlayer, {
  AudioEncoderAndroidType,
  AudioSourceAndroidType,
  OutputFormatAndroidType,
} from 'react-native-audio-recorder-player';
import Sound from 'react-native-sound';
import RNFS from 'react-native-fs';

const audioRecorderPlayer = new AudioRecorderPlayer();

const App = () => {
  const [audioPath, setAudioPath] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [lastRecordedTime, setLastRecordedTime] = useState('');

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
    const path = RNFS.DocumentDirectoryPath + '/test.mp3';
    const result = await audioRecorderPlayer.startRecorder(path, {
      source: AudioSourceAndroidType.MIC,
      encoder: AudioEncoderAndroidType.AAC,
      outputFormat: OutputFormatAndroidType.MPEG_4,
    });
    console.log('Recording started with result:', result);
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

  const onSaveRecord = async () => {
    // Your onSave logic here
    // This is just a placeholder for demonstration purposes
    Alert.alert('Save Recording', 'Recording saved successfully!');
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
          title="Save Recording"
          onPress={onSaveRecord}
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
