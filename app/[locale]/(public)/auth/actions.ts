"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { prisma } from "@/configs/prisma/db";
import { createClientSsr } from "@/configs/supabase/server";
import { handleErrorServerNoAuth } from "@/utils/handle-error-server";

const createNewUserWithNickname = async (nickname: string, password: string) => {
  const existingNickname = await prisma.nickname.findFirst({
    where: { content: nickname }
  });

  if (existingNickname) {
    throw new Error("Nickname already exists");
  }

  const email = `${nickname}@local.app`;

  const supabase = await createClientSsr();
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password
  });

  if (signUpError) {
    throw new Error(signUpError.message);
  }

  if (signUpData.user) {
    await prisma.nickname.create({
      data: {
        content: nickname,
        authorId: signUpData.user.id
      }
    });

    return {
      user: signUpData.user,
      session: signUpData.session,
      isNewUser: true
    };
  }

  throw new Error("Failed to create user");
};

const signInWithNickname = async (nickname: string, password: string) =>
  handleErrorServerNoAuth({
    cb: async () => {
      if (!(nickname && password)) {
        throw new Error("Nickname and password are required");
      }

      const email = `${nickname}@local.app`;
      const supabase = await createClientSsr();

      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (!signInError && signInData.user) {
        return {
          user: signInData.user,
          session: signInData.session
        };
      }

      if (signInError?.message.includes("Invalid login credentials")) {
        return await createNewUserWithNickname(nickname, password);
      }

      throw new Error(signInError?.message || "Authentication failed");
    }
  });

export { signInWithNickname };
