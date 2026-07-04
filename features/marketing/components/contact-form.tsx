"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useLocale, useTranslations } from 'next-intl';

import { FormShell } from "@/features/forms/components/form-shell";
import {
  FormTextareaField,
  FormTextField,
} from "@/features/forms/components/form-text-field";
import { ContactInput, contactSchema } from "@/features/marketing/schemas";

export function ContactForm() {
  const locale = useLocale();
  const t = useTranslations('contact');
  const form = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      message: "",
    },
  });

  async function onSubmit(values: ContactInput) {
    // TODO: wire up to backend when available
    console.log("submitted form", values);
  }

  return (
    <FormShell<ContactInput>
      form={form}
      title={t('title')}
      description={t('description')}
      onSubmit={onSubmit}
      submitText={t('form.submitButton')}
      className="relative z-20"
      headerSlot={null}
      footer={
        <p className="pt-4 text-center text-sm text-muted-foreground">
          {locale === "zh"
            ? "如有合作、支付或账户问题，请通过此页面联系我们。"
            : "For partnership, payment, or account questions, please contact us through this page."}
        </p>
      }
    >
      <FormTextField
        control={form.control}
        name="name"
        label={t('form.nameLabel')}
        placeholder={t('form.namePlaceholder')}
        autoComplete="name"
      />
      <FormTextField
        control={form.control}
        name="email"
        type="email"
        label={t('form.emailLabel')}
        placeholder={t('form.emailPlaceholder')}
        autoComplete="email"
      />
      <FormTextField
        control={form.control}
        name="company"
        label={t('form.companyLabel')}
        placeholder={t('form.companyPlaceholder')}
        autoComplete="organization"
      />
      <FormTextareaField
        control={form.control}
        name="message"
        label={t('form.messageLabel')}
        placeholder={t('form.messagePlaceholder')}
        rows={5}
      />
    </FormShell>
  );
}
