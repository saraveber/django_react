# Installation Backend

To get started, follow these steps to set up your Django and React project:

1. Install the Python virtual environment package:

    ```bash
    sudo apt install python3.10-venv
    ```

2. Create a virtual environment for your project:

    Linux:
    ```bash
    python3 -m venv env
    ```

    Windows:
    ```bash
    python -m venv env
    ```

3. Activate the virtual environment:

    Linux:
    ```bash
    source env/bin/activate
    ```

    Windows:
    ```bash
    cd env/Scripts/
    .\activate
    ```



4. Install the project dependencies from the `requirements.txt` file:

    ```bash
    pip install -r requirements.txt
    ```

## Project Setup 

Now that your environment is set up, you can start your Django project:

1. Create the Django project:

    ```bash
    django-admin startproject backend
    ```

2. Create a Django app within the project:

    ```bash
    python manage.py startapp api
    ```

3. Watch [this YouTube video](https://www.youtube.com/watch?v=c-QsfbznSXI&t=505s) for additional guidance.

4. Run the following commands to complete the project setup:

    ```bash
    python manage.py makemigrations
    python manage.py migrate
    python manage.py runserver
    ```

# Frontend

To install the frontend dependencies, run the following command:


npm create vite@latest frontend -- --template react

npm install axios react-router-dom jwt-decode



check out this link https://react.dev/learn/react-developer-tools


using prettier