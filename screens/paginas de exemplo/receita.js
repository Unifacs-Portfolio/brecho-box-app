import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, FlatList} from 'react-native';
import { ImageHeaderScrollView, TriggeringView } from 'react-native-image-header-scroll-view';

export default function Receita() {
  const MIN_HEIGHT = 150; // Set the minimum height for the header image
  
  // isso vem do servidor via REST API aqui tem de ter os ingredientes, foto  e o modo de preparo.
  // nas Views temos de recodificar o acesso aos dados. 
  const DATA = [
      {
        id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
        title: '1 colher sopa de arroz',
      },
      {
        id: '3ac68afc-c605-48d3-a4f8-fbd91aa97f63',
        title: '1/2 cebola picada',
      },
      {
        id: '58694a0f-3da1-471f-bd96-145571e29d72',
        title: '1/2 tempero verde',
      },  
      {
        id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
        title: '1 tomate picado',
      },
      {
        id: '3ac68afc-c605-48d3-a4f8-fbd91aa97f63',
        title: 'Sal a gosto',
      },

  ];


  const Item = ({title}) => (
      <View style={styles.item}>
        <Text style={styles.content}>{title}</Text>
      </View>
    );

  return (
    <View style={{ flex: 1 }}>
      <ImageHeaderScrollView
        maxHeight={200}
        minHeight={MIN_HEIGHT}
        headerImage={require("../assets/prato.png")}
        renderForeground={() => (
          <View style={styles.header}>
            <TouchableOpacity onPress={() => console.log("tap!!")}>
              <Text style={styles.headerText}>Tap Me!</Text>
            </TouchableOpacity>
          </View>
        )}
      >
        <View style={styles.content}>
          <TriggeringView onHide={() => console.log("text hidden")}>
            <Text style={styles.title}>Arroz com Frango</Text>
          </TriggeringView>
          <View>
            <Text style={styles.ingredientes}>Ingredientes</Text>
          </View>
          <View style={{ margin: "20" }}>
                <FlatList 
                    data={DATA}
                    renderItem={({item}) => <Item title={item.title} />}
                    keyExtractor={item => item.id}
                    horizontal
                />
          </View>
          <View>
            <Text style={styles.ingredientes}>Preparo</Text>
          </View>
          <Text style={styles.paragraph}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </Text>
          <Text style={styles.paragraph}>
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
          </Text>
          <Text style={styles.paragraph}>
            Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.
          </Text>
        </View>
      </ImageHeaderScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 150,
    justifyContent: "center",
    alignItems: "center"
  },
  headerText: {
    backgroundColor: "transparent",
    color: "#fff",
    fontSize: 24
  },
  ingredientes: {
    fontSize: 24,
    padding: 20
  },
  content: {
    fontSize: 16,
    padding: 20
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 20
  },
  paragraph: {
    fontSize: 18,
    marginBottom: 20
  },
  item: {
    backgroundColor: '#ffffff',
    padding: 3,
    borderRadius: 12,
    borderStyle:"solid",
    borderWidth: 1,
    borderColor: "bleck",
    marginVertical: 10,
    marginHorizontal: 12,
  },
});

