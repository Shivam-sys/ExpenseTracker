import { TagIcon } from 'phosphor-react-native';
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { CATEGORY_NAME_MAX_LENGTH } from '../store/types';
import {
  CATEGORY_COLOR_PALETTE,
  COLOR_KEYS,
  ColorKey,
} from '../theme/categories';
import { RADIUS, Theme, font, hexToRgba } from '../theme/tokens';

interface Props {
  visible: boolean;
  /** current category labels, for the case-insensitive duplicate check */
  existingNames: string[];
  onCreate: (name: string, colorKey: ColorKey) => Promise<void>;
  onClose: () => void;
  theme: Theme;
}

/**
 * Centered "New Category" card over a dimmed backdrop. Name + colour only —
 * every user-created category gets the fixed tag icon (shown in the preview
 * pill). Duplicate names are blocked inline; nothing persists on cancel.
 */
export function NewCategoryModal({
  visible,
  existingNames,
  onCreate,
  onClose,
  theme,
}: Props) {
  const [name, setName] = useState('');
  const [colorKey, setColorKey] = useState<ColorKey>(COLOR_KEYS[0]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // reset per open, so a cancelled draft never leaks into the next one
  useEffect(() => {
    if (visible) {
      setName('');
      setColorKey(COLOR_KEYS[0]);
      setError(null);
      setSubmitting(false);
    }
  }, [visible]);

  const trimmed = name.trim();
  const duplicate =
    trimmed !== '' &&
    existingNames.some(n => n.toLowerCase() === trimmed.toLowerCase());
  const canAdd = trimmed !== '' && !duplicate && !submitting;
  const palette = CATEGORY_COLOR_PALETTE[colorKey];
  const inlineError = duplicate
    ? `You already have a category named ${trimmed}`
    : error;

  const submit = async () => {
    if (!canAdd) return;
    setSubmitting(true);
    setError(null);
    try {
      await onCreate(trimmed, colorKey);
    } catch {
      // DuplicateCategoryError from the server-side unique index — the local
      // list was stale, so mirror the client-side duplicate message
      setError(`You already have a category named ${trimmed}`);
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={[styles.backdrop, { backgroundColor: theme.overlayColor }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* tap outside the card dismisses without creating anything */}
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={[styles.card, { backgroundColor: theme.sheetBg }]}>
          <View style={styles.headerRow}>
            <Text style={[styles.title, { color: theme.text }]}>
              New Category
            </Text>
            <Pressable
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: theme.closeBtnBg }]}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Close">
              <Text style={[styles.closeX, { color: theme.textMuted5 }]}>✕</Text>
            </Pressable>
          </View>

          <TextInput
            value={name}
            onChangeText={setName}
            onSubmitEditing={submit}
            placeholder="Category name"
            placeholderTextColor={theme.textMuted45}
            autoFocus
            maxLength={CATEGORY_NAME_MAX_LENGTH}
            returnKeyType="done"
            style={[
              styles.input,
              {
                color: theme.text,
                backgroundColor: theme.inputBg,
                borderColor: theme.border,
              },
            ]}
          />

          {/* live preview pill — fixed tag icon, selected colour pair */}
          <View
            style={[
              styles.previewPill,
              {
                backgroundColor: theme.dark
                  ? hexToRgba(palette.accent, 0.24)
                  : palette.bg,
                borderColor: hexToRgba(palette.accent, 0.35),
              },
            ]}>
            <TagIcon size={16} color={palette.accent} weight="duotone" />
            <Text
              style={[styles.previewLabel, { color: theme.text }]}
              numberOfLines={1}>
              {trimmed || 'Category'}
            </Text>
          </View>

          <Text style={[styles.colorLabel, { color: theme.textMuted45 }]}>
            COLOR
          </Text>
          <View style={styles.swatchRow}>
            {COLOR_KEYS.map(key => {
              const selected = key === colorKey;
              const swatch = CATEGORY_COLOR_PALETTE[key];
              return (
                <Pressable
                  key={key}
                  onPress={() => setColorKey(key)}
                  style={styles.swatchHit}
                  accessibilityRole="button"
                  accessibilityLabel={swatch.label}
                  accessibilityState={{ selected }}>
                  <View
                    style={[
                      styles.swatchRing,
                      selected && { borderColor: swatch.accent },
                    ]}>
                    <View
                      style={[styles.swatchDot, { backgroundColor: swatch.accent }]}
                    />
                  </View>
                </Pressable>
              );
            })}
          </View>

          {inlineError != null && (
            <Text style={styles.errorText} numberOfLines={2}>
              {inlineError}
            </Text>
          )}

          <Pressable
            onPress={submit}
            disabled={!canAdd}
            accessibilityRole="button"
            accessibilityLabel="Add category"
            style={[
              styles.addBtn,
              { backgroundColor: canAdd ? palette.accent : theme.border },
            ]}>
            <Text
              style={[
                styles.addBtnText,
                { color: canAdd ? '#fff' : theme.textMuted45 },
              ]}>
              Add category
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  card: {
    alignSelf: 'stretch',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 32,
    elevation: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontFamily: font(700),
    letterSpacing: -0.2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeX: {
    fontSize: 14,
    fontFamily: font(500),
  },
  input: {
    borderWidth: 1.5,
    borderRadius: RADIUS.card,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: font(500),
  },
  previewPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1.5,
    paddingVertical: 7,
    paddingHorizontal: 14,
    marginTop: 14,
    maxWidth: '100%',
  },
  previewLabel: {
    fontSize: 13.5,
    fontFamily: font(500),
    flexShrink: 1,
  },
  colorLabel: {
    fontSize: 11.5,
    fontFamily: font(600),
    letterSpacing: 1.2,
    marginTop: 16,
    marginBottom: 4,
  },
  swatchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  swatchHit: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchRing: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  errorText: {
    fontSize: 12.5,
    fontFamily: font(500),
    color: '#c94a3f',
    marginTop: 10,
  },
  addBtn: {
    marginTop: 14,
    paddingVertical: 14,
    borderRadius: RADIUS.card,
    alignItems: 'center',
  },
  addBtnText: {
    fontSize: 16,
    fontFamily: font(600),
  },
});
