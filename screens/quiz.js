import React, { useState, useEffect } from 'react';
import {
    View, 
    Text, 
    TouchableOpacity,
    StyleSheet, 
    ScrollView
} from 'react-native';
import { Image } from 'react-native';
import logo from '../assets/brecho-box-quiz.png';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { quizData } from '../utils/quizdata';

import arvore0 from '../assets/IconsLevel/arvore0.png';
import arvore1 from '../assets/IconsLevel/arvore1.png';
import arvore2 from '../assets/IconsLevel/arvore2.png';
import arvore3 from '../assets/IconsLevel/arvore3.png';
import arvore4 from '../assets/IconsLevel/arvore4.png';

const Quiz = ({navigation}) => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(30);
    const [quizStarted, setQuizStarted] = useState(false);

    // Mapeamento dos ícones baseados na pontuação
    const treeIcons = [
        arvore0,   // 0 acertos
        arvore0,  // 1 acerto
        arvore1,   // 2 acertos
        arvore2,    // 3 acertos
        arvore3,    // 4 acertos
        arvore4     // 5 acertos (usando o mesmo do 4 ou pode adicionar outra imagem se tiver)
    ];

    // Função para obter o ícone correto baseado no score
    const getTreeIcon = () => {
        // Garante que o score esteja entre 0 e 5
        const iconIndex = Math.min(Math.max(score, 0), 5);
        return treeIcons[iconIndex];
    };

    const saveQuizScore = async (score) => {
        try {
            await AsyncStorage.setItem('@quizScore', score.toString());
            console.log('Pontuação salva com sucesso!');
        } catch (e) {
            console.error('Erro ao salvar pontuação:', e);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (timeLeft > 0) {
                setTimeLeft(timeLeft - 1);
            } else {
                if (currentQuestion < quizData.length - 1) {
                    setCurrentQuestion(currentQuestion + 1);
                    setTimeLeft(10);
                } else {
                    setQuizCompleted(true);
                }
            }
        }, 1000);

        if (quizCompleted) {
            saveQuizScore(score)
        }

        return () => clearTimeout(timer);
    }, [currentQuestion, timeLeft], [quizCompleted]);

    const handleAnswer = (selectedOption) => {
        if (selectedOption === quizData[currentQuestion].correctAnswer) {
            setScore(score + 1);
        }

        if (currentQuestion < quizData.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
            setTimeLeft(30);
        } else {
            setQuizCompleted(true);
        }
    };

    const handleRetest = () => {
        setCurrentQuestion(0);
        setScore(0);
        setQuizCompleted(false);
        setTimeLeft(30);
    };

    const displayAnswers = quizData.map((question, index) => (
        <View key={index} style={styles.answerItem}>
            <Text style={styles.questionText}>
                {`${index + 1}. ${question.question}`}
            </Text>
            <Text style={styles.answerText}>
                {question.correctAnswer}
            </Text>
        </View>
    ));

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.navigate('Home')}
            >
                <Ionicons name="arrow-back" size={24} color={primaryColor} />
                <Text style={styles.backButtonText}>Voltar</Text>
            </TouchableOpacity>
            <Image source={logo} style={styles.logo} />
        
            {quizCompleted ? (
                <View style={styles.resultContainer}>
                    <Text style={styles.scoreTitle}>SEU RESULTADO</Text>
                    <Text style={styles.score}>
                        {score}/5
                    </Text>
                    
                    <Image 
                        source={getTreeIcon()} 
                        style={styles.treeIcon} 
                        resizeMode="contain"
                    />
                    
                    <Text style={styles.sectionTitle}>Respostas Corretas:</Text>
                    
                    <View style={styles.answersContainer}>
                        {displayAnswers}
                    </View>
                    
                    <TouchableOpacity
                        style={styles.retestButton}
                        onPress={handleRetest}>
                        <Text style={styles.buttonText}>
                            FAZER NOVAMENTE
                        </Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View>
                    <Text style={styles.question}>
                        {quizData[currentQuestion].question}
                    </Text>
                    <Text style={styles.timer}>
                        Time Left: {timeLeft} sec
                    </Text>
                    {quizData[currentQuestion].options.map((option, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.option}
                            onPress={() => handleAnswer(option)}
                        >
                            <Text style={styles.buttonText}>
                                {option}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </ScrollView>
    );
};

const primaryColor = '#464193';

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
        alignItems: 'center',
    },
    resultContainer: {
        width: '100%',
        alignItems: 'center',
    },
    question: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#464193',
    },
    questionText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#464193',
        marginBottom: 3,
    },
    scoreTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#464193',
        marginBottom: 5,
    },
    answerItem: {
        marginBottom: 15,
        width: '100%',
    },
    option: {
        width: '100%',
        borderColor: '#464193',
        borderRadius: 5,
        backgroundColor: '#464193',
        padding: 10,
        marginBottom: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    logo: {
        width: 300,
        resizeMode: 'contain',
        marginBottom: 50,
        alignSelf: 'center',
    },
    score: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#464193',
    },
    retestButton: {
        borderWidth: 1,
        borderColor: '#464193',
        borderRadius: 5,
        backgroundColor: '#464193',
        marginTop: 10,
        padding: 10,
        alignItems: 'center',
    },
    timer: {
        fontSize: 15,
        color: '#767676',
        fontWeight: 'bold',
        marginBottom: 20,
        marginTop: 20,
        flexDirection: 'row',
    },
    correctAnswer: {
        color: '#767676',
        marginBottom: 10,
    },
    backButton: {
        position: 'absolute',
        top: 40,
        left: 16,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
    },
    backButtonText: {
        fontSize: 16,
        marginLeft: 8,
        color: '#464193',
    },
    treeIcon: {
        width: 120,
        height: 120,
        marginBottom: 10,
    },
    answerText: {
        fontSize: 13,
        color: '#767676',
    },
    answersContainer: {
        width: '100%',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#464193',
        marginTop: 20,
        marginBottom: 10,
        alignSelf: 'flex-start',
    },
});

export default Quiz;