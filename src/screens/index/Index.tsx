import React, { useState } from 'react';
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

} from '@gluestack-ui/themed';
import { config } from "@gluestack-ui/config";
import { Alert, TouchableOpacity } from 'react-native';

const Index = ({ navigation }: { navigation: any }) => {
    
    return (
        <GluestackUIProvider config={config}>
        <Box >
            <Heading size="md" >
                Lista Compras
            </Heading>
            <Box overflow="hidden">
                <Box bg="blue.600" >
                    <HStack justifyContent="space-between">
                        <Button>
                            <ButtonText color="white">+</ButtonText>
                        </Button>
                    </HStack>
                </Box>

            </Box>
        </Box>
    </GluestackUIProvider>


    );
};

export default Index;