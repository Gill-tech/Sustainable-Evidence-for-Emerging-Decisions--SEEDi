import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import Colors from "@/constants/colors";
import { getApiUrl } from "@/lib/query-client";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_QUESTIONS = [
  "What innovations help with drought resistance?",
  "Best practices for smallholder farmers in Africa?",
  "Which SDGs relate to sustainable agriculture?",
  "Recommend innovations for soil health improvement",
];

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <View
      style={[
        styles.messageBubble,
        isUser ? styles.userBubble : styles.assistantBubble,
      ]}
    >
      {!isUser && (
        <View style={styles.assistantIcon}>
          <Ionicons name="leaf" size={14} color={Colors.primary} />
        </View>
      )}
      <View
        style={[
          styles.messageContent,
          isUser ? styles.userContent : styles.assistantContent,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            isUser ? styles.userText : styles.assistantText,
          ]}
        >
          {message.content}
        </Text>
      </View>
    </View>
  );
}

export default function AIAssistant() {
  const [visible, setVisible] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const pulseScale = useSharedValue(1);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const startPulse = useCallback(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1,
      true
    );
  }, []);

  React.useEffect(() => {
    startPulse();
  }, [startPulse]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isStreaming) return;

    Keyboard.dismiss();
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsStreaming(true);

    const assistantId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "" },
    ]);

    try {
      const baseUrl = getApiUrl();
      const url = new URL("/api/ai/ask", baseUrl);

      const response = await fetch(url.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text.trim() }),
      });

      if (!response.ok) {
        throw new Error("AI request failed");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                fullText += data.content;
                const capturedText = fullText;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? { ...m, content: capturedText }
                      : m
                  )
                );
              }
              if (data.done) break;
              if (data.error) throw new Error(data.error);
            } catch (e) {}
          }
        }
      }
    } catch (error) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content:
                  "Sorry, I couldn't process that request. Please try again.",
              }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  const handleOpen = () => {
    setVisible(true);
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content:
            "Hello! I'm your SEEDi AI assistant. I can help you explore agricultural innovations, understand sustainability goals, and find the right solutions for your context. What would you like to know?",
        },
      ]);
    }
  };

  const renderItem = useCallback(
    ({ item }: { item: ChatMessage }) => <MessageBubble message={item} />,
    []
  );

  const webTopInset = Platform.OS === "web" ? 67 : 0;

  return (
    <>
      <Animated.View style={[styles.fabContainer, pulseStyle]}>
        <Pressable
          style={({ pressed }) => [styles.fab, pressed && { opacity: 0.9 }]}
          onPress={handleOpen}
          testID="ai-assistant-button"
        >
          <Ionicons name="chatbubble-ellipses" size={24} color="#fff" />
        </Pressable>
      </Animated.View>

      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
          <View
            style={[
              styles.modalHeader,
              { paddingTop: insets.top + webTopInset + 8 },
            ]}
          >
            <View style={styles.headerLeft}>
              <View style={styles.headerIconWrap}>
                <Ionicons name="leaf" size={18} color="#fff" />
              </View>
              <View>
                <Text style={styles.headerTitle}>SEEDi AI</Text>
                <Text style={styles.headerSub}>Agricultural Assistant</Text>
              </View>
            </View>
            <Pressable
              onPress={() => setVisible(false)}
              hitSlop={12}
              testID="close-assistant"
            >
              <Ionicons name="close" size={24} color={Colors.textSecondary} />
            </Pressable>
          </View>

          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.chatContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
            ListFooterComponent={
              isStreaming ? (
                <View style={styles.typingIndicator}>
                  <ActivityIndicator size="small" color={Colors.primary} />
                  <Text style={styles.typingText}>Thinking...</Text>
                </View>
              ) : null
            }
            ListHeaderComponent={
              messages.length <= 1 ? (
                <View style={styles.suggestionsWrap}>
                  <Text style={styles.suggestionsTitle}>Try asking:</Text>
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <Pressable
                      key={q}
                      style={({ pressed }) => [
                        styles.suggestionChip,
                        pressed && { opacity: 0.8, backgroundColor: Colors.primaryLight },
                      ]}
                      onPress={() => sendMessage(q)}
                    >
                      <Ionicons
                        name="sparkles"
                        size={14}
                        color={Colors.primary}
                      />
                      <Text style={styles.suggestionText}>{q}</Text>
                    </Pressable>
                  ))}
                </View>
              ) : null
            }
          />

          <View
            style={[
              styles.inputBar,
              { paddingBottom: Math.max(insets.bottom, 12) },
            ]}
          >
            <TextInput
              style={styles.textInput}
              placeholder="Ask about agricultural innovations..."
              placeholderTextColor={Colors.textMuted}
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={500}
              editable={!isStreaming}
              onSubmitEditing={() => sendMessage(input)}
              testID="ai-input"
            />
            <Pressable
              style={({ pressed }) => [
                styles.sendBtn,
                (!input.trim() || isStreaming) && styles.sendBtnDisabled,
                pressed && { opacity: 0.8 },
              ]}
              onPress={() => sendMessage(input)}
              disabled={!input.trim() || isStreaming}
              testID="ai-send"
            >
              <Ionicons
                name="send"
                size={18}
                color={
                  input.trim() && !isStreaming ? "#fff" : Colors.textMuted
                }
              />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: "absolute",
    bottom: 90,
    right: 20,
    zIndex: 100,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: "DMSans_700Bold",
    color: Colors.text,
  },
  headerSub: {
    fontSize: 12,
    fontFamily: "DMSans_400Regular",
    color: Colors.textSecondary,
  },
  chatContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageBubble: {
    flexDirection: "row",
    marginBottom: 12,
    gap: 8,
  },
  userBubble: {
    justifyContent: "flex-end",
  },
  assistantBubble: {
    justifyContent: "flex-start",
  },
  assistantIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  messageContent: {
    maxWidth: "78%",
    borderRadius: 16,
    padding: 12,
  },
  userContent: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  assistantContent: {
    backgroundColor: Colors.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "DMSans_400Regular",
  },
  userText: {
    color: "#fff",
  },
  assistantText: {
    color: Colors.text,
  },
  typingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingLeft: 36,
    paddingVertical: 4,
  },
  typingText: {
    fontSize: 13,
    fontFamily: "DMSans_400Regular",
    color: Colors.textMuted,
  },
  suggestionsWrap: {
    marginTop: 8,
    gap: 8,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontFamily: "DMSans_600SemiBold",
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  suggestionChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 12,
    padding: 12,
  },
  suggestionText: {
    fontSize: 13,
    fontFamily: "DMSans_500Medium",
    color: Colors.text,
    flex: 1,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: "DMSans_400Regular",
    color: Colors.text,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  sendBtnDisabled: {
    backgroundColor: Colors.borderLight,
  },
});
