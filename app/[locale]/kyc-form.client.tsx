"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { LoadingComponent } from "@/components/custom/Loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useHandleError } from "@/hooks/use-handle-error";
import { handleDatetime } from "@/utils/handle-datetime";
import { countKYCRecordsByNicknameId, getCacheKYCCount, getRandomKYCData } from "./actions";
import { VoiceRecorder } from "./voice-recorder.client";

type KYCData = {
  code: string;
  fullName: string;
  birthday: Date;
  sex: string;
  identity: string;
  phone: string;
  status: string;
};

export function KYCFormClient() {
  const [KYCCount, setKYCCount] = useState<number>(0);
  const [randomKYC, setRandomKYC] = useState<KYCData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voiceRecordings, setVoiceRecordings] = useState<{
    fullName?: Blob;
    birthday?: Blob;
    identity?: Blob;
    phone?: Blob;
  }>({});
  const [selectedSex, setSelectedSex] = useState<"male" | "female">("male");

  const router = useRouter();

  const { handleErrorClient } = useHandleError();

  const uploadAllAudioFiles = async (kycCode: string, voiceRecordings: Record<string, Blob>): Promise<boolean> => {
    try {
      const formData = new FormData();
      formData.append("kycCode", kycCode);

      for (const [fieldName, audioBlob] of Object.entries(voiceRecordings)) {
        formData.append(fieldName, audioBlob, `${fieldName}.m4a`);
      }

      const response = await fetch("/api/upload-audio", {
        method: "POST",
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to upload audio files");
      }

      if (result.revalidated) {
        await loadRandomKYC(selectedSex);
      }

      if (result.success || result.data?.successCount > 0) {
        return true;
      }

      throw new Error("Failed to upload audio files");
    } catch (error) {
      throw new Error((error as Error).message || "Failed to upload audio files");
    }
  };

  const handleSubmit = async () => {
    if (!randomKYC) {
      toast.error("No KYC data available!");
      return;
    }

    setIsSubmitting(true);

    await handleErrorClient({
      cb: async () => {
        await uploadAllAudioFiles(randomKYC.code, voiceRecordings);

        setVoiceRecordings({});

        return {
          error: null,
          data: {
            status: 200,
            payload: "Audio files uploaded successfully"
          }
        };
      },
      withSuccessNotify: true,
      onSuccess: () => {
        router.refresh();
      }
    });

    setIsSubmitting(false);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <TODO: fix then>
  const loadRandomKYC = useCallback(async (selectedSex: "male" | "female") => {
    setIsLoading(true);
    await handleErrorClient({
      cb: async () => {
        const result = await getRandomKYCData(selectedSex);
        const count = await getCacheKYCCount(selectedSex);

        if (result.data?.payload) {
          setRandomKYC(result.data.payload as KYCData);
          setVoiceRecordings({});
        }

        setKYCCount(count);
        return result;
      },
      withSuccessNotify: false
    });
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadRandomKYC(selectedSex);
  }, [loadRandomKYC, selectedSex]);

  return (
    <div className='mx-auto w-full'>
      <Card className='mx-auto max-w-[400px] text-center'>
        <CardHeader className='mb-0 p-4 text-center'>
          <CardTitle>Total: {KYCCount}</CardTitle>
        </CardHeader>
        <CardContent className='overflow-x-auto p-4 text-center'>
          {randomKYC ? (
            <div className='space-y-4'>
              <div className='flex items-center justify-center gap-4'>
                <Select onValueChange={(value) => setSelectedSex(value as "male" | "female")} value={selectedSex}>
                  <SelectTrigger className='w-[180px]'>
                    <SelectValue placeholder='Giới tính' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='male'>Nam</SelectItem>
                    <SelectItem value='female'>Nữ</SelectItem>
                  </SelectContent>
                </Select>
                <Button disabled={isLoading} onClick={() => loadRandomKYC(selectedSex)} size='lg'>
                  Refresh Random Data
                </Button>
              </div>
              <div className='space-y-4'>
                <div className='flex justify-center gap-6'>
                  <div className='space-x-2'>
                    <Label>ID:</Label>
                    <span className='rounded font-mono text-xl'>{randomKYC.code}</span>
                  </div>
                  <div className='space-x-2'>
                    <Label>Sex:</Label>
                    <span className='rounded font-mono text-xl uppercase'>{randomKYC.sex}</span>
                  </div>
                </div>
                <Separator />
                <div className='justify-center space-y-2'>
                  <Label>Full Name</Label>
                  <p className='rounded font-semibold text-xl'>{randomKYC.fullName}</p>
                  <VoiceRecorder
                    key={`fullName-${randomKYC.code}`}
                    label='Full Name'
                    onRecordingComplete={(blob) => setVoiceRecordings({ ...voiceRecordings, fullName: blob })}
                  />
                </div>

                <div className='space-y-2'>
                  <Label> Birthday (ví dụ: ngày 12 tháng 9 năm 2022)</Label>
                  <p className='rounded font-semibold text-xl'>{handleDatetime(new Date(randomKYC.birthday))}</p>
                  <VoiceRecorder
                    key={`birthday-${randomKYC.code}`}
                    label='Birthday'
                    onRecordingComplete={(blob) => setVoiceRecordings({ ...voiceRecordings, birthday: blob })}
                  />
                </div>

                <div className='space-y-2'>
                  <Label>Identity</Label>
                  <p className='rounded font-semibold text-xl'>{randomKYC.identity}</p>
                  <VoiceRecorder
                    key={`identity-${randomKYC.code}`}
                    label='Identity'
                    onRecordingComplete={(blob) => setVoiceRecordings({ ...voiceRecordings, identity: blob })}
                  />
                </div>

                <div className='space-y-2'>
                  <Label>Phone</Label>
                  <p className='rounded font-semibold text-xl'>{randomKYC.phone}</p>
                  <VoiceRecorder
                    key={`phone-${randomKYC.code}`}
                    label='Phone'
                    onRecordingComplete={(blob) => setVoiceRecordings({ ...voiceRecordings, phone: blob })}
                  />
                </div>
              </div>

              <div>
                <Button
                  disabled={isSubmitting || Object.keys(voiceRecordings).length !== 4}
                  onClick={handleSubmit}
                  size='lg'
                >
                  {isSubmitting ? "Uploading" : `Submit (${Object.keys(voiceRecordings).length}/4)`}
                </Button>
              </div>
            </div>
          ) : (
            <LoadingComponent />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
