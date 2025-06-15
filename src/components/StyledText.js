import React from 'react';
import { Text, StyleSheet } from 'react-native';

/**
 * Retorna o nome da fonte Poppins apropriado com base no fontWeight.
 * Mapeia os valores numéricos e textuais de fontWeight para os nomes dos arquivos da fonte Poppins.
 * @param {string | number} fontWeight - O peso da fonte (ex: 'bold', 'normal', '600', '700').
 * @returns {string} O nome da família da fonte Poppins.
 */
const getFontFamily = (fontWeight) => {
  switch (String(fontWeight)) { // Converte para string para lidar com números e strings
    case '100':
    case 'thin':
      return 'Poppins-Thin';
    case '200':
    case 'extra-light':
      return 'Poppins-ExtraLight';
    case '300':
    case 'light':
      return 'Poppins-Light';
    case '400':
    case 'normal':
      return 'Poppins-Regular'; // Peso padrão para 'normal'
    case '500':
    case 'medium':
      return 'Poppins-Medium';
    case '600':
    case 'semi-bold':
      return 'Poppins-SemiBold';
    case '700':
    case 'bold':
      return 'Poppins-Bold'; // Peso padrão para 'bold'
    case '800':
    case 'extra-bold':
      return 'Poppins-ExtraBold';
    case '900':
    case 'black':
      return 'Poppins-Black';
    case 'italic': // Para lidar com itálico se você tiver arquivos específicos para isso
      return 'Poppins-Italic';
    default:
      return 'Poppins-Regular'; // Fallback para regular
  }
};

/**
 * Componente Text personalizado que aplica automaticamente a fonte Poppins.
 * Ele tenta mapear o fontWeight do estilo para a variante Poppins correspondente.
 * Se um fontFamily explícito já for fornecido no estilo, ele será respeitado.
 *
 * @param {object} props - Propriedades passadas para o componente Text.
 * @param {object | Array<object>} props.style - Objeto de estilo ou array de objetos de estilo.
 * @param {React.ReactNode} props.children - Conteúdo do texto.
 */
const StyledText = ({ style, children, ...props }) => {
  // Achata os estilos para inspecionar todas as propriedades combinadas
  const flattenedStyle = StyleSheet.flatten(style);
  
  // Extrai o fontWeight do estilo. Se não houver, assume 'normal' (400).
  const fontWeight = flattenedStyle?.fontWeight || 'normal';

  // Verifica se um fontFamily já foi explicitamente definido no estilo
  const customFontFamily = flattenedStyle?.fontFamily;

  // Determina a família da fonte: usa a personalizada se existir, caso contrário, usa o mapeamento por fontWeight
  const resolvedFontFamily = customFontFamily || getFontFamily(fontWeight);

  // Remove o 'fontWeight' do estilo para evitar conflito com 'fontFamily'
  // Quando você define um 'fontFamily' específico (ex: 'Poppins-Bold'),
  // o 'fontWeight' padrão do React Native (ex: 'bold') não é mais necessário e pode causar avisos.
  const { fontWeight: removedFontWeight, ...restStyle } = flattenedStyle;

  return (
    <Text style={[{ fontFamily: resolvedFontFamily }, restStyle]} {...props}>
      {children}
    </Text>
  );
};

export default StyledText;

