import React from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function Perfil() {
  const navigation = useNavigation();

  const userName = 'Nome do Usuário'; // ← Substituir pelo nome real vindo do banco

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.topCurve}>
        {/* Botão de voltar fixo no topo à esquerda */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Ionicons name="arrow-back" size={24} color={'#fff'} />
        </TouchableOpacity>

        <View style={styles.container}>
          {/* Imagem principal */}
          <View style={styles.profileContainer}>
            <Image
              source={require('../../assets/iconsLogin/carinhabranco.jpg')} // <- substituir pela função de escolha de imagem do aparelho
              style={styles.mainImage}
            />
            <View style={styles.overlayIconContainer}>
              <Image
                source={require('../../assets/IconsLevel/arvore0.png')} // <- substituir pelo resultado do quiz
                style={styles.overlayIcon}
              />
            </View>
          </View>

          <Text style={styles.userName}>{userName}</Text>
        </View>
      </View>

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('Modificacoes')}
        >
          <Text style={styles.editButtonText}>Modificações</Text>
        </TouchableOpacity>
      </View>
    </View>

  );
}

const primaryColor = '#464193';

const styles = StyleSheet.create({


  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  topCurve: {
    backgroundColor: '#473da1',
    height: '70%',
    borderBottomLeftRadius: 200,
    borderBottomRightRadius: 200,
    alignItems: 'center',
    paddingTop: 60,
  },

  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    padding: 10,
  },

  backButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
  },

  profileContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  mainImage: {
    width: 250,
    height: 250,
    resizeMode: 'contain',
    borderWidth: 4,
    borderColor: '#4B0082',
    borderRadius: 20,
  },

  overlayIconContainer: {
    position: 'absolute',
    right: 15,
    bottom: 6,
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 5,
    borderWidth: 2,
    borderColor: '#4B0082',
  },

  overlayIcon: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },

  userName: {
    marginTop: 30,
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },

  bottomContainer: {
    height: '30%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
  },

  editButton: {
    backgroundColor: '#473da1',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
  },

  editButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
