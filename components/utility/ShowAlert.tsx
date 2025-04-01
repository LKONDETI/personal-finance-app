import { Platform, Alert } from 'react-native';
import { Alert as WebAlert } from 'react-native-web';

const showAlert = (title, message) => {
  if (Platform.OS === 'web') {
    WebAlert.alert(title, message);
  } else {
    Alert.alert(title, message);
  }
};

export default showAlert;
