import React, { useState, useEffect, useCallback, useRef } from 'react'; 
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Dimensions,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { quizData as localQuizData } from '../utils/quizdata'; 

// Importe das imagens de árvore
import arvore0 from '../assets/IconsLevel/arvore0.png';
import arvore1 from '../assets/IconsLevel/arvore1.png';
import arvore2 from '../assets/IconsLevel/arvore2.png';
import arvore3 from '../assets/IconsLevel/arvore3.png';
import arvore4 from '../assets/IconsLevel/arvore4.png';

const { width, height } = Dimensions.get('window');

export default function Quiz({ navigation }) {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [quizFinished, setQuizFinished] = useState(false);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(null);
  const [timer, setTimer] = useState(30);

  
  const intervalIdRef = useRef(null);

 

  // Mapeamento dos ícones baseados na pontuação
  const treeIcons = [
    arvore0,
    arvore1,
    arvore2,
    arvore3,
    arvore4,
    arvore4
  ];

  // Função para iniciar o timer
  const startTimer = useCallback(() => {
    // Limpa qualquer timer anterior antes de iniciar um novo
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
    }
    const id = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(intervalIdRef.current);
          handleAnswer(null); // Responde como tempo esgotado
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);
    intervalIdRef.current = id; // Armazena o ID no useRef
  }, []); // Sem dependências, esta função é estável

  // Função para buscar as perguntas do quiz
  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    setQuizFinished(false);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswerIndex(null);
    setTimer(30);
    
    // Limpa o timer existente antes de buscar novas perguntas
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null; // Reseta a referência
    }

    try {
      const formattedQuestions = localQuizData.map(q => ({
        id: Math.random().toString(36).substring(2, 9),
        pergunta: q.question,
        alternativas: q.options.map(optionText => ({
          texto: optionText,
          isCorrect: optionText === q.correctAnswer,
        })),
      }));

      const shuffledQuestions = formattedQuestions.sort(() => Math.random() - 0.5);
      setQuestions(shuffledQuestions);
      startTimer(); // Inicia o timer após carregar as perguntas
    } catch (error) {
      console.error('Erro ao carregar perguntas do quiz:', error);
      Alert.alert('Erro', 'Não foi possível carregar as perguntas do quiz. Tente novamente mais tarde.');
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, [startTimer]); // Depende apenas de startTimer, que agora é estável

  useEffect(() => {
    fetchQuestions();
    return () => {
      // Função de limpeza: garante que o timer seja parado ao desmontar o componente
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
    };
  }, [fetchQuestions]); 

  // Função para lidar com a seleção de resposta 
  const handleAnswer = async (selectedIndex) => {
    if (selectedAnswerIndex !== null && selectedIndex !== null) return;
    setSelectedAnswerIndex(selectedIndex);
    // Limpa o timer quando uma resposta é selecionada
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
    }

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedIndex !== null && currentQuestion.alternativas[selectedIndex]?.isCorrect;

    if (isCorrect) {
      setScore((prevScore) => prevScore + 1);
    }

    setTimeout(() => {
      const nextQuestionIndex = currentQuestionIndex + 1;
      if (nextQuestionIndex < questions.length) {
        setCurrentQuestionIndex(nextQuestionIndex);
        setSelectedAnswerIndex(null);
        setTimer(30);
        startTimer(); // Inicia o timer para a próxima pergunta
      } else {
        setQuizFinished(true);
        // Garante que a pontuação final seja salva corretamente, incluindo o acerto atual
        AsyncStorage.setItem('@quizScore', String(score + (isCorrect ? 1 : 0)))
          .catch(err => console.error('Erro ao salvar pontuação:', err));
      }
    }, 1000);
  };

  // Renderiza a tela de carregamento
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={primaryColor} />
        <Text style={styles.loadingText}>Carregando Quiz...</Text>
      </View>
    );
  }

  // Renderiza a tela de quiz finalizado
  if (quizFinished) {
    const finalScore = score;
    const treeImageSource = treeIcons[Math.min(finalScore, treeIcons.length - 1)];
    return (
      <View style={styles.resultContainer}>
        <Text style={styles.quizTitle}>QUIZ BRECHÓ BOX</Text>
        <Text style={styles.resultHeader}>SEU RESULTADO</Text>
        <Text style={styles.scoreText}>{finalScore}/{questions.length}</Text>
        <Image source={treeImageSource} style={styles.resultTreeImage} />
        <Text style={styles.correctAnswersTitle}>Respostas Corretas:</Text>
        <ScrollView style={styles.answersScroll}>
          {questions.map((q, index) => (
            <View key={q.id} style={styles.answerItem}>
              <Text style={styles.answerQuestion}>{index + 1}. {q.pergunta}</Text>
              <Text style={styles.answerCorrect}>
                {q.alternativas.find(alt => alt.isCorrect)?.texto || 'N/A'}
              </Text>
            </View>
          ))}
        </ScrollView>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchQuestions}
        >
          <Text style={styles.retryButtonText}>Refazer Quiz</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.backToHomeButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.backToHomeButtonText}>Voltar para Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Renderiza a pergunta atual do quiz
  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Nenhuma pergunta disponível.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchQuestions}>
          <Text style={styles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.quizContainer}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
        <Text style={styles.backButtonText}>Voltar</Text>
      </TouchableOpacity>

      <Text style={styles.quizTitle}>QUIZ BRECHÓ BOX</Text>

      <ScrollView contentContainerStyle={styles.questionScrollContent}>
        <Text style={styles.questionText}>{currentQuestion.pergunta}</Text>
        <Text style={styles.timerText}>Tempo Restante: {timer} seg</Text>

        <View style={styles.optionsContainer}>
          {currentQuestion.alternativas.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                selectedAnswerIndex === index && (option.isCorrect ? styles.correctOption : styles.incorrectOption),
                selectedAnswerIndex !== null && !option.isCorrect && selectedAnswerIndex === index && styles.incorrectOption,
                selectedAnswerIndex !== null && option.isCorrect && styles.correctOptionBorder
              ]}
              onPress={() => handleAnswer(index)}
              disabled={selectedAnswerIndex !== null}
            >
              <Text style={styles.optionButtonText}>{option.texto}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const primaryColor = '#464193';

