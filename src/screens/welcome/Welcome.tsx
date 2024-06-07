import React from 'react';
import {
    GluestackUIProvider,
    Text,
    Box,
    Center,
    Button,
    ButtonText,
    Image,
    Heading
} from '@gluestack-ui/themed';
import { config } from "@gluestack-ui/config";
const logoListMarket = require('../../../assets/logoListMarket2.png');

const Welcome = ({ navigation }: { navigation: any }) => {
    return (
        <GluestackUIProvider config={config} >
            <Box justifyContent="space-between" h='$full' w='$full' py='$10'>
                <Center>
                    <Image
                        size="2xl" $xs-borderRadius="$sm"
                        source={logoListMarket}
                        alt="Logo Unicauca"
                        mb="$12"
                        resizeMode='contain'
                        w='$full'
                        h='$96'
                    />
                    <Box>
                        <Heading bold size="2xl">
                            Bienvenido a ListMarket
                        </Heading>
                        <Text size="xl">
                            La mejor App para hacer tus listas de compras!
                        </Text>
                    </Box>
                </Center>
                <Button onPress={() => {
                    // navigation.navigate('Login')
                }}
                    size="md" mx='$5' variant="solid" bgColor='#00293F' action="primary" isDisabled={false} isFocusVisible={false} >
                    <ButtonText>Continuar</ButtonText>
                </Button>
            </Box>
        </GluestackUIProvider>
    )
}
export default Welcome;