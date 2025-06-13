import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../src/services/api'; // Ajuste o caminho conforme necessário

const { width, height } = Dimensions.get('window');
const primaryColor = '#464193';
const dangerColor = '#D9534F'; // Cor para botão de exclusão

export default function DicasDetalhesScreen({ route, navigation }) {
  // Acesso seguro aos parâmetros de navegação
  // Se route.params for undefined, tipId e tipTitle serão undefined
  const { tipId, tipTitle } = route.params || {}; 
  const [tip, setTip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState(null);
  const [userToken, setUserToken] = useState(null);

  // Função para buscar o email e token do usuário logado
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const email = await AsyncStorage.getItem('@currentUserEmail');
        const token = await AsyncStorage.getItem('userToken');
        setUserEmail(email);
        setUserToken(token);
      } catch (error) {
        console.error('Erro ao buscar email ou token do usuário:', error);
      }
    };
    fetchUserData();
  }, []);

  // Função para buscar os detalhes completos da dica
  const fetchTipDetails = useCallback(async () => {
    setLoading(true);
    // Verifica se tipId existe antes de fazer a chamada à API
    if (!tipId) {
      console.warn('tipId não fornecido na rota. Não é possível buscar os detalhes da dica.');
      Alert.alert('Erro', 'ID da dica não fornecido.');
      setLoading(false);
      navigation.goBack();
      return;
    }
    try {
      const response = await api.get(`/api/dicas/${tipId}`);
      if (response.data) {
        setTip(response.data.dica || response.data); 
      } else {
        Alert.alert('Erro', 'Dica não encontrada.');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes da dica:', error.response?.data || error.message);
      Alert.alert('Erro', 'Não foi possível carregar os detalhes da dica.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [tipId, navigation]); 

  // Chama a busca dos detalhes da dica ao carregar a tela e quando tipId muda
  useEffect(() => {
    if (tipId) { // Garante que temos um ID antes de buscar
      fetchTipDetails();
    }
  }, [tipId, fetchTipDetails]);



  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={primaryColor} />
        <Text style={styles.loadingText}>Carregando dica...</Text>
      </View>
    );
  }

  if (!tip) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>Dica não encontrada ou erro ao carregar.</Text>
        <TouchableOpacity style={styles.backButtonBottom} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color={primaryColor} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>{tip.titulo}</Text>
        {tip.email && <Text style={styles.author}>Por: {tip.email}</Text>}
        {tip.tema && <Text style={styles.infoText}>Tema: {tip.tema}</Text>}
        {tip.subtemas && tip.subtemas.length > 0 && (
          <Text style={styles.infoText}>Subtemas: {tip.subtemas.join(', ')}</Text>
        )}
        
        <View style={styles.contentCard}>
          <Text style={styles.content}>{tip.conteudo}</Text>
        </View>

        {/* Botão de Excluir - Visível apenas se o usuário for o criador */}
        {canDelete && (
          <TouchableOpacity
            style={[styles.deleteButton, loading && styles.disabledButton]}
            onPress={handleDeleteTip}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.deleteButtonText}>Excluir Dica</Text>
            )}
          </TouchableOpacity>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    paddingTop: Platform.OS === 'ios' ? height * 0.06 : height * 0.03, // Ajuste para status bar
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
  },
  loadingText: {
    marginTop: 10,
    fontSize: width * 0.04,
    color: primaryColor,
  },
  errorText: {
    fontSize: width * 0.05,
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? height * 0.05 : height * 0.03,
    left: width * 0.03,
    padding: 10,
    zIndex: 1,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 20,
  },
  backButtonBottom: {
    backgroundColor: primaryColor,
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.08,
    borderRadius: 10,
    marginTop: 20,
  },
  backButtonText: {
    color: '#fff',
    fontSize: width * 0.04,
    fontWeight: 'bold',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: width * 0.05,
    paddingBottom: height * 0.03,
    alignItems: 'center',
  },
  title: {
    fontSize: width * 0.07,
    fontWeight: 'bold',
    color: primaryColor,
    marginBottom: height * 0.01,
    textAlign: 'center',
    marginTop: height * 0.06, // Espaçamento para o botão de voltar
  },
  author: {
    fontSize: width * 0.04,
    color: '#666',
    marginBottom: height * 0.01,
    textAlign: 'center',
  },
  infoText: {
    fontSize: width * 0.038,
    color: '#555',
    marginBottom: height * 0.005,
    textAlign: 'center',
  },
  contentCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: width * 0.05,
    marginTop: height * 0.02,
    marginBottom: height * 0.03,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    fontSize: width * 0.042,
    color: '#333',
    lineHeight: width * 0.06,
    textAlign: 'justify',
  },
  deleteButton: {
    backgroundColor: dangerColor,
    paddingVertical: height * 0.018,
    paddingHorizontal: width * 0.06,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: height * 0.02,
    width: '80%',
    alignSelf: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: width * 0.045,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.7,
  },
});
