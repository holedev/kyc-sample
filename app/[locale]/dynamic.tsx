import Image from "next/image";
import { Link } from "@/configs/i18n/routing";
import { _ROUTE_PROFILE } from "@/constants/route";
import { countKYCRecordsByNicknameId } from "./actions";

type Payload = {
  count: number;
};

const ThankUser = async () => {
  const { data, error } = await countKYCRecordsByNicknameId();
  if (error) {
    throw new Error(error.message);
  }
  const count = (data?.payload as Payload).count;

  if (count < 0) {
    return (
      <div>
        <h1 className='my-2 text-center font-bold text-xl'>Lời cảm ơn!</h1>
        <div>
          <div className='text-center'>
            Cảm ơn anh/chị/em đã hỗ trợ mình trong việc thu thập dữ liệu mẫu KYC lần này. Sự đóng góp của anh/chị/em
            giúp mình cải thiện tốc độ ra trường rất nhiều ạ.
          </div>
          <Image alt='Thank You' className='mx-auto my-4' height={200} src='/assets/chu_ngua.png' width={300} />
          <div className='text-center'>
            Anh/chị/em vui lòng tạo hoặc đăng nhập tài khoản trước tại{" "}
            <Link className='font-bold underline' href={_ROUTE_PROFILE}>
              đây
            </Link>{" "}
            ạ.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className='my-2 text-center font-bold text-xl'>Lời cảm ơn!</h1>
      <div className='space-y-4'>
        <p className='text-center'>
          Cảm ơn anh/chị/em đã hỗ trợ mình trong việc thu thập dữ liệu mẫu KYC lần này. Sự đóng góp của anh/chị/em giúp
          mình cải thiện tốc độ ra trường rất nhiều ạ.
        </p>
        <p className='text-center'>
          Anh/chị/em đã record thành công <strong>{count}</strong> bản ghi.
        </p>
      </div>
    </div>
  );
};

export { ThankUser };
