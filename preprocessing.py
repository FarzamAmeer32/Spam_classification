import nltk
from nltk.tokenize import TweetTokenizer
from nltk.corpus import stopwords
from nltk.stem import SnowballStemmer


# Download stopwords if they are not already available
try:
    stopwords.words('english')
except LookupError:
    nltk.download('stopwords')


# Creating tokenizer, stemmer and stop words
tweet_tokenizer = TweetTokenizer()
s_stemmer = SnowballStemmer(language='english')
stop_words = set(stopwords.words('english'))


# Helper function to convert text into lowercase
def lowercase(text):
    return text.lower()


# Removing stopwords
def remove_stopwords(text):
    l = []

    for i in text:
        if i not in stop_words:
            l.append(i)

    return l


# Applying snowball stemming
def s_stem(text):
    l = []

    for i in text:
        l.append(s_stemmer.stem(i))

    return l


# Converting tokens back into text
def convert_tokens_to_text(text):
    return ' '.join(text)


# Complete preprocessing function used before prediction
def preprocess_text(text):
    text = lowercase(text)
    text = tweet_tokenizer.tokenize(text)
    text = remove_stopwords(text)
    text = s_stem(text)
    text = convert_tokens_to_text(text)

    return text
