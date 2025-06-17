import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import api from '../../src/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

import StyledText from '../../src/components/StyledText';

const { width, height } = Dimensions.get('window');

export default function ModificarDados({ navigation, route }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userToken, setUserToken] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Função para formatar o telefone para exibição
  const formatarTelefone = (valor) => {
    const numeros = valor.replace(/\D/g, '');

    if (numeros.length <= 2) {
      return '(' + numeros;
    } else if (numeros.length <= 7) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
    } else if (numeros.length <= 11) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7, 11)}`;
    } else {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7, 11)}`;
    }
  };

  // Carrega os dados do usuário ao abrir a tela
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setFetching(true);
        const currentEmail = await AsyncStorage.getItem('@currentUserEmail');
        const token = await AsyncStorage.getItem('userToken');
        const id = await AsyncStorage.getItem('@currentUserId');
        
        if (!currentEmail || !token || !id) {
          throw new Error('Nenhum email ou token encontrado');
        }
        setUserToken(token);
        setUserEmail(currentEmail);
        setEmail(currentEmail);
        setCurrentUserId(id);

        const response = await api.get(`/api/usuario/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        

        if (response.data?.user) {
          setNome(response.data.user.nome || '');
          if (response.data.user.telefone) {
            setTelefone(formatarTelefone(response.data.user.telefone));
          } else {
            setTelefone('');
          }
        }

        const storedData = await AsyncStorage.getItem(`@userData:${currentEmail}`);
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          if (parsedData.nome && !nome) {
            setNome(parsedData.nome);
          }
          if (parsedData.telefone && !telefone) {
            setTelefone(formatarTelefone(parsedData.telefone));
          }
        }

      } catch (error) {
        console.error('Erro ao carregar dados do usuário em ModificarDados:', error.response?.data || error.message);
        Alert.alert('Erro', 'Não foi possível carregar os dados do usuário.');
      } finally {
        setFetching(false);
      }
    };

    loadUserData();
  }, []);

  // Função para salvar as alterações
  const salvarAlteracoes = async () => {
    if (loading) return;

    if (!nome || !telefone) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    const telefoneParaAPI = telefone.replace(/\D/g, '');

    if (telefoneParaAPI.length < 10 || telefoneParaAPI.length > 11) {
      Alert.alert('Erro', 'Por favor, insira um número de telefone válido (DDD + 8 ou 9 dígitos).');
      setLoading(false);
      return;
    }

    const validatePassword = (pwd) => {
      return pwd.length >= 6;
    };

    if (senha && !validatePassword(senha)) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const updateData = {
        nome,
        telefone: telefoneParaAPI
      };

      if (senha) {
        updateData.senha = senha;
      }

      console.log('Dados enviados para a API:', updateData);

      const id = await AsyncStorage.getItem('@currentUserId');

      const response = await api.put(`/api/usuario/${id}`, updateData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        }
      });

      const updatedUserData = {
        nome,
        email,
        telefone: telefone
      };
      
      await AsyncStorage.setItem(`@userData:${email}`, JSON.stringify(updatedUserData));

      navigation.navigate('Perfil', { 
        updatedData: updatedUserData,
        refresh: true 
      });

      Alert.alert('Sucesso', 'Dados atualizados com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar dados:', error.response?.data || error.message);
      
      let errorMessage = 'Erro ao atualizar dados';
      if (error.response?.data?.errors) {
        errorMessage = error.response.data.errors.map(err => err.message || err).join('\n');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      Alert.alert('Erro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={primaryColor} />
        <StyledText style={styles.loadingText}>Carregando seus dados...</StyledText>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={'#473da1'} />
      </TouchableOpacity>
      
      <StyledText style={styles.header}>Modificar Dados</StyledText>
      {/* Nome */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nome"
          fontfamily="Poppins"
          value={nome}
          onChangeText={setNome}
          editable={!loading}
        />
        <Ionicons name="person-outline" size={24} color={primaryColor} style={styles.icon} />
      </View>

      {/* Email */}
      <View style={[styles.inputContainer, { backgroundColor: '#f5f5f5' }]}>
        <TextInput
          style={[styles.input, { color: '#666' }]}
          placeholder="E-mail"
          fontfamily="Poppins"
          value={email}
          editable={false}
        />
        <MaterialIcons name="email" size={24} color={primaryColor} style={styles.icon} />
      </View>

      {/* Telefone */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Telefone"
          keyboardType="phone-pad"
          fontfamily="Poppins"
          value={telefone}
          onChangeText={text => setTelefone(formatarTelefone(text))}
          editable={!loading}
          maxLength={15}
        />
        <Ionicons name="call-outline" size={24} color={primaryColor} style={styles.icon} />
      </View>

      {/* Senha */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nova senha ou senha atual"
          fontfamily="Poppins"
          secureTextEntry={!mostrarSenha}
          value={senha}
          onChangeText={setSenha}
          editable={!loading}
        />
        <TouchableOpacity 
          onPress={() => setMostrarSenha(!mostrarSenha)}
          disabled={loading}
        >
          <Ionicons
            name={mostrarSenha ? 'eye' : 'eye-off'}
            size={24}
            color={primaryColor}
            style={styles.icon}
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={[styles.saveButton, loading && styles.disabledButton]}
        onPress={salvarAlteracoes}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <StyledText style={styles.saveButtonText}>Salvar Alterações</StyledText>
        )}
      </TouchableOpacity>
    </View>
  );
}

const primaryColor = '#464193';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: width * 0.05,
    paddingTop: height * 0.07,
  },
  backButton: {
    position: 'absolute',
    top: height * 0.05,
    left: width * 0.05,
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 20,
    color: primaryColor,
    fontSize: width * 0.04,
  },
  header: {
    fontSize: width * 0.06,
    fontWeight: 'bold',
    color: primaryColor,
    marginBottom: height * 0.03,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: primaryColor,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: width * 0.03,
    marginBottom: height * 0.02,
  },
  input: {
    flex: 1,
    paddingVertical: height * 0.015,
    paddingRight: width * 0.02,
    fontSize: width * 0.04,
  },
  icon: {
    marginLeft: width * 0.01,
  },
  saveButton: {
    backgroundColor: primaryColor,
    paddingVertical: height * 0.02,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: height * 0.02,
  },
  disabledButton: {
    backgroundColor: '#999',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: width * 0.045,
    fontWeight: '600',
  },
});
