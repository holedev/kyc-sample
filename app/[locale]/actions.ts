"use server";

import { cacheTag } from "next/cache";
import { prisma } from "@/configs/prisma/db";
import { createClientSsr } from "@/configs/supabase/server";
import { _CACHE_KYC_COUNT, _CACHE_KYC_LIST, _CACHE_NICKNAMES } from "@/constants/cache";
import { handleErrorServerNoAuth, handleErrorServerWithAuth } from "@/utils/handle-error-server";

type KYCFormData = {
  fullName: string;
  birthday: Date;
  sex: string;
  identity: string;
  phone: string;
};

const cacheCountKYCByNicknameTag = async (userId: string) => {
  "use cache";
  cacheTag(`${_CACHE_KYC_COUNT}::${userId}`);

  console.info("[actions.ts:36] ", `cacheCountKYCByNicknameTag: ${userId}`);

  const nickname = await prisma.nickname.findUnique({
    where: { authorId: userId }
  });

  if (!nickname) {
    throw new Error("User must have a nickname to count KYC records");
  }

  const count = await prisma.infoKYC.count({
    where: { nicknameId: nickname.id }
  });

  return count;
};

const countKYCRecordsByNicknameId = async () =>
  handleErrorServerNoAuth({
    cb: async () => {
      const supabase = await createClientSsr();
      const user = await supabase.auth.getUser();

      if (!user.data.user) {
        return { count: -1 };
      }

      const count = await cacheCountKYCByNicknameTag(user.data.user?.id);
      return { count };
    }
  });

const getCacheKYCCount = async () => {
  "use cache";
  cacheTag(_CACHE_KYC_COUNT);

  console.info("[actions.ts:55] ", "getCacheKYCCount");

  const totalKYC = await prisma.infoKYC.count({
    where: { status: "PENDING" }
  });

  return totalKYC;
};

const getCacheKYCData = async () => {
  "use cache";
  cacheTag(_CACHE_KYC_LIST);

  console.info("[actions.ts:70] ", "getCacheKYCData");

  const randomKYCData = await prisma.infoKYC.findMany({
    where: { status: "PENDING" },
    select: {
      code: true,
      fullName: true,
      birthday: true,
      sex: true,
      identity: true,
      phone: true,
      status: true
    }
  });

  return randomKYCData;
};

const getRandomKYCData = async () =>
  handleErrorServerNoAuth({
    cb: async () => {
      const totalKYC = await getCacheKYCCount();

      if (totalKYC === 0) {
        throw new Error("No KYC records found in database");
      }

      const randomKYCData = await getCacheKYCData();

      const randomOffset = Math.floor(Math.random() * totalKYC);
      const randomKYC = randomKYCData[randomOffset];

      if (!randomKYC) {
        throw new Error("No KYC record found");
      }

      return randomKYC;
    }
  });

const createKYCRecord = async (formData: KYCFormData) =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => {
      if (!user) {
        throw new Error("User not authenticated");
      }

      const userNickname = await prisma.nickname.findUnique({
        where: { authorId: user.id }
      });

      if (!userNickname) {
        throw new Error("User must have a nickname to create KYC record");
      }

      const timestamp = Date.now().toString(36);
      const random = Math.random().toString(36).substr(2, 5);
      const kycCode = `KYC-${timestamp}-${random}`.toUpperCase();

      const kycRecord = await prisma.infoKYC.create({
        data: {
          code: kycCode,
          fullName: formData.fullName,
          birthday: formData.birthday,
          sex: formData.sex,
          identity: formData.identity,
          phone: formData.phone,
          nicknameId: userNickname.id
        }
      });

      return {
        id: kycRecord.id,
        code: kycRecord.code,
        status: kycRecord.status
      };
    }
  });

export { countKYCRecordsByNicknameId, getRandomKYCData, createKYCRecord, getCacheKYCCount };
