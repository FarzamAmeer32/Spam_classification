# Spam Classification Web App

A simple full-stack web application that predicts whether a message is **Spam** or **Not Spam**.

The app uses a trained machine learning model with a **Flask backend** and a frontend built using **HTML, CSS, and JavaScript**.

## Features

* Spam message prediction
* Clean and responsive interface
* Prediction confidence
* Flask backend
* Machine learning based classification

## Tech Stack

* HTML
* CSS
* JavaScript
* Python
* Flask
* scikit-learn
* NLTK

## Project Structure

```text id="kl3fdg"
spam_classifier_app/
├── app.py
├── model/
│   └── best_spam_classifier.pkl
├── notebook/
│   └── spam_classification.ipynb
├── templates/
│   └── index.html
├── static/
│   ├── style.css
│   └── app.js
├── requirements.txt
└── README.md
```

## Run the Project

Clone the repository:

```bash id="spxll4"
git clone https://github.com/FarzamAmeer32/Spam_classification.git

```

Create and activate a virtual environment:

```bash id="0p59p2"
python -m venv .venv
```

Install dependencies:

```bash id="x665gr"
pip install -r requirements.txt
```

Run the Flask application:

```bash id="943v71"
python app.py
```

Open in your browser:

```text id="29nntp"
http://127.0.0.1:5000
```

## Example

Input:

```text id="yjp2q8"
Congratulations! You won a free prize. Click here to claim it.
```

Output:

```text id="xfzvd4"
Spam
```

## Note

This project is created for learning and demonstration purposes. Predictions may not always be accurate.
