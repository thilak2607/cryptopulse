import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
# In a real-world scenario, you would uncomment these and load a pre-trained Keras model:
# from tensorflow.keras.models import load_model

app = Flask(__name__)
CORS(app)

# Fake historical scaling factors and base sizes for mocked LSTM prediction (converted to INR)
MOCK_PRICES = {
    'BTC': 5010000,
    'ETH': 250500,
    'BNB': 41750,
    'SOL': 12525
}

@app.route('/predict', methods=['GET', 'POST'])
def predict():
    """
    Returns next 24 hours of predictions based on mocked LSTM.
    Accepts: ?symbol=BTC
    """
    # Accept GET or POST
    if request.method == 'GET':
        symbol = request.args.get('symbol', 'BTC').upper()
    else:
        symbol = request.json.get('symbol', 'BTC').upper()
        
    current_price = MOCK_PRICES.get(symbol, 100)
    
    # Generate 24 hourly predictions based on a random walk with trend
    predictions = []
    prices = []
    
    # We pretend our Mock LSTM sees an upward/downward trend
    trend = np.random.normal(0.0005, 0.002) 
    
    predicted_price = current_price
    for i in range(24):
        # Adding randomness (volatility) + trend
        volatility = np.random.normal(0, current_price * 0.005)
        predicted_price = predicted_price + volatility + (current_price * trend)
        prices.append(predicted_price)
        predictions.append({
            "hour": i + 1,
            "predicted_price": round(predicted_price, 2)
        })
        
    # Generate a Buy/Hold/Sell signal
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

if __name__ == '__main__':
    print("Starting ML Flask Server on Port 5001...")
    app.run(host='0.0.0.0', port=5001, debug=True)
