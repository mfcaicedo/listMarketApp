import React, { useState,useEffect  } from 'react';
import {
    GluestackUIProvider,
    Text,
    Box,
    Center,
    Button,
    ButtonText,
    Image,
    Heading,
    HStack,
    Card,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    Input,
} from '@gluestack-ui/themed';

import { config } from "@gluestack-ui/config";
import { Alert, TouchableOpacity, View, FlatList, StyleSheet, TextInput, Modal, } from 'react-native';
import { FIREBASE_DB } from '../../config/firebase';
import { collection, addDoc, getDocs, DocumentData } from 'firebase/firestore';
interface Item {
    name: string;
    site: string;
  }

  interface Site {
    name: string;
  }  

const Index = ({ navigation }: { navigation: any }) => {
    const [items, setItems] = useState<Item[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [newItem, setNewItem] = useState('');
    const [newSite, setNewSite] = useState('');
    const [sites, setSites] = useState<Site[]>([]);
    const [siteModalVisible, setSiteModalVisible] = useState(false);
    const [newSiteName, setNewSiteName] = useState('');

    useEffect(() => {
        fetchItems();
        fetchSites();
      }, []);
    
      const fetchItems = async () => {
        const querySnapshot = await getDocs(collection(FIREBASE_DB, 'items'));
        const itemsList = querySnapshot.docs.map(doc => doc.data() as Item);
        setItems(itemsList);
      };
    
      const fetchSites = async () => {
        const querySnapshot = await getDocs(collection(FIREBASE_DB, 'sites'));
        const sitesList = querySnapshot.docs.map(doc => doc.data() as Site);
        setSites(sitesList);
      };
    
      const addItem = async () => {
        if (newItem && newSite) {
          await addDoc(collection(FIREBASE_DB, 'items'), { name: newItem, site: newSite });
          fetchItems();
          setModalVisible(false);
          setNewItem('');
          setNewSite('');
        } else {
          Alert.alert('Error', 'Debe ingresar un nombre y un sitio.');
        }
      };
    
      const addSite = async () => {
        if (newSiteName) {
          await addDoc(collection(FIREBASE_DB, 'sites'), { name: newSiteName });
          fetchSites();
          setSiteModalVisible(false);
          setNewSiteName('');
        } else {
          Alert.alert('Error', 'Debe ingresar un nombre para el sitio.');
        }
      };
    
    return (
        <GluestackUIProvider config={config}>
        <Box flex={1} p={4}>
          <FlatList
            data={items}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <HStack justifyContent="space-between" p={4} borderBottomWidth={1} borderBottomColor="#ccc">
                <Text>{item.name}</Text>
                <Text>{item.site}</Text>
              </HStack>
            )}
          />
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Center
              position="absolute"
              right={4}
              bottom={4}
              bg="#000"
              width={14}
              height={14}
              borderRadius={7}
              alignItems="center"
              justifyContent="center"
            >
              <Text color="#fff" fontSize={24}>+</Text>
            </Center>
          </TouchableOpacity>

          <Modal visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
            <ModalHeader>Agregar Producto</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Box mb={3}>
                <TextInput
                  placeholder="Nombre del producto"
                  value={newItem}
                  onChangeText={setNewItem}
                  style={{
                    height: 40,
                    borderColor: 'gray',
                    borderWidth: 1,
                    marginBottom: 12,
                    paddingHorizontal: 8,
                  }}
                />
              </Box>
              <Box mb={3}>
                <TextInput
                  placeholder="Sitio"
                  value={newSite}
                  onChangeText={setNewSite}
                  style={{
                    height: 40,
                    borderColor: 'gray',
                    borderWidth: 1,
                    marginBottom: 12,
                    paddingHorizontal: 8,
                  }}
                />
              </Box>
              <Button onPress={() => setSiteModalVisible(true)}>
                <ButtonText>Añadir nuevo sitio</ButtonText>
              </Button>
              <Button onPress={addItem} mt={3}>
                <ButtonText>Guardar</ButtonText>
              </Button>
              <Button onPress={() => setModalVisible(false)} mt={3}>
                <ButtonText>Cancelar</ButtonText>
              </Button>
            </ModalBody>
          </Modal>

          <Modal visible={siteModalVisible} onRequestClose={() => setSiteModalVisible(false)}>
            <ModalHeader>Agregar Sitio</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Box mb={3}>
                <TextInput
                  placeholder="Nombre del sitio"
                  value={newSiteName}
                  onChangeText={setNewSiteName}
                  style={{
                    height: 40,
                    borderColor: 'gray',
                    borderWidth: 1,
                    marginBottom: 12,
                    paddingHorizontal: 8,
                  }}
                />
              </Box>
              <Button onPress={addSite}>
                <ButtonText>Guardar</ButtonText>
              </Button>
              <Button onPress={() => setSiteModalVisible(false)} mt={3}>
                <ButtonText>Cancelar</ButtonText>
              </Button>
            </ModalBody>
          </Modal>
        </Box>
      </GluestackUIProvider>
    );
};

export default Index;