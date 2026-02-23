import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCurrencyStore, SUPPORTED_CURRENCIES, SupportedCurrency } from '../../store/currencyStore';

export default function CurrencySelector() {
  const [isOpen, setIsOpen] = useState(false);
  const { selectedCurrency, setCurrency } = useCurrencyStore();

  const currentCurrency = SUPPORTED_CURRENCIES[selectedCurrency];

  const getFlagEmoji = (countryCode: string): string => {
    if (countryCode === 'EU') return '🇪🇺';
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  const handleSelectCurrency = (currency: SupportedCurrency) => {
    setCurrency(currency);
    setIsOpen(false);
  };

  const renderCurrencyItem = ({ item }: { item: SupportedCurrency }) => {
    const currency = SUPPORTED_CURRENCIES[item];
    const isSelected = selectedCurrency === item;

    return (
      <TouchableOpacity
        style={[styles.currencyItem, isSelected && styles.currencyItemSelected]}
        onPress={() => handleSelectCurrency(item)}
      >
        <View style={styles.currencyItemLeft}>
          <Text style={styles.flag}>{getFlagEmoji(currency.flag)}</Text>
          <View style={styles.currencyInfo}>
            <Text style={styles.currencyCode}>{currency.code}</Text>
            <Text style={styles.currencyName}>{currency.name}</Text>
          </View>
        </View>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={24} color="#10B981" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <>
      <TouchableOpacity style={styles.button} onPress={() => setIsOpen(true)}>
        <Text style={styles.flag}>{getFlagEmoji(currentCurrency.flag)}</Text>
        <Text style={styles.buttonText}>{currentCurrency.code}</Text>
        <Ionicons name="chevron-down" size={16} color="#6B7280" />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choisir une devise</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={Object.keys(SUPPORTED_CURRENCIES) as SupportedCurrency[]}
              renderItem={renderCurrencyItem}
              keyExtractor={(item) => item}
              style={styles.list}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  flag: {
    fontSize: 20,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  list: {
    padding: 8,
  },
  currencyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 4,
  },
  currencyItemSelected: {
    backgroundColor: '#D1FAE5',
  },
  currencyItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  currencyInfo: {
    marginLeft: 12,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  currencyName: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
});
