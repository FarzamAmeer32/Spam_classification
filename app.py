import joblib
from flask import Flask, render_template, request, jsonify
from preprocessing import preprocess_text


app = Flask(__name__)


# Loading the trained model
model_path = 'model/best_spam_classifier.pkl'

try:
    model = joblib.load(model_path)
except FileNotFoundError:
    model = None


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/health', methods=['GET'])
def health():
    if model is not None:
        model_loaded = True
    else:
        model_loaded = False

    return jsonify({
        'status': 'ok',
        'model_loaded': model_loaded
    })


@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({
            'error': 'Model is not loaded. Add best_spam_classifier.pkl inside the model folder.'
        }), 503

    data = request.get_json()

    if data is None or 'text' not in data:
        return jsonify({
            'error': 'Please enter a message.'
        }), 400

    text = data['text'].strip()

    if text == '':
        return jsonify({
            'error': 'Message cannot be empty.'
        }), 400

    # Preprocessing the message
    processed_text = preprocess_text(text)

    # Making prediction
    prediction = model.predict([processed_text])[0]

    if prediction == 1:
        label = 'Spam'
        is_spam = True
    else:
        label = 'Not spam'
        is_spam = False

    confidence = None
    spam_probability = None
    ham_probability = None

    # Getting prediction probabilities if the model supports it
    if hasattr(model, 'predict_proba'):
        probabilities = model.predict_proba([processed_text])[0]
        classes = list(model.classes_)

        if 0 in classes:
            ham_index = classes.index(0)
            ham_probability = float(probabilities[ham_index])

        if 1 in classes:
            spam_index = classes.index(1)
            spam_probability = float(probabilities[spam_index])

        if is_spam:
            confidence = spam_probability
        else:
            confidence = ham_probability

    return jsonify({
        'label': label,
        'is_spam': is_spam,
        'confidence': confidence,
        'spam_probability': spam_probability,
        'ham_probability': ham_probability,
        'processed_text': processed_text
    })


if __name__ == '__main__':
    app.run(debug=True)
