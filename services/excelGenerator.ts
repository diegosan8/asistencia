import { MONTH_NAMES_ES, DAYS_OF_WEEK_CONFIG } from '../constants';
import type { Player, DayOfWeekIndex } from '../types';

// This file uses the global XLSX object loaded from the CDN in index.html
declare var XLSX: any;

interface GenerateWorkbookArgs {
    teamName: string;
    year: number;
    players: Player[];
    selectedDays: Set<DayOfWeekIndex>;
}

const MAX_PLAYERS = 100; // Set a maximum number of players for dynamic rows

const getColName = (n: number) => {
    let s = '';
    while (n > 0) {
        const rem = (n - 1) % 26;
        s = String.fromCharCode(65 + rem) + s;
        n = Math.floor((n - 1) / 26);
    }
    return s;
};

const getPracticeDatesForMonth = (year: number, monthIndex: number, selectedDays: Set<DayOfWeekIndex>) => {
    const dates: Date[] = [];
    const date = new Date(year, monthIndex, 1);
    while (date.getMonth() === monthIndex) {
        if (selectedDays.has(date.getDay() as DayOfWeekIndex)) {
            dates.push(new Date(date));
        }
        date.setDate(date.getDate() + 1);
    }
    return dates;
};

// --- Cell Styles ---
const headerStyle = { font: { bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "004D40" } }, alignment: { horizontal: "center", vertical: "center" } };
const nameStyle = { font: { bold: true } };
const absentStyle = { fill: { fgColor: { rgb: "FFCDD2" } }, alignment: { horizontal: "center", vertical: "center" } };
const percentageHeaderStyle = { font: { bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "1976D2" } }, alignment: { horizontal: "center", vertical: "center" } };
const percentageStyle = { font: { bold: true }, fill: { fgColor: { rgb: "FFF9C4" } }, alignment: { horizontal: "center", vertical: "center" } };
const centerAlign = { alignment: { horizontal: "center", vertical: "center" } };
const instructionHeaderStyle = { font: { bold: true, sz: 16, color: { rgb: "004D40" } } };
const instructionStepStyle = { font: { bold: true, sz: 12 } };

