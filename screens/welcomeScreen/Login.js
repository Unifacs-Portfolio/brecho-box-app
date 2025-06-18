import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import logoApp from '../../assets/icon.jpeg';
import api from '../../src/services/api';
import * as jwt from 'jwt-decode';

import StyledText from '../../src/components/StyledText';

const { height } = Dimensions.get('window');

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [manterConectado, setManterConectado] = useState(true);


  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validatePassword = (password) => password.length >= 6;

    if (!validateEmail(email)) {
      Alert.alert('Erro', 'Por favor, insira um e-mail válido');
      return;
    }

    if (!validatePassword(password)) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      setLoading(true);

      // Chamada da API de login
      const response = await api.post('/api/usuario/login', { email, senha: password });
      const { token } = response.data;

      const decodedToken = jwt.jwtDecode(token); 
      
      const userId = decodedToken.userId; 

      // Armazena o token, o e-mail e o userId do usuário
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('@currentUserEmail', email);
      await AsyncStorage.setItem('@currentUserId', userId); 


      const expirationTime = Date.now() + 3600 * 1000; 
      await AsyncStorage.setItem('@tokenExpiration', String(expirationTime));

      // Armazena o estado de "manter conectado"
      await AsyncStorage.setItem('@manterConectado', manterConectado ? 'true' : 'false');

      // Se a API retornar 'usuario' na resposta de login, armazena o nome
      if (response.data.usuario && response.data.usuario.nome) {
        await AsyncStorage.setItem(`@userData:${email}`, JSON.stringify({ nome: response.data.usuario.nome }));
      }

      // Navega para a tela principal (AppTabs) após o login
      navigation.navigate('AppTabs');

    } catch (error) {
      console.error('Erro ao fazer login:', error.response?.data || error.message);
      let errorMessage = 'Erro ao fazer login. Verifique suas credenciais.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message.includes('jwt-decode não é uma função decodificável.')) {
        errorMessage = 'Erro interno: A biblioteca de decodificação de token não foi carregada corretamente. Tente limpar o cache do Expo/Metro.';
      }
      Alert.alert('Erro', errorMessage);
    } finally {
      setLoading(false); // Desativa o indicador de carregamento
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // Comportamento diferente para iOS e Android
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled" // Garante que toques fora dos inputs não fechem o teclado imediatamente
      >
        <View style={styles.topCurve}>
          <Image source={logoApp} style={styles.appLogo} />
          <StyledText style={styles.title}>BrechóBox</StyledText>
        </View>

        <View style={styles.formContainer}>
          <StyledText style={styles.welcome}>Olá, bem-vindo(a) de volta!</StyledText>

          <View style={styles.inputGroup}>
            <TextInput
              placeholder="E-mail"
              placeholderTextColor="#aaa"
              fontfamily="Poppins-Regular"
              style={styles.inputField}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
            <MaterialCommunityIcons
              name="email-outline"
              size={24}
              color="#464193"
              style={styles.inputIcon}
            />
          </View>

          <View style={styles.inputGroup}>
            <TextInput
              placeholder="Senha"
              placeholderTextColor="#aaa"
              fontfamily="Poppins-Regular"
              style={styles.inputField}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              editable={!loading}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.inputIcon}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={24}
                color="#464193"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setManterConectado(!manterConectado)}
              disabled={loading}
            >
              <Ionicons
                name={manterConectado ? 'checkbox-outline' : 'square-outline'}
                size={24}
                color="#464193"
              />
            </TouchableOpacity>
            <StyledText style={styles.checkboxText}>Manter conectado</StyledText>
          </View>

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <StyledText style={styles.loginButtonText}>Entrar</StyledText>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            disabled={loading}
          >
            <StyledText style={styles.forgotPassword}>Esqueceu a senha?</StyledText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Registro')}
            disabled={loading}
          >
            <StyledText style={styles.register}>Não tem uma conta? Cadastre-se</StyledText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const primaryColor = '#473da1';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  topCurve: {
    backgroundColor: '#473da1',
    height: height * 0.4,
    width: '100%',
    borderBottomLeftRadius: 200,
    borderBottomRightRadius: 200,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 30,
  },
  appLogo: {
    width: height * 0.18,
    height: height * 0.18,
    marginBottom: 10,
    resizeMode: 'contain',
  },
  title: {
    fontSize: height * 0.04,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
  },
  formContainer: {
    width: '90%',
    marginTop: -height * 0,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  welcome: {
    fontSize: height * 0.024,
    fontWeight: 'bold',
    color: primaryColor,
    marginBottom: 25,
    textAlign: 'center',
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
    paddingHorizontal: 10,
    marginBottom: 15,
    width: '100%',
  },
  inputField: {
    flex: 1,
    height: height * 0.06,
    fontSize: height * 0.02,
    color: '#333',
  },
  inputIcon: {
    marginLeft: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    alignSelf: 'flex-start',
    width: '100%',
  },
  checkbox: {
    padding: 2,
  },
  checkboxText: {
    marginLeft: 8,
    fontSize: height * 0.018,
    color: '#555',
  },
  loginButton: {
    backgroundColor: primaryColor,
    paddingVertical: height * 0.02,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
    width: '100%',
  },
  disabledButton: {
    backgroundColor: '#999',
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: height * 0.022,
    fontWeight: 'bold',
  },
  forgotPassword: {
    textAlign: 'center',
    color: primaryColor,
    marginTop: 5,
    marginBottom: 10,
    fontSize: height * 0.018,
  },
  register: {
    textAlign: 'center',
    color: primaryColor,
    marginTop: 10,
    fontSize: height * 0.018,
  },
});