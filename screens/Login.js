import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import logoApp from '../assets/icon.jpg'; 

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    console.log(`Login attempt with email: ${email}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topCurve}>
        <View style={styles.purpleBackground}></View>
          <Image source={logoApp} style={styles.appLogo} />
        <Text style={styles.title}>Bem vindo de volta!</Text>
      </View>

      <View style={styles.container2}>

      <View style={styles.form}>
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

        <View style={styles.inputGroup}>
          <TextInput
            placeholder="Senha"
            placeholderTextColor="#aaa"
            style={styles.inputField}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.iconButton}>
            <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={24} color="#464193" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.forgot}>Esqueceu a senha?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.loginButtonText}>Entrar</Text>
        </TouchableOpacity>

        <Text style={styles.register}>
          Ainda não tem uma conta?{' '}
          <Text style={styles.registerLink} onPress={() => navigation.navigate('Registro')}>
            Cadastrar
          </Text>
        </Text>
      </View>
    </View>
    </View>
  );
}

const primaryColor = '#464193';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
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

  iconButton: {
    padding: 5,
  },

  forgot: {
    color: primaryColor,
    textAlign: 'right',
    marginBottom: 20,
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
    color: '#555',
  },

  registerLink: {
    color: primaryColor,
    fontWeight: 'bold',
  },
});
