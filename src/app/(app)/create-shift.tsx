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
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import {
  Button,
  CalendarPickerModal,
  GlassCard,
  Input,
  ScreenBackground,
  TimePickerModal,
} from '../../components';
import { useShifts } from '../../state/ShiftContext';
import { borderRadius, colors, layout, shadows, spacing } from '../../theme';
import { hapticFeedback } from '../../utils/haptics';

export default function CreateShiftScreen() {
  const router = useRouter();
  const { createShift, isActionLoading, error: apiError, clearError } = useShifts();

  // Initialize with sensible defaults for hospitality staff
  const today = new Date();
  const defaultDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const [dateStr, setDateStr] = useState(defaultDateStr); // YYYY-MM-DD
  const [startTimeStr, setStartTimeStr] = useState('11:00'); // HH:MM (24h)
  const [endTimeStr, setEndTimeStr] = useState('18:00');   // HH:MM (24h)
  const [breakMinutesStr, setBreakMinutesStr] = useState('30');
  const [location, setLocation] = useState('Main Dining Room');
  const [notes, setNotes] = useState('');

  // Interactive picker modals state
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isStartTimeOpen, setIsStartTimeOpen] = useState(false);
  const [isEndTimeOpen, setIsEndTimeOpen] = useState(false);

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Formatting helpers for friendly UI display
  const formatDisplayDate = (dStr: string) => {
    try {
      const parts = dStr.split('-').map(Number);
      if (parts.length === 3) {
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        return d.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      }
    } catch {
      // fallback
    }
    return dStr;
  };

  const formatDisplayTime = (tStr: string) => {
    try {
      const parts = tStr.split(':').map(Number);
      if (parts.length >= 2) {
        const h = parts[0];
        const m = parts[1];
        const isPm = h >= 12;
        const h12 = h % 12 === 0 ? 12 : h % 12;
        return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${isPm ? 'PM' : 'AM'}`;
      }
    } catch {
      // fallback
    }
    return tStr;
  };

  // Live shift duration calculation
  const getShiftDurationMetrics = () => {
    const [startH, startM] = startTimeStr.split(':').map(Number);
    const [endH, endM] = endTimeStr.split(':').map(Number);
    const breakM = parseInt(breakMinutesStr, 10) || 0;

    if (
      isNaN(startH) || isNaN(startM) ||
      isNaN(endH) || isNaN(endM)
    ) {
      return null;
    }

    const startTotal = startH * 60 + startM;
    const endTotal = endH * 60 + endM;
    const grossMinutes = endTotal - startTotal;

    if (grossMinutes <= 0) {
      return { isValid: false, message: 'End time must be after start time' };
    }

    const netMinutes = Math.max(0, grossMinutes - breakM);
    const grossHours = Math.floor(grossMinutes / 60);
    const grossRemMin = grossMinutes % 60;
    const netHours = Math.floor(netMinutes / 60);
    const netRemMin = netMinutes % 60;

    return {
      isValid: true,
      grossFormatted: `${grossHours}h ${grossRemMin > 0 ? `${grossRemMin}m` : ''}`.trim(),
      netFormatted: `${netHours}h ${netRemMin > 0 ? `${netRemMin}m` : ''}`.trim(),
      breakMinutes: breakM,
    };
  };

  const metrics = getShiftDurationMetrics();

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
      hapticFeedback.error();
      setValidationErrors(errors);
      return null;
    }

    // Build ISO timestamps using local date components
    const [startH, startM] = startTimeStr.split(':').map(Number);
    const [endH, endM] = endTimeStr.split(':').map(Number);

    const startDate = new Date(`${dateStr.trim()}T00:00:00`);
    startDate.setHours(startH, startM, 0, 0);

    const endDate = new Date(`${dateStr.trim()}T00:00:00`);
    endDate.setHours(endH, endM, 0, 0);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      errors.date = 'Invalid date or time value provided.';
      hapticFeedback.error();
      setValidationErrors(errors);
      return null;
    }

    // Critical Requirement: End time must be after start time
    if (endDate.getTime() <= startDate.getTime()) {
      errors.endTime = 'End time must be after the start time.';
      hapticFeedback.error();
      setValidationErrors(errors);
      return null;
    }

    const totalDurationMinutes = (endDate.getTime() - startDate.getTime()) / (1000 * 60);
    if (breakMinutes >= totalDurationMinutes) {
      errors.breakMinutes = `Break (${breakMinutes}m) must be less than total shift duration (${Math.round(totalDurationMinutes)}m).`;
      hapticFeedback.error();
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

      hapticFeedback.success();
      router.back();
    } catch {
      hapticFeedback.error();
    }
  };

  const handleCancel = () => {
    hapticFeedback.light();
    router.back();
  };

  const commonBreakPresets = [0, 15, 30, 45, 60];

  return (
    <ScreenBackground>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* iOS Header */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={handleCancel}
                style={styles.backButton}
                accessibilityRole="button"
                accessibilityLabel="Cancel and return"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.backButtonText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Add Shift</Text>
              <View style={styles.headerSpacer} />
            </View>

            {Boolean(apiError) && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{apiError}</Text>
              </View>
            )}

            <GlassCard variant="elevated" style={styles.card}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionHeader}>SHIFT SCHEDULE</Text>
              </View>

              {/* Shift Date Card Trigger */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>SHIFT DATE</Text>
                <TouchableOpacity
                  style={[
                    styles.pickerTriggerCard,
                    Boolean(validationErrors.date) && styles.pickerTriggerCardError,
                  ]}
                  onPress={() => {
                    hapticFeedback.light();
                    setIsCalendarOpen(true);
                  }}
                  activeOpacity={0.75}
                  accessibilityRole="button"
                  accessibilityLabel={`Shift date: ${formatDisplayDate(dateStr)}. Tap to change.`}
                >
                  <View style={styles.triggerIconContainer}>
                    <Text style={styles.triggerIcon}>📅</Text>
                  </View>
                  <View style={styles.triggerContent}>
                    <Text style={styles.triggerMainText}>{formatDisplayDate(dateStr)}</Text>
                    <Text style={styles.triggerSubText}>{dateStr}</Text>
                  </View>
                  <View style={styles.changeBadge}>
                    <Text style={styles.changeBadgeText}>Calendar ▾</Text>
                  </View>
                </TouchableOpacity>
                {Boolean(validationErrors.date) && (
                  <Text style={styles.fieldErrorText}>{validationErrors.date}</Text>
                )}
              </View>

              {/* Start & End Time Cards Triggers (Side by Side 24h Scrollers) */}
              <View style={styles.row}>
                {/* Start Time */}
                <View style={styles.halfCol}>
                  <Text style={styles.fieldLabel}>START TIME (24h)</Text>
                  <TouchableOpacity
                    style={[
                      styles.pickerTriggerCard,
                      Boolean(validationErrors.startTime) && styles.pickerTriggerCardError,
                    ]}
                    onPress={() => {
                      hapticFeedback.light();
                      setIsStartTimeOpen(true);
                    }}
                    activeOpacity={0.75}
                    accessibilityRole="button"
                    accessibilityLabel={`Start time: ${startTimeStr} (${formatDisplayTime(startTimeStr)}). Tap to select.`}
                  >
                    <View style={styles.triggerIconContainer}>
                      <Text style={styles.triggerIcon}>☀️</Text>
                    </View>
                    <View style={styles.triggerContent}>
                      <Text style={styles.triggerMainText}>{startTimeStr}</Text>
                      <Text style={styles.triggerSubText}>{formatDisplayTime(startTimeStr)}</Text>
                    </View>
                  </TouchableOpacity>
                  {Boolean(validationErrors.startTime) && (
                    <Text style={styles.fieldErrorText}>{validationErrors.startTime}</Text>
                  )}
                </View>

                {/* End Time */}
                <View style={styles.halfCol}>
                  <Text style={styles.fieldLabel}>END TIME (24h)</Text>
                  <TouchableOpacity
                    style={[
                      styles.pickerTriggerCard,
                      Boolean(validationErrors.endTime) && styles.pickerTriggerCardError,
                    ]}
                    onPress={() => {
                      hapticFeedback.light();
                      setIsEndTimeOpen(true);
                    }}
                    activeOpacity={0.75}
                    accessibilityRole="button"
                    accessibilityLabel={`End time: ${endTimeStr} (${formatDisplayTime(endTimeStr)}). Tap to select.`}
                  >
                    <View style={styles.triggerIconContainer}>
                      <Text style={styles.triggerIcon}>🌙</Text>
                    </View>
                    <View style={styles.triggerContent}>
                      <Text style={styles.triggerMainText}>{endTimeStr}</Text>
                      <Text style={styles.triggerSubText}>{formatDisplayTime(endTimeStr)}</Text>
                    </View>
                  </TouchableOpacity>
                  {Boolean(validationErrors.endTime) && (
                    <Text style={styles.fieldErrorText}>{validationErrors.endTime}</Text>
                  )}
                </View>
              </View>

              {/* Live Shift Duration Preview Callout */}
              {metrics && (
                <View
                  style={[
                    styles.durationCallout,
                    !metrics.isValid && styles.durationCalloutError,
                  ]}
                >
                  {metrics.isValid ? (
                    <Text style={styles.durationCalloutText}>
                      ⏱ Total Shift: <Text style={styles.durationBold}>{metrics.grossFormatted}</Text> • Paid Hours: <Text style={styles.durationBold}>{metrics.netFormatted}</Text>
                    </Text>
                  ) : (
                    <Text style={styles.durationCalloutErrorText}>
                      ⚠️ {metrics.message}
                    </Text>
                  )}
                </View>
              )}

              {/* Break Duration with Quick Presets */}
              <View style={styles.fieldContainer}>
                <View style={styles.breakHeaderRow}>
                  <Text style={styles.fieldLabel}>BREAK DURATION (MINUTES)</Text>
                </View>

                {/* Quick Chips */}
                <View style={styles.breakChipsRow}>
                  {commonBreakPresets.map((mins) => {
                    const isSelected = breakMinutesStr === String(mins);
                    return (
                      <TouchableOpacity
                        key={mins}
                        style={[
                          styles.breakChip,
                          isSelected && styles.breakChipActive,
                        ]}
                        onPress={() => {
                          hapticFeedback.selection();
                          setBreakMinutesStr(String(mins));
                          if (validationErrors.breakMinutes) {
                            setValidationErrors((prev) => ({ ...prev, breakMinutes: undefined! }));
                          }
                        }}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.breakChipText,
                            isSelected && styles.breakChipTextActive,
                          ]}
                        >
                          {mins === 0 ? 'No Break' : `${mins}m`}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Input for custom break minutes */}
                <Input
                  label=""
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
              </View>

              <View style={styles.divider} />
              <Text style={styles.sectionHeader}>LOCATION & NOTES</Text>

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

      {/* Calendar Picker Modal */}
      <CalendarPickerModal
        visible={isCalendarOpen}
        selectedDate={dateStr}
        onSelectDate={(newDate) => {
          setDateStr(newDate);
          if (validationErrors.date) {
            setValidationErrors((prev) => ({ ...prev, date: undefined! }));
          }
        }}
        onClose={() => setIsCalendarOpen(false)}
      />

      {/* Start Time Picker Modal (Side-by-side 24h & minutes scroller) */}
      <TimePickerModal
        visible={isStartTimeOpen}
        title="Select Start Time"
        selectedTime={startTimeStr}
        onSelectTime={(newTime) => {
          setStartTimeStr(newTime);
          if (validationErrors.startTime) {
            setValidationErrors((prev) => ({ ...prev, startTime: undefined! }));
          }
        }}
        onClose={() => setIsStartTimeOpen(false)}
      />

      {/* End Time Picker Modal (Side-by-side 24h & minutes scroller) */}
      <TimePickerModal
        visible={isEndTimeOpen}
        title="Select End Time"
        selectedTime={endTimeStr}
        onSelectTime={(newTime) => {
          setEndTimeStr(newTime);
          if (validationErrors.endTime) {
            setValidationErrors((prev) => ({ ...prev, endTime: undefined! }));
          }
        }}
        onClose={() => setIsEndTimeOpen(false)}
      />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
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
    paddingTop: spacing.xs,
  },
  backButton: {
    minHeight: layout.minTouchTarget,
    justifyContent: 'center',
    paddingRight: spacing.sm,
  },
  backButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  headerSpacer: {
    width: 50,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: colors.textTertiary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.separator,
    marginVertical: spacing.md,
  },
  card: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfCol: {
    flex: 1,
  },
  fieldContainer: {
    marginBottom: spacing.md,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  pickerTriggerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    minHeight: 58,
    ...shadows.card,
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        } as any)
      : {}),
  },
  pickerTriggerCardError: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerMuted,
  },
  triggerIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  triggerIcon: {
    fontSize: 18,
  },
  triggerContent: {
    flex: 1,
  },
  triggerMainText: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  triggerSubText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textTertiary,
    marginTop: 1,
  },
  changeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    backgroundColor: 'rgba(10, 132, 255, 0.08)',
  },
  changeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  fieldErrorText: {
    fontSize: 12,
    color: colors.danger,
    fontWeight: '600',
    marginTop: 4,
  },
  durationCallout: {
    backgroundColor: 'rgba(10, 132, 255, 0.07)',
    borderRadius: borderRadius.md,
    paddingVertical: spacing.xs + 3,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(10, 132, 255, 0.18)',
    marginTop: 4,
    marginBottom: spacing.md,
  },
  durationCalloutError: {
    backgroundColor: colors.dangerMuted,
    borderColor: colors.dangerBorder,
  },
  durationCalloutText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  durationCalloutErrorText: {
    fontSize: 12,
    color: colors.danger,
    fontWeight: '700',
    textAlign: 'center',
  },
  durationBold: {
    fontWeight: '800',
  },
  breakHeaderRow: {
    marginBottom: 4,
  },
  breakChipsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: spacing.xs + 2,
    flexWrap: 'wrap',
  },
  breakChip: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: borderRadius.pill,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  breakChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  breakChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  breakChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  errorBanner: {
    backgroundColor: colors.dangerMuted,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    marginBottom: spacing.md,
  },
  errorBannerText: {
    fontSize: 13,
    color: colors.danger,
    lineHeight: 18,
    fontWeight: '600',
  },
  submitButton: {
    marginTop: spacing.md,
  },
});
