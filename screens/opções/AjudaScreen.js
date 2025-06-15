import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import StyledText from '../../src/components/StyledText';

const primaryColor = '#464193'; // Roxo base do logo

// Componente de item expansível/retrátil para FAQ
const ExpandableItem = ({ title, content }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <TouchableOpacity style={styles.faqItem} onPress={toggleExpand} activeOpacity={0.8}>
      <View style={styles.faqHeader}>
        <StyledText style={styles.faqTitle}>{title}</StyledText>
        <Ionicons
          name={expanded ? 'chevron-up-outline' : 'chevron-down-outline'}
          size={24}
          color={primaryColor}
        />
      </View>
      {expanded && (
        <View style={styles.faqContentContainer}>
          <StyledText style={styles.faqContent}>{content}</StyledText>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default function AjudaScreen({ navigation }) {
  const faqData = [
    {
      id: '1',
      question: 'O que são essas árvores no meu perfil?',
      answer: 'As árvores representam seu nível de engajamento e sustentabilidade. Cada acerto no quiz ou interação positiva no aplicativo contribui para o crescimento da sua árvore!',
    },
    {
      id: '2',
      question: 'Como posso contribuir com dicas de moda sustentável?',
      answer: 'Você pode enviar suas próprias dicas e receitas de moda sustentável através da seção "Dicas/Receitas" do aplicativo. Suas contribuições podem ser verificadas e compartilhadas com a comunidade!',
    },
    {
      id: '3',
      question: 'Meus dados estão seguros no aplicativo?',
      answer: 'Sim, a segurança dos seus dados é nossa prioridade. Utilizamos as melhores práticas de segurança para proteger suas informações. Consulte nossa Política de Privacidade para mais detalhes.',
    },
    {
      id: '4',
      question: 'Como faço para alterar minha foto de perfil?',
      answer: 'Na tela de Perfil, basta tocar na sua imagem atual. Você terá a opção de escolher uma nova foto da sua galeria.',
    },
    {
        id: '5',
        question: 'Onde encontro as "Receitas de Moda"?',
        answer: 'Na aba "Dicas/Receitas" na barra de navegação inferior, você encontrará a opção para escolher entre "Dicas de Moda" e "Receitas de Moda".'
    }
  ];

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      <StyledText style={styles.header}>Ajuda</StyledText>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Seção Guia de Árvores */}
        <StyledText style={styles.sectionTitle}>Guia de Árvores</StyledText>
        <ExpandableItem
          title="Guia de Níveis de Engajamento"
          content="Sua árvore de perfil cresce à medida que você participa dos quizzes, adota dicas de moda sustentável e interage com o conteúdo do aplicativo. Cada nível desbloqueia uma nova fase da árvore, representando seu progresso na jornada da moda consciente."
        />

        {/* Seção Perguntas Frequentes */}
        <StyledText style={styles.sectionTitle}>Perguntas Frequentes</StyledText>
        {faqData.map((item) => (
          <ExpandableItem key={item.id} title={item.question} content={item.answer} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#473da1',
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
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    marginTop: 20,
    textAlign: 'center',
  },
  faqItem: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: primaryColor,
    flexShrink: 1,
    marginRight: 10,
  },
  faqContentContainer: {
    marginTop: 10,
  },
  faqContent: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    textAlign: 'justify'
  },
});