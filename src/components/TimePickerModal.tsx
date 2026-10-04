import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { borderRadius, colors, shadows, spacing } from '../theme';
import { hapticFeedback } from '../utils/haptics';

interface TimePickerModalProps {
  visible: boolean;
  title: string;
  selectedTime: string; // "HH:MM" (24-hour format)
  onSelectTime: (time24: string) => void;
  onClose: () => void;
}

const ITEM_HEIGHT = 46;
const VISIBLE_COUNT = 5;
const SCROLLER_HEIGHT = ITEM_HEIGHT * VISIBLE_COUNT; // 230px

export function TimePickerModal({
  visible,
  title,
  selectedTime,
  onSelectTime,
  onClose,
}: TimePickerModalProps) {
  // Parse HH:MM 24h format
  const parse24 = (tStr: string) => {
    const parts = (tStr || '11:00').split(':').map(Number);
    let h = 11;
    let m = 0;
    if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      h = Math.min(23, Math.max(0, parts[0]));
      m = Math.min(59, Math.max(0, parts[1]));
    }
    return { hour: h, minute: m };
  };

  const initial = parse24(selectedTime);
  const [selectedHour, setSelectedHour] = useState(initial.hour);
  const [selectedMinute, setSelectedMinute] = useState(initial.minute);

  const hourScrollRef = useRef<ScrollView>(null);
  const minuteScrollRef = useRef<ScrollView>(null);

  const hoursList = Array.from({ length: 24 }, (_, i) => i);
  const minutesList = Array.from({ length: 60 }, (_, i) => i);

  useEffect(() => {
    if (visible) {
      const parsed = parse24(selectedTime);
      setSelectedHour(parsed.hour);
      setSelectedMinute(parsed.minute);

      const timer = setTimeout(() => {
        hourScrollRef.current?.scrollTo({
          y: parsed.hour * ITEM_HEIGHT,
          animated: false,
        });
        minuteScrollRef.current?.scrollTo({
          y: parsed.minute * ITEM_HEIGHT,
          animated: false,
        });
      }, 120);

      return () => clearTimeout(timer);
    }
  }, [visible, selectedTime]);

  const handleHourPress = (h: number) => {
    hapticFeedback.selection();
    setSelectedHour(h);
    hourScrollRef.current?.scrollTo({
      y: h * ITEM_HEIGHT,
      animated: true,
    });
  };

  const handleMinutePress = (m: number) => {
    hapticFeedback.selection();
    setSelectedMinute(m);
    minuteScrollRef.current?.scrollTo({
      y: m * ITEM_HEIGHT,
      animated: true,
    });
  };

  const handleScrollEnd = (
    e: NativeSyntheticEvent<NativeScrollEvent>,
    type: 'hour' | 'minute'
  ) => {
    const y = e.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    if (type === 'hour') {
      const clamped = Math.max(0, Math.min(23, index));
      if (clamped !== selectedHour) {
        hapticFeedback.selection();
        setSelectedHour(clamped);
      }
    } else {
      const clamped = Math.max(0, Math.min(59, index));
      if (clamped !== selectedMinute) {
        hapticFeedback.selection();
        setSelectedMinute(clamped);
      }
    }
  };

  const handleConfirm = () => {
    hapticFeedback.success();
    const result24 = `${String(selectedHour).padStart(2, '0')}:${String(selectedMinute).padStart(2, '0')}`;
    onSelectTime(result24);
    onClose();
  };

  const time24Formatted = `${String(selectedHour).padStart(2, '0')}:${String(selectedMinute).padStart(2, '0')}`;

  // 12-hour companion label for hospitality staff clarity
  const isPm = selectedHour >= 12;
  const hour12 = selectedHour % 12 === 0 ? 12 : selectedHour % 12;
  const time12Formatted = `${String(hour12).padStart(2, '0')}:${String(selectedMinute).padStart(2, '0')} ${isPm ? 'PM' : 'AM'}`;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>{title}</Text>
              <View style={styles.timeDisplayRow}>
                <Text style={styles.headerTime24}>{time24Formatted}</Text>
                <View style={styles.badge12}>
                  <Text style={styles.badge12Text}>{time12Formatted}</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeIconBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.closeIconText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Scroller Column Headers */}
          <View style={styles.scrollerHeaderRow}>
            <View style={styles.columnHeaderBox}>
              <Text style={styles.columnHeaderLabel}>HOURS (24h)</Text>
            </View>
            <View style={styles.dividerSpacer} />
            <View style={styles.columnHeaderBox}>
              <Text style={styles.columnHeaderLabel}>MINUTES (00 - 59)</Text>
            </View>
          </View>

          {/* Dual Side-by-Side 24-Hour Scrollers */}
          <View style={styles.scrollersContainer}>
            {/* Center Row Highlight Glass Surface */}
            <View pointerEvents="none" style={styles.centerHighlightBand} />

            {/* Left Column: 24 Hours (00 - 23) */}
            <View style={styles.scrollerColumn}>
              <ScrollView
                ref={hourScrollRef}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled
                contentContainerStyle={styles.columnScrollContent}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                onMomentumScrollEnd={(e) => handleScrollEnd(e, 'hour')}
                onScrollEndDrag={(e) => handleScrollEnd(e, 'hour')}
              >
                {hoursList.map((h) => {
                  const isSelected = selectedHour === h;
                  return (
                    <TouchableOpacity
                      key={h}
                      style={[
                        styles.wheelItem,
                        isSelected && styles.wheelItemSelected,
                      ]}
                      onPress={() => handleHourPress(h)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.wheelItemText,
                          isSelected && styles.wheelItemTextSelected,
                        ]}
                      >
                        {String(h).padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Center Colon Separator */}
            <View style={styles.colonSeparator}>
              <Text style={styles.colonText}>:</Text>
            </View>

            {/* Right Column: 60 Minutes (00 - 59) */}
            <View style={styles.scrollerColumn}>
              <ScrollView
                ref={minuteScrollRef}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled
                contentContainerStyle={styles.columnScrollContent}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                onMomentumScrollEnd={(e) => handleScrollEnd(e, 'minute')}
                onScrollEndDrag={(e) => handleScrollEnd(e, 'minute')}
              >
                {minutesList.map((m) => {
                  const isSelected = selectedMinute === m;
                  return (
                    <TouchableOpacity
                      key={m}
                      style={[
                        styles.wheelItem,
                        isSelected && styles.wheelItemSelected,
                      ]}
                      onPress={() => handleMinutePress(m)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.wheelItemText,
                          isSelected && styles.wheelItemTextSelected,
                        ]}
                      >
                        {String(m).padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>

          {/* Quick Presets for Common Shifts */}
          <View style={styles.quickPresetRow}>
            {['09:00', '11:00', '16:00', '18:00', '23:00'].map((preset) => {
              const isCurrent = time24Formatted === preset;
              return (
                <TouchableOpacity
                  key={preset}
                  style={[
                    styles.quickPresetChip,
                    isCurrent && styles.quickPresetChipActive,
                  ]}
                  onPress={() => {
                    const parsed = parse24(preset);
                    handleHourPress(parsed.hour);
                    handleMinutePress(parsed.minute);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.quickPresetChipText,
                      isCurrent && styles.quickPresetChipTextActive,
                    ]}
                  >
                    {preset}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Actions */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmButtonText}>Set Time</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 360,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    ...shadows.card,
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 20px 45px rgba(15, 23, 42, 0.25)',
        } as any)
      : {}),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  timeDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    marginTop: 4,
  },
  headerTime24: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -0.5,
  },
  badge12: {
    backgroundColor: 'rgba(10, 132, 255, 0.10)',
    borderRadius: borderRadius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badge12Text: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  closeIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIconText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  scrollerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    paddingHorizontal: 8,
  },
  columnHeaderBox: {
    flex: 1,
    alignItems: 'center',
  },
  columnHeaderLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: colors.textTertiary,
  },
  dividerSpacer: {
    width: 24,
  },
  scrollersContainer: {
    height: SCROLLER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    position: 'relative',
    paddingHorizontal: spacing.xs,
  },
  centerHighlightBand: {
    position: 'absolute',
    top: (SCROLLER_HEIGHT - ITEM_HEIGHT) / 2,
    left: spacing.xs,
    right: spacing.xs,
    height: ITEM_HEIGHT,
    backgroundColor: 'rgba(10, 132, 255, 0.08)',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(10, 132, 255, 0.25)',
  },
  scrollerColumn: {
    flex: 1,
    height: SCROLLER_HEIGHT,
  },
  columnScrollContent: {
    paddingVertical: (SCROLLER_HEIGHT - ITEM_HEIGHT) / 2,
  },
  colonSeparator: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colonText: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
    marginTop: -2,
  },
  wheelItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  wheelItemSelected: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  wheelItemText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  wheelItemTextSelected: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  quickPresetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    gap: 4,
  },
  quickPresetChip: {
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: borderRadius.pill,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  quickPresetChipActive: {
    backgroundColor: colors.primary,
  },
  quickPresetChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  quickPresetChipTextActive: {
    color: '#FFFFFF',
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  cancelButton: {
    flex: 1,
    height: 44,
    borderRadius: borderRadius.lg,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  confirmButton: {
    flex: 1.5,
    height: 44,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 2,
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
