import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../src/services/api'; 

const { width, height } = Dimensions.get('window');
const primaryColor = '#464193';

export default function CreateDicaScreen({ navigation }) {
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState(''); // Mapeia para 'descricao' na API
  const [loading, setLoading] = useState(false);
  const [userToken, setUserToken] = useState(null);
  const [userEmail, setUserEmail] = useState(null); // Para armazenar o email do usuário logado

 

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const email = await AsyncStorage.getItem('@currentUserEmail');
        setUserToken(token);
        setUserEmail(email); 
      } catch (error) {
        console.error('Erro ao buscar token ou email do usuário:', error);
      }
    };
    fetchUserData();
  }, []);

  const handleSubmitDica = async () => {
    if (!userToken || !userEmail) { // Verifica se há token e email do usuário
      Alert.alert('Erro', 'Você precisa estar logado para criar uma dica.');
      navigation.navigate('Login'); // Redireciona para o login
      return;
    }

    if (!titulo || !conteudo) {
      Alert.alert('Erro', 'Por favor, preencha Título e Conteúdo da Dica.');
      return;
    }

    setLoading(true);

    try {
    

      const response = await api.post('/api/dicas', {
        titulo: titulo,
        conteudo: conteudo,
        tema: "Moda",
        subtema: "subtema-moda-sustentavel",
        usuarioId: userEmail,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201) {
        Alert.alert('Sucesso', 'Dica criada com sucesso!');
        navigation.goBack(); // Volta para a tela anterior
      } else {
        Alert.alert('Erro', response.data?.message || 'Erro ao criar dica.');
      }
    } catch (error) {
      console.error('Erro ao criar dica:', error.response?.data || error.message);
      Alert.alert('Erro', error.response?.data?.message || 'Não foi possível criar a dica. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={primaryColor} />
        </TouchableOpacity>

        <Text style={styles.header}>Criar Nova Dica</Text>

        <View style={styles.formCard}>
          <TextInput
            style={styles.input}
            placeholder="Título da Dica"
            placeholderTextColor="#aaa"
            value={titulo}
            onChangeText={setTitulo}
            editable={!loading}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Conteúdo Detalhado da Dica"
            placeholderTextColor="#aaa"
            value={conteudo}
            onChangeText={setConteudo}
            multiline
            numberOfLines={5}
            editable={!loading}
          />

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.disabledButton]}
            onPress={handleSubmitDica}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Publicar Dica</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: width * 0.05,
    paddingTop: height * 0.08,
  },
  backButton: {
    position: 'absolute',
    top: height * 0.05,
    left: width * 0.05,
    padding: 10,
    zIndex: 1,
  },
  header: {
    fontSize: width * 0.07,
    fontWeight: 'bold',
    color: primaryColor,
    marginBottom: height * 0.03,
    textAlign: 'center',
  },
  formCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: width * 0.05,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  input: {
    width: '100%',
    padding: height * 0.015,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: height * 0.02,
    fontSize: width * 0.04,
  },
  textArea: {
    height: height * 0.15,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: primaryColor,
    paddingVertical: height * 0.02,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: height * 0.01,
  },
  disabledButton: {
    backgroundColor: '#999',
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: width * 0.045,
    fontWeight: 'bold',
  },
});
