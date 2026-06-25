"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { signOut, useSession, authClient } from "@/lib/auth-client";
import { Background } from "@/components/background";
import { Button } from "@/components/button";
import { Container } from "@/components/container";
import {
  getSubscriptionPlanTranslationKey,
  normalizeProfileName,
} from "@/lib/account-settings";
import { getApiErrorMessage } from "@/lib/error-utils";

type UserProfile = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  credits: number;
  createdAt: string;
  subscription?: {
    planKey: string;
    status: string;
    currentPeriodEnd?: string | null;
  } | null;
};

type SaveState =
  | {
      type: "success" | "error";
      message: string;
    }
  | null;

export default function SettingsPage() {
  const session = useSession();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const tDashboard = useTranslations("dashboard");

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarSaveState, setAvatarSaveState] = useState<SaveState>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await fetch("/api/user/profile");
      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      const data = (await response.json()) as { user: UserProfile };
      setUserProfile(data.user);
      setName(data.user.name);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session.data?.user?.id) {
      fetchUserProfile();
    }
  }, [fetchUserProfile, session.data?.user?.id]);

  const handleAvatarChange = async (file: File) => {
    setIsUploadingAvatar(true);
    setAvatarSaveState(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Step 1: Upload image to R2
      const uploadResponse = await fetch("/api/user/avatar", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(
          getApiErrorMessage(
            uploadData,
            t("sections.profile.avatarUploadError")
          )
        );
      }

      const imageUrl = uploadData.url as string;

      // Step 2: Update user profile via Better Auth (syncs session automatically)
      const { error: updateError } = await authClient.updateUser({
        image: imageUrl,
      });

      if (updateError) {
        throw new Error(updateError.message || t("sections.profile.avatarUploadError"));
      }

      // Step 3: Force refetch session so all components (e.g. navbar) see the update
      await session.refetch();

      // Step 4: Update local state
      setUserProfile((previous) =>
        previous
          ? { ...previous, image: imageUrl }
          : null
      );
      setAvatarSaveState({
        type: "success",
        message: t("sections.profile.avatarUploadSuccess"),
      });
      router.refresh();
    } catch (error) {
      setAvatarSaveState({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : t("sections.profile.avatarUploadError"),
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleAvatarFileInput = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      void handleAvatarChange(file);
    }
    event.target.value = "";
  };

  const handleSaveProfile = async () => {
    const normalizedName = normalizeProfileName(name);

    if (!normalizedName || normalizedName.length < 2) {
      setSaveState({
        type: "error",
        message: t("sections.profile.validation"),
      });
      return;
    }

    setIsSaving(true);
    setSaveState(null);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: normalizedName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("sections.profile.saveError"));
      }

      setUserProfile((previous) =>
        previous
          ? {
              ...previous,
              ...data.user,
              subscription: previous.subscription ?? null,
            }
          : data.user
      );
      setName(data.user.name);
      setSaveState({
        type: "success",
        message: t("sections.profile.saveSuccess"),
      });
      router.refresh();
    } catch (error) {
      setSaveState({
        type: "error",
        message:
          error instanceof Error ? error.message : t("sections.profile.saveError"),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  const displayUser = userProfile ?? session.data?.user;
  const initial = displayUser?.name
    ? displayUser.name.charAt(0).toUpperCase()
    : displayUser?.email
      ? displayUser.email.charAt(0).toUpperCase()
      : "U";
  const currentPlanKey = getSubscriptionPlanTranslationKey(
    userProfile?.subscription?.planKey
  );
  const memberSince = displayUser?.createdAt
    ? new Date(displayUser.createdAt).toLocaleDateString(
        locale === "zh" ? "zh-CN" : "en-US",
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        }
      )
    : tDashboard("cards.statistics.labels.today");
  const renewalDate = userProfile?.subscription?.currentPeriodEnd
    ? new Date(userProfile.subscription.currentPeriodEnd).toLocaleDateString(
        locale === "zh" ? "zh-CN" : "en-US",
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        }
      )
    : t("sections.billing.noRenewal");

  if (loading && !displayUser) {
    return (
      <div className="relative min-h-screen">
        <Background />
        <Container className="relative z-10 py-20">
          <div className="flex h-64 items-center justify-center">
            <p className="text-muted-foreground">{tCommon("status.loading")}</p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <Background />
      <Container className="relative z-10 py-20">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ease: "easeOut", duration: 0.5 }}
          className="mx-auto max-w-5xl"
        >
          <div className="mb-12">
            <button
              type="button"
              onClick={() => router.back()}
              className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <span aria-hidden>←</span>
              {tCommon("actions.back")}
            </button>
            <h1 className="mb-4 text-4xl font-bold text-foreground md:text-6xl">
              {t("title")}
            </h1>
            <p className="text-xl text-muted-foreground">{t("subtitle")}</p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <motion.section
              id="profile"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ ease: "easeOut", duration: 0.5, delay: 0.1 }}
              className="rounded-3xl border border-border bg-card/50 p-6 backdrop-blur-md lg:col-span-2"
            >
              <h2 className="text-2xl font-semibold text-card-foreground">
                {t("sections.profile.title")}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("sections.profile.description")}
              </p>

              <div className="mt-6 space-y-5">
                {/* Avatar upload */}
                <div>
                  <label className="mb-3 block text-sm font-medium text-card-foreground">
                    {t("sections.profile.avatarLabel")}
                  </label>
                  <div className="flex items-center gap-5">
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-[rgba(232,194,122,0.92)] via-[rgba(232,194,122,0.60)] to-[rgba(232,194,122,0.30)] ring-2 ring-[rgba(232,194,122,0.18)]">
                      {displayUser?.image ? (
                        <Image
                          src={displayUser.image}
                          alt={displayUser.name || "Avatar"}
                          fill
                          sizes="80px"
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-[rgba(255,247,236,0.92)]">
                          {initial}
                        </div>
                      )}
                      {isUploadingAvatar && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs font-medium text-white">
                          ...
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handleAvatarFileInput}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingAvatar}
                      >
                        {isUploadingAvatar
                          ? t("sections.profile.avatarUploading")
                          : t("sections.profile.avatarChange")}
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        {t("sections.profile.avatarHint")}
                      </p>
                    </div>
                  </div>
                  {avatarSaveState && (
                    <div
                      className={`mt-3 rounded-xl border px-3 py-2 text-xs ${
                        avatarSaveState.type === "success"
                          ? "border-green-500/30 bg-green-500/10 text-green-600"
                          : "border-destructive/30 bg-destructive/10 text-destructive"
                      }`}
                    >
                      {avatarSaveState.message}
                    </div>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="settings-name"
                    className="mb-2 block text-sm font-medium text-card-foreground"
                  >
                    {t("sections.profile.nameLabel")}
                  </label>
                  <input
                    id="settings-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none transition focus:border-primary"
                    placeholder={t("sections.profile.namePlaceholder")}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-card-foreground">
                    {t("sections.profile.emailLabel")}
                  </label>
                  <div className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-muted-foreground">
                    {displayUser?.email}
                  </div>
                </div>

                {saveState && (
                  <div
                    className={`rounded-xl border px-4 py-3 text-sm ${
                      saveState.type === "success"
                        ? "border-green-500/30 bg-green-500/10 text-green-600"
                        : "border-destructive/30 bg-destructive/10 text-destructive"
                    }`}
                  >
                    {saveState.message}
                  </div>
                )}

                <Button onClick={handleSaveProfile} disabled={isSaving}>
                  {isSaving
                    ? t("sections.profile.saving")
                    : t("sections.profile.save")}
                </Button>
              </div>
            </motion.section>

            <motion.section
              id="billing"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ ease: "easeOut", duration: 0.5, delay: 0.15 }}
              className="rounded-3xl border border-border bg-card/50 p-6 backdrop-blur-md"
            >
              <h2 className="text-2xl font-semibold text-card-foreground">
                {t("sections.billing.title")}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("sections.billing.description")}
              </p>

              <div className="mt-6 space-y-4">
                <div className="rounded-2xl bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">
                    {t("sections.billing.currentPlan")}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-card-foreground">
                    {tDashboard(`cards.statistics.plans.${currentPlanKey}`)}
                  </p>
                </div>
                <div className="rounded-2xl bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">
                    {t("sections.billing.creditsBalance")}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-card-foreground">
                    {userProfile?.credits ?? 0}
                  </p>
                </div>
                <div className="rounded-2xl bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">
                    {t("sections.billing.renewal")}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-card-foreground">
                    {renewalDate}
                  </p>
                </div>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => router.push(`/${locale}/credits`)}
                  >
                    {t("sections.billing.manageCredits")}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => router.push(`/${locale}/pricing`)}
                  >
                    {t("sections.billing.viewPricing")}
                  </Button>
                </div>
              </div>
            </motion.section>

            <motion.section
              id="security"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ ease: "easeOut", duration: 0.5, delay: 0.2 }}
              className="rounded-3xl border border-border bg-card/50 p-6 backdrop-blur-md lg:col-span-3"
            >
              <h2 className="text-2xl font-semibold text-card-foreground">
                {t("sections.security.title")}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("sections.security.description")}
              </p>

              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">
                    {t("sections.security.emailStatus")}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-card-foreground">
                    {displayUser?.emailVerified
                      ? tCommon("status.verified")
                      : tCommon("status.pending")}
                  </p>
                </div>
                <div className="rounded-2xl bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">
                    {t("sections.security.memberSince")}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-card-foreground">
                    {memberSince}
                  </p>
                </div>
                <div className="rounded-2xl bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">
                    {t("sections.security.accountId")}
                  </p>
                  <p className="mt-1 break-all font-mono text-sm text-card-foreground">
                    {displayUser?.id}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 md:flex-row">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/${locale}/profile`)}
                >
                  {t("sections.security.viewProfile")}
                </Button>
                <Button variant="simple" onClick={handleSignOut}>
                  {t("sections.security.signOut")}
                </Button>
              </div>
            </motion.section>
          </div>
        </motion.div>
      </Container>
    </div>
  );
}
