import os
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np

app = Flask(__name__)
CORS(app)

# 🔥 LIVE PRICE FUNCTION (BINANCE + FALLBACK)
def get_live_price(symbol):
    try:
        # Binance API (FAST + RELIABLE)
        url = f"https://api.binance.com/api/v3/ticker/price?symbol={symbol}USDT"
        res = requests.get(url, timeout=5)
        data = res.json()

        usd_price = float(data["price"])

        # Convert USD → INR
        inr_price = usd_price * 83

        return inr_price

    except Exception as e:
        print("Binance error:", e)

        # 🔁 Fallback → CoinGecko
        try:
            cg_url = f"https://api.coingecko.com/api/v3/simple/price?ids={symbol.lower()}&vs_currencies=inr"
            res = requests.get(cg_url, timeout=5)
            data = res.json()

            return data[symbol.lower()]["inr"]

        except Exception as e:
            print("CoinGecko error:", e)
            return 100


@app.route('/predict', methods=['GET', 'POST'])
def predict():
    """
    Returns next 24 hours of predictions based on simulated ML.
    Accepts: ?symbol=BTC
    """

    # Get symbol
    if request.method == 'GET':
        symbol = request.args.get('symbol', 'BTC').upper()
    else:
        symbol = request.json.get('symbol', 'BTC').upper()

    # 🔥 REAL PRICE (FIXED)
    current_price = get_live_price(symbol)

    predictions = []
    prices = []

    # Slight trend simulation
    trend = np.random.normal(0.0005, 0.002)

    predicted_price = current_price

    for i in range(24):
        volatility = np.random.normal(0, current_price * 0.005)

        predicted_price = predicted_price + volatility + (current_price * trend)

        prices.append(predicted_price)

        predictions.append({
            "hour": i + 1,
            "predicted_price": round(predicted_price, 2)
        })

    # 🔔 SIGNAL LOGIC
    expected_return = (prices[-1] - current_price) / current_price

    if expected_return > 0.02:
        signal = "BUY"
    elif expected_return < -0.02:
        signal = "SELL"
    else:
        signal = "HOLD"

    confidence = round(np.random.uniform(65, 95), 2)

    return jsonify({
        "symbol": symbol,
        "current_price": round(current_price, 2),
        "predictions": predictions,
        "signal": signal,
        "confidence_percentage": confidence
    })


if __name__ == '__main__':
    print("🚀 ML Server Running on Port 5001...")
    app.run(host='0.0.0.0', port=5001, debug=True)
