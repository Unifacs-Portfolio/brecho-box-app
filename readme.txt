
npx create-expo-app@latest --template bare-minimum
responder  às perguntas.
cd pasta do app
abrir o arquivo App.js
npx expo install react-native-web react-dom @expo/metro-runtime
para rodar o emulador web
npx expo start --web
para rodar o emulador android
export ANDROID_HOME=/home/HOME-USER/Android/sdk (no windows configure a variável de ambiente)
npx expo start android
ou instale o app Expo GO, aponte o mesmo para o código de barras e ele vai emular o app no android/ios


para o exemplo da navegação instalar
npm install @react-navigation/native @react-navigation/native-stack
npx expo install react-native-screens react-native-safe-area-context

para o banco de dalos local instalar
npm install react-native-mmkv-storage --save

para o react-native-elements
npm install @rneui/base@edge @rneui/themed@edge

npm install react-native-image-header-scroll-view
npm install react-native-super-grid

npm install react-hook-form

expo-font




############## Sites de referencia

https://www.awesomereactnative.com/
https://genymotion.com
https://reactnativeelements.com/










