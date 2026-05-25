import { Link } from 'expo-router';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors } from '../theme/colors';

type SectionPlaceholderProps = {
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
};

export function SectionPlaceholder({ eyebrow, title, description, bullets }: SectionPlaceholderProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View>
          <Text style={styles.eyebrow}>{eyebrow}</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Coming next</Text>
          {bullets.map((bullet) => (
            <View key={bullet} style={styles.bullet}>
              <View style={styles.dot} />
              <Text style={styles.bulletText}>{bullet}</Text>
            </View>
          ))}
        </View>

        <Link href="/(tabs)" asChild>
          <PrimaryButton variant="secondary">Back to AI Coach</PrimaryButton>
        </Link>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.linen
  },
  content: {
    flexGrow: 1,
    gap: 22,
    padding: 20,
    paddingTop: 36,
    paddingBottom: 40
  },
  eyebrow: {
    color: colors.copper,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase'
  },
  title: {
    marginTop: 12,
    color: colors.ink,
    fontSize: 38,
    lineHeight: 42,
    fontWeight: '800',
    letterSpacing: -1.2
  },
  description: {
    marginTop: 12,
    color: colors.muted,
    fontSize: 16,
    lineHeight: 24
  },
  card: {
    gap: 14,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: colors.sand,
    backgroundColor: colors.paper,
    padding: 20
  },
  cardTitle: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '800'
  },
  bullet: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start'
  },
  dot: {
    marginTop: 8,
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: colors.copper
  },
  bulletText: {
    flex: 1,
    color: colors.coffee,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600'
  }
});
