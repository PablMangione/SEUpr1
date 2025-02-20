import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Accelerometer, Gyroscope, Magnetometer, Pedometer } from 'expo-sensors';
import * as Location from 'expo-location';
import * as Network from 'expo-network';

export default function App() {
  const [accelerometerData, setAccelerometerData] = useState({});
  const [gyroscopeData, setGyroscopeData] = useState({});
  const [magnetometerData, setMagnetometerData] = useState({});
  const [pedometerData, setPedometerData] = useState({ steps: 0 });
  const [location, setLocation] = useState(null);
  const [networkInfo, setNetworkInfo] = useState(null);

  // Subscripciones de sensores
  const [subscriptionAcc, setSubscriptionAcc] = useState(null);
  const [subscriptionGyro, setSubscriptionGyro] = useState(null);
  const [subscriptionMagnetometer, setSubscriptionMagnetometer] = useState(null);
  const [subscriptionPedometer, setSubscriptionPedometer] = useState(null);
  const [subscriptionLocation, setSubscriptionLocation] = useState(null);
  const [networkInterval, setNetworkInterval] = useState(null);

  // Acelerómetro
  const subscribeAccelerometer = () => {
    if (!subscriptionAcc) {
      const sub = Accelerometer.addListener(data => {
        setAccelerometerData(data);
      });
      setSubscriptionAcc(sub);
    }
  };

  const unsubscribeAccelerometer = () => {
    if (subscriptionAcc) {
      subscriptionAcc.remove();
      setSubscriptionAcc(null);
      setAccelerometerData({});
    }
  };

  // Giroscopio
  const subscribeGyroscope = () => {
    if (!subscriptionGyro) {
      const sub = Gyroscope.addListener(data => {
        setGyroscopeData(data);
      });
      setSubscriptionGyro(sub);
    }
  };

  const unsubscribeGyroscope = () => {
    if (subscriptionGyro) {
      subscriptionGyro.remove();
      setSubscriptionGyro(null);
      setGyroscopeData({});
    }
  };

  // Brújula (Magnetómetro)
  const subscribeMagnetometer = () => {
    if (!subscriptionMagnetometer) {
      const sub = Magnetometer.addListener(data => {
        setMagnetometerData(data);
      });
      setSubscriptionMagnetometer(sub);
    }
  };

  const unsubscribeMagnetometer = () => {
    if (subscriptionMagnetometer) {
      subscriptionMagnetometer.remove();
      setSubscriptionMagnetometer(null);
      setMagnetometerData({});
    }
  };

  // Podómetro
  const subscribePedometer = () => {
    if (!subscriptionPedometer) {
      const sub = Pedometer.watchStepCount(result => {
        setPedometerData(result);
      });
      setSubscriptionPedometer(sub);
    }
  };

  const unsubscribePedometer = () => {
    if (subscriptionPedometer) {
      subscriptionPedometer.remove();
      setSubscriptionPedometer(null);
      setPedometerData({ steps: 0 });
    }
  };

  // GPS (Ubicación)
  const subscribeGPS = async () => {
    if (!subscriptionLocation) {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const sub = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, timeInterval: 1000, distanceInterval: 1 },
          (loc) => {
            setLocation(loc);
          }
        );
        setSubscriptionLocation(sub);
      } else {
        console.log('Permiso para ubicación denegado');
      }
    }
  };

  const unsubscribeGPS = () => {
    if (subscriptionLocation) {
      subscriptionLocation.remove();
      setSubscriptionLocation(null);
      setLocation(null);
    }
  };

  // Cobertura (Estado de Red)
  const subscribeNetwork = () => {
    if (!networkInterval) {
      // Se actualiza la información de red cada 2 segundos
      const interval = setInterval(async () => {
        const info = await Network.getNetworkStateAsync();
        setNetworkInfo(info);
      }, 2000);
      setNetworkInterval(interval);
    }
  };

  const unsubscribeNetwork = () => {
    if (networkInterval) {
      clearInterval(networkInterval);
      setNetworkInterval(null);
      setNetworkInfo(null);
    }
  };

  // Función para calcular la orientación a partir de los datos del magnetómetro
  const getCompassHeading = () => {
    if (magnetometerData.x != null && magnetometerData.y != null) {
      let angle = Math.atan2(magnetometerData.y, magnetometerData.x) * (180 / Math.PI);
      if (angle < 0) angle += 360;
      return angle.toFixed(2);
    }
    return '0.00';
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Datos de Sensores</Text>

        {/* Acelerómetro */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Acelerómetro</Text>
          <Text style={styles.sensorData}>x: {accelerometerData.x?.toFixed(2)}</Text>
          <Text style={styles.sensorData}>y: {accelerometerData.y?.toFixed(2)}</Text>
          <Text style={styles.sensorData}>z: {accelerometerData.z?.toFixed(2)}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={subscribeAccelerometer} style={[styles.button, styles.buttonStart]}>
              <Text style={styles.buttonText}>Iniciar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={unsubscribeAccelerometer} style={[styles.button, styles.buttonStop]}>
              <Text style={styles.buttonText}>Detener</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Giroscopio */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Giroscopio</Text>
          <Text style={styles.sensorData}>x: {gyroscopeData.x?.toFixed(2)}</Text>
          <Text style={styles.sensorData}>y: {gyroscopeData.y?.toFixed(2)}</Text>
          <Text style={styles.sensorData}>z: {gyroscopeData.z?.toFixed(2)}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={subscribeGyroscope} style={[styles.button, styles.buttonStart]}>
              <Text style={styles.buttonText}>Iniciar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={unsubscribeGyroscope} style={[styles.button, styles.buttonStop]}>
              <Text style={styles.buttonText}>Detener</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Brújula */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Brújula</Text>
          <Text style={styles.sensorData}>Orientación: {getCompassHeading()}°</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={subscribeMagnetometer} style={[styles.button, styles.buttonStart]}>
              <Text style={styles.buttonText}>Iniciar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={unsubscribeMagnetometer} style={[styles.button, styles.buttonStop]}>
              <Text style={styles.buttonText}>Detener</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Podómetro */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Podómetro</Text>
          <Text style={styles.sensorData}>Pasos: {pedometerData.steps}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={subscribePedometer} style={[styles.button, styles.buttonStart]}>
              <Text style={styles.buttonText}>Iniciar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={unsubscribePedometer} style={[styles.button, styles.buttonStop]}>
              <Text style={styles.buttonText}>Detener</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* GPS */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>GPS</Text>
          {location ? (
            <>
              <Text style={styles.sensorData}>Latitud: {location.coords.latitude.toFixed(6)}</Text>
              <Text style={styles.sensorData}>Longitud: {location.coords.longitude.toFixed(6)}</Text>
            </>
          ) : (
            <Text style={styles.sensorData}>Ubicación no disponible</Text>
          )}
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={subscribeGPS} style={[styles.button, styles.buttonStart]}>
              <Text style={styles.buttonText}>Iniciar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={unsubscribeGPS} style={[styles.button, styles.buttonStop]}>
              <Text style={styles.buttonText}>Detener</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Detector de Iluminación */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Detector de Iluminación</Text>
          <Text style={styles.sensorData}>Sensor no implementado</Text>
        </View>

        {/* Cobertura (Estado de Red) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Cobertura (Estado de Red)</Text>
          {networkInfo ? (
            <>
              <Text style={styles.sensorData}>Conectado: {networkInfo.isConnected ? 'Sí' : 'No'}</Text>
              <Text style={styles.sensorData}>Tipo: {networkInfo.type}</Text>
            </>
          ) : (
            <Text style={styles.sensorData}>Información de red no disponible</Text>
          )}
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={subscribeNetwork} style={[styles.button, styles.buttonStart]}>
              <Text style={styles.buttonText}>Iniciar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={unsubscribeNetwork} style={[styles.button, styles.buttonStop]}>
              <Text style={styles.buttonText}>Detener</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F4F7',
  },
  container: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
    color: '#333',
  },
  card: {
    backgroundColor: '#FFF',
    width: '100%',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
    color: '#007AFF',
  },
  sensorData: {
    fontSize: 16,
    marginVertical: 2,
    color: '#555',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'space-around',
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  buttonStart: {
    backgroundColor: '#34C759',
  },
  buttonStop: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
