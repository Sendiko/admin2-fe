import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import ExcelJS from "exceljs";

const INDONESIAN_MONTHS: Record<string, string> = {
  "01": "JANUARI",
  "02": "FEBRUARI",
  "03": "MARET",
  "04": "APRIL",
  "05": "MEI",
  "06": "JUNI",
  "07": "JULI",
  "08": "AGUSTUS",
  "09": "SEPTEMBER",
  "10": "OKTOBER",
  "11": "NOVEMBER",
  "12": "DESEMBER",
};

interface BapRecord {
  id: string;
  tanggal: string;
  jam_masuk: string;
  jam_keluar: string;
  jumlah_jam: number;
  deskripsi_pekerjaan: string;
  paraf?: number;
  type?: string;
  id_laboratorium?: string;
  laboratorium?: { id: string; kode: string; nama: string };
  user?: { nama_lengkap?: string; username?: string; nim?: string };
}

// Convert a "HH:MM:SS" or "HH:MM" time string to an Excel serial fraction
// Excel stores time as fraction of a day: 09:30 = 9.5/24
function timeToExcelSerial(timeStr: string): number {
  const parts = timeStr.split(":");
  const h = parseInt(parts[0] || "0", 10);
  const m = parseInt(parts[1] || "0", 10);
  const s = parseInt(parts[2] || "0", 10);
  return (h * 3600 + m * 60 + s) / 86400;
}

// Convert "YYYY-MM-DD" to a JS Date (midnight UTC) so ExcelJS renders it as a date
function dateStrToDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Metadata params
    const nama = searchParams.get("nama") || "NAMA ASISTEN";
    const nim = searchParams.get("nim") || "";
    const namaLab = searchParams.get("nama_lab") || "LABORATORIUM";
    const prodi = searchParams.get("prodi") || "";
    const bulan = searchParams.get("bulan") || ""; // e.g. "08"
    const tahun = searchParams.get("tahun") || "2026";
    const laboran = searchParams.get("laboran") || "PIC. Laboran";

    // Data params - passed as JSON body substitute (query param for GET)
    const encodedRecords = searchParams.get("records");
    let records: BapRecord[] = [];
    if (encodedRecords) {
      records = JSON.parse(decodeURIComponent(encodedRecords));
    }

    // Sort records by tanggal
    records.sort((a, b) => a.tanggal.localeCompare(b.tanggal));

    // Load the xlsx template from public/templates
    const templatePath = path.join(process.cwd(), "public", "templates", "BAP_template.xlsx");
    if (!fs.existsSync(templatePath)) {
      return NextResponse.json({ error: "Template not found" }, { status: 500 });
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(templatePath);

    const ws = workbook.worksheets[0];

    // Rename the worksheet to the selected month name
    const bulanName = INDONESIAN_MONTHS[bulan] || "LAPORAN";
    ws.name = bulanName;

    // ─── Fill header metadata ───────────────────────────────────────────────
    ws.getCell("D4").value = nama.toUpperCase();
    ws.getCell("D5").value = nim;
    ws.getCell("D6").value = namaLab.toUpperCase();
    ws.getCell("D7").value = prodi.toUpperCase();
    ws.getCell("D8").value = bulanName;
    ws.getCell("D9").value = tahun;
    // D10 remains SUM formula (auto-calculated by Excel from F13:F32)

    // ─── Clear existing data rows (13-32) ─────────────────────────────────
    const DATA_START_ROW = 13;
    const DATA_END_ROW = 32; // template has rows 13-32 for data
    for (let r = DATA_START_ROW; r <= DATA_END_ROW; r++) {
      ws.getCell(`A${r}`).value = null;
      ws.getCell(`B${r}`).value = null;
      ws.getCell(`C${r}`).value = null;
      ws.getCell(`D${r}`).value = null;
      ws.getCell(`E${r}`).value = null;
      ws.getCell(`F${r}`).value = null;
      ws.getCell(`G${r}`).value = null;
      ws.getCell(`H${r}`).value = null;
    }

    // ─── Fill data rows ────────────────────────────────────────────────────
    let totalJam = 0;
    records.forEach((rec, idx) => {
      const rowNum = DATA_START_ROW + idx;
      if (rowNum > DATA_END_ROW) return; // cap at 20 rows (template limit)

      const jamIn = timeToExcelSerial(rec.jam_masuk);
      const jamOut = timeToExcelSerial(rec.jam_keluar);
      const jam = rec.jumlah_jam || 0;
      totalJam += jam;

      const row = ws.getRow(rowNum);

      // No
      ws.getCell(`A${rowNum}`).value = idx + 1;

      // Tanggal — store as Date; format is already set in template styles
      ws.getCell(`B${rowNum}`).value = dateStrToDate(rec.tanggal);

      // Keep column C merged (B:C merge in template) — clear it
      ws.getCell(`C${rowNum}`).value = null;

      // Jam Masuk & Keluar as Excel time fraction (number formatted as time in template)
      ws.getCell(`D${rowNum}`).value = jamIn;
      ws.getCell(`E${rowNum}`).value = jamOut;

      // Jumlah Jam — plain number
      ws.getCell(`F${rowNum}`).value = jam;

      // Deskripsi
      ws.getCell(`G${rowNum}`).value = rec.deskripsi_pekerjaan;

      // Paraf — leave empty (for physical signature)
      ws.getCell(`H${rowNum}`).value = null;

      row.commit();
    });

    // D10 is SUM formula — override with actual total for safety
    ws.getCell("D10").value = totalJam;

    // ─── Signature section ─────────────────────────────────────────────────
    // City + date row (G35) — generate current date string
    const now = new Date();
    const months = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember",
    ];
    const dateLabel = `Bandung, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
    ws.getCell("G35").value = dateLabel;

    // Laboran name (G41)
    ws.getCell("G41").value = laboran;

    // ─── Write to buffer and return as download ────────────────────────────
    const buffer = await workbook.xlsx.writeBuffer();

    const fileName = `BAP_${bulanName}_${tahun}.xlsx`;
    return new NextResponse(buffer as ArrayBuffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("BAP export error:", err);
    return NextResponse.json(
      { error: "Failed to generate Excel file." },
      { status: 500 }
    );
  }
}
