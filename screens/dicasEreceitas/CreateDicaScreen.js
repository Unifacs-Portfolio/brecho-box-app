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
  const [conteudo, setConteudo] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [userToken, setUserToken] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null); 

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const email = await AsyncStorage.getItem('@currentUserEmail');
        setUserToken(token);
        setUserEmail(email); 

        if (email && token) {
          const response = await api.get(`/api/usuario/${email}`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          const userId = response.data?.id || response.data?.user?.id; 
          setCurrentUserId(userId);
          console.log('[CreateDicaScreen] ID do usuário obtido da API:', userId);
        } else {
          console.log('[CreateDicaScreen] Email ou token não encontrados no AsyncStorage.');
          Alert.alert('Erro de Autenticação', 'Você precisa estar logado para criar uma dica.');
          navigation.navigate('Login'); // Redireciona para o login se não houver dados
        }
      } catch (error) {
        console.error('[CreateDicaScreen] Erro ao buscar token, email ou ID do usuário:', error.response?.data || error.message);
        Alert.alert('Erro de Autenticação', 'Não foi possível carregar seus dados de usuário. Por favor, tente logar novamente.');
        navigation.navigate('Login'); // Redireciona para o login em caso de erro
      }
    };
    fetchUserData();
  }, []); 
  const handleSubmitDica = async () => {
    // Verifica se os dados essenciais do usuário estão disponíveis
    if (!userToken || !userEmail || !currentUserId) {
      Alert.alert('Erro', 'Você precisa estar logado para criar uma dica. Redirecionando para o login.');
      navigation.navigate('Login');
      setLoading(false); 
      return;
    }

    // Validação dos campos do formulário
    if (!titulo || !conteudo) {
      Alert.alert('Erro', 'Por favor, preencha Título e Conteúdo da Dica.');
      setLoading(false); 
      return;
    }

    setLoading(true);
    console.log('[CreateDicaScreen] Loading ativado.');

    try {
      const payload = {
        titulo: titulo,
        conteudo: conteudo,
        tema: "Moda",
        subtemas: ["subtema-moda-sustentavel"], 
        email: userEmail,
        fotos: [], 
      };
      console.log('[CreateDicaScreen] Payload enviado para /api/dicas:', payload);

      const response = await api.post('/api/dicas', payload, {
        headers: {
          Authorization: `Bearer ${userToken}`, 
        },
      });
      console.log('[CreateDicaScreen] Resposta da API recebida. Status:', response.status);

      if (response.status === 201) { 
        Alert.alert('Sucesso', 'Dica criada com sucesso!');
        navigation.goBack(); // Volta para a tela anterior
      } else {
        console.error('[CreateDicaScreen] Erro na resposta da API ao criar dica (status não 201):', response.status, response.data);
        Alert.alert('Erro', response.data?.message || `Erro ao criar dica. Status: ${response.status}`);
      }
    } catch (error) {
      console.error('[CreateDicaScreen] Erro na requisição API ao criar dica:', error);
      if (error.response) {
        console.error('[CreateDicaScreen] Erro de Resposta da API:', error.response.status, error.response.data);
        Alert.alert('Erro', error.response.data?.message || `Erro do servidor: ${error.response.status}. Tente novamente.`);
      } else if (error.request) {
        console.error('[CreateDicaScreen] Erro de Requisição (sem resposta):', error.request);
        Alert.alert('Erro de Conexão', 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.');
      } else {
        console.error('[CreateDicaScreen] Erro inesperado:', error.message);
        Alert.alert('Erro', 'Ocorreu um erro inesperado. Tente novamente.');
      }
    } finally {
      setLoading(false);
      console.log('[CreateDicaScreen] Loading desativado.');
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