export const generateAttendanceWorkbook = ({ teamName, year, players, selectedDays }: GenerateWorkbookArgs) => {
    const wb = XLSX.utils.book_new();

    // --- 0. Instructions Sheet ---
    const instructionsWsData = [
        [{v: "Instrucciones para usar en Google Sheets", s: instructionHeaderStyle}],
        [],
        [{v: "Paso 1: Sube este archivo a tu Google Drive.", s: instructionStepStyle}],
        ["Visita https://drive.google.com y arrastra este archivo a 'Mi unidad'."],
        [],
        [{v: "Paso 2: Ábrelo con Hojas de cálculo de Google (Google Sheets).", s: instructionStepStyle}],
        ["Haz doble clic en el archivo dentro de Google Drive para abrirlo."],
        [],
        [{v: "Paso 3: Convertir celdas en casillas de verificación (checkboxes).", s: instructionStepStyle}],
        ["- Ve a una hoja de un mes (ej. 'Enero')."],
        ["- Selecciona todas las celdas de asistencia (el área con fondo rojo claro)."],
        ["- En el menú, ve a 'Insertar' > 'Casilla de verificación'."],
        ["- Repite este paso para cada hoja mensual."],
        [],
        [{v: "Paso 4 (Opcional): Añadir colores automáticos (formato condicional).", s: instructionStepStyle}],
        ["- Con las mismas celdas seleccionadas, ve a 'Formato' > 'Formato condicional'."],
        ["- El formato para ausentes (fondo rojo) ya está aplicado. Para los presentes:"],
        ["- Haz clic en 'Añadir otra regla'."],
        ["- En 'Reglas de formato', elige 'El texto es exactamente' y escribe VERDADERO."],
        ["- En 'Estilo de formato', elige un color de fondo verde."],
        ["- Haz clic en 'Hecho' y repite para los otros meses."],
    ];
    const instructionsWs = XLSX.utils.aoa_to_sheet(instructionsWsData, {cellStyles: true});
    instructionsWs['!cols'] = [{ wch: 80 }];
    XLSX.utils.book_append_sheet(wb, instructionsWs, "Instrucciones");


    // --- 1. Roster Sheet ("Caratula") ---
    // Pad the roster with empty rows up to MAX_PLAYERS to allow for dynamic additions
    const rosterRows = Array.from({ length: MAX_PLAYERS }, (_, i) => {
      const p = players[i];
      return {
          "N° Camiseta": p ? p.jersey : "",
          "Nombre y Apellido": p ? p.name : "",
          "DNI": p ? p.dni : "",
          "Fecha Nacimiento": p ? p.birthDate : "",
      };
    });
    const rosterWs = XLSX.utils.json_to_sheet(rosterRows);
    rosterWs['!cols'] = [{ wch: 15 }, { wch: 30 }, { wch: 15 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, rosterWs, "Caratula");

    // --- 2. Monthly Sheets ---
    MONTH_NAMES_ES.forEach((monthName, monthIndex) => {
        const practiceDates = getPracticeDatesForMonth(year, monthIndex, selectedDays);
        const dayShorts = DAYS_OF_WEEK_CONFIG.reduce((acc, day) => ({...acc, [day.index]: day.short}), {} as Record<DayOfWeekIndex, string>);

        const headers = ["Nombre Completo", ...practiceDates.map(d => `${dayShorts[d.getDay() as DayOfWeekIndex]} ${d.getDate()}/${d.getMonth() + 1}`), "Asistencia"];
        const aoa: any[][] = [headers];

        const firstDateCol = 'B';
        const lastDateCol = getColName(1 + practiceDates.length);

        for (let i = 0; i < MAX_PLAYERS; i++) {
            const rowNum = i + 2;
            const nameFormula = `IF(LEN(Caratula!B${rowNum})>0, Caratula!B${rowNum}, "")`;

            const attendanceFormula = practiceDates.length > 0
                ? `IF(LEN(A${rowNum})>0, IFERROR(COUNTIF(${firstDateCol}${rowNum}:${lastDateCol}${rowNum}, TRUE) / COUNTA(${firstDateCol}$1:${lastDateCol}$1), ""), "")`
                : "";
            
            // Use null for empty, editable cells. A formula would block user interaction.
            const checkboxCells = practiceDates.map(() => null);

            const rowData = [{ f: nameFormula }, ...checkboxCells, { f: attendanceFormula, t: 'n', z: '0.00%' }];
            aoa.push(rowData);
        }

        const ws = XLSX.utils.aoa_to_sheet(aoa);
        
        // Styling
        ws['!cols'] = [{ wch: 30 }, ...Array(practiceDates.length).fill({ wch: 7 }), { wch: 12 }];
        headers.forEach((_, c) => {
            const cellRef = XLSX.utils.encode_cell({ r: 0, c });
            ws[cellRef].s = (c < headers.length -1) ? headerStyle : percentageHeaderStyle;
        });
        
        for (let r = 0; r < MAX_PLAYERS; r++) {
            const playerRow = r + 1;
            ws[XLSX.utils.encode_cell({r: playerRow, c: 0})].s = nameStyle; // Name style
            practiceDates.forEach((__, c) => {
                const cell = ws[XLSX.utils.encode_cell({r: playerRow, c: c + 1})];
                // Check if cell exists before styling to avoid errors on totally empty rows
                if(cell) {
                    cell.s = absentStyle;
                } else { // If cell is null, create it to apply style
                    XLSX.utils.sheet_add_aoa(ws, [[{v: '', s: absentStyle}]], { origin: {r: playerRow, c: c + 1} });
                }
            });
            ws[XLSX.utils.encode_cell({r: playerRow, c: headers.length - 1})].s = percentageStyle; // Percentage cell
        }

        XLSX.utils.book_append_sheet(wb, ws, monthName);
    });

    // --- 3. Annual Summary Sheet ---
    const summaryHeaders = ["Nombre Completo", ...MONTH_NAMES_ES, "Total Anual"];
    const summaryAoa: any[][] = [summaryHeaders];

    for (let i = 0; i < MAX_PLAYERS; i++) {
        const rowNum = i + 2;
        const nameFormula = `IF(LEN(Caratula!B${rowNum})>0, Caratula!B${rowNum}, "")`;
        
        const monthFormulas = MONTH_NAMES_ES.map(monthName => {
            // Dynamic formula to find the "Asistencia" column and get the value.
            // This is robust against adding/removing columns in the monthly sheets.
            const formula = `INDEX('${monthName}'!A:ZZ, ${rowNum}, MATCH("Asistencia", '${monthName}'!$1:$1, 0))`;
            return { f: `IF(LEN($A${rowNum})>0, IFERROR(${formula}, ""), "")`, t: 'n', z: '0.00%' };
        });

        const totalFormula = `IF(LEN($A${rowNum})>0, IFERROR(AVERAGE(B${rowNum}:${getColName(1 + MONTH_NAMES_ES.length)}${rowNum}), ""), "")`;
        
        const rowData = [
            { f: nameFormula },
            ...monthFormulas,
            { f: totalFormula, t: 'n', z: '0.00%' }
        ];
        summaryAoa.push(rowData);
    }

    const summaryWs = XLSX.utils.aoa_to_sheet(summaryAoa);
    summaryWs['!cols'] = [{ wch: 30 }, ...Array(MONTH_NAMES_ES.length).fill({ wch: 10 }), { wch: 12 }];
    summaryHeaders.forEach((_, c) => {
        const cellRef = XLSX.utils.encode_cell({ r: 0, c });
        summaryWs[cellRef].s = (c < summaryHeaders.length -1) ? headerStyle : percentageHeaderStyle;
    });

    for (let r = 0; r < MAX_PLAYERS; r++) {
        const playerRow = r + 1;
        summaryWs[XLSX.utils.encode_cell({r: playerRow, c: 0})].s = nameStyle; // Name style
        MONTH_NAMES_ES.forEach((__, c) => {
             const cell = summaryWs[XLSX.utils.encode_cell({r: playerRow, c: c + 1})];
             if(cell) cell.s = centerAlign;
        });
        summaryWs[XLSX.utils.encode_cell({r: playerRow, c: summaryHeaders.length - 1})].s = percentageStyle;
    }

    XLSX.utils.book_append_sheet(wb, summaryWs, "Resumen Anual");

    // --- 4. Download ---
    XLSX.writeFile(wb, `Plantilla_Asistencia_${teamName}_${year}.xlsx`);
};
