import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np

app = Flask(__name__)
CORS(app)

# 🔥 COIN MAPPING (Binance format)
SUPPORTED_COINS = ["BTC", "ETH", "BNB", "SOL", "XRP", "ADA"]

# 🔥 GET LIVE PRICE
def get_live_price(symbol):
    try:
        url = f"https://api.binance.com/api/v3/ticker/price?symbol={symbol}USDT"
        res = requests.get(url, timeout=5)
        data = res.json()

        return float(data["price"]) * 83  # INR
    except:
        return None


# 🔥 GET HISTORICAL DATA (LAST 50 HOURS)
def get_historical_data(symbol):
    try:
        url = f"https://api.binance.com/api/v3/klines?symbol={symbol}USDT&interval=1h&limit=50"
        res = requests.get(url, timeout=5)
        data = res.json()

        closes = [float(candle[4]) * 83 for candle in data]
        return closes
    except:
        return []


# 🔥 REAL TREND-BASED PREDICTION
def predict_prices(prices):
    predictions = []

    if len(prices) < 10:
        return []

    # Calculate trend using last prices
    returns = np.diff(prices) / prices[:-1]
    avg_return = np.mean(returns)

    current_price = prices[-1]
    predicted_price = current_price

    for i in range(24):
        noise = np.random.normal(0, 0.002)
        predicted_price = predicted_price * (1 + avg_return + noise)

        predictions.append({
            "hour": i + 1,
            "predicted_price": round(predicted_price, 2)
        })

    return predictions


# 🔥 SIGNAL GENERATION
def generate_signal(current_price, predicted_prices):
    if not predicted_prices:
        return "HOLD", 50

    final_price = predicted_prices[-1]["predicted_price"]
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

    # 🔥 REAL DATA
    current_price = get_live_price(symbol)
    historical_prices = get_historical_data(symbol)

    if not current_price or not historical_prices:
        return jsonify({"error": "Failed to fetch market data"}), 500

    # 🔥 REAL PREDICTION
    predictions = predict_prices(historical_prices)

    # 🔥 SIGNAL
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
