import React, { useState, useEffect } from 'react';
import {
  GluestackUIProvider,
  Text,
  Box,
  Center,
  Button,
  ButtonText,
  HStack,
  Modal,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Input,
  InputField,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from '@gluestack-ui/themed';
import { config } from "@gluestack-ui/config";
import { Alert, TouchableOpacity, FlatList, View } from 'react-native';
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
  const [selectedSite, setSelectedSite] = useState('');
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
    console.log("Sitios:", sitesList);
    setSites(sitesList);
  };

  const addItem = async () => {
    if (newItem && selectedSite) {
      await addDoc(collection(FIREBASE_DB, 'items'), { name: newItem, site: selectedSite });
      fetchItems();
      setModalVisible(false);
      setNewItem('');
      setSelectedSite('');
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
              <Text>Nuevo producto</Text>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Box mb={3}>
                <Input variant="underlined">
                  <InputField
                    placeholder="Aquí el nombre del producto"
                    value={newItem}
                    onChangeText={setNewItem}
                  />
                </Input>
              </Box>
              <Box mb={3}>
                <Text>Seleccionar sitio:</Text>
                <Select
                  selectedValue={selectedSite}
                  onValueChange={(value) => setSelectedSite(value)}
                  placeholder="Seleccionar sitio..."
                >
                  <SelectTrigger>
                    <SelectContent>
                      {sites.map((site, index) => (
                        <SelectItem key={index} value={site.name} label={site.name}>
                          <Text>{site.name}</Text>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </SelectTrigger>
                </Select>
                <Button onPress={() => setSiteModalVisible(true)} mt={2}>
                  <ButtonText>Añadir Sitio</ButtonText>
                </Button>
              </Box>
              <HStack space="md">
                <Button onPress={addItem} flex={1}>
                  <ButtonText>Guardar</ButtonText>
                </Button>
                <Button onPress={() => setModalVisible(false)} flex={1}>
                  <ButtonText>Cancelar</ButtonText>
                </Button>
              </HStack>
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
              <Button onPress={addSite} mb={3}>
                <ButtonText>Guardar</ButtonText>
              </Button>
              <Button onPress={() => setSiteModalVisible(false)}>
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
