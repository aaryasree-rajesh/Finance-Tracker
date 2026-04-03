import win32com.client, os

try:
    excel = win32com.client.Dispatch("Excel.Application")
    excel.DisplayAlerts = False
    wb = excel.Workbooks.Open(os.path.abspath('finance_data.xlsx'))
    pt = wb.Sheets('PivotTables').PivotTables('PivotCategory')

    with open("test_slicer_output.txt", "w") as f:
        try:
            f.write("Trying Add2 with PivotField object\n")
            fld = pt.PivotFields('Category')
            sc = wb.SlicerCaches.Add2(pt, fld)
            f.write("Success Add2 PivotField\n")
        except Exception as e:
            f.write(f"Failed Add2: {e}\n")

            try:
                f.write("Trying Add with PivotField object\n")
                sc = wb.SlicerCaches.Add(pt, fld)
                f.write("Success Add PivotField\n")
            except Exception as e2:
                f.write(f"Failed Add: {e2}\n")

        if 'sc' in locals():
            try:
                dashboard = wb.Sheets('Dashboard')
                sl = sc.Slicers.Add(dashboard, "Category", "MySlicer2", "Category Filter")
                f.write("Slicer added to Dashboard sheet (4 args).\n")
            except Exception as e3:
                f.write(f"Failed Slicers.Add (4 args): {e3}\n")
                try:
                    sl = sc.Slicers.Add(dashboard)
                    f.write("Slicer added to Dashboard sheet (1 arg).\n")
                except Exception as e4:
                    f.write(f"Failed Slicers.Add (1 arg): {e4}\n")

    wb.Close(SaveChanges=False)
    excel.Quit()
except Exception as outer:
    with open("test_slicer_output.txt", "w") as f:
        f.write(str(outer))
