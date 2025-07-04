from flask import Flask, request, jsonify
from flask_cors import CORS
from youtube_transcript_api import YouTubeTranscriptApi, NoTranscriptFound, TranscriptsDisabled
import requests
import os
from dotenv import load_dotenv

app = Flask(__name__)
# Allow React frontend origin
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

# Load environment variables
load_dotenv()
AI_API_URL = os.getenv('AI_API_URL')
AI_API_KEY = os.getenv('AI_API_KEY')


def extract_video_id(url):
    """Extract YouTube video ID from URL."""
    import re
    regex = r'(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})'
    match = re.search(regex, url)
    return match.group(1) if match else None


@app.route('/api/transcript', methods=['POST'])
def get_transcript():
    try:
        data = request.get_json()
        youtube_url = data.get('url')
        if not youtube_url:
            return jsonify({'error': 'YouTube URL is required'}), 400

        video_id = extract_video_id(youtube_url)
        if not video_id:
            return jsonify({'error': 'Invalid YouTube URL'}), 400

        # Fetch transcript
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
        transcript_text = ' '.join([item['text'] for item in transcript])

       # print(f"Debugging: {transcript_text}")

        # Summarize transcript using AI API

        ai_response = requests.post(
            AI_API_URL,
            json={'text': transcript_text, 'max_length': 200},
            headers={'Authorization': f'Bearer {AI_API_KEY}'}
        )
        ai_response.raise_for_status()
        summary = ai_response.json().get('summary', 'Summary not generated')

        # Generate X post
        key_points = [f"{i+1}. {point}" for i,
                      point in enumerate(summary.split('. ')[:3]) if point]
        x_post = f"Key points from the video:\n{'. '.join(key_points)}\n\n#YouTubeSummary #VideoInsights #AI"

        return jsonify({
            'transcript': transcript_text,
            'summary': summary,
            'x_post': x_post
        })

    except NoTranscriptFound:
        return jsonify({'error': 'No transcript available for this video'}), 400
    except TranscriptsDisabled:
        return jsonify({'error': 'Transcripts are disabled for this video'}), 400
    except requests.RequestException as e:
        return jsonify({'error': f'AI API error: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)
