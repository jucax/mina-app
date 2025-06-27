import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
  Platform,
  Animated,
} from 'react-native';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

// Mock data for notifications
const notifications = [
  {
    id: '1',
    image: require('../../../assets/images/property1.png'),
    title: '¡Tienes un interesado en tu propiedad!',
    subtitle: 'Miguel de Mina esta interesado en vender tu propiedad, abre la notificación y ve que tiene para ofrecerte',
    time: 'Hoy',
  },
  {
    id: '2',
    image: require('../../../assets/images/property2.png'),
    title: '¡Alguien ha marcado tu propiedad como favorita!',
    subtitle: 'Natalia Aguilar agrego tu propiedad a su lista de favoritos. Podría contactarte pronto!',
    time: 'Hoy',
  },
  {
    id: '3',
    image: require('../../../assets/images/property3.png'),
    title: '!Tienes un mensaje!',
    subtitle: 'Miguel de Mina te ha mandado su propuesta de valor, abre el mensaje para ver que tiene para ofrecerte. Tu puedes ACEPTAR O RECHAZAR su propuesta',
    time: 'Ayer',
  },
  {
    id: '4',
    image: require('../../../assets/images/property4.png'),
    title: '!Tienes un mensaje!',
    subtitle: 'Miguel de Mina te ha mandado su propuesta de valor, abre el mensaje para ver que tiene para ofrecerte. Tu puedes ACEPTAR O RECHAZAR su propuesta',
    time: '3 días',
  },
  {
    id: '5',
    image: require('../../../assets/images/property5.png'),
    title: '¡Tienes un interesado en tu propiedad!',
    subtitle: 'Miguel de Mina esta interesado en vender tu propiedad, abre la notificación y ve que tiene para ofrecerte',
    time: '5 días',
  },
  {
    id: '6',
    image: require('../../../assets/images/property6.png'),
    title: '¡Tienes un interesado en tu propiedad!',
    subtitle: 'Miguel de Mina esta interesado en vender tu propiedad, abre la notificación y ve que tiene para ofrecerte',
    time: '1 semana',
  },
  {
    id: '7',
    image: require('../../../assets/images/property1.png'),
    title: '¡Tienes un interesado en tu propiedad!',
    subtitle: 'Miguel de Mina esta interesado en vender tu propiedad, abre la notificación y ve que tiene para ofrecerte',
    time: '1 mes',
  },
];

const NotificationsScreen = () => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleNotificationPress = (index: number) => {
    setSelectedIndex(index);
    // Navigate to proposal screen with the notification's data
    router.push({
      pathname: '/(general)/proposal',
      params: { notificationId: notifications[index].id },
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Notificaciones</Text>
        <Image
          source={require('../../../assets/images/logo_login_screen.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Notifications List */}
      <ScrollView style={styles.notificationsList}>
        {notifications.map((notification, index) => (
          <TouchableOpacity
            key={notification.id}
            onPress={() => handleNotificationPress(index)}
            style={[
              styles.notificationItem,
              selectedIndex === index && styles.notificationItemSelected,
            ]}
          >
            <Image
              source={notification.image}
              style={styles.notificationImage}
            />
            <View style={styles.notificationContent}>
              <View style={styles.notificationHeader}>
                <Text style={styles.notificationTitle} numberOfLines={2}>
                  {notification.title}
                </Text>
                <Text style={styles.notificationTime}>{notification.time}</Text>
              </View>
              <Text style={styles.notificationSubtitle} numberOfLines={3}>
                {notification.subtitle}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#144E7A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: height * 0.025,
    backgroundColor: '#144E7A',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: width * 0.075,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  logo: {
    height: height * 0.05,
  },
  notificationsList: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  notificationItemSelected: {
    backgroundColor: 'rgba(255, 167, 51, 0.15)',
    ...Platform.select({
      ios: {
        shadowColor: '#FFA733',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  notificationImage: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  notificationContent: {
    flex: 1,
    marginLeft: 16,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  notificationTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginRight: 8,
  },
  notificationTime: {
    fontSize: 14,
    color: '#666666',
  },
  notificationSubtitle: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
});

export default NotificationsScreen; 