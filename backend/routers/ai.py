# routers/ai.py
from fastapi import APIRouter
from services.ai_utils import generate_insights

router = APIRouter()

@router.get("/insights")
async def get_ai_insights():
    snapshot_text = """
    Your snapshot summary or financial data text goes here.
    """
    result = generate_insights("Cafe Mocha Financials", snapshot_text)
    return {"insights": result}
