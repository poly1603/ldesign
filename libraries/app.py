from flask import Flask, render_template
from languages import languages

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html', languages=languages)

@app.route('/language/<language_name>')
def language_detail(language_name):
    language = next((lang for lang in languages if lang['name'].lower() == language_name.lower()), None)
    if language:
        return render_template('language_detail.html', language=language)
    return "Language not found", 404

if __name__ == '__main__':
    app.run(debug=True)






