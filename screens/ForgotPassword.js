import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import logoApp from '../assets/icon.png';
import api from '../src/services/api';

export default function ForgotPassword({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Erro', 'Por favor, informe seu e-mail');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Erro', 'Por favor, insira um e-mail válido');
      return;
    }

    setLoading(true);
    
    try {
      await api.post('/api/usuario/reset', { email: email });
      
      Alert.alert(
          'Sucesso', 
          'Um token de redefinição foi enviado para seu e-mail. Verifique sua caixa de entrada.',
          [
              { 
                  text: 'OK', 
                  onPress: () => navigation.navigate('Login') 
              }
          ]
      );throw new Error(response.data?.message || 'Erro ao enviar e-mail');
      } catch (error) {
      console.error('Erro na redefinição de senha:', error.response?.data || error.message);
      
      let errorMessage = 'Erro ao solicitar redefinição de senha';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Erro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topCurve}>
        <View style={styles.purpleBackground}></View>
        <Image source={logoApp} style={styles.appLogo} />
        <Text style={styles.title}>Esqueceu a senha?</Text>
      </View>

      <View style={styles.container2}>
        <View style={styles.form}>
          <Text style={styles.instruction}>
            Informe seu e-mail e vamos te ajudar a recuperar sua senha.
          </Text>

          <View style={styles.inputGroup}>
            <TextInput
              placeholder="E-mail"
              placeholderTextColor="#aaa"
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
            style={[styles.loginButton, loading && styles.disabledButton]} 
            onPress={handleResetPassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Enviar e-mail</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => navigation.navigate('Login')}
            disabled={loading}
          >
            <Text style={styles.register}>Voltar para login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const primaryColor = '#464193';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container2: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  topCurve: {
    backgroundColor: '#473da1',
    height: '50%',
    borderBottomLeftRadius: 200,
    borderBottomRightRadius: 200,
    alignItems: 'center',
    paddingTop: 60, 
  },
  purpleBackground: {
    backgroundColor: primaryColor,
    width: '150%',
    height: 200,
    borderBottomLeftRadius: 100,
    borderBottomRightRadius: 100,
    position: 'absolute',
    top: 0,
    zIndex: -1,
  },
  appLogo: {
    width: 200,
    height: 200,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
  },
  form: {
    marginTop: 20,
  },
  instruction: {
    fontSize: 14,
    color: '#555',
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  inputField: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  inputIcon: {
    marginLeft: 8,
  },
  loginButton: {
    backgroundColor: primaryColor,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  disabledButton: {
    backgroundColor: '#999',
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  register: {
    textAlign: 'center',
    color: primaryColor,
    marginTop: 10,
  },
});
