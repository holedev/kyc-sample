import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { LoadingComponent } from "@/components/custom/Loading";
import { createClientSsr } from "@/configs/supabase/server";
import type { locale } from "@/types/global";
import { ThankUser } from "./dynamic";
import { KYCFormClient } from "./kyc-form.client";

type PageType = {
  params: Promise<{ locale: locale }>;
};

export async function generateMetadata({ params }: PageType): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  return {
    title: t("title")
  };
}

export default async function Page({ params }: PageType) {
  const { locale } = await params;
  setRequestLocale(locale as locale);

  const supabase = await createClientSsr();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    return (
      <section className='space-y-6 py-6'>
        <Suspense fallback={<LoadingComponent />}>
          <ThankUser />
        </Suspense>
      </section>
    );
  }

  return (
    <section className='space-y-6 py-6'>
      <Suspense fallback={<LoadingComponent />}>
        <ThankUser />
      </Suspense>
      <KYCFormClient />
    </section>
  );
}