const styles = StyleSheet.create({
  quizContainer: {
    flex: 1,
    backgroundColor: '#473da1',
    paddingTop: height * 0.1,
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
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
  backButton: {
    position: 'absolute',
    top: height * 0.05,
    left: 20,
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff44',
    padding: 8,
    borderRadius: 10,
  },
  backButtonText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 16,
  },
  quizTitle: {
    fontSize: width * 0.07,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  questionScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 10,
  },
  questionText: {
    fontSize: width * 0.055,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  timerText: {
    fontSize: width * 0.045,
    color: '#fff',
    marginBottom: 25,
    fontWeight: 'bold',
  },
  optionsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  optionButton: {
    backgroundColor: '#fff',
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.04,
    borderRadius: 12,
    marginBottom: 10,
    width: '95%',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: height * 0.07,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  optionButtonText: {
    fontSize: width * 0.04,
    color: primaryColor,
    fontWeight: '500',
    textAlign: 'center',
  },
  correctOption: {
    backgroundColor: '#d4edda',
    borderColor: '#28a745',
    borderWidth: 2,
  },
  incorrectOption: {
    backgroundColor: '#f8d7da',
    borderColor: '#dc3545',
    borderWidth: 2,
  },
  correctOptionBorder: {
    borderColor: '#28a745',
    borderWidth: 2,
  },

  // Estilos da tela de resultados do quiz
  resultContainer: {
    flex: 1,
    backgroundColor: '#473da1',
    paddingTop: 50,
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
  },
  resultHeader: {
    fontSize: width * 0.06,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    textAlign: 'center',
  },
  scoreText: {
    fontSize: width * 0.1,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
  },
  resultTreeImage: {
    width: width * 0.4,
    height: width * 0.4,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  correctAnswersTitle: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    alignSelf: 'flex-start',
  },
  answersScroll: {
    width: '100%',
    maxHeight: height * 0.4,
    marginBottom: 20,
  },
  answerItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    width: '100%',
  },
  answerQuestion: {
    fontSize: width * 0.04,
    fontWeight: '600',
    color: primaryColor,
    marginBottom: 5,
  },
  answerCorrect: {
    fontSize: width * 0.038,
    color: '#555',
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: '#fff',
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.08,
    borderRadius: 12,
    marginTop: 10,
    width: '80%',
    alignItems: 'center',
  },
  retryButtonText: {
    color: primaryColor,
    fontSize: width * 0.045,
    fontWeight: 'bold',
  },
  backToHomeButton: {
    backgroundColor: primaryColor,
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.08,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 20,
    width: '80%',
    alignItems: 'center',
    borderColor: '#fff',
    borderWidth: 1,
  },
  backToHomeButtonText: {
    color: '#fff',
    fontSize: width * 0.045,
    fontWeight: 'bold',
  },
});
