import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function SupportPage() {
  const router = useRouter();

  const handleContactSupport = (method: string) => {
    switch (method) {
      case 'email':
        Linking.openURL('mailto:support@intershop.com');
        break;
      case 'phone':
        Linking.openURL('tel:+2250700000000');
        break;
      case 'whatsapp':
        Linking.openURL('https://wa.me/2250700000000');
        break;
      default:
        Alert.alert('Info', 'Fonctionnalité à venir');
    }
  };

  const faqItems = [
    {
      question: 'Comment passer une commande?',
      answer: 'Parcourez les produits, ajoutez-les au panier et suivez le processus de paiement.',
    },
    {
      question: 'Quels sont les modes de paiement acceptés?',
      answer: 'Nous acceptons Mobile Money, Orange Money, MTN Money et les cartes bancaires.',
    },
    {
      question: 'Comment suivre ma commande?',
      answer: 'Allez dans "Mes Commandes" pour voir le statut de toutes vos commandes.',
    },
    {
      question: 'Puis-je annuler ma commande?',
      answer: 'Oui, vous pouvez annuler une commande tant qu\'elle n\'a pas été expédiée.',
    },
    {
      question: 'Quelle est la politique de retour?',
      answer: 'Vous avez 14 jours pour retourner un produit non conforme.',
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Aide & Support</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content}>
        {/* Contact rapide */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contactez-nous</Text>
          
          <TouchableOpacity
            style={styles.contactCard}
            onPress={() => handleContactSupport('phone')}
          >
            <View style={styles.contactIcon}>
              <Ionicons name="call" size={24} color="#10B981" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Téléphone</Text>
              <Text style={styles.contactValue}>+225 07 00 00 00 00</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactCard}
            onPress={() => handleContactSupport('email')}
          >
            <View style={styles.contactIcon}>
              <Ionicons name="mail" size={24} color="#3B82F6" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Email</Text>
              <Text style={styles.contactValue}>support@intershop.com</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactCard}
            onPress={() => handleContactSupport('whatsapp')}
          >
            <View style={styles.contactIcon}>
              <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>WhatsApp</Text>
              <Text style={styles.contactValue}>Chat en direct</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* FAQ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Questions fréquentes</Text>
          
          {faqItems.map((item, index) => (
            <View key={index} style={styles.faqItem}>
              <View style={styles.faqQuestion}>
                <Ionicons name="help-circle" size={20} color="#FBBF24" />
                <Text style={styles.faqQuestionText}>{item.question}</Text>
              </View>
              <Text style={styles.faqAnswer}>{item.answer}</Text>
            </View>
          ))}
        </View>

        {/* Ressources */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ressources</Text>
          
          <TouchableOpacity style={styles.resourceItem}>
            <Ionicons name="book" size={24} color="#6B7280" />
            <Text style={styles.resourceText}>Guide d'utilisation</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.resourceItem}>
            <Ionicons name="document-text" size={24} color="#6B7280" />
            <Text style={styles.resourceText}>Conditions générales</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.resourceItem}>
            <Ionicons name="shield" size={24} color="#6B7280" />
            <Text style={styles.resourceText}>Politique de confidentialité</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Horaires */}
        <View style={styles.infoCard}>
          <Ionicons name="time" size={24} color="#10B981" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Horaires d'ouverture</Text>
            <Text style={styles.infoText}>Lundi - Vendredi: 8h - 18h</Text>
            <Text style={styles.infoText}>Samedi: 9h - 13h</Text>
            <Text style={styles.infoText}>Dimanche: Fermé</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: 'white',
    marginTop: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  faqItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  faqQuestionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 12,
    flex: 1,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginLeft: 32,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  resourceText: {
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 16,
    flex: 1,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#D1FAE5',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 32,
    padding: 20,
    borderRadius: 16,
  },
  infoContent: {
    marginLeft: 16,
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#065F46',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#047857',
    lineHeight: 20,
  },
});
