# backend/routers/sentiment.py

from fastapi import APIRouter, UploadFile, File, HTTPException
import pandas as pd
import re
from io import StringIO
from wordcloud import WordCloud
import base64
import matplotlib.pyplot as plt
from datetime import datetime

router = APIRouter(prefix="/sentiment", tags=["Sentiment Analysis"])

df_reviews = None

dish_keywords = ['pasta','burger','coffee','pizza','mocha','sandwich','wrap','brownie','smoothie']
aspects = ['food','service','ambience','pricing','staff','menu','cleanliness','waiting time','music','lighting']

@router.post("/upload")
async def upload_reviews(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")

    content = await file.read()
    df = pd.read_csv(StringIO(content.decode("utf-8")))

    df['Date'] = pd.to_datetime(df['Date'], errors='coerce')
    df['Clean_Review'] = df['Clean_Review'].astype(str)

    # Add emoji flag columns
    for emoji in dish_keywords + aspects:
        df[emoji] = df['Clean_Review'].str.contains(emoji, na=False)

    global df_reviews
    df_reviews = df
    return {"message": "Reviews uploaded and processed."}

@router.get("/mentions")
async def get_keyword_mentions():
    if df_reviews is None:
        raise HTTPException(status_code=400, detail="No reviews data available.")

    return {emoji: int(df_reviews[emoji].sum()) for emoji in dish_keywords + aspects}

@router.get("/wordcloud")
async def get_wordclouds():
    if df_reviews is None:
        raise HTTPException(status_code=400, detail="No reviews data available.")

    wc_img = lambda label: _wordcloud_image(df_reviews[df_reviews['Predicted_Label'] == label]['Clean_Review'])

    return {
        "positive": wc_img("LABEL_2"),
        "negative": wc_img("LABEL_0")
    }

def _wordcloud_image(series):
    text = " ".join(series.dropna().tolist())
    wc = WordCloud(width=400, height=200).generate(text)

    fig, ax = plt.subplots(figsize=(5, 2))
    ax.imshow(wc, interpolation="bilinear")
    ax.axis("off")

    plt.savefig("temp_wc.png", format="png", bbox_inches="tight", pad_inches=0)
    with open("temp_wc.png", "rb") as f:
        img_base64 = base64.b64encode(f.read()).decode("utf-8")
    plt.close()
    return f"data:image/png;base64,{img_base64}"

@router.get("/bubble")
async def get_bubble_data():
    if df_reviews is None:
        raise HTTPException(status_code=400, detail="No reviews data available.")

    rows = []
    for asp in aspects:
        for lbl in df_reviews['Predicted_Label'].unique():
            count = df_reviews[(df_reviews[asp]) & (df_reviews['Predicted_Label'] == lbl)].shape[0]
            if count > 0:
                rows.append({'Aspect': asp, 'Sentiment': lbl, 'Count': count})
    return rows

@router.get("/heatmap")
async def get_heatmap_data():
    if df_reviews is None:
        raise HTTPException(status_code=400, detail="No reviews data available.")

    heat = []
    for asp in aspects:
        neg = df_reviews[(df_reviews[asp]) & (df_reviews['Predicted_Label'] == 'LABEL_0')].shape[0]
        neu = df_reviews[(df_reviews[asp]) & (df_reviews['Predicted_Label'] == 'LABEL_1')].shape[0]
        pos = df_reviews[(df_reviews[asp]) & (df_reviews['Predicted_Label'] == 'LABEL_2')].shape[0]
        heat.append({'Aspect': asp, 'Negative': neg, 'Neutral': neu, 'Positive': pos})
    return heat

@router.get("/trend")
async def get_monthly_sentiment_trend():
    if df_reviews is None:
        raise HTTPException(status_code=400, detail="No reviews data available.")

    df_reviews['Month'] = df_reviews['Date'].dt.to_period('M').astype(str)
    trend = df_reviews.groupby(['Month', 'Predicted_Label']).size().reset_index(name='Count')
    return trend.to_dict(orient='records')

@router.get("/radar")
async def get_radar_data():
    if df_reviews is None:
        raise HTTPException(status_code=400, detail="No reviews data available.")

    rows = []
    for asp in aspects:
        pos = df_reviews[(df_reviews[asp]) & (df_reviews['Predicted_Label'] == 'LABEL_2')].shape[0]
        neg = df_reviews[(df_reviews[asp]) & (df_reviews['Predicted_Label'] == 'LABEL_0')].shape[0]
        rows.append({'Aspect': asp, 'Positive': pos, 'Negative': neg})
    return rows

@router.get("/ratings")
async def get_rating_distribution():
    if df_reviews is None:
        raise HTTPException(status_code=400, detail="No reviews data available.")

    counts = df_reviews['Rating'].value_counts().sort_index()
    return counts.to_dict()
