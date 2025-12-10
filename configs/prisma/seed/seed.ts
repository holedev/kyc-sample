import fs from "node:fs";
import path from "node:path";
import { prisma } from "../db";

const dataPath = path.join(__dirname, "./data.json");
const raw = fs.readFileSync(dataPath, "utf8");
const data = JSON.parse(raw);

async function main() {
  console.log(`Importing ${data.length} records`);

  type DataItem = {
    code: string;
    fullName: string;
    sex: string;
    birthday: string;
    identity: string;
    phone: string;
  };

  type InfoKYCInput = {
    code: string;
    fullName: string;
    sex: string;
    birthday: Date;
    identity: string;
    phone: string;
  };

  const typedData: DataItem[] = data;

  await prisma.infoKYC.createMany({
    data: typedData.map(
      (item): InfoKYCInput => ({
        code: item.code,
        fullName: item.fullName,
        sex: item.sex,
        birthday: new Date(item.birthday),
        identity: item.identity,
        phone: item.phone
      })
    ),
    skipDuplicates: true
  });

  console.log("Completed import.");
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
