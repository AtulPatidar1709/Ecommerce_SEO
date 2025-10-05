# recommender_service.py

from flask import Flask, jsonify
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)

# ✅ Load products data from CSV
products = pd.read_csv('products.csv')  # Must be in same folder
products['text'] = (
    products['title'].fillna('') + ' ' +
    products['category'].fillna('') + ' ' +
    products['tags'].fillna('') + ' ' +
    products['description'].fillna('')
)

# ✅ Create TF-IDF matrix from product descriptions
vectorizer = TfidfVectorizer(stop_words='english')
tfidf_matrix = vectorizer.fit_transform(products['text'])

# ✅ Compute similarity matrix
similarity_matrix = cosine_similarity(tfidf_matrix)

# ✅ Create ID-to-index mapping
id_to_index = {pid: idx for idx, pid in enumerate(products['id'])}
index_to_id = {idx: pid for pid, idx in id_to_index.items()}

# ✅ Flask route to get recommendations
@app.route('/recommend/<product_id>', methods=['GET'])
def recommend(product_id):
    if product_id not in id_to_index:
        return jsonify({'error': 'Product ID not found'}), 404

    index = id_to_index[product_id]
    sim_scores = list(enumerate(similarity_matrix[index]))

    # Sort by highest similarity score (excluding self)
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)

    recommendations = []
    for i, score in sim_scores:
        other_id = index_to_id[i]
        if other_id != product_id:
            recommendations.append({
                'id': other_id,
                'score': round(float(score), 2)
            })
        if len(recommendations) >= 5:
            break

    return jsonify({
        'product_id': product_id,
        'recommendations': recommendations
    })


if __name__ == '__main__':
    app.run(debug=True, port=5000)
