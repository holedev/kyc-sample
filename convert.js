import fs from "node:fs";
import path from "node:path";

// 1. Map sửa lỗi: Key = ID sinh viên, Value = Giới tính ĐÚNG (đã đảo ngược so với file gốc)
const genderFixes = {
  CQ11: "Nam",
  CQ12: "Nữ",
  CQ16: "Nữ",
  CQ27: "Nữ",
  CQ29: "Nữ",
  CQ31: "Nam",
  CQ38: "Nam",
  CQ41: "Nữ",
  CQ44: "Nữ",
  CQ48: "Nữ",
  CQ49: "Nữ",
  CQ50: "Nam",
  CQ54: "Nam",
  CQ58: "Nam",
  CQ60: "Nam",
  CQ65: "Nữ",
  CQ66: "Nữ",
  CQ67: "Nữ",
  CQ75: "Nam",
  CQ77: "Nam",
  CQ80: "Nữ",
  CQ85: "Nữ",
  CQ86: "Nam",
  CQ88: "Nữ",
  CQ89: "Nữ",
  CQ92: "Nữ",
  CQ94: "Nữ",
  CQ95: "Nữ",
  CQ97: "Nữ",
  CQ100: "Nữ",
  CQ105: "Nam",
  CQ108: "Nam",
  CQ113: "Nữ",
  CQ114: "Nam",
  CQ117: "Nữ",
  CQ118: "Nam",
  CQ120: "Nữ",
  CQ121: "Nam",
  CQ134: "Nữ",
  CQ136: "Nam",
  CQ142: "Nữ",
  CQ149: "Nam",
  CQ158: "Nữ",
  CQ161: "Nữ",
  CQ163: "Nữ",
  CQ169: "Nữ",
  CQ170: "Nữ",
  CQ171: "Nam",
  CQ177: "Nam",
  CQ182: "Nam",
  CQ185: "Nữ",
  CQ187: "Nam",
  CQ191: "Nam",
  CQ193: "Nam",
  CQ196: "Nam",
  CQ197: "Nam",
  CQ204: "Nam",
  CQ205: "Nam",
  CQ211: "Nữ",
  CQ214: "Nam",
  CQ216: "Nữ",
  CQ220: "Nữ",
  CQ226: "Nam",
  CQ229: "Nữ",
  CQ230: "Nam",
  CQ232: "Nữ",
  CQ239: "Nữ",
  CQ241: "Nam",
  CQ242: "Nam",
  CQ245: "Nữ",
  CQ251: "Nam",
  CQ254: "Nam",
  CQ256: "Nam",
  CQ257: "Nữ",
  CQ260: "Nam",
  CQ263: "Nam",
  CQ265: "Nam",
  CQ270: "Nữ",
  CQ273: "Nam",
  CQ276: "Nữ",
  CQ281: "Nữ",
  CQ284: "Nam",
  CQ287: "Nữ",
  CQ288: "Nam",
  CQ289: "Nữ",
  CQ291: "Nam",
  CQ294: "Nam",
  CQ295: "Nữ",
  CQ300: "Nam",
  CQ302: "Nam",
  CQ303: "Nữ",
  CQ305: "Nam",
  CQ306: "Nữ",
  CQ308: "Nam",
  CQ311: "Nữ",
  CQ313: "Nam",
  CQ319: "Nam",
  CQ327: "Nam",
  CQ333: "Nam",
  CQ335: "Nữ",
  CQ338: "Nam",
  CQ341: "Nam",
  CQ349: "Nam",
  CQ356: "Nam",
  CQ361: "Nữ",
  CQ363: "Nam",
  CQ367: "Nữ",
  CQ368: "Nữ",
  CQ369: "Nam",
  CQ371: "Nữ",
  CQ372: "Nữ",
  CQ374: "Nam",
  CQ377: "Nữ",
  CQ381: "Nữ",
  CQ384: "Nam",
  CQ385: "Nữ",
  CQ386: "Nữ",
  CQ391: "Nam",
  CQ402: "Nam",
  CQ404: "Nam",
  CQ405: "Nam",
  CQ408: "Nữ",
  CQ409: "Nam",
  CQ413: "Nam",
  CQ414: "Nữ",
  CQ418: "Nữ",
  CQ419: "Nam",
  CQ421: "Nữ",
  CQ422: "Nam",
  CQ423: "Nam",
  CQ431: "Nữ",
  CQ432: "Nữ",
  CQ435: "Nam",
  CQ437: "Nam",
  CQ438: "Nam",
  CQ440: "Nam",
  CQ441: "Nữ",
  CQ443: "Nam",
  CQ454: "Nam",
  CQ457: "Nam",
  CQ463: "Nam",
  CQ464: "Nam",
  CQ465: "Nam",
  CQ469: "Nam",
  CQ476: "Nữ",
  CQ483: "Nữ",
  CQ491: "Nam",
  CQ493: "Nữ",
  CQ496: "Nam",
  CQ499: "Nam"
};

const csvPath = path.join(process.cwd(), "data.csv");
const csv = fs.readFileSync(csvPath, "utf8");

const lines = csv.trim().split("\n");
// const headers = lines[0].split(","); // Bỏ qua header khi map

const result = lines.slice(1).map((line) => {
  const cols = line.split(",");

  const code = cols[0].trim();
  let sex = cols[2].trim();

  // Kiểm tra xem ID có nằm trong danh sách cần sửa không
  if (genderFixes[code]) {
    sex = genderFixes[code];
    // Có thể log ra để debug nếu cần:
    // console.log(`Fixed gender for ${code}: ${cols[2]} -> ${sex}`);
  }

  return {
    code,
    fullName: cols[1].trim(),
    sex, // Giá trị đã được patch
    birthday: convertDate(cols[3]),
    identity: cols[4],
    phone: cols[5]?.trim() // Optional trim phòng trường hợp dòng cuối bị lỗi
  };
});

function convertDate(d) {
  if (!d) {
    return "";
  }
  // format dd/MM/yyyy → yyyy-MM-dd
  const [day, month, year] = d.split("/");
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

fs.writeFileSync("data.json", JSON.stringify(result, null, 2));

console.log(`Done → data.json created. Total records: ${result.length}`);
