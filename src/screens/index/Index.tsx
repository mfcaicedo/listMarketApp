import React, { useState, useEffect, useRef } from 'react';
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
  CalendarDaysIcon,
  EditIcon,
  CheckIcon,
  TrashIcon,
  useToast,
  Toast,
  ToastTitle,
  ToastDescription,
} from '@gluestack-ui/themed';
import { config } from "@gluestack-ui/config";
import { Alert, TouchableOpacity, FlatList, View, } from 'react-native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { FIREBASE_DB } from '../../config/firebase';
import { collection, addDoc, getDocs, setDoc, doc, onSnapshot, deleteDoc, query, orderBy, limit } from 'firebase/firestore';
import { Product, ProductStatus, ShoppingList, Site } from '../../models/shopping.list.model';

const Index = ({ navigation }: { navigation: any }) => {
  const [items, setItems] = useState<Product[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisibleUpdate, setModalVisibleUpdate] = useState(false);
  const [newItem, setNewItem] = useState('');
  const [newItemId, setNewItemId] = useState('');
  const [selectedSite, setSelectedSite] = useState('');
  const [sites, setSites] = useState<Site[]>([]);
  const [siteModalVisible, setSiteModalVisible] = useState(false);
  const [newSiteName, setNewSiteName] = useState('');
  const [shoppingList, setShoppingList] = useState<ShoppingList[]>([]);
  const lastTapTimeRef = useRef(null);

  const getSites = async () => {

    onSnapshot(collection(FIREBASE_DB, 'sites'), (snapshot) => {
      const sitesList = snapshot.docs.map(doc => doc.data() as Site);
      setSites(sitesList);
    });

  };

  const getShoppingList = async () => {

    const shoppingListsQuery = query(
      collection(FIREBASE_DB, 'shoppingLists'),
      orderBy('createAt', 'desc'),
      limit(1)
    );

    onSnapshot(shoppingListsQuery, (snapshot) => {
      const shoppingList = snapshot.docs.map(doc => doc.data() as ShoppingList);
      setShoppingList(shoppingList);
    });

  }

  const addProductShoppingList = async () => {

    if (newItem && selectedSite) {
      //Agrego el producto 
      const newDocRef = doc(collection(FIREBASE_DB, 'products'));
      const productId = newDocRef.id;

      const product: Product = {
        id: productId,
        name: newItem.trim(),
        site: sites.find(site => site.name === selectedSite) as Site,
        status: ProductStatus.PENDING,
        createAt: new Date().toISOString()
      }

      await setDoc(newDocRef, product);

      //Agrego el producto a la lista de compras
      const querySnapshot = await getDocs(collection(FIREBASE_DB, 'shoppingLists'));
      const shoppingLists = querySnapshot.docs.map(doc => doc.data() as ShoppingList);

      const shoppingListId = shoppingLists[0].id;

      const shoppingListProducts = shoppingLists[0].products;
      shoppingListProducts.push(product);

      await setDoc(doc(FIREBASE_DB, 'shoppingLists', shoppingListId), { products: shoppingListProducts },
        { merge: true });

      setModalVisible(false);
      setNewItem('');
      setSelectedSite('');

    } else {
      Alert.alert('Error', 'Debe ingresar un nombre y un sitio.');
    }

  }

  const addSite = async () => {

    if (newSiteName) {

      const newDocRef = doc(collection(FIREBASE_DB, 'sites'));
      const siteId = newDocRef.id;

      const site: Site = {
        id: siteId,
        name: newSiteName.trim(),
        createAt: new Date().toISOString()
      }

      await setDoc(newDocRef, site);

      setSiteModalVisible(false);
      setNewSiteName('');

    } else {
      Alert.alert('Error', 'Debe ingresar un nombre para el sitio.');
    }

  };

  const handleTap = async (product: Product, shoppingList: ShoppingList, index: number) => {
    const now = new Date().getTime();
    const DOUBLE_TAP_DELAY = 300; // Adjust as needed for your use case (in milliseconds)

    if (now - lastTapTimeRef.current < DOUBLE_TAP_DELAY) {

      //consulta del producto y luego actualizo el estado
      product.status = product.status === ProductStatus.PENDING ? ProductStatus.BOUGHT : ProductStatus.PENDING;
      setDoc(doc(FIREBASE_DB, 'products', product.id), product, { merge: true });

      //actualizo la lista de compras
      const shoppingListProducts = shoppingList.products;
      shoppingListProducts[index] = product;

      setDoc(doc(FIREBASE_DB, 'shoppingLists', shoppingList.id), { products: shoppingListProducts },
        { merge: true });

    }

    lastTapTimeRef.current = now;
  };

  const updateProduct = async () => {

    //busco el producto y actualizo el nombre y el sitio si ha cambiado
    const product = shoppingList[0].products.find(product => product.id === newItemId);

    if (product) {
      product.name = newItem.trim();
      product.site = sites.find(site => site.name === selectedSite) as Site;
      await setDoc(doc(FIREBASE_DB, 'products', product.id), product, { merge: true });

      //actualizo la lista de compras
      const shoppingListProducts = shoppingList[0].products;
      const index = shoppingListProducts.findIndex(product => product.id === newItemId);
      shoppingListProducts[index] = product;

      await setDoc(doc(FIREBASE_DB, 'shoppingLists', shoppingList[0].id), { products: shoppingListProducts },
        { merge: true });

      setModalVisibleUpdate(false);
      setNewItem('');
      setNewItemId('');
      setSelectedSite('');
    } else {
      Alert.alert('Error', 'No se ha encontrado el producto a actualizar.');
    }

  }

  const handleDelete = async (product: Product, currentShoppingList: ShoppingList, index: number) => {

    //Solo se puede eliminar si el producto está pendiente de compra
    if (product.status === ProductStatus.PENDING) {

      try {
        await deleteDoc(doc(FIREBASE_DB, 'products', product.id));

        const shoppingListProducts = currentShoppingList.products.filter((_, i) => i !== index);
        await setDoc(doc(FIREBASE_DB, 'shoppingLists', currentShoppingList.id), { products: shoppingListProducts }, { merge: true });

      } catch (error) {
        console.error("Error eliminando el producto: ", error);
      }

    } else {
      Alert.alert('Error', 'Solo se puede eliminar productos pendientes de compra.');
    }

  };

  const cloneShoppingList = async () => {

    if (shoppingList.length > 0) {
      const currentShoppingList = shoppingList[0];

      // 1: Obtener la lista de compras
      const querySnapshot = await getDocs(collection(FIREBASE_DB, 'shoppingLists'));
      const shoppingLists = querySnapshot.docs.map(doc => doc.data() as ShoppingList);

      // 2: Crear el objeto con su nuevo ID y su nueva fecha
      const newShoppingListId = doc(collection(FIREBASE_DB, 'shoppingLists')).id;
      const clonedProducts = currentShoppingList.products.map(product => ({
        ...product,
        id: doc(collection(FIREBASE_DB, 'products')).id,
        createAt: new Date().toISOString(),
      }));

      const clonedShoppingList: ShoppingList = {
        ...currentShoppingList,
        id: newShoppingListId,
        products: clonedProducts,
        createAt: new Date().toISOString(),
      };

      // 3: Crear una nueva lista de compras con el objeto anterior en Firebase
      await setDoc(doc(FIREBASE_DB, 'shoppingLists', newShoppingListId), clonedShoppingList);

      Alert.alert('Éxito', 'La lista de compras ha sido clonada.');
    } else {
      Alert.alert('Error', 'No hay lista de compras para clonar.');
    }

  };

  useEffect(() => {

    getSites();
    getShoppingList();

  }, []);

  return (
    // <GluestackUIProvider config={config}>
    <GestureHandlerRootView>
      <Box p='$1.5'>
        <Heading>Tu lista de compras!</Heading>
      </Box>
      <HStack space="md" justifyContent='flex-end' pl='$1.5' pr='$1.5' mb='$2'>
        <Button variant="solid" bgColor='#00293F' action="primary" onPress={cloneShoppingList}>
          <ButtonText>Clonar Lista</ButtonText>
        </Button>
      </HStack>
      <ScrollView h="$full" w="$full" pl='$1.5' pr='$1.5'>
        <VStack flex={1} mb='$1.5'>
          <HStack space="xl" justifyContent='space-between' reversed={false}>
            <Text color='$black' bold>Nombre</Text>
            <Text color='$black' bold>Sitio</Text>
            <Text color='$black' bold>Acciones</Text>
          </HStack>
        </VStack>
        <VStack flex={1}>
          {shoppingList[0]?.products?.map((product, index) => (
            <Swipeable key={index} renderRightActions={() =>
              <Box w='$16' bg='$red500' justifyContent='center' alignItems='center' >
                <Icon as={TrashIcon} size="xl" color='$white' />
              </Box>
            }
              onSwipeableRightOpen={() => handleDelete(product, shoppingList[0], index)}>

              <TouchableOpacity key={index} onPress={() => handleTap(product, shoppingList[0], index)}>
                <Box bg={product.status === ProductStatus.BOUGHT ? '$blueGray300' : '$green200'} flexDirection='row'
                  justifyContent='space-between' py='$4' pl='$1' mb='$1.5' rounded='$md'>
                  <Box w='$40'>
                    <Text strikeThrough={product.status === ProductStatus.BOUGHT ? true : false}>
                      {product.name}
                    </Text>
                  </Box>
                  <Box w='$32'>
                    <Text strikeThrough={product.status === ProductStatus.BOUGHT ? true : false}>
                      {product.site.name}
                    </Text>
                  </Box>
                  <Box w='$16' alignItems='center'>
                    {product.status === ProductStatus.BOUGHT ? (
                      <Icon color='$green500' as={CheckIcon} size="xl" />
                    ) : (
                      <TouchableOpacity onPress={() => {
                        setModalVisibleUpdate(true)
                        setNewItem(product.name)
                        setNewItemId(product.id)
                        setSelectedSite(product.site.name)
                      }
                        // updateProduct(product, shoppingList[0], index)
                      }>
                        <Icon as={EditIcon} size="xl" />
                      </TouchableOpacity>
                    )}
                  </Box>
                </Box>
              </TouchableOpacity>
            </Swipeable>
          ))}
        </VStack>
      </ScrollView>
      <Box>
        <Button position='absolute' m='$1.5' right={1} bottom={1} size="xl" w='$16' h='$16' rounded='$full'
          variant="solid" bgColor='#00293F' action="primary" isDisabled={false} isFocusVisible={true}
          onPress={() => setModalVisible(true)} >
          <ButtonIcon as={AddIcon} />
        </Button>

        <Modal isOpen={modalVisible} onClose={() => setModalVisible(false)}>
          <ModalContent>
            <ModalHeader>
              <Heading>Crea tu nuevo producto</Heading>
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
              <Box mb='$1' justifyContent='space-between' flexDirection='row' >
                <Select w='$56' onValueChange={(value) => setSelectedSite(value)}>
                  <SelectTrigger variant="underlined" size="md" >
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
                <Button w='$10' h='$10' bgColor='#00293F' rounded='$full' variant="solid" action="primary" size='md' onPress={() => setSiteModalVisible(true)} mt={2}>
                  <ButtonIcon as={AddIcon} />
                </Button>
              </Box>
              <HStack space="md">
                <Button variant='solid' bgColor='#00293F' action='primary' flex={1}
                  onPress={addProductShoppingList} isDisabled={
                    newItem === '' || selectedSite === '' ? true : false

                  } >
                  <ButtonText>Guardar</ButtonText>
                </Button>
                <Button variant="outline" flex={1} action="secondary" onPress={() => {
                  setModalVisible(false)
                  setNewItem('')
                  setNewItemId('')
                  setSelectedSite('')
                }} >
                  <ButtonText>Cancelar</ButtonText>
                </Button>
              </HStack>
            </ModalBody>
          </ModalContent>
        </Modal>

        <Modal isOpen={modalVisibleUpdate} onClose={() => setModalVisibleUpdate(false)}>
          <ModalContent>
            <ModalHeader>
              <Heading>Actualiza el producto seleccionado</Heading>
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
              <Box mb='$1' justifyContent='space-between' flexDirection='row' >
                <Select w='$56' onValueChange={(value) => setSelectedSite(value)} initialLabel={selectedSite}>
                  <SelectTrigger variant="underlined" size="md" >
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
                <Button w='$10' h='$10' rounded='$full' variant="solid" action="primary" size='md' onPress={() => setSiteModalVisible(true)} mt={2}>
                  <ButtonIcon as={AddIcon} />
                </Button>
              </Box>
              <HStack space="md">
                <Button variant='solid' action='primary' bgColor='#00293F' onPress={() => updateProduct()} flex={1}>
                  <ButtonText>Guardar</ButtonText>
                </Button>
                <Button variant="outline" action="secondary" flex={1} onPress={() => {
                  setNewItem('')
                  setNewItemId('')
                  setSelectedSite('')
                  setModalVisibleUpdate(false)
                }} >
                  <ButtonText>Cancelar</ButtonText>
                </Button>
              </HStack>
            </ModalBody>
          </ModalContent>
        </Modal>

        <Modal isOpen={siteModalVisible} onClose={() => setSiteModalVisible(false)}>
          <ModalContent>
            <ModalHeader>
              <Heading>Crea un nuevo Sitio</Heading>
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
              <HStack space="md">
                <Button flex={1} variant='solid' bgColor='#00293F' action='primary' size='md' onPress={addSite} mb={3}
                  isDisabled={newSiteName === '' ? true : false}>
                  <ButtonText>Guardar</ButtonText>
                </Button>
                <Button flex={1} variant="outline" action="secondary" onPress={() => {
                  setNewSiteName('')
                  setSiteModalVisible(false)
                }}>
                  <ButtonText>Cancelar</ButtonText>
                </Button>
              </HStack>
            </ModalBody>
          </ModalContent>
        </Modal>
      </Box>
    </GestureHandlerRootView>
    // </GluestackUIProvider>
  );
};

export default Index;
