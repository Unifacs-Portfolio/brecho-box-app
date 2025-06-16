import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  Image, 
  FlatList, 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker'; 
import * as FileSystem from 'expo-file-system'; 
import api from '../../src/services/api';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

import StyledText from '../../src/components/StyledText';

const { width, height } = Dimensions.get('window');
const primaryColor = '#464193';
const secondaryColor = '#6A5ACD'; 
const API_URL = 'https://api-consumo-app.onrender.com';

export default function CreateReceitasScreen({ navigation }) {
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [userToken, setUserToken] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]); 

  async function schedulePushNotification(title, body) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
      },
      trigger: { seconds: 1 }, // A notificação será exibida em 1 segundo
    });
  }
  

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const email = await AsyncStorage.getItem('@currentUserEmail');
        const id = await AsyncStorage.getItem('@currentUserId');
        setUserToken(token);
        setUserEmail(email);
        setCurrentUserId(id);

        if (email && token && id) {
          const response = await api.get(`api/usuario/${id}`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          const userId = response.data?.id || response.data?.user?.id; 
          setCurrentUserId(userId);
        }
      } catch (error) {
        console.error('Erro ao buscar token, email ou ID do usuário:', error);
        Alert.alert('Erro', 'Não foi possível carregar os dados do usuário. Por favor, faça login novamente.');
        navigation.navigate('Login'); 
      }
    };
    fetchUserData();
  }, [navigation]);


  // Função para selecionar imagens da galeria
  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos da permissão para acessar suas fotos!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaType,
        allowsMultipleSelection: true, // Permite selecionar múltiplas imagens
        quality: 1, // Qualidade da imagem
        selectionLimit: 8 - selectedImages.length, // Limita novas seleções para não exceder 8
      });

      if (!result.canceled && result.assets) {
        // Mapeia os assets para obter apenas as URIs e adiciona ao estado
        const newImages = result.assets.map(asset => ({ uri: asset.uri, type: asset.type, name: asset.fileName || asset.uri.split('/').pop() }));
        setSelectedImages(prevImages => {
          const combinedImages = [...prevImages, ...newImages];
          // Garante que não excede o limite de 8 imagens
          return combinedImages.slice(0, 8); 
        });
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    }
  };

  // Função para remover uma imagem selecionada
  const removeImage = (uriToRemove) => {
    setSelectedImages(prevImages => prevImages.filter(image => image.uri !== uriToRemove));
  };

  const handleSubmitReceita = async () => {
    setLoading(true);

    if (!titulo || !conteudo) {
      Alert.alert('Erro', 'Por favor, preencha Título e Conteúdo da Receita.');
      return;
    }

      const conteudoComYoutube = youtubeUrl ? `${conteudo}\n\n${youtubeUrl}` : conteudo;
    
      const formData = new FormData();
      formData.append('titulo', titulo);
      formData.append('conteudo', conteudoComYoutube);
      formData.append('email', userEmail); 
      formData.append('tema', "Moda"); 
      formData.append('subtemas[]', "subtema-moda-sustentavel");

  
      for (const image of selectedImages) {
        const fileUri = image.uri;
        const fileName = image.name || fileUri.split('/').pop();
        let fileType = image.type;
        console.log(`Adicionando imagem: ${fileName}, tipo: ${fileType}, URI: ${fileUri}`);
        formData.append('fotos', { 
          uri: fileUri,
          name: fileName,
          type: 'image/jpeg', //tem que ser dinamico, mas aqui é um exemplo
        });
      }
      
      try {
       
          // const response = await api.postForm('api/receitas', formData)
          const response = await fetch(`${API_URL}/api/receitas`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'multipart/form-data',
            },
            body: formData,
          });
          console.log('Resposta da API ao criar receita:', await response.json());

          if (response.status === 201) {
            Alert.alert('Sucesso', 'Receita criada com sucesso!');
            await schedulePushNotification('Nova Receita', `Sua receita "${titulo}" foi criada com sucesso!`); 
            navigation.goBack(); 
          } else {
            Alert.alert('Erro', response.data?.message || 'Erro ao criar receita. Status: ' + response.status);
          } 
      } catch (error) {
          console.log('Erro ao criar receita:', error);
          console.error('Erro completo:', {
            message: error.message,
            code: error.code,
            url: error.config?.url,
            request: error.request,
            response: error.response?.data
          });
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

        <StyledText style={styles.header}>Criar Nova Receita</StyledText>

        <View style={styles.formCard}>
          <TextInput
            style={styles.input}
            placeholder="Título da Receita"
            placeholderTextColor="#aaa"
            fontfamily="poppins-bold"
            value={titulo}
            onChangeText={setTitulo}
            editable={!loading}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Conteúdo Detalhado da Receita"
            placeholderTextColor="#aaa"
            fontfamily="poppins-bold"
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
            fontfamily="poppins-bold"
            value={youtubeUrl}
            onChangeText={setYoutubeUrl}
            keyboardType="url"
            autoCapitalize="none"
            editable={!loading}
          />

          {/* Botão para selecionar imagens */}
          <TouchableOpacity
            style={[styles.selectImageButton, selectedImages.length >= 8 && styles.disabledButton]}
            onPress={handlePickImage}
            disabled={loading || selectedImages.length >= 8} // Desabilita se já tem 8 imagens
          >
            <Ionicons name="image-outline" size={20} color="#fff" />
            <StyledText style={styles.selectImageButtonText}>
              Adicionar Imagens ({selectedImages.length}/8)
            </StyledText>
          </TouchableOpacity>

          {/* Pré-visualização das imagens selecionadas */}
          {selectedImages.length > 0 && (
            <FlatList
              data={selectedImages}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, index) => item.uri + index} // Adiciona index para garantir unicidade caso haja URIs duplicadas
              renderItem={({ item }) => (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: item.uri }} style={styles.imagePreview} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeImage(item.uri)}
                  >
                    <Ionicons name="close-circle" size={24} color="red" />
                  </TouchableOpacity>
                </View>
              )}
              style={styles.imageFlatList}
            />
          )}

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.disabledButton]}
            onPress={handleSubmitReceita}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <StyledText style={styles.submitButtonText}>Publicar Receita</StyledText>
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
  selectImageButton: {
    backgroundColor: secondaryColor,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: height * 0.015,
    borderRadius: 10,
    marginTop: height * 0.01,
    marginBottom: height * 0.02,
  },
  selectImageButtonText: {
    color: '#fff',
    fontSize: width * 0.04,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  imageFlatList: {
    maxHeight: height * 0.15,
    marginBottom: height * 0.02,
  },
  imagePreviewContainer: {
    marginRight: 10,
    position: 'relative',
  },
  imagePreview: {
    width: width * 0.2,
    height: width * 0.2,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#fff',
    borderRadius: 12,
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
