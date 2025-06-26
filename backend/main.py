from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import financial, forecast, sentiment
from routers import ai
from shared.state import financial_df

app = FastAPI()

# CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(financial.router)
app.include_router(forecast.router)
app.include_router(sentiment.router)
app.include_router(ai.router, prefix="/ai", tags=["AI Insights"])