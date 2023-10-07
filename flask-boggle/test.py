from unittest import TestCase
from app import app
from flask import session
from boggle import Boggle


class FlaskTests(TestCase):

    def setUp(self):
        """Set up test client before running tests."""
        self.test_client = app.test_client()
        app.config['TESTING'] = True

    def test_display_boggle_board_view(self):
        """Test if Boggle board is displayed and stored in session."""

        with self.test_client as client:
            response = client.get('/')
            html_content = response.get_data(as_text=True)

            #Test if status code 200 is returned
            self.assertEqual(response.status_code, 200)

            #Test if table appears in HTML content
            self.assertIn('<table>', html_content)

            #Test if the board is stored in the session
            self.assertIn('current_boggle_board', session)

    def test_submit_user_guess(self):
        """Test submit user guess"""

        with self.test_client as client:
            with client.session_transaction() as session:
                # Manually set sample board in session for testing
                session['current_boggle_board'] = [
                    ['M', 'I', 'T', 'K', 'E'],
                    ['F', 'I', 'H', 'I', 'J'],
                    ['K', 'L', 'L', 'N', 'O'],
                    ['P', 'Q', 'R', 'K', 'T'],
                    ['U', 'V', 'W', 'X', 'Y']
                ]
            
            # Test "ok" response
            response = client.post('/submit_user_guess', json={'user_guess': 'milk'})
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.json['result'], 'ok')

            # Test "not-on-board" response
            response = client.post('/submit_user_guess', json={'user_guess': 'train'})
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.json['result'], 'not-on-board')

            # Test "not-word" response
            response = client.post('/submit_user_guess', json={'user_guess': 'asdf'})
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.json['result'], 'not-word')

    def test_submit_final_score(self):
        with self.test_client as client:
            with client.session_transaction() as sess:
                sess['highest_score'] = 10
                sess['times_played'] = 5
            
            response = client.post('/submit_final_score', json={'final_score': 20})

            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.json['highest_score'], 20)
            self.assertEqual(response.json['times_played'], 6)

            #Check session to make sure it is updated now
            self.assertEqual(session['highest_score'], 20)
            self.assertEqual(session['times_played'], 6)
