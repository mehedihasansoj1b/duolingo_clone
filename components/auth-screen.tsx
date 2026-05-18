import { images } from "@/constants/images";
import { useSignIn, useSignUp, useSSO } from "@clerk/expo";
import { FontAwesome } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Link, router, Stack } from "expo-router";
import { styled } from "nativewind";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const StyledImage = styled(Image);

type AuthMode = "sign-up" | "sign-in";
type SocialProvider = "Google" | "Apple";
type OAuthStrategy = "oauth_google" | "oauth_apple";

type AuthScreenProps = {
  mode: AuthMode;
};

const isIos = process.env.EXPO_OS === "ios";
const redirectUrl = "duolingo://oauth-callback";

function isUnsupportedPasswordError(error: unknown) {
  if (
    typeof error !== "object" ||
    error === null ||
    !("message" in error) ||
    typeof error.message !== "string"
  ) {
    return false;
  }

  return error.message.includes("password is not a valid parameter");
}

export function AuthScreen({ mode }: AuthScreenProps) {
  const { signIn, fetchStatus: signInFetchStatus } = useSignIn();
  const { signUp, fetchStatus: signUpFetchStatus } = useSignUp();
  const { startSSOFlow } = useSSO();
  const [isVerificationVisible, setVerificationVisible] = useState(false);
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const isSignUp = mode === "sign-up";
  const isFetching =
    signInFetchStatus === "fetching" || signUpFetchStatus === "fetching";

  const handleSessionTask = (currentTask: any, authMode: AuthMode) => {
    if (!currentTask) {
      router.replace("/");
      return;
    }

    // Handle task-specific flows
    switch (currentTask) {
      case "require_email_verification":
      case "require_phone_verification":
        // Trigger verification modal for email or phone codes
        setVerificationVisible(true);
        break;
      case "require_mfa":
      case "continue_sign_up":
        // MFA or additional setup needed
        Alert.alert(
          "Additional verification required",
          `Please complete the ${currentTask} step to continue your registration.`,
        );
        setVerificationVisible(true);
        break;
      default:
        console.log(`${authMode} session task:`, currentTask);
        Alert.alert(
          "Authentication step required",
          "Please complete the required steps to continue.",
        );
    }
  };

  const finishAuth = async (
    resource: typeof signIn | typeof signUp,
    authMode: AuthMode,
  ) => {
    await resource.finalize({
      navigate: ({ session }) => {
        handleSessionTask(session?.currentTask ?? null, authMode);
      },
    });
  };

  const showError = (error: unknown) => {
    const message =
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      typeof error.message === "string"
        ? error.message
        : "Something went wrong. Please try again.";

    Alert.alert("Authentication error", message);
  };

  const handleEmailAuth = async () => {
    const normalizedEmail = emailAddress.trim();

    if (!normalizedEmail) {
      Alert.alert("Email required", "Enter your email address to continue.");
      return;
    }

    if (isSignUp && !password) {
      Alert.alert(
        "Password required",
        "Enter a password to create your account.",
      );
      return;
    }

    try {
      if (isSignUp) {
        const { error } = await signUp.password({
          emailAddress: normalizedEmail,
          password,
        });

        if (error) {
          if (!isUnsupportedPasswordError(error)) {
            showError(error);
            return;
          }

          await signUp.reset();

          const { error: emailCodeError } = await signUp.create({
            emailAddress: normalizedEmail,
          });

          if (emailCodeError) {
            showError(emailCodeError);
            return;
          }
        }

        await signUp.verifications.sendEmailCode();
      } else {
        const { error } = await signIn.create({
          identifier: normalizedEmail,
        });

        if (error) {
          showError(error);
          return;
        }

        await signIn.emailCode.sendCode({
          emailAddress: normalizedEmail,
        });
      }

      setVerificationVisible(true);
    } catch (error) {
      showError(error);
    }
  };

  const handleVerifyCode = async (code: string) => {
    try {
      if (isSignUp) {
        const { error } = await signUp.verifications.verifyEmailCode({ code });

        if (error) {
          showError(error);
          return false;
        }

        if (signUp.status === "complete") {
          await finishAuth(signUp, "sign-up");
          return true;
        }

        // If not complete, show verification incomplete message
        Alert.alert(
          "Verification incomplete",
          "We could not finish authentication with that code. Please try again.",
        );
        return false;
      } else {
        const { error } = await signIn.emailCode.verifyCode({ code });

        if (error) {
          showError(error);
          return false;
        }

        if (signIn.status === "complete") {
          await finishAuth(signIn, "sign-in");
          return true;
        }

        // If not complete, show verification incomplete message
        Alert.alert(
          "Verification incomplete",
          "We could not finish authentication with that code. Please try again.",
        );
        return false;
      }
    } catch (error) {
      showError(error);
      return false;
    }
  };

  const handleSocialAuth = async (provider: SocialProvider) => {
    const strategy: OAuthStrategy =
      provider === "Google" ? "oauth_google" : "oauth_apple";

    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy,
        redirectUrl,
      });

      if (createdSessionId) {
        await setActive?.({ session: createdSessionId });
        router.replace("/");
      }
    } catch (error) {
      showError(error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          className="h-11 w-11 items-start justify-center"
        >
          <FontAwesome name="angle-left" size={34} color="#001328" />
        </Pressable>

        <View className="pt-6">
          <Text
            adjustsFontSizeToFit
            minimumFontScale={0.74}
            numberOfLines={1}
            className="text-text-primary font-poppins-bold text-[30px] leading-[38px]"
          >
            {isSignUp ? "Create your account" : "Welcome back"}
          </Text>
          <Text
            adjustsFontSizeToFit
            minimumFontScale={0.72}
            numberOfLines={1}
            className="mt-3 text-text-secondary font-poppins text-[18px] leading-[26px]"
          >
            {isSignUp
              ? "Start your language journey today ✨"
              : "Continue your language journey today ✨"}
          </Text>
        </View>

        <View className="relative h-[190px] items-center justify-end overflow-hidden">
          <Text className="absolute left-[100px] top-[62px] text-[28px] text-[#ff8a00]">
            ✦
          </Text>
          <Text className="absolute right-[83px] top-[80px] text-[26px] text-[#6ea6ff]">
            ✦
          </Text>
          <Text className="absolute right-[100px] top-[124px] text-[30px] text-[#ffcf4d]">
            ✦
          </Text>
          <StyledImage
            source={images.mascotAuth}
            className="h-[194px] w-[246px]"
            contentFit="cover"
            contentPosition="top"
          />
        </View>

        <View className="-mt-1 gap-4">
          <View style={styles.inputBox}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              inputMode="email"
              keyboardType="email-address"
              onChangeText={setEmailAddress}
              placeholder="alex@gmail.com"
              placeholderTextColor="#727c9a"
              style={styles.input}
              value={emailAddress}
            />
          </View>

          {isSignUp ? (
            <View style={styles.inputBox}>
              <Text style={styles.inputLabel}>Password</Text>
              <View className="flex-row items-center">
                <TextInput
                  onChangeText={setPassword}
                  secureTextEntry={!isPasswordVisible}
                  placeholder="•••••••••"
                  placeholderTextColor="#727c9a"
                  style={[styles.input, styles.passwordInput]}
                  value={password}
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    isPasswordVisible ? "Hide password" : "Show password"
                  }
                  onPress={() => setPasswordVisible(!isPasswordVisible)}
                >
                  <FontAwesome
                    name={isPasswordVisible ? "eye-slash" : "eye"}
                    size={26}
                    color="#72809a"
                  />
                </Pressable>
              </View>
            </View>
          ) : null}

          <Pressable
            accessibilityRole="button"
            disabled={isFetching}
            onPress={handleEmailAuth}
            style={[styles.shadowButton, isFetching && styles.disabledButton]}
            className="h-[66px] items-center justify-center rounded-[15px] bg-lingua-purple"
          >
            <Text className="font-poppins-semibold text-[23px] leading-[30px] text-white">
              {isSignUp ? "Sign Up" : "Sign In"}
            </Text>
          </Pressable>
        </View>

        <View className="flex-row items-center gap-6 pt-5">
          <View className="h-px flex-1 bg-border" />
          <Text className="font-poppins text-[18px] leading-[26px] text-text-secondary">
            or continue with
          </Text>
          <View className="h-px flex-1 bg-border" />
        </View>

        <View className="gap-4">
          <SocialButton
            provider="Google"
            iconName="google"
            color="#4285f4"
            disabled={isFetching}
            onPress={() => handleSocialAuth("Google")}
          />
          <SocialButton
            provider="Apple"
            iconName="apple"
            color="#001328"
            disabled={isFetching}
            onPress={() => handleSocialAuth("Apple")}
          />
        </View>

        <View className="mt-auto flex-row items-center justify-center gap-1 pt-16">
          <Text className="font-poppins text-[17px] leading-[24px] text-text-secondary">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}
          </Text>
          <Link
            href={isSignUp ? "/sign-in" : "/sign-up"}
            className="font-poppins-semibold text-[17px] leading-[24px] text-lingua-purple"
          >
            {isSignUp ? "Log in" : "Sign up"}
          </Link>
        </View>
      </ScrollView>

      <VerificationModal
        visible={isVerificationVisible}
        onClose={() => setVerificationVisible(false)}
        onVerify={handleVerifyCode}
      />
      <View nativeID="clerk-captcha" />
    </SafeAreaView>
  );
}

