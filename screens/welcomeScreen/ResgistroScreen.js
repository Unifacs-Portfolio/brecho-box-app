import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Image 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';


import api from '../../src/services/api';

const { height } = Dimensions.get('window');

export default function RegistroScreen({ navigation }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);
  const [loading, setLoading] = useState(false);

  // Lógica de validação e formatação permanece inalterada
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validateSenha = (senha) => senha.length >= 6;

  const formatarTelefone = (valor) => {
    const numeros = valor.replace(/\D/g, '');
    if (numeros.length <= 2) {
      return '(' + numeros;
    } else if (numeros.length <= 7) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
    } else if (numeros.length <= 11) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
    } else {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7, 11)}`;
    }
  };

  const handleRegistro = async () => {
    if (!nome || !email || !telefone || !senha || !confirmarSenha) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert('Erro', 'Por favor, insira um e-mail válido.');
      return;
    }
    
    const telefoneFormatadoParaAPI = telefone.replace(/\D/g, ''); 
    
    if (!/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(telefone)) { 
      Alert.alert('Erro', 'Por favor, insira um telefone válido no formato (XX) XXXXX-XXXX.');
      return;
    }
    if (!validateSenha(senha)) {
      Alert.alert('Erro', 'A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (senha !== confirmarSenha) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/api/usuario', {
        nome,
        email,
        senha,
        tokens: 'random-token-' + Math.random().toString(36).substring(2),
        telefone: telefoneFormatadoParaAPI, // Envia o telefone formatado para a API
        nivelConsciencia: 1,
        isMonitor: false
      });


    await saveUserData(email, nome); 

      console.log('Conta criada com sucesso!');
      Alert.alert(
        'Sucesso!',
        'Conta criada com sucesso!',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error) {
      const erroServidor = error.response?.data?.errors?.[0];
      const status = error.response?.status;

      if (status === 409 || erroServidor?.toLowerCase().includes('email')) {
        Alert.alert('Erro', 'Este e-mail já está em uso. Tente outro.');
      } else {
        Alert.alert('Erro no registro', erroServidor || 'Não foi possível concluir o registro.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Função para salvar os dados do usuário
  const saveUserData = async (email, nome) => {
    try {
        await AsyncStorage.setItem(`@userData:${email}`, JSON.stringify({ nome }));
        await AsyncStorage.setItem('@currentUserEmail', email);
        console.log('Dados do usuário salvos:', email);
    } catch (error) {
        console.error('Erro ao salvar dados do usuário:', error);
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
          <Image
            source={require('../../assets/icon.jpeg')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Crie sua conta!</Text>
        </View>

        <View style={styles.formContainer}>
          {/* Campos de input */}
          <View style={styles.inputGroup}>
            <TextInput
              placeholder="Nome"
              placeholderTextColor="#aaa"
              style={styles.inputField}
              value={nome}
              onChangeText={setNome}
              editable={!loading}
            />
            <MaterialCommunityIcons
              name="account-outline"
              size={24}
              color="#464193"
              style={styles.inputIcon}
            />
          </View>

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

          <View style={styles.inputGroup}>
            <TextInput
              placeholder="Telefone"
              placeholderTextColor="#aaa"
              style={styles.inputField}
              value={telefone}
              onChangeText={text => setTelefone(formatarTelefone(text))}
              keyboardType="phone-pad"
              editable={!loading}
              maxLength={15}
            />
            <MaterialCommunityIcons
              name="phone-outline"
              size={24}
              color="#464193"
              style={styles.inputIcon}
            />
          </View>

          <View style={styles.inputGroup}>
            <TextInput
              placeholder="Senha"
              placeholderTextColor="#aaa"
              style={styles.inputField}
              value={senha}
              onChangeText={setSenha}
              secureTextEntry={!showSenha}
              editable={!loading}
            />
            <TouchableOpacity
              onPress={() => setShowSenha(!showSenha)}
              style={styles.inputIcon}
            >
              <Ionicons
                name={showSenha ? 'eye-off-outline' : 'eye-outline'}
                size={24}
                color="#464193"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <TextInput
              placeholder="Confirmar senha"
              placeholderTextColor="#aaa"
              style={styles.inputField}
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
              secureTextEntry={!showConfirmarSenha}
              editable={!loading}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmarSenha(!showConfirmarSenha)}
              style={styles.inputIcon}
            >
              <Ionicons
                name={showConfirmarSenha ? 'eye-off-outline' : 'eye-outline'}
                size={24}
                color="#464193"
              />
            </TouchableOpacity>
          </View>

          {/* Botões */}
          <TouchableOpacity
            style={[styles.registerButton, loading && styles.disabledButton]}
            onPress={handleRegistro}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.registerButtonText}>Registrar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            disabled={loading}
          >
            <Text style={styles.loginLink}>Já tem uma conta? Faça login</Text>
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
    height: height * 0.35,
    width: '100%',
    borderBottomLeftRadius: 200,
    borderBottomRightRadius: 200,
    alignItems: 'center',
    
    justifyContent: 'space-evenly', 
    paddingTop: 30,
    paddingBottom: 25, 
  },
  logo: { 
    width: height * 0.15, 
    height: height * 0.15,
    resizeMode: 'contain',
    marginBottom: 5, 
  },
  title: {
    fontSize: height * 0.04,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 5, 
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
  registerButton: {
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
  registerButtonText: {
    color: '#fff',
    fontSize: height * 0.022,
    fontWeight: 'bold',
  },
  loginLink: {
    textAlign: 'center',
    color: primaryColor,
    marginTop: 10,
    fontSize: height * 0.018,
  },
});