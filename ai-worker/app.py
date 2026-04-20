from flask import Flask, request, jsonify
import base64
import cv2
import numpy as np
import face_recognition
import os
from PIL import Image
import io
import pickle
import threading
from datetime import datetime

app = Flask(__name__)

# In-memory known faces (load from backend DB via API or file)
known_encodings = []
known_ids = []  # user idNumbers

# Load known faces (called on startup or refresh)
def load_known_faces():
  global known_encodings, known_ids
  known_encodings = []
  known_ids = []
  print("Loaded known faces (mock: 3 users)")

load_known_faces()  # Init mock

@app.route('/health', methods=['GET'])
def health():
  return jsonify({'status': 'ok', 'known_faces': len(known_ids)})

@app.route('/recognize', methods=['POST'])
def recognize():
  try:
    data = request.json
    image_b64 = data['image']
    embedding_dim = data.get('embedding_dim', 128)
    
    # Decode base64 to image
    image_data = base64.b64decode(image_b64.split(',')[1])
    pil_image = Image.open(io.BytesIO(image_data))
    opencv_image = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
    
    # Extract face encoding
    encodings = face_recognition.face_encodings(opencv_image)
    if not encodings:
      return jsonify({'userId': None, 'confidence': 0.0, 'reason': 'No face'})
    
    face_encoding = encodings[0]
    
    # Compare to known
    matches = face_recognition.compare_faces(known_encodings, face_encoding, tolerance=0.6)
    face_distances = face_recognition.face_distance(known_encodings, face_encoding)
    
    match_idx = np.argmin(face_distances)
    confidence = 1.0 - face_distances[match_idx]
    
    if matches[match_idx] and confidence > 0.6:
      user_id = known_ids[match_idx]
      return jsonify({
        'userId': user_id,
        'confidence': float(confidence),
        'embedding': face_encoding[:embedding_dim].tolist()  # Truncate if needed
      })
    else:
      return jsonify({
        'userId': None,
        'confidence': float(confidence),
        'embedding': face_encoding[:embedding_dim].tolist(),
        'reason': 'No match'
      })
      
  except Exception as e:
    return jsonify({'error': str(e)}), 500

@app.route('/embedding', methods=['POST'])
def embedding():
  try:
    data = request.json
    image_b64 = data['image']
    
    image_data = base64.b64decode(image_b64.split(',')[1])
    pil_image = Image.open(io.BytesIO(image_data))
    opencv_image = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
    
    encodings = face_recognition.face_encodings(opencv_image)
    if not encodings:
      raise ValueError('No face found')
    
    return jsonify({'embedding': encodings[0].tolist()})
    
  except Exception as e:
    return jsonify({'error': str(e)}), 400

@app.route('/reload-faces', methods=['POST'])
def reload_faces():
  load_known_faces()
  return jsonify({'status': 'reloaded'})

if __name__ == '__main__':
  port = int(os.environ.get('PORT', 5000))
  app.run(host='0.0.0.0', port=port, debug=True)

