"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Button } from "@/components/button";
import { LocaleLink } from "@/components/locale-link";
import { FormShell } from "@/features/forms/components/form-shell";
import { AuthMessageCard } from "@/features/forms/components/auth-message-card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/features/forms/components/input";
import { toast } from "sonner";

const createForgotPasswordSchema = (invalidEmailMessage: string) =>
  z.object({
    email: z.string().email(invalidEmailMessage),
  });

type ForgotPasswordInput = z.infer<ReturnType<typeof createForgotPasswordSchema>>;

export default function ForgotPasswordPage() {
  const t = useTranslations("auth.forgotPassword");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(createForgotPasswordSchema(t("invalidEmail"))),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setEmailSent(true);
        toast.success(t("successToast"));
      } else {
        toast.error(t("errorToast"));
      }
    } catch {
      toast.error(t("errorToast"));
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <AuthMessageCard
        title={t("sentTitle")}
        description={t("sentDescription")}
      >
        <p className="text-sm text-muted-foreground">
          {t("sentHelp")}
        </p>
        <Button
          variant="outline"
          onClick={() => setEmailSent(false)}
          className="w-full"
        >
          {t("tryAgain")}
        </Button>
        <LocaleLink href="/login">
          <Button variant="simple" className="w-full">
            {t("backToLogin")}
          </Button>
        </LocaleLink>
      </AuthMessageCard>
    );
  }

  return (
    <FormShell<ForgotPasswordInput>
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
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("emailLabel")}</FormLabel>
            <FormControl>
              <Input
                type="email"
                placeholder={t("emailPlaceholder")}
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
