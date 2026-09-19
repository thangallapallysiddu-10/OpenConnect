import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
  onBack: () => void;
};

export const RequestRJScreen = ({ onBack }: Props) => {
  const [userName, setUserName] = useState('');
  const [rjName, setRjName] = useState('');
  const [stationName, setStationName] = useState('');
  const [location, setLocation] = useState('');
  const [message, setMessage] = useState('');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Validation errors
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});

  const handleSubmit = () => {
    const newErrors: { [key: string]: boolean } = {};
    if (!userName.trim()) newErrors.userName = true;
    if (!rjName.trim()) newErrors.rjName = true;
    if (!stationName.trim()) newErrors.stationName = true;
    if (!location.trim()) newErrors.location = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    // Simulate server response
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1800);
  };

  const handleReset = () => {
    setUserName('');
    setRjName('');
    setStationName('');
    setLocation('');
    setMessage('');
    setIsSubmitted(false);
    onBack();
  };

  if (isSubmitted) {
    return (
      <LinearGradient colors={['#0C0C0C', '#1E0533']} style={styles.container}>
        <SafeAreaView style={styles.safe}>
          <View style={[styles.successContainer, { width: '100%', maxWidth: 550, marginLeft: 'auto', marginRight: 'auto', paddingHorizontal: 24 }]}>
            <View style={styles.successBadge}>
              <Text style={styles.successIcon}>🎉</Text>
            </View>
            
            <Text style={styles.successTitle}>Request Submitted!</Text>
            
            <Text style={styles.successSubtitle}>
              Your request has been successfully broadcast to our network. We are reviewing the details to connect with the RJ.
            </Text>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>REQUEST SUMMARY</Text>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Requested By</Text>
                <Text style={styles.summaryValue}>{userName}</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>RJ Name</Text>
                <Text style={styles.summaryValue}>{rjName}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Station / Frequency</Text>
                <Text style={styles.summaryValue}>{stationName}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Location</Text>
                <Text style={styles.summaryValue}>{location}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={handleReset} activeOpacity={0.85}>
              <LinearGradient
                colors={['#7B2FF7', '#F107A3']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />
              <Text style={styles.submitBtnText}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#0C0C0C', '#130C1C']} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          {/* Header */}
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.8}>
              <Text style={styles.backIcon}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.topBarTitle}>Request for RJ</Text>
            <View style={{ width: 38 }} />
          </View>

          <ScrollView 
  showsVerticalScrollIndicator={false} 
  contentContainerStyle={[styles.scrollContent, { paddingBottom: 140 }]}
  keyboardShouldPersistTaps="handled"
>
            <View style={{ width: '100%', maxWidth: 600, marginLeft: 'auto', marginRight: 'auto', paddingHorizontal: 16 }}>
              {/* Title & Description */}
              <View style={styles.introSection}>
              <Text style={styles.eyebrow}>BROADCAST REQUEST</Text>
              <Text style={styles.heading}>Invite an RJ</Text>
              <Text style={styles.sub}>
                Fill out the details below to request your favorite RJ or local voice artist to broadcast in your region.
              </Text>
            </View>

            {/* Form Fields */}
            <View style={styles.formContainer}>
              {/* Full Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>YOUR NAME *</Text>
                <TextInput
                  style={[styles.input, errors.userName && styles.inputError]}
                  placeholder="Enter your full name"
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  value={userName}
                  onChangeText={(val) => {
                    setUserName(val);
                    if (errors.userName) setErrors({ ...errors, userName: false });
                  }}
                />
                {errors.userName && <Text style={styles.errorText}>Your name is required</Text>}
              </View>

              {/* RJ Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>RJ NAME *</Text>
                <TextInput
                  style={[styles.input, errors.rjName && styles.inputError]}
                  placeholder="e.g. RJ Malishka, RJ Sayema"
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  value={rjName}
                  onChangeText={(val) => {
                    setRjName(val);
                    if (errors.rjName) setErrors({ ...errors, rjName: false });
                  }}
                />
                {errors.rjName && <Text style={styles.errorText}>RJ name is required</Text>}
              </View>

              {/* Station Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>STATION / FREQUENCY *</Text>
                <TextInput
                  style={[styles.input, errors.stationName && styles.inputError]}
                  placeholder="e.g. 98.3 FM Radio Mirchi"
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  value={stationName}
                  onChangeText={(val) => {
                    setStationName(val);
                    if (errors.stationName) setErrors({ ...errors, stationName: false });
                  }}
                />
                {errors.stationName && <Text style={styles.errorText}>Station name is required</Text>}
              </View>

              {/* Location */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>LOCATION *</Text>
                <TextInput
                  style={[styles.input, errors.location && styles.inputError]}
                  placeholder="e.g. Hyderabad, Telangana"
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  value={location}
                  onChangeText={(val) => {
                    setLocation(val);
                    if (errors.location) setErrors({ ...errors, location: false });
                  }}
                />
                {errors.location && <Text style={styles.errorText}>Location is required</Text>}
              </View>

              {/* Remarks/Message */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>MESSAGE / REMARKS</Text>
                <TextInput
                  style={[styles.input, styles.multilineInput]}
                  placeholder="Why would you like to request this RJ? Any special messages or topics you would like them to cover?"
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  value={message}
                  onChangeText={setMessage}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              {/* Submit Button */}
              <TouchableOpacity 
                style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]} 
                onPress={handleSubmit} 
                activeOpacity={0.85}
                disabled={isSubmitting}
              >
                {!isSubmitting && (
                  <LinearGradient
                    colors={['#F97316', '#EC4899']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFillObject}
                  />
                )}
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.submitBtnText}>Submit Request</Text>
                )}
              </TouchableOpacity>
            </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    color: '#fff',
    fontSize: 24,
    lineHeight: 28,
  },
  topBarTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  introSection: {
    marginBottom: 28,
  },
  eyebrow: {
    color: '#F97316',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 8,
  },
  heading: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 38,
    marginBottom: 10,
  },
  sub: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 13,
    lineHeight: 20,
  },
  formContainer: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: 12,
    color: '#fff',
    fontSize: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inputError: {
    borderColor: 'rgba(239, 68, 68, 0.5)',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  multilineInput: {
    height: 110,
    paddingTop: 14,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '500',
  },
  submitBtn: {
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginTop: 10,
    backgroundColor: '#333', // Fallback
  },
  submitBtnDisabled: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  // Success screen styles
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 140, 
  },
  successBadge: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    borderWidth: 2,
    borderColor: '#F97316',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successIcon: {
    fontSize: 40,
  },
  successTitle: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
  },
  successSubtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 32,
  },
  summaryCard: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.16)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 36,
  },
  summaryTitle: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  summaryLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
  },
  summaryValue: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});