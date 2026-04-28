import * as React from "react";
import ClipboardModule from "react-native/Libraries/Components/Clipboard/Clipboard";

import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { useLockIn } from "@/src/context/LockInContext";
import {
  generateLockInPassword,
  isValidLockInPassword,
  maskLockInPassword,
} from "@/src/utils/lock-in";

const Clipboard = ClipboardModule as unknown as {
  setString: (content: string) => void;
};

function LoadingState() {
  return (
    <View
      style={{
        alignItems: "center",
        flex: 1,
        gap: 12,
        justifyContent: "center",
        padding: 24,
      }}
    >
      <ActivityIndicator color="#6b7280" size="large" />
      <Text style={{ color: "#6b7280", fontSize: 14 }}>
        Loading LockIn settings...
      </Text>
    </View>
  );
}

function SectionCard({ children }: React.PropsWithChildren) {
  return (
    <View
      style={{
        backgroundColor: "#ffffff",
        borderColor: "#e5e7eb",
        borderCurve: "continuous",
        borderRadius: 20,
        borderWidth: 1,
        gap: 14,
        padding: 18,
      }}
    >
      {children}
    </View>
  );
}

function SectionTitle({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <View style={{ gap: 6 }}>
      <Text
        style={{
          color: "#111827",
          fontSize: 18,
          fontWeight: "700",
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          color: "#4b5563",
          fontSize: 14,
          lineHeight: 22,
        }}
      >
        {description}
      </Text>
    </View>
  );
}

