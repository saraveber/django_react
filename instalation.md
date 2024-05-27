sudo apt install python3.10-venv


python3 -m venv env
python3 -m venv env
source env/bin/activate

pip install -r requirements.txt

django-admin startproject backend
python manage.py startapp api