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
  Image,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../src/services/api';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

import StyledText from '../../src/components/StyledText';

const { width, height } = Dimensions.get('window');
const primaryColor = '#464193';
const secondaryColor = '#6A5ACD';

export default function EditReceitaScreen({ navigation, route }) {
  const { receitaId } = route.params; // Obter o ID da receita dos parâmetros de navegação

  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true); // Novo estado para carregamento inicial dos dados da receita
  const [userToken, setUserToken] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [existingImageUrls, setExistingImageUrls] = useState([]); // Para armazenar URLs de imagens já existentes

  // Função para extrair URL do YouTube do conteúdo
  const extractYouTubeUrl = (text) => {
    const urlRegex = /(https?:\/\/(?:www\.)?(?:m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|)([\w-]{11}))(?:\S+)?/i;
    const match = text.match(urlRegex);
    return match && match[1] ? match[1] : '';
  };

  // Função para buscar dados do usuário e da receita
  useEffect(() => {
    const fetchInitialData = async () => {
      setFetchingData(true);
      try {
        const token = await AsyncStorage.getItem('userToken');
        const email = await AsyncStorage.getItem('@currentUserEmail');
        const id = await AsyncStorage.getItem('@currentUserId');
        setUserToken(token);
        setUserEmail(email);
        setCurrentUserId(id);

        if (email && token && id) {
          const userResponse = await api.get(`/api/usuario/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const userId = userResponse.data?.user?.id || userResponse.data?.id;
          setCurrentUserId(userId);
        }

        // Buscar dados da receita específica
        const receitaResponse = await api.get(`/api/receitas/${receitaId}`);
        const receitaData = receitaResponse.data.receita; // Ajuste para o caminho correto dos dados da receita

        setTitulo(receitaData.titulo);
        
        const extractedYoutubeUrl = extractYouTubeUrl(receitaData.conteudo);
        setYoutubeUrl(extractedYoutubeUrl);
        // Remove a URL do YouTube do conteúdo antes de definir o estado
        setConteudo(receitaData.conteudo.replace(extractedYoutubeUrl, '').trim());

        // Processar as imagens existentes (se houver)
        if (receitaData.fotos && Array.isArray(receitaData.fotos)) {
            // Se as fotos vierem como um array de strings de URL
            setExistingImageUrls(receitaData.fotos);
        } else if (typeof receitaData.fotos === 'string') {
            // Se as fotos vierem como uma string JSON (caso de Base64 anterior)
            try {
                const parsedPhotos = JSON.parse(Buffer.from(receitaData.fotos, 'base64').toString('utf-8'));
                if (Array.isArray(parsedPhotos)) {
                    setExistingImageUrls(parsedPhotos);
                }
            } catch (parseError) {
                console.warn('Erro ao parsear fotos de receita:', parseError);
                setExistingImageUrls([]);
            }
        } else {
            setExistingImageUrls([]);
        }

      } catch (error) {
        console.error('Erro ao carregar dados da receita ou do usuário:', error.response?.data || error.message);
        Alert.alert('Erro', 'Não foi possível carregar os dados da receita.');
        navigation.goBack(); // Volta se não conseguir carregar os dados
      } finally {
        setFetchingData(false);
      }
    };

    fetchInitialData();
  }, [receitaId, navigation]);

  // Função para selecionar imagens da galeria
  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos da permissão para acessar suas fotos!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.7,
        selectionLimit: 8 - (selectedImages.length + existingImageUrls.length), // Limita novas seleções
      });

      if (!result.canceled && result.assets) {
        const newImages = result.assets.map(asset => ({ uri: asset.uri, type: asset.type, name: asset.fileName || asset.uri.split('/').pop() }));
        setSelectedImages(prevImages => {
          const combinedImages = [...prevImages, ...newImages];
          return combinedImages.slice(0, 8 - existingImageUrls.length); // Garante que o total não exceda 8
        });
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    }
  };

  // Função para remover uma imagem recém-selecionada (não as existentes)
  const removeSelectedImage = (uriToRemove) => {
    setSelectedImages(prevImages => prevImages.filter(image => image.uri !== uriToRemove));
  };

  // Função para remover uma imagem existente (precisaria de uma lógica de API para isso)
  const removeExistingImage = async (urlToRemove) => {
    Alert.alert(
      "Confirmar exclusão",
      "Tem certeza que deseja remover esta imagem existente? Esta ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          onPress: async () => {
            setExistingImageUrls(prevUrls => prevUrls.filter(url => url !== urlToRemove));
            Alert.alert("Imagem Removida", "A imagem foi removida localmente. Salve as alterações para aplicar.");
          }
        }
      ]
    );
  };

  const handleSubmitReceita = async () => {
    if (!userToken || !currentUserId) {
      Alert.alert('Erro', 'Você precisa estar logado para editar uma receita.');
      return;
    }

    if (!titulo || !conteudo) {
      Alert.alert('Erro', 'Por favor, preencha Título e Conteúdo da Receita.');
      return;
    }

    setLoading(true);

    try {
      const conteudoFinal = youtubeUrl ? `${conteudo}\n\n${youtubeUrl}` : conteudo;
      
      const formData = new FormData();
      formData.append('titulo', titulo);
      formData.append('conteudo', conteudoFinal);
      formData.append('existingImageUrls', JSON.stringify(existingImageUrls)); 
      for (const image of selectedImages) {
        const fileUri = image.uri;
        const fileName = image.name || fileUri.split('/').pop();
        let fileType = image.type;
        if (!fileType) {
            const fileInfo = await FileSystem.getInfoAsync(fileUri);
            if (fileInfo.exists) {
                const extension = fileName.split('.').pop().toLowerCase();
                if (extension === 'jpg' || extension === 'jpeg') fileType = 'image/jpeg';
                else if (extension === 'png') fileType = 'image/png';
                else if (extension === 'gif') fileType = 'image/gif';
                else fileType = 'application/octet-stream'; 
            }
        }
        formData.append('files', {
          uri: fileUri,
          name: fileName,
          type: fileType,
        });
      }

      console.log('Enviando FormData para a API de edição...');
      const response = await api.putForm(`api/receitas/${receitaId}`, formData, {
        headers: {
          'Authorization': `Bearer ${userToken}`,
        },
      });

      console.log('Resposta da API ao editar receita:', response.data);

      if (response.status === 200) {
        Alert.alert('Sucesso', 'Receita atualizada com sucesso!');
        navigation.goBack();
      } else {
        Alert.alert('Erro', response.data?.message || 'Erro ao atualizar receita. Status: ' + response.status);
      }
    } catch (error) {
      console.error('Erro ao editar receita:', error.response?.data || error.message || error);
      Alert.alert('Erro', error.response?.data?.message || 'Não foi possível atualizar a receita. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={primaryColor} />
        <StyledText style={styles.loadingText}>Carregando dados da receita...</StyledText>
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

        <StyledText style={styles.header}>Editar Receita</StyledText>

        <View style={styles.formCard}>
          <TextInput
            style={styles.input}
            placeholder="Título da Receita"
            placeholderTextColor="#aaa"
            textColor="#000000"
            fontfamily="poppins-bold"
            value={titulo}
            onChangeText={setTitulo}
            editable={!loading}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Conteúdo Detalhado da Receita"
            placeholderTextColor="#aaa"
            textColor="#000000"
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
            textColor="#000000"
            value={youtubeUrl}
            onChangeText={setYoutubeUrl}
            keyboardType="url"
            autoCapitalize="none"
            editable={!loading}
          />

          {/* Seção de Imagens Existentes */}
          {existingImageUrls.length > 0 && (
            <View style={styles.imageSectionContainer}>
                <StyledText style={styles.imageSectionTitle}>Imagens Existentes:</StyledText>
                <FlatList
                    data={existingImageUrls}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                        <View style={styles.imagePreviewContainer}>
                            <Image source={{ uri: item }} style={styles.imagePreview} />
                            <TouchableOpacity
                                style={styles.removeImageButton}
                                onPress={() => removeExistingImage(item)}
                            >
                                <Ionicons name="close-circle" size={24} color="red" />
                            </TouchableOpacity>
                        </View>
                    )}
                    style={styles.imageFlatList}
                />
            </View>
          )}

          {/* Botão para adicionar novas imagens */}
          <TouchableOpacity
            style={[styles.selectImageButton, (selectedImages.length + existingImageUrls.length) >= 8 && styles.disabledButton]}
            onPress={handlePickImage}
            disabled={loading || (selectedImages.length + existingImageUrls.length) >= 8}
          >
            <Ionicons name="image-outline" size={20} color="#fff" />
            <StyledText style={styles.selectImageButtonText}>
              Adicionar Novas Imagens ({selectedImages.length + existingImageUrls.length}/8)
            </StyledText>
          </TouchableOpacity>

          {/* Pré-visualização das novas imagens selecionadas */}
          {selectedImages.length > 0 && (
            <FlatList
              data={selectedImages}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, index) => item.uri + index}
              renderItem={({ item }) => (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: item.uri }} style={styles.imagePreview} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeSelectedImage(item.uri)}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
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
  imageSectionContainer: {
    marginBottom: height * 0.02,
  },
  imageSectionTitle: {
    fontSize: width * 0.045,
    fontWeight: 'bold',
    color: primaryColor,
    marginBottom: 10,
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
