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
  const [userEmail, setUserEmail] = useState('');

  // Carrega os dados do usuário ao abrir a tela
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const { nome, email, telefone } = JSON.parse(userData);
          setNome(nome);
          setEmail(email);
          setTelefone(telefone);
          setUserEmail(email);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
      }
    };

    loadUserData();
  }, []);

  const salvarAlteracoes = async () => {
    if (loading) return;
    
    if (!nome || !telefone) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
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
      
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));

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
          onChangeText={setTelefone}
          editable={!loading}
        />
        <Ionicons name="call-outline" size={24} color={primaryColor} style={styles.icon} />
      </View>

      {/* Senha */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nova senha"
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