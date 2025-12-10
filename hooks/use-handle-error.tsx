import { useTranslations } from "next-intl";
import { toast } from "sonner";
import type { ResponseType, SuccessResponseType } from "@/types/response";

type HandleErrorType = {
  cb: () => Promise<ResponseType>;
  onSuccess?: ({ data }: { data: SuccessResponseType }) => void;
  withSuccessNotify?: boolean;
};

const useHandleError = () => {
  const t = useTranslations("common.notify");

  const handleErrorClient = async ({
    cb,
    onSuccess = () => {
      /* no-op */
    },
    withSuccessNotify = true
  }: HandleErrorType) => {
    try {
      const { error, data } = await cb();

      if (error) {
        toast.error(t("error.title"), {
          description: error.message
        });
        return;
      }

      if (withSuccessNotify) {
        toast.success(t("success.title"), {
          description: t("success.message")
        });
      }

      onSuccess({ data: data ?? {} });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(t("error.unknownError"), {
          description: error.message
        });
        return;
      }
    }
  };

  return { handleErrorClient, toast };
};

export { useHandleError };
