"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/button";
import { LocaleLink } from "@/components/locale-link";
import { FormShell } from "@/features/forms/components/form-shell";
import { AuthMessageCard } from "@/features/forms/components/auth-message-card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/features/forms/components/input";
import { toast } from "sonner";

const createResetPasswordSchema = (messages: {
  passwordMin: string;
  passwordMismatch: string;
}) =>
  z.object({
    password: z.string().min(8, messages.passwordMin),
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: messages.passwordMismatch,
    path: ["confirmPassword"],
  });

type ResetPasswordInput = z.infer<ReturnType<typeof createResetPasswordSchema>>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations("auth.resetPassword");
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const token = searchParams.get("token");

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(createResetPasswordSchema({
      passwordMin: t("passwordMin"),
      passwordMismatch: t("passwordMismatch"),
    })),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!token) {
      setIsValidToken(false);
      return;
    }

    // Verify token validity
    fetch(`/api/auth/verify-reset-token?token=${token}`)
      .then(res => res.json())
      .then(data => {
        setIsValidToken(data.valid);
      })
      .catch(() => {
        setIsValidToken(false);
      });
  }, [token]);

  const onSubmit = async (data: ResetPasswordInput) => {
    if (!token) {
      toast.error(t("invalidLinkToast"));
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password: data.password,
        }),
      });

      if (response.ok) {
        toast.success(t("successToast"));
        setTimeout(() => {
          router.push(`/${locale}/login`);
        }, 2000);
      } else {
        toast.error(t("errorToast"));
      }
    } catch {
      toast.error(t("errorToast"));
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidToken === null) {
    return (
      <AuthMessageCard
        title={t("verifyingTitle")}
        description={t("verifyingDescription")}
      >
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
        </div>
      </AuthMessageCard>
    );
  }

  if (isValidToken === false) {
    return (
      <AuthMessageCard
        title={t("invalidTitle")}
        description={t("invalidDescription")}
      >
        <p className="text-sm text-muted-foreground">
          {t("requestNewDescription")}
        </p>
        <LocaleLink href="/forgot-password">
          <Button className="w-full">
            {t("requestNew")}
          </Button>
        </LocaleLink>
        <LocaleLink href="/login">
          <Button variant="outline" className="w-full">
            {t("backToLogin")}
          </Button>
        </LocaleLink>
      </AuthMessageCard>
    );
  }

  return (
    <FormShell<ResetPasswordInput>
      form={form}
      title={t("title")}
      description={t("description")}
      onSubmit={onSubmit}
      submitText={t("submit")}
      submitLoadingText={t("submitting")}
      isLoading={isLoading}
      footer={
        <div className="text-center">
          <LocaleLink
            href="/login"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            {t("backToLogin")}
          </LocaleLink>
        </div>
      }
    >
      <FormField
        control={form.control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("newPasswordLabel")}</FormLabel>
            <FormControl>
              <Input
                type="password"
                placeholder={t("newPasswordPlaceholder")}
                disabled={isLoading}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="confirmPassword"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("confirmPasswordLabel")}</FormLabel>
            <FormControl>
              <Input
                type="password"
                placeholder={t("confirmPasswordPlaceholder")}
                disabled={isLoading}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormShell>
  );
}
