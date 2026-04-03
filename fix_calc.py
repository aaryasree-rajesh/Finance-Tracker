import win32com.client, os

excel = win32com.client.Dispatch("Excel.Application")
excel.DisplayAlerts = False
file_path = os.path.abspath('finance_data.xlsx')

wb = None
for workbook in excel.Workbooks:
    if workbook.FullName.lower() == file_path.lower():
        wb = workbook
        break

if not wb:
    wb = excel.Workbooks.Open(file_path)

for sh in wb.Sheets:
    if sh.Name == 'Calculations':
        sh.Delete()

calc_ws = wb.Sheets.Add()
calc_ws.Name = 'Calculations'

calc_ws.Range("A1").Value = 'Metric'
calc_ws.Range("B1").Value = 'Value'

calculations = [
    ('Total Income', '=SUMIF(Sheet1!F:F,"Income",Sheet1!C:C)'),
    ('Total Expense', '=SUMIF(Sheet1!F:F,"Expense",Sheet1!C:C)'),
    ('Balance', '=B2-B3'),
    ('Average Expense', '=AVERAGEIF(Sheet1!F:F,"Expense",Sheet1!C:C)'),
    ('Average Income', '=AVERAGEIF(Sheet1!F:F,"Income",Sheet1!C:C)'),
    ('Max Expense', '=AGGREGATE(14,6,Sheet1!C2:C10000/(Sheet1!F2:F10000="Expense"),1)'),
    ('Min Expense', '=AGGREGATE(15,6,Sheet1!C2:C10000/(Sheet1!F2:F10000="Expense"),1)'),
    ('Transaction Count', '=COUNTA(Sheet1!A:A)-1'),
    ('Expense Count', '=COUNTIF(Sheet1!F:F,"Expense")'),
    ('Income Count', '=COUNTIF(Sheet1!F:F,"Income")')
]

for row_idx, (metric, formula) in enumerate(calculations, 2):
    calc_ws.Cells(row_idx, 1).Value = metric
    calc_ws.Cells(row_idx, 2).Formula = formula

wb.Save()
print("Calculations sheet fixed and replaced via COM!")
