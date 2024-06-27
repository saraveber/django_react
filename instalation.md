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

4. Run the following commands when database changes:
    ```bash
    rm db.sqlite3
    ```
    ```bash
    python manage.py makemigrations
    python manage.py migrate
    ```

5. Run backend

    ```bash
    python manage.py runserver
    ```

# Frontend

To install the frontend dependencies, run the following command:

1. Make frontend template

    ```bash
    npm create vite@latest frontend -- --template react
    ```

2. Install packages

    ```bash
    npm install axios react-router-dom jwt-decode
    ```

3. Run frontend

    ```bash
    npm run dev
    ```


check out this link https://react.dev/learn/react-developer-tools


# Superuser 

```bash
    python manage.py createsuperuser
```


1. Sara 
Username: saraveber
Password: Ananas3510

2. Tina
Username:
Password: 