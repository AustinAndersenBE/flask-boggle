from flask import Flask, render_template, request, session, redirect, jsonify
from boggle import Boggle

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!!'


boggle_game_instance = Boggle() # create instance of Boggle

@app.route('/')
def display_boggle_board():
    generated_board = boggle_game_instance.make_board()
    session['current_boggle_board'] = generated_board
    session.setdefault('highest_score', 0)
    session.setdefault('times_played', 0)
    return render_template('boggle_board.html', board=generated_board)

@app.route('/submit_user_guess', methods=['POST'])
def submit_user_guess():
    user_guess = request.json['user_guess'] #get value associated with key 'user_guess' from JSON data
    current_board = session['current_boggle_board']
    
    result = boggle_game_instance.check_valid_word(current_board, user_guess.lower())
    return jsonify({'result': result})

@app.route('/submit_final_score', methods=['POST'])
def submit_final_score():
    final_score = request.json['final_score']
    session['times_played'] += 1

    if final_score > session['highest_score']:
        session['highest_score'] = final_score

    return jsonify({
        'highest_score': session['highest_score'],
        'times_played': session['times_played']
    })


