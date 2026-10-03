import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button, GlassCard, Input } from '../../components';
import { useShifts } from '../../state/ShiftContext';
import { borderRadius, colors, layout, spacing } from '../../theme';

export default function CreateShiftScreen() {
  const router = useRouter();
  const { createShift, isActionLoading, error: apiError, clearError } = useShifts();

  // Initialize with sensible defaults for hospitality staff
  const today = new Date();
  const defaultDateStr = today.toISOString().split('T')[0];

  const [dateStr, setDateStr] = useState(defaultDateStr); // YYYY-MM-DD
  const [startTimeStr, setStartTimeStr] = useState('11:00'); // HH:MM
  const [endTimeStr, setEndTimeStr] = useState('18:00');   // HH:MM
  const [breakMinutesStr, setBreakMinutesStr] = useState('30');
  const [location, setLocation] = useState('Main Dining Room');
  const [notes, setNotes] = useState('');

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validate = (): { startIso: string; endIso: string; breakMinutes: number } | null => {
    const errors: Record<string, string> = {};

    // Validate Date format: YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr.trim())) {
      errors.date = 'Date must be formatted as YYYY-MM-DD.';
    }

    // Validate Start Time format: HH:MM
    if (!/^\d{1,2}:\d{2}$/.test(startTimeStr.trim())) {
      errors.startTime = 'Start time must be in HH:MM format (e.g. 09:00).';
    }

    // Validate End Time format: HH:MM
    if (!/^\d{1,2}:\d{2}$/.test(endTimeStr.trim())) {
      errors.endTime = 'End time must be in HH:MM format (e.g. 17:00).';
    }

    const breakMinutes = parseInt(breakMinutesStr, 10);
    if (isNaN(breakMinutes) || breakMinutes < 0) {
      errors.breakMinutes = 'Break duration must be a non-negative number.';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return null;
    }

    // Construct full ISO timestamps
    const [startH, startM] = startTimeStr.trim().split(':').map(Number);
    const [endH, endM] = endTimeStr.trim().split(':').map(Number);

    const startDate = new Date(`${dateStr.trim()}T00:00:00`);
    startDate.setHours(startH, startM, 0, 0);

    const endDate = new Date(`${dateStr.trim()}T00:00:00`);
    endDate.setHours(endH, endM, 0, 0);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      errors.date = 'Invalid date or time value provided.';
      setValidationErrors(errors);
      return null;
    }

    // Critical Requirement: End time must be after start time
    if (endDate.getTime() <= startDate.getTime()) {
      errors.endTime = 'End time must be after the start time.';
      setValidationErrors(errors);
      return null;
    }

    const totalDurationMinutes = (endDate.getTime() - startDate.getTime()) / (1000 * 60);
    if (breakMinutes >= totalDurationMinutes) {
      errors.breakMinutes = `Break (${breakMinutes}m) must be less than total shift duration (${Math.round(totalDurationMinutes)}m).`;
      setValidationErrors(errors);
      return null;
    }

    setValidationErrors({});
    return {
      startIso: startDate.toISOString(),
      endIso: endDate.toISOString(),
      breakMinutes,
    };
  };

  const handleCreate = async () => {
    clearError();
    const validated = validate();
    if (!validated) return;

    try {
      await createShift({
        scheduledStart: validated.startIso,
        scheduledEnd: validated.endIso,
        breakDurationMinutes: validated.breakMinutes,
        location: location.trim() || 'Floor Service',
        notes: notes.trim() || undefined,
      });

      router.back();
    } catch {
      // Error handled via ShiftContext state
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
              accessibilityRole="button"
              accessibilityLabel="Cancel and return"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.backButtonText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Add New Shift</Text>
            <View style={styles.headerSpacer} />
          </View>

          {Boolean(apiError) && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{apiError}</Text>
            </View>
          )}

          <GlassCard style={styles.card}>
            <Input
              label="Shift Date (YYYY-MM-DD)"
              value={dateStr}
              onChangeText={(val) => {
                setDateStr(val);
                if (validationErrors.date) {
                  setValidationErrors((prev) => ({ ...prev, date: undefined! }));
                }
              }}
              placeholder="2026-10-04"
              error={validationErrors.date}
              autoCapitalize="none"
            />

            <View style={styles.row}>
              <View style={styles.halfCol}>
                <Input
                  label="Start Time (24h)"
                  value={startTimeStr}
                  onChangeText={(val) => {
                    setStartTimeStr(val);
                    if (validationErrors.startTime) {
                      setValidationErrors((prev) => ({ ...prev, startTime: undefined! }));
                    }
                  }}
                  placeholder="09:00"
                  error={validationErrors.startTime}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.halfCol}>
                <Input
                  label="End Time (24h)"
                  value={endTimeStr}
                  onChangeText={(val) => {
                    setEndTimeStr(val);
                    if (validationErrors.endTime) {
                      setValidationErrors((prev) => ({ ...prev, endTime: undefined! }));
                    }
                  }}
                  placeholder="17:00"
                  error={validationErrors.endTime}
                  autoCapitalize="none"
                />
              </View>
            </View>

            <Input
              label="Break Duration (Minutes)"
              value={breakMinutesStr}
              onChangeText={(val) => {
                setBreakMinutesStr(val);
                if (validationErrors.breakMinutes) {
                  setValidationErrors((prev) => ({ ...prev, breakMinutes: undefined! }));
                }
              }}
              placeholder="30"
              keyboardType="number-pad"
              error={validationErrors.breakMinutes}
            />

            <Input
              label="Service Location / Section"
              value={location}
              onChangeText={setLocation}
              placeholder="e.g. Main Dining Room, Bar, Patio"
            />

            <Input
              label="Notes (Optional)"
              value={notes}
              onChangeText={setNotes}
              placeholder="e.g. Private event, lunch rush"
            />

            <Button
              title="Create Shift"
              onPress={handleCreate}
              loading={isActionLoading}
              disabled={isActionLoading}
              style={styles.submitButton}
            />
          </GlassCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  backButton: {
    minHeight: layout.minTouchTarget,
    justifyContent: 'center',
    paddingRight: spacing.sm,
  },
  backButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerSpacer: {
    width: 50,
  },
  card: {
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfCol: {
    flex: 1,
  },
  errorBanner: {
    backgroundColor: 'rgba(255, 69, 58, 0.1)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 58, 0.25)',
    marginBottom: spacing.md,
  },
  errorBannerText: {
    fontSize: 13,
    color: colors.danger,
    lineHeight: 18,
    fontWeight: '500',
  },
  submitButton: {
    marginTop: spacing.sm,
  },
});