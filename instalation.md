# Installation

To get started, follow these steps to set up your Django and React project:

1. Install the Python virtual environment package:
    ```bash
    sudo apt install python3.10-venv
    ```

2. Create a virtual environment for your project:
    ```bash
    python3 -m venv env
    ```

3. Activate the virtual environment:
    ```bash
    source env/bin/activate
    ```

4. Install the project dependencies from the `requirements.txt` file:
    ```bash
    pip install -r requirements.txt
    ```

# Project Setup

Now that your environment is set up, you can start your Django project:

1. Create the Django project:
    ```bash
    django-admin startproject backend
    ```

2. Create a Django app within the project:
    ```bash
    python manage.py startapp api
    ```