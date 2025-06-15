import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import StyledText from '../../src/components/StyledText';

const primaryColor = '#464193'; // Roxo base do logo

export default function SobreScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      <StyledText style={styles.header}>Sobre</StyledText>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Seção Sobre o aplicativo */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="information-circle-outline" size={24} color={primaryColor} style={styles.cardIcon} />
            <StyledText style={styles.cardTitle}>Sobre o aplicativo</StyledText>
          </View>
          <StyledText style={styles.cardContent}>
            O BrechóBox é uma ferramenta dedicada a promover o consumo sustentável e a moda circular,
            oferecendo dicas e receitas para reutilizar, reformar e dar nova vida às suas roupas.
            Ele faz parte de um movimento para explorar a sustentabilidade no universo da moda.
          </StyledText>
        </View>

        {/* Seção Objetivo */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="flag-outline" size={24} color={primaryColor} style={styles.cardIcon} />
            <Text style={styles.cardTitle}>Objetivo</Text>
          </View>
          <StyledText style={styles.cardContent}>
            Nosso objetivo é oferecer soluções práticas e acessíveis para ajudar as pessoas a adotarem
            hábitos de moda mais sustentáveis, reduzindo o impacto ambiental da indústria têxtil e
            incentivando a criatividade na forma de vestir. Com isso, buscamos contribuir para um
            futuro mais consciente e ecológico.
          </StyledText>
        </View>

        {/* Seção Desenvolvedores */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="code-slash-outline" size={24} color={primaryColor} style={styles.cardIcon} />
            <StyledText style={styles.cardTitle}>Desenvolvedores</StyledText>
          </View>
          <StyledText style={styles.cardContent}>
            • Ana Priscilla Silva Oliveira  {'\n'}
            • Duilio do Nascimento Brandao {'\n'}
            • Kleber Araujo Rodrigues {'\n'}
            • Luiggi Souza Grasi  {'\n'}
            • Pedro Henrique de Oliveira Carvalho {'\n'}
            • Roan Nascimento Lisboa {'\n'}
          </StyledText>
        </View>

        {/* Seção Orientadores */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="school-outline" size={24} color={primaryColor} style={styles.cardIcon} />
            <StyledText style={styles.cardTitle}>Orientadores</StyledText>
          </View>
          <StyledText style={styles.cardContent}>
            • Wellington Lacerda
          </StyledText>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#464193',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
    backgroundColor: '#ffffff44',
    padding: 8,
    borderRadius: 10,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    alignSelf: 'center',
    marginBottom: 30,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardIcon: {
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: primaryColor,
  },
  cardContent: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    textAlign: 'justify'
  },
});