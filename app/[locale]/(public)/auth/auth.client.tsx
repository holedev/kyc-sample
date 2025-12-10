"use client";

import type { Provider } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/configs/supabase/client";
import { _ROUTE_AUTH_CALLBACK } from "@/constants/route";
import { useHandleError } from "@/hooks/use-handle-error";
import type { ResponseType } from "@/types/response";
import { signInWithNickname } from "./actions";

const LoginClient = () => {
  const t = useTranslations("common.text");
  const tAuth = useTranslations("auth");

  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const { handleErrorClient } = useHandleError();

  const handleLogin = async (provider: Provider) => {
    const supabase = createClient();
    const redirectTo = `${location.origin}${_ROUTE_AUTH_CALLBACK}`;

    await handleErrorClient({
      cb: async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider,
          options: { redirectTo }
        });
        return {
          data: data ? { payload: data } : null,
          error: error ? { message: error.message } : null
        } as ResponseType;
      },
      withSuccessNotify: false
    });
  };

  const handleNicknameLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    await handleErrorClient({
      cb: async () => signInWithNickname(nickname, password),
      withSuccessNotify: true,
      onSuccess: () => {
        window.location.href = "/";
      }
    });
    setIsLoading(false);
  };

  return (
    <Card className='w-[400px]'>
      <CardHeader>
        <CardTitle className='font-bold text-xl uppercase'>{tAuth("title")}</CardTitle>
        <CardDescription className='text-muted-foreground'>{tAuth("description")}</CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        <form className='space-y-4' onSubmit={handleNicknameLogin}>
          <div className='space-y-2'>
            <Label htmlFor='nickname'>{tAuth("form.nicknameLabel")}</Label>
            <Input
              id='nickname'
              onChange={(e) => setNickname(e.target.value)}
              placeholder={tAuth("form.nicknamePlaceholder")}
              required
              type='text'
              value={nickname}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='password'>{tAuth("form.passwordLabel")}</Label>
            <Input
              id='password'
              onChange={(e) => setPassword(e.target.value)}
              placeholder={tAuth("form.passwordPlaceholder")}
              required
              type='password'
              value={password}
            />
          </div>
          <Button className='w-full' disabled={isLoading} type='submit'>
            {tAuth("form.fastSignUp")}
          </Button>
        </form>

        {/* Divider */}
        <div className='relative'>
          <div className='absolute inset-0 flex items-center'>
            <span className='w-full border-t' />
          </div>
          <div className='relative flex justify-center text-xs uppercase'>
            <span className='bg-background px-2 text-muted-foreground'>{tAuth("orContinueWith")}</span>
          </div>
        </div>

        {/* OAuth Login Buttons */}
        <div className='space-y-3'>
          <Button className='w-full max-w-sm' onClick={() => handleLogin("google")} variant='outline'>
            {t("loginWith")} Google
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export { LoginClient };
