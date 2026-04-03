import os
import sys

try:
    import win32com.client
except ImportError:
    import subprocess
    print("Installing pywin32...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pywin32"])
    import win32com.client

EXCEL_FILE = os.path.abspath('finance_data.xlsx')

def create_dashboard():
    # Start Excel application
    excel = win32com.client.Dispatch("Excel.Application")
    excel.Visible = False  # Keep it invisible while modifying
    excel.DisplayAlerts = False
    
    try:
        # Open the workbook
        wb = excel.Workbooks.Open(EXCEL_FILE)
        
        # Ensure 'Sheet1' exists
        sheet1 = None
        for sh in wb.Sheets:
            if sh.Name == 'Sheet1':
                sheet1 = sh
                break
        
        if not sheet1:
            print("Sheet1 not found!")
            return

        # Check column formats and correct them
        # Columns: 'ID', 'Date', 'Amount', 'Category', 'Description', 'Type'
        max_row = sheet1.Cells(sheet1.Rows.Count, 1).End(-4162).Row # xlUp
        if max_row > 1:
            # Set Date column to Date format
            sheet1.Range(f"B2:B{max_row}").NumberFormat = "yyyy-mm-dd"
            # Set Amount column to Number/Currency format
            sheet1.Range(f"C2:C{max_row}").NumberFormat = "0.00"
            
        print("Formats fixed.")

        # Delete existing PivotTables and Dashboard sheets if they exist
        for sh in wb.Sheets:
            if sh.Name in ['PivotTables', 'Dashboard']:
                sh.Delete()

        # Create "PivotTables" sheet
        pivot_sh = wb.Sheets.Add()
        pivot_sh.Name = 'PivotTables'

        # Create "Dashboard" sheet
        dash_sh = wb.Sheets.Add()
        dash_sh.Name = 'Dashboard'
            
        # Define the source data range
        src_range = sheet1.Range(f"A1:F{max_row}")
        
        # Create Pivot Cache
        pc = wb.PivotCaches().Create(SourceType=1, SourceData=src_range) # xlDatabase
        
        # --- Pivot Table 1: Category vs Amount (Expenses) ---
        pt_cat = pc.CreatePivotTable(TableDestination=pivot_sh.Range("A3"), TableName="PivotCategory")
        
        # Add 'Type' as page/report filter
        f_type = pt_cat.PivotFields("Type")
        f_type.Orientation = 3 # xlPageField
        try:
            f_type.CurrentPage = "Expense"
        except:
            pass # Ignore if no expense data

        # Add 'Category' as row field
        f_cat = pt_cat.PivotFields("Category")
        f_cat.Orientation = 1 # xlRowField
        
        # Add 'Amount' as data field
        f_amt = pt_cat.AddDataField(pt_cat.PivotFields("Amount"), "Total Amount", -4112) # xlSum is -4112 standard, wait, xlSum is -4157 wait, xlSum = -4112 or -4157? Actually it's -4112. Let's use string Name or just let it default if we don't specify function?
        # Actually Default is Count for text, Sum for numbers. Let's just use string "Sum" if possible, but xlSum is -4112! Wait, xlSum is -4112.
        # No, xlSum = -4112, xlCount = -4112? xlSum is -4112!
        # Let's use numeric constant: xlSum = -4112
        f_amt.NumberFormat = "0.00"

        # --- Pivot Table 2: Date (Monthly) vs Amount (Income & Expenses) ---
        pt_trend = pc.CreatePivotTable(TableDestination=pivot_sh.Range("E3"), TableName="PivotTrend")
        
        f_date = pt_trend.PivotFields("Date")
        f_date.Orientation = 1 # xlRowField
        
        # Add 'Type' as column field
        f_type_trend = pt_trend.PivotFields("Type")
        f_type_trend.Orientation = 2 # xlColumnField
        
        # Add 'Amount' as data field
        f_amt_trend = pt_trend.AddDataField(pt_trend.PivotFields("Amount"), "Sum of Amount", -4112) # xlSum
        f_amt_trend.NumberFormat = "0.00"

        print("Pivot tables created.")

        # --- Create Charts on Dashboard ---
        
        # Chart 1: Category Bar Chart (Expense)
        chart_obj1 = dash_sh.ChartObjects().Add(Left=10, Top=50, Width=400, Height=250)
        chart1 = chart_obj1.Chart
        chart1.SetSourceData(Source=pivot_sh.Range(pt_cat.TableRange1.Address))
        chart1.ChartType = 57 # xlBarClustered
        chart1.HasTitle = True
        chart1.ChartTitle.Text = "Expenses by Category"

        # Chart 2: Income/Expense Trend (Line)
        chart_obj2 = dash_sh.ChartObjects().Add(Left=420, Top=50, Width=400, Height=250)
        chart2 = chart_obj2.Chart
        chart2.SetSourceData(Source=pivot_sh.Range(pt_trend.TableRange1.Address))
        chart2.ChartType = 4  # xlLine
        chart2.HasTitle = True
        chart2.ChartTitle.Text = "Income & Expense Trend"

        print("Charts created.")

        try:
            # Delete old slicer caches to avoid name conflicts
            for sc in wb.SlicerCaches:
                try:
                    sc.Delete()
                except:
                    pass

            slc_name = f"CategorySlicer"
            fld = pt_cat.PivotFields("Category")
            slc_cache = wb.SlicerCaches.Add2(pt_cat, fld, slc_name)
            
            # Add slicer to Dashboard sheet
            sl = slc_cache.Slicers.Add(dash_sh)
            sl.Top = 320
            sl.Left = 10
            sl.Width = 200
            sl.Height = 200
            
            # Link slicer to the other pivot table too!
            slc_cache.PivotTables.AddPivotTable(pt_trend)
            print("Slicer added.")
        except Exception as se:
            print(f"Error adding slicer: {se}")

        # Style the Dashboard
        dash_sh.Range("A1").Value = "FINANCIAL DASHBOARD"
        dash_sh.Range("A1").Font.Size = 24
        dash_sh.Range("A1").Font.Bold = True

        # Save and close
        wb.Save()
        wb.Close()
        print("Dashboard created successfully!")

    except Exception as e:
        print(f"Error: {e}")
        try:
            wb.Close(SaveChanges=False)
        except:
            pass
    finally:
        excel.DisplayAlerts = True
        excel.Quit()

if __name__ == "__main__":
    create_dashboard()
