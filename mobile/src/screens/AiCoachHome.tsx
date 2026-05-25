import { Link } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import type { AssistantMessageResponse, MealPlan, WorkoutPlan } from '../api';
import { ApiClientError, createApiClient } from '../api';
import { useAuth } from '../auth';
import { colors } from '../theme/colors';

type ChatRole = 'assistant' | 'user' | 'system';

type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  intent?: string;
  workoutPlan?: WorkoutPlan;
  mealPlan?: MealPlan;
};

const quickPrompts = [
  'Create a 25-minute lower body gym workout for today.',
  'Help me create a low-calorie lunch with chicken.',
  'Summarize my progress and suggest one next step.',
  'Draft a simple check-in I can share today.'
];

function initialMessage(): ChatMessage {
  return {
    id: 'welcome',
    role: 'assistant',
    text: 'Tell me what you want to do today. I can help plan workouts, suggest meals, summarize progress, or create a simple next step.'
  };
}

export function AiCoachHome() {
  const { isAuthenticated, isHydrated, token } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage()]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollViewRef = useRef<InstanceType<typeof ScrollView> | null>(null);

  const api = useMemo(() => createApiClient({ token: () => token }), [token]);

  async function sendPrompt(promptText: string): Promise<void> {
    const prompt = promptText.trim();
    if (!prompt || isSending) {
      return;
    }

    const sentAt = Date.now();
    const userMessage: ChatMessage = {
      id: `user-${sentAt}`,
      role: 'user',
      text: prompt
    };
    const pendingMessage: ChatMessage = {
      id: `pending-${sentAt}`,
      role: 'system',
      text: 'Thinking...'
    };

    setMessages((current) => [...current, userMessage, pendingMessage]);
    setInput('');
    setError(null);
    setIsSending(true);

    try {
      const response = await api.sendAssistantMessage(prompt);
      const assistantMessage = mapAssistantResponse(response);
      setMessages((current) => current.filter((message) => message.id !== pendingMessage.id).concat(assistantMessage));
    } catch (sendError) {
      const message =
        sendError instanceof ApiClientError
          ? sendError.message
          : sendError instanceof Error
            ? sendError.message
            : 'The AI coach is temporarily unavailable.';
      setError(message);
      setMessages((current) =>
        current.filter((item) => item.id !== pendingMessage.id).concat({
          id: `error-${Date.now()}`,
          role: 'assistant',
          text: `I could not complete that request. ${message}`
        })
      );
    } finally {
      setIsSending(false);
      requestAnimationFrame(() => scrollViewRef.current?.scrollToEnd({ animated: true }));
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboard}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>AI Coach</Text>
            <Text style={styles.headerTitle}>What can I help with?</Text>
          </View>
          {!isHydrated ? null : isAuthenticated ? (
            <View style={styles.authPill}>
              <Text style={styles.authPillText}>Signed in</Text>
            </View>
          ) : (
            <Link href="/sign-in" asChild>
              <Pressable style={styles.signInButton}>
                <Text style={styles.signInText}>Sign in</Text>
              </Pressable>
            </Link>
          )}
        </View>

        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.messages}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </ScrollView>

        <View style={styles.promptRail}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {quickPrompts.map((prompt) => (
              <Pressable
                disabled={isSending}
                key={prompt}
                onPress={() => {
                  void sendPrompt(prompt);
                }}
                style={styles.quickPrompt}
              >
                <Text style={styles.quickPromptText}>{prompt}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.composerWrap}>
          <TextInput
            editable={!isSending}
            multiline
            onChangeText={setInput}
            placeholder="Ask for a workout, meal, report, or next step..."
            placeholderTextColor="#9a897a"
            style={styles.input}
            value={input}
          />
          <Pressable
            disabled={!input.trim() || isSending}
            onPress={() => {
              void sendPrompt(input);
            }}
            style={({ pressed }: { pressed: boolean }) => [
              styles.sendButton,
              !input.trim() || isSending ? styles.sendButtonDisabled : null,
              pressed ? styles.pressed : null
            ]}
          >
            {isSending ? <ActivityIndicator color={colors.white} /> : <Text style={styles.sendText}>Send</Text>}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  return (
    <View style={[styles.messageRow, isUser ? styles.userRow : styles.assistantRow]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : isSystem ? styles.systemBubble : styles.assistantBubble]}>
        <Text style={[styles.messageText, isUser ? styles.userText : styles.assistantText]}>{message.text}</Text>
        {message.intent && !isUser ? <Text style={styles.intentText}>{message.intent}</Text> : null}
        {message.workoutPlan ? <WorkoutCard plan={message.workoutPlan} /> : null}
        {message.mealPlan ? <MealCard plan={message.mealPlan} /> : null}
      </View>
    </View>
  );
}

