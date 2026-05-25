import type { ReactNode } from 'react';
import { Pressable, type PressableProps, StyleSheet, Text } from 'react-native';
import { colors } from '../theme/colors';

type PrimaryButtonProps = PressableProps & {
  children: ReactNode;
  variant?: 'primary' | 'secondary';
};

export function PrimaryButton({ children, variant = 'primary', ...pressableProps }: PrimaryButtonProps) {
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      {...pressableProps}
      style={(state) => [
        styles.button,
        isPrimary ? styles.primary : styles.secondary,
        state.pressed ? styles.pressed : null,
        typeof pressableProps.style === 'function' ? pressableProps.style(state) : pressableProps.style
      ]}
    >
      <Text style={[styles.label, isPrimary ? styles.primaryLabel : styles.secondaryLabel]}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    paddingHorizontal: 20
  },
  primary: {
    backgroundColor: colors.ink
  },
  secondary: {
    borderWidth: 1,
    borderColor: colors.sand,
    backgroundColor: colors.paper
  },
  pressed: {
    opacity: 0.82
  },
  label: {
    fontSize: 16,
    fontWeight: '700'
  },
  primaryLabel: {
    color: colors.white
  },
  secondaryLabel: {
    color: colors.coffee
  }
});
