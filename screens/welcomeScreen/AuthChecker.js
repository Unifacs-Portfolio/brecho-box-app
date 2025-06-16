import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../src/services/api';

export default function AuthChecker({ navigation }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const manterConectado = await AsyncStorage.getItem('@manterConectado');
        const expiration = await AsyncStorage.getItem('@tokenExpiration');

        if (!token || manterConectado !== 'true' || (expiration && Date.now() > parseInt(expiration))) {
          // Se não houver token, ou manterConectado não for 'true', ou o token estiver expirado
          navigation.navigate('Inicio'); // Redireciona para 'Inicio'
          return;
        }

        // Tenta validar o token com a API
        await api.get('/api/usuario', {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Se a validação for bem-sucedida, navega para as abas principais do aplicativo
        navigation.navigate('AppTabs');
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        // Em caso de erro na validação ou API, redireciona para 'Inicio'
        navigation.navigate('Inicio');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigation]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}