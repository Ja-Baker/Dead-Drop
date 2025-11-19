import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator();

function VaultsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>VAULTS</Text>
      <Text style={styles.subtext}>No vaults yet. Immortal?</Text>
    </View>
  );
}

function ExecutorsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>EXECUTORS</Text>
      <Text style={styles.subtext}>No executors assigned. Trust issues?</Text>
    </View>
  );
}

function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>SETTINGS</Text>
      <Text style={styles.subtext}>Configure your death</Text>
    </View>
  );
}

function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>PROFILE</Text>
      <Text style={styles.subtext}>You're still alive</Text>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Tab.Navigator
          screenOptions={{
            tabBarStyle: {
              backgroundColor: '#000000',
              borderTopColor: '#ffffff',
              borderTopWidth: 1,
            },
            tabBarActiveTintColor: '#ff0000',
            tabBarInactiveTintColor: '#ffffff',
            headerStyle: {
              backgroundColor: '#000000',
              borderBottomColor: '#ffffff',
              borderBottomWidth: 1,
            },
            headerTintColor: '#ffffff',
            headerTitleStyle: {
              fontFamily: 'Helvetica-Bold',
              fontSize: 18,
            },
          }}
        >
          <Tab.Screen 
            name="Vaults" 
            component={VaultsScreen}
            options={{ title: 'VAULTS' }}
          />
          <Tab.Screen 
            name="Executors" 
            component={ExecutorsScreen}
            options={{ title: 'EXECUTORS' }}
          />
          <Tab.Screen 
            name="Settings" 
            component={SettingsScreen}
            options={{ title: 'SETTINGS' }}
          />
          <Tab.Screen 
            name="Profile" 
            component={ProfileScreen}
            options={{ title: 'PROFILE' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  text: {
    color: '#ffffff',
    fontSize: 32,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 10,
  },
  subtext: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Arial',
    textAlign: 'center',
  },
});

