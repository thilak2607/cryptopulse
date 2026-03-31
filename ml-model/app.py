import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np

app = Flask(__name__)
CORS(app)

SUPPORTED_COINS = ["BTC", "ETH", "BNB", "SOL", "XRP", "ADA"]

# 🔥 COINGECKO MAPPING
COIN_MAP = {
    "BTC": "bitcoin",
    "ETH": "ethereum",
    "BNB": "binancecoin",
    "SOL": "solana",
    "XRP": "ripple",
    "ADA": "cardano"
}


# 🔥 LIVE PRICE (BINANCE + FALLBACK)
def get_live_price(symbol):
    try:
        url = f"https://api.binance.com/api/v3/ticker/price?symbol={symbol}USDT"
        res = requests.get(url, timeout=5)
        data = res.json()

        if "price" in data:
            return float(data["price"]) * 83

    except Exception as e:
        print("Binance price failed:", e)

    try:
        coin_id = COIN_MAP.get(symbol, "bitcoin")
        url = f"https://api.coingecko.com/api/v3/simple/price?ids={coin_id}&vs_currencies=inr"
        res = requests.get(url, timeout=5)
        data = res.json()

        return data[coin_id]["inr"]

    except Exception as e:
        print("CoinGecko price failed:", e)

    return None


# 🔥 HISTORICAL DATA (BINANCE + FALLBACK)
def get_historical_data(symbol):
    try:
        url = f"https://api.binance.com/api/v3/klines?symbol={symbol}USDT&interval=1h&limit=50"
        res = requests.get(url, timeout=5)
        data = res.json()

        if isinstance(data, list):
            return [float(c[4]) * 83 for c in data]

    except Exception as e:
        print("Binance history failed:", e)

    try:
        coin_id = COIN_MAP.get(symbol, "bitcoin")
        url = f"https://api.coingecko.com/api/v3/coins/{coin_id}/market_chart?vs_currency=inr&days=2"
        res = requests.get(url, timeout=5)
        data = res.json()

        prices = data.get("prices", [])
        return [p[1] for p in prices[-50:]]

    except Exception as e:
        print("CoinGecko history failed:", e)

    return []


# 🔥 TREND-BASED PREDICTION
def predict_prices(prices):
    if len(prices) < 10:
        return []

    returns = np.diff(prices) / prices[:-1]
    avg_return = np.mean(returns)

    predicted_price = prices[-1]
    predictions = []

    for i in range(24):
        noise = np.random.normal(0, 0.002)
        predicted_price *= (1 + avg_return + noise)

        predictions.append({
            "hour": i + 1,
            "predicted_price": round(predicted_price, 2)
        })

    return predictions


# 🔥 SIGNAL
def generate_signal(current_price, predictions):
    if not predictions:
        return "HOLD", 50

    final_price = predictions[-1]["predicted_price"]
    change = (final_price - current_price) / current_price

    if change > 0.02:
        return "BUY", round(change * 100, 2)
    elif change < -0.02:
        return "SELL", round(abs(change) * 100, 2)
    else:
        return "HOLD", round(abs(change) * 100, 2)


@app.route('/')
def home():
    return "🚀 CryptoPulse ML API LIVE"


@app.route('/predict', methods=['GET'])
def predict():
    symbol = request.args.get('symbol', 'BTC').upper()

    if symbol not in SUPPORTED_COINS:
        return jsonify({"error": "Unsupported coin"}), 400

    current_price = get_live_price(symbol)
    historical_prices = get_historical_data(symbol)

    # 🔥 FAIL SAFE (IMPORTANT)
    if current_price is None or len(historical_prices) < 10:
        return jsonify({
            "error": "Market data temporarily unavailable",
            "hint": "Try again in few seconds"
        }), 200

    predictions = predict_prices(historical_prices)
    signal, confidence = generate_signal(current_price, predictions)

    return jsonify({
        "symbol": symbol,
        "current_price": round(current_price, 2),
        "predictions": predictions,
        "signal": signal,
        "confidence_percentage": confidence
    })


if __name__ == '__main__':
    print("🚀 ML Server Running...")
    app.run(host='0.0.0.0', port=5001)
