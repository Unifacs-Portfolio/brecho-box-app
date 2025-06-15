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
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons'; 
import logoApp from '../../assets/icon.jpeg';
import api from '../../src/services/api';

import StyledText from '../../src/components/StyledText';

const { width, height } = Dimensions.get('window');

export default function ForgotPassword({ navigation }) {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('requestEmail');

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const validateEmail = (value) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(value);
  };

  const validatePassword = (value) => value.length >= 6; // Mínimo de 6 caracteres

  const handleSubmit = async () => {
    setLoading(true);

    if (step === 'requestEmail') {
      // Lógica para enviar o e-mail com o token
      if (!email) {
        Alert.alert('Erro', 'Por favor, informe seu e-mail.');
        setLoading(false);
        return;
      }
      if (!validateEmail(email)) {
        Alert.alert('Erro', 'Por favor, insira um e-mail válido.');
        setLoading(false);
        return;
      }

      try {
        await api.post('/api/usuario/reset', { email: email });
        Alert.alert(
          'Sucesso',
          'Um token de redefinição foi enviado para seu e-mail. Verifique sua caixa de entrada.',
          [{ text: 'OK', onPress: () => setStep('enterToken') }] // Avança para o próximo passo
        );
      } catch (error) {
        console.error('Erro ao solicitar token:', error.response?.data || error.message);
        let errorMessage = 'Erro ao solicitar token de redefinição. Verifique seu e-mail.';
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
        Alert.alert('Erro', errorMessage);
      } finally {
        setLoading(false);
      }
    } else if (step === 'enterToken') {
      // Lógica para redefinir a senha com o token
      if (!token || !newPassword || !confirmNewPassword) {
        Alert.alert('Erro', 'Por favor, preencha todos os campos.');
        setLoading(false);
        return;
      }
      if (!validatePassword(newPassword)) {
        Alert.alert('Erro', 'A nova senha deve ter no mínimo 6 caracteres.');
        setLoading(false);
        return;
      }
      if (newPassword !== confirmNewPassword) {
        Alert.alert('Erro', 'As senhas não coincidem.');
        setLoading(false);
        return;
      }

      try {
        // Rota da API para validar o token e definir a nova senha
        await api.post(`/api/usuario/reset/${token}`, { newPassword: newPassword });

        console.log('Senha redefinida com sucesso!');
        Alert.alert(
          'Sucesso',
          'Sua senha foi redefinida com sucesso!',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }] // Volta para a tela de Login
        );
      } catch (error) {
        console.error('Erro ao redefinir senha:', error.response?.data || error.message);
        let errorMessage = 'Erro ao redefinir senha. Verifique o token ou tente novamente.';
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
        Alert.alert('Erro', errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.topCurve}>
          <Image source={logoApp} style={styles.appLogo} />
          <StyledText style={styles.title}>Esqueceu a senha?</StyledText>
        </View>

        <View style={styles.formContainer}>
          {step === 'requestEmail' ? (
            // Conteúdo para solicitar o e-mail
            <>
              <StyledText style={styles.instruction}>
                Informe seu e-mail para receber um token de redefinição.
              </StyledText>

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

              <TouchableOpacity
                style={[styles.actionButton, loading && styles.disabledButton]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <StyledText style={styles.buttonText}>Enviar e-mail</StyledText>
                )}
              </TouchableOpacity>
            </>
          ) : (
            // Conteúdo para inserir o token e a nova senha
            <>
              <StyledText style={styles.instruction}>
                Insira o token recebido por e-mail e sua nova senha.
              </StyledText>

              <View style={styles.inputGroup}>
                <TextInput
                  placeholder="Token de redefinição"
                  placeholderTextColor="#aaa"
                  fontfamily="Poppins-Regular"
                  style={styles.inputField}
                  value={token}
                  onChangeText={setToken}
                  autoCapitalize="none"
                  editable={!loading}
                />
                <MaterialCommunityIcons
                  name="key-outline" 
                  size={24}
                  color="#464193"
                  style={styles.inputIcon}
                />
              </View>

              <View style={styles.inputGroup}>
                <TextInput
                  placeholder="Nova Senha"
                  placeholderTextColor="#aaa"
                  fontfamily="Poppins-Regular"
                  style={styles.inputField}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNewPassword}
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  style={styles.inputIcon}
                >
                  <Ionicons
                    name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={24}
                    color="#464193"
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <TextInput
                  placeholder="Confirmar Nova Senha"
                  placeholderTextColor="#aaa"
                  fontfamily="Poppins-Regular"
                  style={styles.inputField}
                  value={confirmNewPassword}
                  onChangeText={setConfirmNewPassword}
                  secureTextEntry={!showConfirmNewPassword}
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                  style={styles.inputIcon}
                >
                  <Ionicons
                    name={showConfirmNewPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={24}
                    color="#464193"
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.actionButton, loading && styles.disabledButton]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <StyledText style={styles.buttonText}>Redefinir Senha</StyledText>
                )}
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            disabled={loading}
          >
            <StyledText style={styles.backToLogin}>Voltar para login</StyledText>
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
    justifyContent: 'space-evenly',
    paddingTop: 30,
    paddingBottom: 50,
  },
  appLogo: {
    width: height * 0.18,
    height: height * 0.18,
    marginBottom: 0,
    resizeMode: 'contain',
  },
  title: {
    fontSize: height * 0.04,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 0,
  },
  formContainer: {
    width: '90%',
    marginTop: -height * 0.0,
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
  instruction: {
    fontSize: height * 0.018,
    color: '#555',
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 10,
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
  actionButton: { 
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
  buttonText: { 
    color: '#fff',
    fontSize: height * 0.022,
    fontWeight: 'bold',
  },
  backToLogin: {
    textAlign: 'center',
    color: primaryColor,
    marginTop: 10,
    fontSize: height * 0.018,
  },
});
