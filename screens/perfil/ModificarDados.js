import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import api from '../../src/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ModificarDados({ navigation, route }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const formatarTelefone = (valor) => {
    // Remove tudo que não for número
    const numeros = valor.replace(/\D/g, '');

    // Aplica a máscara dependendo do tamanho
    if (numeros.length <= 2) {
        return '(' + numeros;
    } else if (numeros.length <= 7) {
        return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
    } else if (numeros.length <= 11) {
        return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
    } else {
        // Limita a 11 dígitos (padrão brasileiro com DDD e número com 9 dígitos)
        return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7, 11)}`;
    }
};

  // Carrega os dados do usuário ao abrir a tela
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setFetching(true);
        const currentEmail = await AsyncStorage.getItem('@currentUserEmail');
        if (!currentEmail) {
          throw new Error('Nenhum usuário logado');
        }
        setUserEmail(currentEmail);
        setEmail(currentEmail);


        const response = await api.get(`/api/usuario/${currentEmail}`);
        
        if (response.data) {
          const userData = response.data.usuario || response.data;
          setNome(userData.nome || '');
          
          // Formata o telefone antes de exibir
          if (userData.telefone) {
            setTelefone(formatarTelefone(userData.telefone));
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
        console.error('Erro ao carregar dados do usuário:', error);
      } finally {
        setFetching(false);
      }
    };
    
    loadUserData();
  }, []);

  

  const salvarAlteracoes = async () => {
    if (loading) return;

    await AsyncStorage.setItem(`@userData:${userEmail}`, JSON.stringify({ nome }));
    
    if (!nome || !telefone) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    // Validação de senha (mínimo 6 caracteres)
    const validatePassword = (senha) => {
      return senha.length >= 6;
    };

     if (senha && !validatePassword(senha)) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return;
    }


    setLoading(true);

    try {
      const updateData = {
        nome,
        telefone
      };

      // Adiciona a senha apenas se foi preenchida
      if (senha) {
        updateData.senha = senha;
      }

      const response = await api.put(`/api/usuario/${userEmail}`, updateData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Atualiza os dados locais
      const updatedUserData = {
        nome,
        email,
        telefone
      };
      
      await AsyncStorage.setItem(`@userData:${email}`, JSON.stringify(updatedUserData));

      // Envia os dados atualizados de volta para a tela de perfil
      navigation.navigate('Perfil', { 
        updatedData: updatedUserData,
        refresh: true 
      });

      Alert.alert('Sucesso', 'Dados atualizados com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar dados:', error.response?.data || error.message);
      
      let errorMessage = 'Erro ao atualizar dados';
      if (error.response?.data?.errors) {
        errorMessage = error.response.data.errors.join('\n');
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
        <Text style={styles.loadingText}>Carregando seus dados...</Text>
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
      
      <Text style={styles.header}>Modificar Dados</Text>
      {/* Nome */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nome"
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
          value={telefone}
          onChangeText={text => setTelefone(formatarTelefone(text))} // Chama a função para formatar o telefone
          editable={!loading}
        />
        <Ionicons name="call-outline" size={24} color={primaryColor} style={styles.icon} />
      </View>

      {/* Senha */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nova senha ou senha atual"
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
          <Text style={styles.saveButtonText}>Salvar Alterações</Text>
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
    padding: 20,
    paddingTop: 50,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
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
    fontSize: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: primaryColor,
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: primaryColor,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingRight: 10,
    fontSize: 16,
  },
  icon: {
    marginLeft: 5,
  },
  saveButton: {
    backgroundColor: primaryColor,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#999',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
