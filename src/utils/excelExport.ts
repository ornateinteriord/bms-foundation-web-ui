import XLSX from 'xlsx-js-style';

interface ExportColumn {
    header: string;
    key: string;
    width?: number;
}

interface ExportOptions {
    fileName: string;
    title: string;
    columns: ExportColumn[];
    data: any[];
    statusField?: string;
}

export const exportToExcel = ({
    fileName,
    title,
    columns,
    data,
    statusField = 'status'
}: ExportOptions) => {
    // 1. Create workbook and worksheet
    const wb = XLSX.utils.book_new();

    // 2. Prepare data with empty first row for title
    const wsData = [
        Array(columns.length).fill(null), // Row 1: Title placeholder
        columns.map(col => col.header),   // Row 2: Headers
        ...data.map(row => columns.map(col => {
            const value = row[col.key];
            // Format dates if value is a Date object or potential date string
            if (value && (value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)) && value.includes('-')))) {
                // You might want to format date here if needed, or rely on Excel formatting
                // For simplicity, we keep string if it's already formatted string
            }
            return value;
        }))
    ];

    // 3. Create worksheet from array of arrays
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // 4. Merge Title cells (A1 to LastColumn1)
    if (!ws['!merges']) ws['!merges'] = [];
    ws['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: columns.length - 1 } });

    // 5. Add Title content and Style
    ws['A1'] = {
        v: title,
        t: 's',
        s: {
            font: { bold: true, sz: 16, color: { rgb: "FFFFFF" } },
            alignment: { horizontal: "center", vertical: "center" },
            fill: { fgColor: { rgb: "1a237e" } }, // Dark blue background
            border: {
                top: { style: "thin" },
                bottom: { style: "thin" },
                left: { style: "thin" },
                right: { style: "thin" }
            }
        }
    };

    // 6. Style Headers (Row 2)
    // Range for headers is A2 to [LastColumn]2
    const headerRowIndex = 1; // 0-indexed, so row 2 is index 1
    columns.forEach((_, index) => {
        const cellRef = XLSX.utils.encode_cell({ r: headerRowIndex, c: index });
        if (!ws[cellRef]) ws[cellRef] = { v: '', t: 's' };

        ws[cellRef].s = {
            font: { bold: true, sz: 12, color: { rgb: "000000" } },
            alignment: { horizontal: "center", vertical: "center" },
            fill: { fgColor: { rgb: "f1f5f9" } }, // Light gray
            border: {
                top: { style: "thin" },
                bottom: { style: "medium" }, // Slightly thicker bottom border for header
                left: { style: "thin" },
                right: { style: "thin" }
            }
        };
    });

    // 7. Style Data Rows (Row 3 onwards)
    data.forEach((row, rowIndex) => {
        const currentRowIndex = rowIndex + 2; // Title is 0, Header is 1, Data starts at 2

        columns.forEach((col, colIndex) => {
            const cellRef = XLSX.utils.encode_cell({ r: currentRowIndex, c: colIndex });

            // Generate cell if it doesn't exist (e.g. null value)
            if (!ws[cellRef]) {
                ws[cellRef] = { v: '', t: 's' };
            }

            // Default Style
            let cellStyle: any = {
                font: { sz: 11 },
                alignment: { vertical: "center", horizontal: "left" }, // Default left align
                border: {
                    top: { style: "thin" },
                    bottom: { style: "thin" },
                    left: { style: "thin" },
                    right: { style: "thin" }
                },
                fill: { fgColor: { rgb: "FFFFFF" } } // White default
            };

            // Status Styling
            if (col.key === statusField) {
                const statusValue = String(row[statusField] || '').toLowerCase();
                cellStyle.alignment = { vertical: "center", horizontal: "center" };

                if (statusValue === 'active') {
                    cellStyle.fill = { fgColor: { rgb: "d1fae5" } }; // Light green
                    cellStyle.font = { sz: 11, color: { rgb: "065f46" }, bold: true }; // Dark green text
                } else if (statusValue === 'inactive' || statusValue === 'blocked') {
                    cellStyle.fill = { fgColor: { rgb: "fee2e2" } }; // Light red
                    cellStyle.font = { sz: 11, color: { rgb: "991b1b" }, bold: true }; // Dark red text
                } else if (statusValue === 'pending') {
                    cellStyle.fill = { fgColor: { rgb: "fef3c7" } }; // Light yellow
                    cellStyle.font = { sz: 11, color: { rgb: "92400e" }, bold: true }; // Dark orange text
                }
            }

            // Align numbers right
            if (typeof row[col.key] === 'number' || (typeof row[col.key] === 'string' && !isNaN(Number(row[col.key])) && !col.key.toLowerCase().includes('phone') && !col.key.toLowerCase().includes('mobile'))) {
                cellStyle.alignment = { ...cellStyle.alignment, horizontal: "right" };
            }

            ws[cellRef].s = cellStyle;
        });
    });

    // 8. Set Column Widths
    ws['!cols'] = columns.map(col => ({ wch: col.width || 20 }));

    // 9. Add worksheet and export
    // 9. Add worksheet and export
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    // Generate buffer
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    // Create Blob
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    // Trigger Download
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${fileName}.xlsx`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.URL.revokeObjectURL(url);

    return true;
};
