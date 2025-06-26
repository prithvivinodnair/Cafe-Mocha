from fastapi import APIRouter, UploadFile, File, HTTPException
import pandas as pd
import numpy as np
from io import StringIO
from statsmodels.tsa.statespace.sarimax import SARIMAX
from pandas.tseries.offsets import DateOffset
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from xgboost import XGBRegressor

router = APIRouter(prefix="/forecast", tags=["Forecast & Prediction"])

df_forecast = None  # Local to this module

# Upload Endpoint
@router.post("/upload")
async def upload_forecast_csv(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")

    content = await file.read()
    df = pd.read_csv(StringIO(content.decode("utf-8")))

    df['Date'] = pd.to_datetime(df['Date'])
    df = df.sort_values('Date')
    df['Month_Year'] = df['Date'].dt.to_period('M').astype(str)
    df['Month'] = df['Date'].dt.month
    df['Season'] = (df['Month'] % 12 // 3 + 1).map({1: 'Winter', 2: 'Spring', 3: 'Summer', 4: 'Fall'})
    
    required = ['Marketing_Spend', 'Food_Costs', 'Labor_Costs', 'Rent', 'Utilities']
    if not all(col in df.columns for col in required):
        raise HTTPException(status_code=400, detail="Missing required expense columns.")

    df['Total_Expenses'] = df[required].sum(axis=1)

    global df_forecast
    df_forecast = df
    return {"message": "Forecast file uploaded and processed."}

# Helper to return stored df
def get_df():
    global df_forecast
    if df_forecast is None:
        raise HTTPException(status_code=400, detail="No financial data available.")
    return df_forecast.copy()

# SARIMA Forecast
def forecast_sarima(series, steps=36):
    model = SARIMAX(
        series,
        order=(1, 1, 1),
        seasonal_order=(1, 1, 1, 12),
        enforce_stationarity=False,
        enforce_invertibility=False
    )
    result = model.fit(disp=False)
    return result.get_forecast(steps=steps).predicted_mean

@router.get("/sarima")
async def get_sarima_forecast():
    df = get_df()
    df_monthly = df.resample('MS', on='Date').sum()

    revenue_series = df_monthly['Revenue']
    expense_series = df_monthly['Total_Expenses']
    profit_series = df_monthly['Profit']

    future = pd.date_range(
        start=profit_series.index[-1] + DateOffset(months=1),
        periods=36,
        freq='MS'
    ).strftime("%Y-%m").tolist()

    forecasts = {
        "months": future,
        "revenue": forecast_sarima(revenue_series).tolist(),
        "expenses": forecast_sarima(expense_series).tolist(),
        "profit": forecast_sarima(profit_series).tolist()
    }
    return forecasts

# XGBoost Model Performance
@router.get("/xgboost")
async def get_model_performance():
    df = get_df()
    features = ['Customer_Footfall', 'Marketing_Spend', 'Food_Costs', 'Labor_Costs', 'Rent', 'Utilities', 'Revenue']

    if not all(f in df.columns for f in features + ['Profit']):
        raise HTTPException(status_code=400, detail="Required columns are missing.")

    X = df[features]
    y = df['Profit']
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = XGBRegressor(random_state=42)
    model.fit(X_train, y_train)
    pred = model.predict(X_test)

    mae = mean_absolute_error(y_test, pred)
    rmse = np.sqrt(mean_squared_error(y_test, pred))
    r2 = r2_score(y_test, pred)

    return {
        "MAE": round(mae, 2),
        "RMSE": round(rmse, 2),
        "R2": round(r2, 2)
    }
