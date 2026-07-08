import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  useBottomSheetTimingConfigs,
} from '@gorhom/bottom-sheet';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { AmountDisplay } from '../components/AmountDisplay';
import { CategoryPills } from '../components/CategoryPills';
import { DateStepper } from '../components/DateStepper';
import { Keypad } from '../components/Keypad';
import { TrashIcon } from '../components/CategoryIcon';
import { useExpenses, DisplayExpense } from '../hooks/useExpenses';
import { useHaptics } from '../hooks/useHaptics';
import { useTheme } from '../theme/useTheme';
import {
  BRAND,
  BUILTIN_ICON_IDS,
  DELETE_RED,
  DURATIONS,
  EASE,
  RADIUS,
  font,
} from '../theme/tokens';
import { DATE_LABELS } from '../store/types';

export interface AddExpenseSheetHandle {
  presentAdd: () => void;
  presentEdit: (entry: DisplayExpense) => void;
}

const MAX_PAST_OFFSET = DATE_LABELS.length - 1; // Today … 2 days ago

function dateLabel(offset: number) {
  return DATE_LABELS[offset] ?? `${offset} days ago`;
}

export const AddExpenseSheet = forwardRef<AddExpenseSheetHandle>((_props, ref) => {
  const modalRef = useRef<BottomSheetModal>(null);
  const theme = useTheme();
  const haptic = useHaptics();
  const {
    categories,
    categoryById,
    currency,
    addExpense,
    updateExpense,
    deleteExpense,
    addCategory,
  } = useExpenses();

  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('coffee');
  const [dateOffset, setDateOffset] = useState(0);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorShown, setErrorShown] = useState(false);

  const doneScale = useSharedValue(1);
  const doneShakeX = useSharedValue(0);

  const timingConfig = useBottomSheetTimingConfigs({
    duration: DURATIONS.sheet,
    easing: EASE,
  });

  useImperativeHandle(ref, () => ({
    presentAdd: () => {
      setEditingId(null);
      setAmount('');
      setCategoryId('coffee');
      setDateOffset(0);
      setErrorShown(false);
      modalRef.current?.present();
    },
    presentEdit: (entry: DisplayExpense) => {
      setEditingId(entry.id);
      setAmount(String(entry.amount));
      setCategoryId(entry.categoryId as string);
      setDateOffset(entry.dayOffset);
      setErrorShown(false);
      modalRef.current?.present();
    },
  }));

  const parsedAmount = parseFloat(amount);
  const canAdd = !isNaN(parsedAmount) && parsedAmount > 0;
  const dotUsed = amount.includes('.');
  const currentCategory = categoryById(categoryId);
  const iconId = (BUILTIN_ICON_IDS as readonly string[]).includes(categoryId)
    ? categoryId
    : 'custom';

  const onKey = useCallback((ch: string) => {
    setAmount(prev => {
      if (ch === '⌫') return prev.slice(0, -1);
      if (ch === '.') return prev.includes('.') ? prev : prev + '.';
      const candidate = prev + ch;
      return /^\d{0,6}(\.\d{0,2})?$/.test(candidate) ? candidate : prev;
    });
  }, []);

  const close = useCallback(() => {
    modalRef.current?.dismiss();
  }, []);

  const onSelectCategory = useCallback(
    (id: string) => {
      haptic('light');
      setCategoryId(id);
    },
    [haptic],
  );

  const onAddCategory = useCallback(
    (label: string) => {
      const cat = addCategory(label);
      setCategoryId(cat.id as string);
    },
    [addCategory],
  );

  const runShake = useCallback(() => {
    haptic('medium');
    setErrorShown(true);
    doneShakeX.value = withSequence(
      withTiming(-6, { duration: 80, easing: EASE }),
      withTiming(6, { duration: 80, easing: EASE }),
      withTiming(-4, { duration: 80, easing: EASE }),
      withTiming(4, { duration: 80, easing: EASE }),
      withTiming(0, { duration: 80, easing: EASE }),
    );
  }, [doneShakeX, haptic]);

  const submit = useCallback(async () => {
    if (!canAdd || submitting) return;
    setErrorShown(false);
    setSubmitting(true);
    // success pulse plays while the "network" call is in flight
    doneScale.value = withSequence(
      withTiming(0.94, { duration: DURATIONS.bounce, easing: EASE }),
      withTiming(1, { duration: DURATIONS.bounce, easing: EASE }),
    );
    const draft = {
      label: currentCategory.label,
      categoryId,
      amount: parsedAmount,
      dayOffset: dateOffset,
    };
    try {
      if (editingId != null) {
        await updateExpense(editingId, draft);
      } else {
        await addExpense(draft);
      }
      haptic('success');
      setSubmitting(false);
      setAmount('');
      close();
    } catch {
      setSubmitting(false);
      runShake();
    }
  }, [
    canAdd,
    submitting,
    doneScale,
    currentCategory,
    categoryId,
    parsedAmount,
    dateOffset,
    editingId,
    updateExpense,
    addExpense,
    haptic,
    close,
    runShake,
  ]);

  const deleteFromSheet = useCallback(() => {
    if (editingId != null) {
      deleteExpense(editingId);
      close();
    }
  }, [editingId, deleteExpense, close]);

  const doneStyle = useAnimatedStyle(() => ({
    transform: [{ scale: doneScale.value }, { translateX: doneShakeX.value }],
  }));

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.35}
        pressBehavior="close"
      />
    ),
    [],
  );

  const isEditing = editingId != null;

  return (
    <BottomSheetModal
      ref={modalRef}
      enableDynamicSizing
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      animationConfigs={timingConfig}
      backgroundStyle={{ backgroundColor: theme.sheetBg, borderRadius: RADIUS.sheet }}
      handleIndicatorStyle={{ backgroundColor: theme.handleColor, width: 36, height: 4 }}>
      <BottomSheetView style={styles.content}>
        {/* Close + (editing) delete affordances */}
        <Pressable
          onPress={close}
          style={[styles.cornerBtn, styles.closeBtn, { backgroundColor: theme.closeBtnBg }]}
          hitSlop={8}>
          <Text style={[styles.closeX, { color: theme.textMuted5 }]}>✕</Text>
        </Pressable>
        {isEditing && (
          <Pressable
            onPress={deleteFromSheet}
            style={[styles.cornerBtn, styles.deleteBtn]}
            hitSlop={8}>
            <TrashIcon color={DELETE_RED} size={16} strokeWidth={2} />
          </Pressable>
        )}

        {isEditing && <Text style={styles.editingLabel}>Editing expense</Text>}

        <AmountDisplay
          amount={parsedAmount || 0}
          currency={currency}
          categoryColor={currentCategory.color}
          iconId={iconId}
          theme={theme}
        />

        <CategoryPills
          categories={categories}
          selectedId={categoryId}
          onSelect={onSelectCategory}
          onAddCategory={onAddCategory}
          theme={theme}
        />

        <DateStepper
          label={dateLabel(dateOffset)}
          canGoForward={dateOffset > 0}
          onForward={() => setDateOffset(o => Math.max(0, o - 1))}
          onBack={() => setDateOffset(o => Math.min(MAX_PAST_OFFSET, o + 1))}
          theme={theme}
        />

        <Keypad onKey={onKey} dotUsed={dotUsed} theme={theme} />

        <Pressable onPress={submit} disabled={!canAdd}>
          <Animated.View
            style={[
              styles.done,
              {
                backgroundColor: canAdd ? BRAND : theme.border,
              },
              doneStyle,
            ]}>
            <Text
              style={[
                styles.doneText,
                { color: canAdd ? '#fff' : theme.textMuted45 },
              ]}>
              Done
            </Text>
          </Animated.View>
        </Pressable>

        <Text
          style={[styles.errorText, { opacity: errorShown ? 1 : 0 }]}>
          Couldn’t save — check your connection and try again.
        </Text>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 22,
    paddingBottom: 30,
    paddingTop: 2,
  },
  cornerBtn: {
    position: 'absolute',
    top: 2,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  closeBtn: {
    right: 16,
  },
  deleteBtn: {
    left: 16,
    backgroundColor: 'rgba(201,74,63,.1)',
  },
  closeX: {
    fontSize: 16,
    fontFamily: font(500),
  },
  editingLabel: {
    textAlign: 'center',
    fontSize: 13,
    fontFamily: font(600),
    color: DELETE_RED,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  done: {
    marginTop: 14,
    paddingVertical: 15,
    borderRadius: RADIUS.card,
    alignItems: 'center',
  },
  doneText: {
    fontSize: 18,
    fontFamily: font(600),
  },
  errorText: {
    textAlign: 'center',
    fontSize: 12.5,
    fontFamily: font(500),
    color: DELETE_RED,
    marginTop: 8,
  },
});
