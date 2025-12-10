import Image from "next/image";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Link } from "@/configs/i18n/routing";
import { _ROUTE_PROFILE } from "@/constants/route";
import { countKYCRecordsByNicknameId } from "./actions";

type Payload = {
  count: number;
};

const ThankUser = async () => {
  const t = await getTranslations("home.thanks");
  const { data, error } = await countKYCRecordsByNicknameId();
  if (error) {
    throw new Error(error.message);
  }
  const count = (data?.payload as Payload).count;

  if (count < 0) {
    return (
      <div>
        <h1 className='my-2 text-center font-bold text-xl'>{t("title")}</h1>
        <div>
          <div className='text-center'>{t("description")}</div>
          <Image alt='Thank You' className='mx-auto my-4' height={200} src='/assets/chu_ngua.png' width={300} />
          <div className='text-center'>
            {t("login")}
            <Link className='font-bold underline' href={_ROUTE_PROFILE}>
              link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className='my-2 text-center font-bold text-xl'>{t("title")}</h1>
      <div className='space-y-4'>
        <p className='text-center'>{t("description")}</p>
        <p className='text-center'>{t("recordCount", { count })}</p>
      </div>
    </div>
  );
};

export { ThankUser };
