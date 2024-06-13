import React, { useState, useEffect } from 'react';
import {
  GluestackUIProvider,
  Text,
  Box,
  Center,
  Button,
  ButtonText,
  HStack,
  VStack,
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
  SelectInput,
  SelectIcon,
  Icon,
  SelectPortal,
  SelectDragIndicatorWrapper,
  SelectDragIndicator,
  ChevronDownIcon,
  SelectBackdrop,
  Heading,
  AddIcon,
  ButtonIcon,
  ScrollView,
} from '@gluestack-ui/themed';
import { config } from "@gluestack-ui/config";
import { Alert, TouchableOpacity, FlatList, View } from 'react-native';
import { FIREBASE_DB } from '../../config/firebase';
import { collection, addDoc, getDocs, Timestamp } from 'firebase/firestore';

interface Item {
  name: string;
  site: string;
  createdAt?: Timestamp;
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
    getItems();
    getSites();
  }, []);

  const getItems = async () => {
    const querySnapshot = await getDocs(collection(FIREBASE_DB, 'items'));
    const itemsList = querySnapshot.docs.map(doc => doc.data() as Item);
    setItems(itemsList);
  };

  const getSites = async () => {
    const querySnapshot = await getDocs(collection(FIREBASE_DB, 'sites'));
    const sitesList = querySnapshot.docs.map(doc => doc.data() as Site);
    console.log("Sitios:", sitesList);
    setSites(sitesList);
  };

  const addItem = async () => {
    if (newItem && selectedSite) {
      const newItemData = {
        name: newItem,
        site: selectedSite,
        createdAt: Timestamp.now()
      };
      await addDoc(collection(FIREBASE_DB, 'items'), newItemData);
      getItems();
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
      getSites();
      setSiteModalVisible(false);
      setNewSiteName('');
    } else {
      Alert.alert('Error', 'Debe ingresar un nombre para el sitio.');
    }
  };

  return (
    <GluestackUIProvider config={config}>
      <Box p='$1.5'>
      <Heading>Tu lista de compras!</Heading>
      </Box>
      <ScrollView h="$80" w="$full" pl='$1.5' pr='$1.5'>
        <VStack flex={1}>
          <HStack space="xl" justifyContent='space-between' reversed={false}>
            <Text color='$black' bold>Nombre</Text>
            <Text color='$black' bold>Sitio</Text>
            <Text color='$black' bold>Creado</Text>
            <Text color='$black' bold>Acciones</Text>
          </HStack>
        </VStack>
        <VStack flex={1}>
          {items.map((item, index) => (
            <HStack key={index} space="xl" justifyContent='space-between' reversed={false}>
              <Text>{item.name}</Text>
              <Text>{item.site}</Text>
              <Text>{item.createdAt ? item.createdAt.toDate().toLocaleString() : 'N/A'}</Text>
              <TouchableOpacity onPress={() => console.log('edit')}>
                <Text>Editar</Text>
              </TouchableOpacity>
            </HStack>
          ))}
        </VStack>
      </ScrollView>
      <Box>
        <Button position='absolute' m='$1.5' right={1} bottom={1} size="xl" w='$16' h='$16' rounded='$full'
          variant="solid" action="primary" isDisabled={false} isFocusVisible={true}
          onPress={() => setModalVisible(true)} >
          <ButtonIcon as={AddIcon} />
        </Button>

        <Modal isOpen={modalVisible} onClose={() => setModalVisible(false)}>
          <ModalContent>
            <ModalHeader>
              <Heading>Nuevo producto</Heading>
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
                <Select onValueChange={(value) => setSelectedSite(value)}>
                  <SelectTrigger variant="underlined" size="md">
                    <SelectInput placeholder="Seleccionar sitio" />
                    <SelectIcon>
                      <Icon as={ChevronDownIcon} />
                    </SelectIcon>
                  </SelectTrigger>
                  <SelectPortal>
                    <SelectBackdrop />
                    <SelectContent>
                      <SelectDragIndicatorWrapper>
                        <SelectDragIndicator />
                      </SelectDragIndicatorWrapper>
                      {sites.map((site, index) => (
                        <SelectItem key={index} value={site.name} label={site.name}>
                          <Text>{site.name}</Text>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </SelectPortal>
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
              <Heading>Añadir Sitio</Heading>
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
