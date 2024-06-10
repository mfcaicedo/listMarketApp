import React, { useState, useEffect } from 'react';
import {
  GluestackUIProvider,
  Text,
  Box,
  Center,
  Button,
  ButtonText,
  Heading,
  HStack,
  Modal,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Input,
  InputField
} from '@gluestack-ui/themed';
import { config } from "@gluestack-ui/config";
import { Alert, TouchableOpacity, View, FlatList, TextInput } from 'react-native';
import { FIREBASE_DB } from '../../config/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

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
            width={56}
            height={56}
            borderRadius={28}
            alignItems="center"
            justifyContent="center"
          >
            <Text style={{ color: '#fff', fontSize: 24 }}>+</Text>
          </Center>
        </TouchableOpacity>

        <Modal isOpen={modalVisible} onClose={() => setModalVisible(false)}>
          <ModalContent>
            <ModalHeader>
              <Text>Agregar Producto</Text>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Box mb={3}>
                <Input variant="underlined">
                  <InputField
                    placeholder="Nombre del producto"
                    value={newItem}
                    onChangeText={setNewItem}
                  />
                </Input>
              </Box>
              <Box mb={3}>
                <Input variant="underlined">
                  <InputField
                    placeholder="Sitio"
                    value={newSite}
                    onChangeText={setNewSite}
                  />
                </Input>
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
          </ModalContent>
        </Modal>

        <Modal isOpen={siteModalVisible} onClose={() => setSiteModalVisible(false)}>
          <ModalContent>
            <ModalHeader>
              <Text>Agregar Sitio</Text>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Box mb={3}>
                <Input variant="underlined">
                  <InputField
                    placeholder="Nombre del sitio"
                    value={newSiteName}
                    onChangeText={setNewSiteName}
                  />
                </Input>
              </Box>
              <Button onPress={addSite}>
                <ButtonText>Guardar</ButtonText>
              </Button>
              <Button onPress={() => setSiteModalVisible(false)} mt={3}>
                <ButtonText>Cancelar</ButtonText>
              </Button>
            </ModalBody>
          </ModalContent>
        </Modal>
      </Box>
    </GluestackUIProvider>
  );
};

export default Index;
