import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { BUCKET_NAME, minioClient } from "@/configs/minio/client";
import { prisma } from "@/configs/prisma/db";
import { createClientSsr } from "@/configs/supabase/server";
import { _CACHE_KYC_COUNT, _CACHE_KYC_LIST, _CACHE_NICKNAMES } from "@/constants/cache";

type UploadResult = {
  fieldName: string;
  objectName?: string;
  size?: number;
  success: boolean;
  error?: string;
};

type AudioFile = {
  fieldName: string;
  file: File;
};

async function checkMinIOConnection() {
  try {
    await minioClient.listBuckets();
    return null;
  } catch (connectionError) {
    return NextResponse.json(
      {
        error: "MinIO server is not available",
        details: "Please make sure MinIO server is running and accessible",
        connectionError: connectionError instanceof Error ? connectionError.message : "Unknown connection error"
      },
      { status: 503 }
    );
  }
}

async function ensureBucketExists() {
  const bucketExists = await minioClient.bucketExists(BUCKET_NAME);
  if (!bucketExists) {
    await minioClient.makeBucket(BUCKET_NAME);
  }
}

async function uploadSingleFile(
  kycCode: string,
  nicknameId: number,
  fieldName: string,
  file: File
): Promise<UploadResult> {
  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    const extensionMap: Record<string, string> = {
      "audio/mp4": "m4a",
      "audio/aac": "m4a",
      "audio/m4a": "m4a",
      "audio/mpeg": "mp3"
    };

    const extension = extensionMap[file.type] ?? "bin";

    const objectName = `${nicknameId}/${kycCode}/${fieldName}.${extension}`;

    await minioClient.putObject(BUCKET_NAME, objectName, buffer, buffer.length, {
      "Content-Type": file.type,
      "Content-Disposition": `inline; filename="${fieldName}.${extension}"`
    });

    return {
      fieldName,
      objectName,
      size: buffer.length,
      success: true
    };
  } catch (uploadError) {
    return {
      fieldName,
      success: false,
      error: uploadError instanceof Error ? uploadError.message : "Unknown error"
    };
  }
}

async function updateDatabase(nicknameId: number, kycCode: string) {
  await prisma.infoKYC.update({
    where: { code: kycCode, status: "PENDING" },
    data: {
      status: "VERIFIED",
      nicknameId
    }
  });
}

function createResponse(kycCode: string, uploadResults: UploadResult[], userId: string) {
  const successCount = uploadResults.filter((result) => result.success).length;
  const failedCount = uploadResults.length - successCount;

  const baseData = {
    bucket: BUCKET_NAME,
    kycCode,
    uploadResults,
    totalFiles: uploadResults.length,
    successCount,
    failedCount
  };

  revalidateTag(`${_CACHE_KYC_COUNT}::${userId}`, { expire: 0 });
  revalidateTag(`${_CACHE_KYC_COUNT}::male`, { expire: 0 });
  revalidateTag(`${_CACHE_KYC_COUNT}::female`, { expire: 0 });
  revalidateTag(`${_CACHE_KYC_LIST}::male`, { expire: 0 });
  revalidateTag(`${_CACHE_KYC_LIST}::female`, { expire: 0 });

  if (failedCount === 0) {
    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
      success: true,
      message: "All audio files uploaded successfully",
      data: baseData
    });
  }

  if (successCount > 0) {
    return NextResponse.json(
      {
        revalidated: true,
        now: Date.now(),
        success: false,
        message: `${successCount} files uploaded successfully, ${failedCount} failed`,
        data: baseData
      },
      { status: 207 }
    );
  }

  return NextResponse.json(
    {
      revalidated: false,
      now: Date.now(),
      success: false,
      message: "All file uploads failed",
      data: baseData
    },
    { status: 500 }
  );
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const kycCode = formData.get("kycCode") as string;

    const supabase = await createClientSsr();
    const user = await supabase.auth.getUser();

    if (!user.data.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!kycCode) {
      return NextResponse.json({ error: "Missing required field: kycCode" }, { status: 400 });
    }

    const nickname = await prisma.nickname.findUnique({
      where: { authorId: user.data.user.id }
    });

    if (!nickname) {
      return NextResponse.json({ error: "User must have a nickname to upload audio files" }, { status: 403 });
    }

    const audioFiles: AudioFile[] = [];
    const expectedFields = ["fullName", "birthday", "identity", "phone"];

    for (const fieldName of expectedFields) {
      const audioFile = formData.get(fieldName) as File;
      if (audioFile && audioFile.size > 0) {
        audioFiles.push({ fieldName, file: audioFile });
      }
    }

    if (audioFiles.length === 0) {
      return NextResponse.json({ error: "No audio files provided" }, { status: 400 });
    }

    const connectionError = await checkMinIOConnection();
    if (connectionError) {
      return connectionError;
    }

    await ensureBucketExists();

    const uploadResults: UploadResult[] = [];
    for (const { fieldName, file } of audioFiles) {
      const result = await uploadSingleFile(kycCode, nickname.id, fieldName, file);
      uploadResults.push(result);
    }

    const successCount = uploadResults.filter((result) => result.success).length;
    const failedCount = uploadResults.length - successCount;

    if (failedCount === 0) {
      await updateDatabase(nickname.id, kycCode);
    }

    return createResponse(kycCode, uploadResults, user.data.user.id);
  } catch (error) {
    console.error("Error uploading audio files to MinIO:", error);
    return NextResponse.json(
      {
        error: "Failed to upload audio files",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