function WorkoutCard({ plan }: { plan: WorkoutPlan }) {
  return (
    <View style={styles.structuredCard}>
      <Text style={styles.cardKicker}>Workout</Text>
      <Text style={styles.cardTitle}>{plan.title}</Text>
      <Text style={styles.cardMeta}>
        {plan.focus} · {plan.estimatedTotalMin} min
      </Text>
      {plan.exercises.slice(0, 5).map((exercise, index) => (
        <View key={`${exercise.name}-${index}`} style={styles.listItem}>
          <Text style={styles.listIndex}>{index + 1}</Text>
          <View style={styles.listBody}>
            <Text style={styles.listTitle}>{exercise.name}</Text>
            <Text style={styles.listSubtext}>
              {exercise.durationMin} min · {exercise.reps}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function MealCard({ plan }: { plan: MealPlan }) {
  return (
    <View style={styles.structuredCard}>
      <Text style={styles.cardKicker}>Nutrition</Text>
      <Text style={styles.cardTitle}>{plan.title}</Text>
      <Text style={styles.cardMeta}>{plan.goal}</Text>
      {plan.options.slice(0, 3).map((meal) => (
        <View key={meal.name} style={styles.mealOption}>
          <Text style={styles.listTitle}>{meal.name}</Text>
          <Text style={styles.listSubtext}>
            {meal.calories} cal · {meal.proteinG}g protein · {meal.prepTimeMin} min
          </Text>
        </View>
      ))}
    </View>
  );
}

function mapAssistantResponse(response: AssistantMessageResponse): ChatMessage {
  return {
    id: `assistant-${Date.now()}`,
    role: 'assistant',
    text: response.reply || response.text || 'Here is what I found.',
    intent: response.intent,
    workoutPlan: response.workoutPlan,
    mealPlan: response.mealPlan
  };
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.linen
  },
  keyboard: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 18,
    paddingBottom: 12,
    paddingTop: 14
  },
  eyebrow: {
    color: colors.copper,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.8,
    textTransform: 'uppercase'
  },
  headerTitle: {
    marginTop: 4,
    color: colors.ink,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.8
  },
  authPill: {
    borderRadius: 999,
    backgroundColor: colors.ink,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  authPillText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '800'
  },
  signInButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.sand,
    backgroundColor: colors.paper,
    paddingHorizontal: 14,
    paddingVertical: 9
  },
  signInText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '800'
  },
  messages: {
    flexGrow: 1,
    gap: 12,
    paddingHorizontal: 14,
    paddingBottom: 16,
    paddingTop: 4
  },
  messageRow: {
    flexDirection: 'row'
  },
  userRow: {
    justifyContent: 'flex-end'
  },
  assistantRow: {
    justifyContent: 'flex-start'
  },
  bubble: {
    maxWidth: '88%',
    borderRadius: 24,
    padding: 14
  },
  userBubble: {
    backgroundColor: colors.ink,
    borderBottomRightRadius: 8
  },
  assistantBubble: {
    borderWidth: 1,
    borderColor: colors.sand,
    backgroundColor: colors.paper,
    borderBottomLeftRadius: 8
  },
  systemBubble: {
    borderWidth: 1,
    borderColor: colors.sand,
    backgroundColor: colors.cream
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22
  },
  userText: {
    color: colors.white
  },
  assistantText: {
    color: colors.ink
  },
  intentText: {
    marginTop: 10,
    color: colors.copper,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase'
  },
  promptRail: {
    paddingBottom: 8,
    paddingLeft: 14
  },
  quickPrompt: {
    maxWidth: 250,
    marginRight: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.sand,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  quickPromptText: {
    color: colors.coffee,
    fontSize: 13,
    fontWeight: '700'
  },
  errorText: {
    paddingHorizontal: 18,
    paddingBottom: 8,
    color: '#b42318',
    fontSize: 13,
    fontWeight: '700'
  },
  composerWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: colors.sand,
    backgroundColor: colors.paper,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 16 : 12
  },
  input: {
    flex: 1,
    maxHeight: 120,
    minHeight: 48,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.sand,
    backgroundColor: colors.white,
    color: colors.ink,
    fontSize: 16,
    lineHeight: 22,
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  sendButton: {
    minWidth: 72,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: colors.ink,
    paddingHorizontal: 16
  },
  sendButtonDisabled: {
    backgroundColor: '#ab9a8c'
  },
  pressed: {
    opacity: 0.8
  },
  sendText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '800'
  },
  structuredCard: {
    gap: 10,
    marginTop: 12,
    borderRadius: 20,
    backgroundColor: colors.cream,
    padding: 12
  },
  cardKicker: {
    color: colors.copper,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase'
  },
  cardTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '800'
  },
  cardMeta: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19
  },
  listItem: {
    flexDirection: 'row',
    gap: 10
  },
  listIndex: {
    width: 24,
    height: 24,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: colors.ink,
    color: colors.white,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 24,
    textAlign: 'center'
  },
  listBody: {
    flex: 1
  },
  listTitle: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '800'
  },
  listSubtext: {
    marginTop: 2,
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17
  },
  mealOption: {
    borderTopWidth: 1,
    borderTopColor: colors.sand,
    paddingTop: 10
  }
});
