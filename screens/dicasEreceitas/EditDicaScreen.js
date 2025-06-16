import React, { useState, useEffect, useCallback } from 'react';
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
import api from '../../src/services/api'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

import StyledText from '../../src/components/StyledText';

const { width, height } = Dimensions.get('window');
const primaryColor = '#464193';

export default function EditDicaScreen({ route, navigation }) {
  const { dicaId } = route.params; 
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [loading, setLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const email = await AsyncStorage.getItem('@currentUserEmail');
        const userId = await AsyncStorage.getItem('@currentUserId');

        setUserToken(token);
        setUserEmail(email);
        setCurrentUserId(userId);

        if (!token || !dicaId) {
          Alert.alert('Erro', 'Dados de autenticação ou ID da dica ausentes.');
          navigation.goBack();
          return;
        }

        // Busca os detalhes da dica a ser editada
        const response = await api.get(`/api/dicas/${dicaId}`);
        const dicaData = response.data.dica || response.data; 

        if (dicaData) {
          setTitulo(dicaData.titulo);
          setConteudo(dicaData.conteudo);
        } else {
          Alert.alert('Erro', 'Dica não encontrada.');
          navigation.goBack();
        }
      } catch (error) {
        console.error('Erro ao carregar dados da dica para edição:', error.response?.data || error.message);
        Alert.alert('Erro', 'Não foi possível carregar os dados da dica para edição.');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [dicaId, navigation]);

  const handleUpdateDica = async () => {
    if (!titulo || !conteudo) {
      Alert.alert('Erro', 'Por favor, preencha Título e Conteúdo da Dica.');
      return;
    }

    if (conteudo.length > 1000 || conteudo.length < 10) {
      Alert.alert('Erro', 'O conteúdo da dica deve ter no máximo 1000 caracteres e no mínimo 10 caracteres.');
      return;
    }

    if (!userToken || !currentUserId) {
        Alert.alert('Erro', 'Você precisa estar logado para atualizar uma dica.');
        navigation.navigate('Login');
        return;
    }

    setLoading(true);
    try {
      const payload = {
        titulo: titulo,
        conteudo: conteudo,
        tema: "Moda",
        subtemas: ["subtema-moda-sustentavel"], 
        email: userEmail,
      };

 
      const response = await api.put(`api/dicas/${dicaId}`, payload, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (response.status === 200) { 
        Alert.alert('Sucesso', 'Dica atualizada com sucesso!');
        navigation.goBack(); 
      } else {
        Alert.alert('Erro', response.data?.message || `Erro ao atualizar dica. Status: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro na requisição API ao atualizar dica:', error.response?.data || error.message);
      Alert.alert('Erro', error.response?.data?.message || 'Não foi possível atualizar a dica. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={primaryColor} />
        <StyledText style={styles.loadingText}>Carregando dados da dica...</StyledText>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={primaryColor} />
        </TouchableOpacity>

        <StyledText style={styles.header}>Editar Dica</StyledText>

        <View style={styles.formCard}>
          <TextInput
            style={styles.input}
            placeholder="Título da Dica"
            placeholderTextColor="#aaa"
            fontfamily="poppins-bold"
            value={titulo}
            onChangeText={setTitulo}
            editable={!loading}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Conteúdo Detalhado da Dica"
            placeholderTextColor="#aaa"
            fontfamily="poppins-bold"
            value={conteudo}
            onChangeText={setConteudo}
            multiline
            numberOfLines={5}
            editable={!loading}
          />

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.disabledButton]}
            onPress={handleUpdateDica}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <StyledText style={styles.submitButtonText}>Salvar Alterações</StyledText>
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
