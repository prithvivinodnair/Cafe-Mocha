from fastapi import APIRouter, UploadFile, File, HTTPException
import pandas as pd
from io import StringIO
import shared.state


router = APIRouter(prefix="/financial", tags=["Financial Insights"])

# In-memory cache (for demo purposes)
df_financial = None

@router.post("/upload")
async def upload_financial_csv(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")
    
    content = await file.read()
    df = pd.read_csv(StringIO(content.decode("utf-8")))
    
    df['Date'] = pd.to_datetime(df['Date'])
    df = df.sort_values('Date')
    df['Month_Year'] = df['Date'].dt.to_period('M').astype(str)
    df['Month'] = df['Date'].dt.month
    df['Season'] = (df['Month'] % 12 // 3 + 1).map({1:'Winter',2:'Spring',3:'Summer',4:'Fall'})
    required = ['Marketing_Spend','Food_Costs','Labor_Costs','Rent','Utilities']
    df['Total_Expenses'] = df[required].sum(axis=1)

    import shared.state
    shared.state.financial_df = df  # ✅ This line stores it globally for other routes

    global df_financial
    df_financial = df
    return {"message": "File uploaded and processed successfully."}


@router.get("/summary")
async def get_financial_summary():
    global df_financial
    if df_financial is None:
        raise HTTPException(status_code=400, detail="No financial data available.")
    
    try:
        total_customers = int(df_financial['Customer_Footfall'].sum().item())
        avg_profit = float(df_financial['Profit'].mean().item())
        min_profit = float(df_financial['Profit'].min().item())

        if avg_profit < 0:
            status = "loss"
        elif avg_profit < 2000:
            status = "low"
        else:
            status = "profitable"

        return {
            "total_customers": total_customers,
            "avg_profit": round(avg_profit, 2),
            "min_profit": round(min_profit, 2),
            "status": status
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/expense-breakdown")
async def get_expense_distribution():
    global df_financial
    if df_financial is None:
        raise HTTPException(status_code=400, detail="No financial data available.")
    
    expense_cols = ['Marketing_Spend','Food_Costs','Labor_Costs','Rent','Utilities']
    breakdown = df_financial[expense_cols].sum().reset_index()
    breakdown.columns = ['Expense', 'Total']
    return breakdown.to_dict(orient="records")

@router.get("/monthly-profit")
async def get_monthly_profit():
    global df_financial
    if df_financial is None:
        raise HTTPException(status_code=400, detail="No financial data available.")

    profit_monthly = df_financial.groupby('Month_Year')['Profit'].sum().reset_index()
    return profit_monthly.to_dict(orient="records")
