import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Welcome from '../screens/welcome/Welcome';
import { Button, ButtonIcon, ButtonText, GluestackUIProvider, MenuIcon, useTheme } from '@gluestack-ui/themed';
import { config } from '@gluestack-ui/config';

const Stack = createNativeStackNavigator();

const NavigationApp = () => {

    const CustomHeaderMenu = ({ navigation }: { navigation: any }) => {
        return (
            <GluestackUIProvider config={config} >
                <Button
                    pr='$8'
                    size="xl"
                    variant="link"
                    action="primary"
                    isDisabled={false}
                    isFocusVisible={false}
                    onPress={() => console.log('menu')}
                >
                    <ButtonIcon color='$white' as={MenuIcon} />
                </Button>
            </GluestackUIProvider>
        );
    };

    return (
        <NavigationContainer independent={true}>
            <Stack.Navigator initialRouteName='Welcome'>
                <Stack.Screen
                    name="Welcome"
                    component={Welcome}
                    options={{ title: '', headerShown: false }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );

};
export default NavigationApp;