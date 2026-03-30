import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np

app = Flask(__name__)
CORS(app)

# Mock prices (INR)
MOCK_PRICES = {
    'BTC': 5010000,
    'ETH': 250500,
    'BNB': 41750,
    'SOL': 12525
}

@app.route('/')
def home():
    return "ML Service Running 🚀"

@app.route('/predict', methods=['GET', 'POST'])
def predict():
    if request.method == 'GET':
        symbol = request.args.get('symbol', 'BTC').upper()
    else:
        symbol = request.json.get('symbol', 'BTC').upper()

    current_price = MOCK_PRICES.get(symbol, 100)

    predictions = []
    prices = []

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

    expected_return = (prices[-1] - current_price) / current_price

    if expected_return > 0.02:
        signal = "Buy"
    elif expected_return < -0.02:
        signal = "Sell"
    else:
        signal = "Hold"

    confidence = round(np.random.uniform(65, 95), 2)

    return jsonify({
        "symbol": symbol,
        "current_price_reference": current_price,
        "predictions": predictions,
        "signal": signal,
        "confidence_percentage": confidence
    })

# 🔥 IMPORTANT FOR RENDER
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5001))
    print(f"Starting ML Flask Server on Port {port}...")
    app.run(host='0.0.0.0', port=port)