function SocialButton({
  provider,
  iconName,
  color,
  disabled,
  onPress,
}: {
  provider: "Google" | "Apple";
  iconName: keyof typeof FontAwesome.glyphMap;
  color: string;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[styles.socialButton, disabled && styles.disabledButton]}
    >
      <View style={styles.socialIcon}>
        <FontAwesome name={iconName} size={30} color={color} />
      </View>
      <Text
        adjustsFontSizeToFit
        minimumFontScale={0.82}
        numberOfLines={1}
        style={styles.socialText}
      >
        Continue with {provider}
      </Text>
    </Pressable>
  );
}

function VerificationModal({
  visible,
  onClose,
  onVerify,
}: {
  visible: boolean;
  onClose: () => void;
  onVerify: (code: string) => Promise<boolean>;
}) {
  const [code, setCode] = useState("");
  const [isVerifying, setVerifying] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [visible]);

  const handleClose = () => {
    setCode("");
    onClose();
  };

  const handleChangeCode = async (value: string) => {
    const nextCode = value.replace(/\D/g, "").slice(0, 6);
    setCode(nextCode);

    if (nextCode.length === 6) {
      setVerifying(true);

      try {
        const didVerify = await onVerify(nextCode);

        if (didVerify) {
          handleClose();
        }
      } finally {
        setVerifying(false);
      }
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={isIos ? "padding" : "height"}
        style={styles.modalKeyboardView}
      >
        <Pressable style={styles.modalBackdrop} onPress={handleClose} />
        <View style={styles.modalCard}>
          <Text className="text-center font-poppins-bold text-[26px] leading-[34px] text-text-primary">
            Check your email
          </Text>
          <Text className="mt-3 text-center font-poppins text-[16px] leading-[24px] text-text-secondary">
            You have received an email. Enter the verification code to continue.
          </Text>

          <Pressable
            accessibilityRole="button"
            onPress={() => inputRef.current?.focus()}
            className="mt-7 flex-row justify-between gap-2"
          >
            {Array.from({ length: 6 }).map((_, index) => (
              <View key={index} style={styles.codeBox}>
                <Text style={styles.codeText}>{code[index] ?? ""}</Text>
              </View>
            ))}
          </Pressable>

          <TextInput
            ref={inputRef}
            value={code}
            onChangeText={handleChangeCode}
            editable={!isVerifying}
            keyboardType="number-pad"
            inputMode="numeric"
            maxLength={6}
            textContentType="oneTimeCode"
            style={styles.hiddenCodeInput}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 43,
    paddingTop: 12,
    paddingBottom: 42,
    gap: 20,
  },
  inputBox: {
    height: 82,
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#e8eaf1",
    borderRadius: 18,
    paddingHorizontal: 24,
    backgroundColor: "#fff",
  },
  inputLabel: {
    fontFamily: "Poppins-Medium",
    fontSize: 16,
    lineHeight: 23,
    color: "#727c9a",
  },
  input: {
    height: 42,
    padding: 0,
    fontFamily: "Poppins-Regular",
    fontSize: 19,
    lineHeight: 26,
    color: "#001328",
  },
  passwordInput: {
    flex: 1,
  },
  socialButton: {
    height: 62,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 14,
    borderWidth: 1.5,
    borderColor: "#e8eaf1",
    borderRadius: 12,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
  socialIcon: {
    width: 34,
    height: 34,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  socialText: {
    flexShrink: 1,
    fontFamily: "Poppins-Medium",
    fontSize: 20,
    lineHeight: 28,
    color: "#001328",
  },
  modalKeyboardView: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 19, 40, 0.38)",
  },
  modalCard: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 34,
    backgroundColor: "#fff",
  },
  codeBox: {
    flex: 1,
    aspectRatio: 0.82,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#e8eaf1",
    borderRadius: 14,
    backgroundColor: "#fff",
  },
  codeText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 24,
    lineHeight: 30,
    color: "#001328",
    fontVariant: ["tabular-nums"],
  },
  hiddenCodeInput: {
    position: "absolute",
    width: 1,
    height: 1,
    opacity: 0,
  },
  shadowButton: {
    shadowColor: "#4f35d9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 8,
  },
  disabledButton: {
    opacity: 0.55,
  },
});
