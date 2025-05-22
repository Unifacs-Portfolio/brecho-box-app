import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import logoApp from '../assets/icon.jpg'; 

export default function ForgotPassword({ navigation }) {
  const [email, setEmail] = useState('');

  const handleResetPassword = () => {
    console.log(`Enviando redefinição para: ${email}`);
    Alert.alert(
      'Redefinição de senha',
      'Se o e-mail estiver cadastrado, você receberá instruções para redefinir sua senha.'
    );
    navigation.navigate('Login');
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
          />
          <MaterialCommunityIcons name="email-outline" size={24} color="#464193" style={styles.inputIcon} />
        </View>

        <TouchableOpacity style={styles.loginButton} onPress={handleResetPassword}>
          <Text style={styles.loginButtonText}>Enviar e-mail</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
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

  container2 : {
    alignItems: 'center',
    justifyContent: 'center',
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