function PasswordField({
  value,
  onChangeText,
  onCopy,
  copyLabel,
  onGenerate,
}: {
  value: string;
  onChangeText: (value: string) => void;
  onCopy: () => void;
  copyLabel: string;
  onGenerate: () => void;
}) {
  return (
    <View style={{ gap: 10 }}>
      <Text
        style={{
          color: "#374151",
          fontSize: 13,
          fontWeight: "600",
        }}
      >
        12-character password
      </Text>
      <View
        style={{
          gap: 10,
        }}
      >
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={onChangeText}
          placeholder="Enter 12 characters"
          placeholderTextColor="#9ca3af"
          secureTextEntry
          style={{
            backgroundColor: "#f9fafb",
            borderColor: "#d1d5db",
            borderCurve: "continuous",
            borderRadius: 16,
            borderWidth: 1,
            color: "#111827",
            flex: 1,
            fontSize: 16,
            paddingHorizontal: 14,
            paddingVertical: 14,
          }}
          value={value}
        />
        <View
          style={{
            flexDirection: "row",
            gap: 10,
          }}
        >
          <Pressable
            accessibilityRole="button"
            disabled={!value}
            onPress={onCopy}
            style={({ pressed }) => ({
              alignItems: "center",
              backgroundColor: value ? "#e5e7eb" : "#f3f4f6",
              borderCurve: "continuous",
              borderRadius: 16,
              flex: 1,
              justifyContent: "center",
              minHeight: 48,
              opacity: pressed ? 0.85 : 1,
              paddingHorizontal: 16,
            })}
          >
            <Text
              style={{
                color: value ? "#111827" : "#9ca3af",
                fontSize: 14,
                fontWeight: "600",
              }}
            >
              {copyLabel}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={onGenerate}
            style={({ pressed }) => ({
              alignItems: "center",
              backgroundColor: "#111827",
              borderCurve: "continuous",
              borderRadius: 16,
              flex: 1,
              justifyContent: "center",
              minHeight: 48,
              opacity: pressed ? 0.85 : 1,
              paddingHorizontal: 16,
            })}
          >
            <Text
              style={{
                color: "#f9fafb",
                fontSize: 14,
                fontWeight: "600",
              }}
            >
              Generate
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function PrimaryButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        alignItems: "center",
        backgroundColor: "#111827",
        borderCurve: "continuous",
        borderRadius: 18,
        justifyContent: "center",
        minHeight: 54,
        opacity: pressed ? 0.85 : 1,
        paddingHorizontal: 18,
      })}
    >
      <Text
        style={{
          color: "#f9fafb",
          fontSize: 15,
          fontWeight: "600",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default function LockInScreen() {
  const {
    password,
    isHydrated,
    isLockConfigured,
    isUnlocked,
    enablePasswordLock,
    relock,
    removeLock,
    replacePassword,
    unlockWithPassword,
  } = useLockIn();
  const [setupPassword, setSetupPassword] = React.useState("");
  const [unlockPassword, setUnlockPassword] = React.useState("");
  const [nextPassword, setNextPassword] = React.useState("");
  const [setupError, setSetupError] = React.useState<string | null>(null);
  const [unlockError, setUnlockError] = React.useState<string | null>(null);
  const [replaceError, setReplaceError] = React.useState<string | null>(null);
  const [setupCopyLabel, setSetupCopyLabel] = React.useState("Copy");
  const [nextCopyLabel, setNextCopyLabel] = React.useState("Copy");

  function validatePasswordInput(value: string) {
    return isValidLockInPassword(value)
      ? null
      : "Password must be 12 characters with uppercase, lowercase, and a number.";
  }

  function handleCopyPassword(
    value: string,
    setCopyLabel: React.Dispatch<React.SetStateAction<string>>,
  ) {
    if (!value) {
      return;
    }

    Clipboard.setString(value);
    setCopyLabel("Copied");
  }

  function handleGenerateSetupPassword() {
    setSetupPassword(generateLockInPassword());
    setSetupCopyLabel("Copy");
    setSetupError(null);
  }

  function handleGenerateNextPassword() {
    setNextPassword(generateLockInPassword());
    setNextCopyLabel("Copy");
    setReplaceError(null);
  }

  function handleEnableLock() {
    const validationError = validatePasswordInput(setupPassword);

    if (validationError) {
      setSetupError(validationError);
      return;
    }

    const didEnable = enablePasswordLock(setupPassword);

    if (!didEnable) {
      setSetupError("LockIn is already configured.");
      return;
    }

    setSetupError(null);
    setSetupPassword("");
  }

  function handleUnlock() {
    const validationError = validatePasswordInput(unlockPassword);

    if (validationError) {
      setUnlockError(validationError);
      return;
    }

    const didUnlock = unlockWithPassword(unlockPassword);

    if (!didUnlock) {
      setUnlockError("Incorrect password.");
      return;
    }

    setUnlockError(null);
    setUnlockPassword("");
  }

  function handleReplacePassword() {
    const validationError = validatePasswordInput(nextPassword);

    if (validationError) {
      setReplaceError(validationError);
      return;
    }

    const didReplace = replacePassword(nextPassword);

    if (!didReplace) {
      setReplaceError("Unlock LockIn before changing the password.");
      return;
    }

    setReplaceError(null);
    setNextPassword("");
  }

  function handleRemoveLock() {
    const didRemove = removeLock();

    if (!didRemove) {
      setReplaceError("Unlock LockIn before removing the password lock.");
      return;
    }

    setReplaceError(null);
    setNextPassword("");
  }

  if (!isHydrated) {
    return <LoadingState />;
  }

  return (
    <ScrollView
      contentContainerStyle={{
        gap: 16,
        padding: 20,
      }}
      contentInsetAdjustmentBehavior="automatic"
    >
      <View style={{ gap: 8 }}>
        <Text
          style={{
            color: "#111827",
            fontSize: 22,
            fontWeight: "700",
          }}
        >
          LockIn
        </Text>
        <Text
          style={{
            color: "#4b5563",
            fontSize: 14,
            lineHeight: 22,
          }}
        >
          Lock enabled filters behind a password so they cannot be switched off
          without unlocking first.
        </Text>
      </View>

      {!isLockConfigured ? (
        <SectionCard>
          <SectionTitle
            description="Set a 12-character password with uppercase, lowercase, and numbers, send it to someone you trust, then delete your copy if you want the extra friction."
            title="Password lock"
          />
          <PasswordField
            onChangeText={(value) => {
              setSetupPassword(value);
              setSetupCopyLabel("Copy");
              setSetupError(null);
            }}
            onCopy={() => handleCopyPassword(setupPassword, setSetupCopyLabel)}
            copyLabel={setupCopyLabel}
            onGenerate={handleGenerateSetupPassword}
            value={setupPassword}
          />
          {setupError ? (
            <Text selectable style={{ color: "#b91c1c", fontSize: 13 }}>
              {setupError}
            </Text>
          ) : null}
          <PrimaryButton label="Enable Lock" onPress={handleEnableLock} />
        </SectionCard>
      ) : null}

      {isLockConfigured && !isUnlocked ? (
        <SectionCard>
          <SectionTitle
            description="Enabled filters are protected right now. Unlock here before you try to turn any of them off."
            title="Password lock active"
          />
          <View
            style={{
              backgroundColor: "#f9fafb",
              borderColor: "#e5e7eb",
              borderCurve: "continuous",
              borderRadius: 16,
              borderWidth: 1,
              gap: 6,
              padding: 14,
            }}
          >
            <Text
              style={{
                color: "#6b7280",
                fontSize: 12,
                fontWeight: "600",
                textTransform: "uppercase",
              }}
            >
              Saved password
            </Text>
            <Text
              selectable
              style={{
                color: "#111827",
                fontSize: 18,
                fontWeight: "700",
                letterSpacing: 1,
              }}
            >
              {password ? maskLockInPassword(password) : "**** **** ****"}
            </Text>
          </View>
          <View style={{ gap: 10 }}>
            <Text
              style={{
                color: "#374151",
                fontSize: 13,
                fontWeight: "600",
              }}
            >
              Enter password to unlock
            </Text>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={(value) => {
                setUnlockPassword(value);
                setUnlockError(null);
              }}
              placeholder="Enter 12 characters"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              style={{
                backgroundColor: "#f9fafb",
                borderColor: "#d1d5db",
                borderCurve: "continuous",
                borderRadius: 16,
                borderWidth: 1,
                color: "#111827",
                fontSize: 16,
                paddingHorizontal: 14,
                paddingVertical: 14,
              }}
              value={unlockPassword}
            />
          </View>
          {unlockError ? (
            <Text selectable style={{ color: "#b91c1c", fontSize: 13 }}>
              {unlockError}
            </Text>
          ) : null}
          <PrimaryButton label="Unlock" onPress={handleUnlock} />
        </SectionCard>
      ) : null}

      {isLockConfigured && isUnlocked ? (
        <>
          <SectionCard>
            <SectionTitle
              description="LockIn stays unlocked until you relock it. Filter toggles can be turned off right now."
              title="LockIn unlocked"
            />
            <View
              style={{
                backgroundColor: "#ecfdf5",
                borderColor: "#a7f3d0",
                borderCurve: "continuous",
                borderRadius: 16,
                borderWidth: 1,
                gap: 6,
                padding: 14,
              }}
            >
              <Text
                style={{
                  color: "#047857",
                  fontSize: 12,
                  fontWeight: "600",
                  textTransform: "uppercase",
                }}
              >
                Status
              </Text>
              <Text
                style={{
                  color: "#065f46",
                  fontSize: 16,
                  fontWeight: "700",
                }}
              >
                Unlocked until you relock
              </Text>
            </View>
            <PrimaryButton label="Relock" onPress={relock} />
          </SectionCard>

          <SectionCard>
            <SectionTitle
              description="Replace the current password with a new 12-character password."
              title="Change password"
            />
            <PasswordField
              onChangeText={(value) => {
                setNextPassword(value);
                setNextCopyLabel("Copy");
                setReplaceError(null);
              }}
              onCopy={() => handleCopyPassword(nextPassword, setNextCopyLabel)}
              copyLabel={nextCopyLabel}
              onGenerate={handleGenerateNextPassword}
              value={nextPassword}
            />
            {replaceError ? (
              <Text selectable style={{ color: "#b91c1c", fontSize: 13 }}>
                {replaceError}
              </Text>
            ) : null}
            <PrimaryButton
              label="Update Password"
              onPress={handleReplacePassword}
            />
          </SectionCard>

          <SectionCard>
            <SectionTitle
              description="Remove the lock completely if you no longer want password protection on enabled filters."
              title="Remove password lock"
            />
            <Pressable
              accessibilityRole="button"
              onPress={handleRemoveLock}
              style={({ pressed }) => ({
                alignItems: "center",
                backgroundColor: "#fef2f2",
                borderColor: "#fecaca",
                borderCurve: "continuous",
                borderRadius: 18,
                borderWidth: 1,
                justifyContent: "center",
                minHeight: 54,
                opacity: pressed ? 0.85 : 1,
                paddingHorizontal: 18,
              })}
            >
              <Text
                style={{
                  color: "#b91c1c",
                  fontSize: 15,
                  fontWeight: "700",
                }}
              >
                Remove Lock
              </Text>
            </Pressable>
          </SectionCard>
        </>
      ) : null}
    </ScrollView>
  );
}
