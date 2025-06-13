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

export default function CreateReceitasScreen({ navigation }) {
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState(''); 
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
        }
      } catch (error) {
        console.error('Erro ao buscar token, email ou ID do usuário:', error);
      }
    };
    fetchUserData();
  }, []);

  const handleSubmitReceita = async () => {
    if (!userToken || !userEmail || !currentUserId) {
      Alert.alert('Erro', 'Você precisa estar logado para criar uma receita.');
      navigation.navigate('Login');
      return;
    }

    if (!titulo || !conteudo) {
      Alert.alert('Erro', 'Por favor, preencha Título e Conteúdo da Receita.');
      return;
    }

    setLoading(true);

    try {
      const conteudoComYoutube = youtubeUrl ? `${conteudo}\n\n${youtubeUrl}` : conteudo;



      const response = await api.post('/api/receitas', {
        titulo: titulo,
        conteudo: conteudo,
        email: userEmail,
        tema: "Moda", 
        subtemas: ["subtema-moda-sustentavel"], 
      });

      if (response.status === 201) {
        Alert.alert('Sucesso', 'Receita criada com sucesso!');
        navigation.goBack();
      } else {
        Alert.alert('Erro', response.data?.message || 'Erro ao criar receita.');
      }
    } catch (error) {
      console.error('Erro ao criar receita:', error.response?.data || error.message);
      Alert.alert('Erro', error.response?.data?.message || 'Não foi possível criar a receita. Tente novamente.');
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

        <Text style={styles.header}>Criar Nova Receita</Text>

        <View style={styles.formCard}>
          <TextInput
            style={styles.input}
            placeholder="Título da Receita"
            placeholderTextColor="#aaa"
            value={titulo}
            onChangeText={setTitulo}
            editable={!loading}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Conteúdo Detalhado da Receita"
            placeholderTextColor="#aaa"
            value={conteudo}
            onChangeText={setConteudo}
            multiline
            numberOfLines={5}
            editable={!loading}
          />
          <TextInput
            style={styles.input}
            placeholder="URL do Vídeo (YouTube, opcional)"
            placeholderTextColor="#aaa"
            value={youtubeUrl}
            onChangeText={setYoutubeUrl}
            keyboardType="url"
            autoCapitalize="none"
            editable={!loading}
          />

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.disabledButton]}
            onPress={handleSubmitReceita}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Publicar Receita</Text>
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
