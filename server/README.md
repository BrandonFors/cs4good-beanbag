# How to run test server

Make sure you cd into the server directory

1. If you don't have a venv run `python -m venv .venv`
2. run `./venv/Scripts/activate` This will need to be run every time you want to start a new terminal and want to run the server
3. run `pip install -r ./requirements.txt` if your packages are not yet installed
4. run `python app.py`

Note if you are using the frontend to test the backend, you need to change the axios endpoints in the frontend. Otherwise use postman.

You also need to create a .env file with the MONGO_URI for the server to use. If you can't find it in slack, dm Brandon