from shared.state import financial_df

def get_summary_snapshot():
    df = financial_df
    if df is None:
        raise ValueError("Financial data not uploaded.")

    return {
        "total_customers": int(df["Customer_Footfall"].sum()),
        "avg_profit": round(df["Profit"].mean(), 2),
        "min_profit": round(df["Profit"].min(), 2),
        "max_profit": round(df["Profit"].max(), 2),
        "profit_by_month": df.groupby(df["Date"].dt.to_period("M"))["Profit"].sum().to_dict()
    }
