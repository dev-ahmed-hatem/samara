#!/bin/sh

# Wait for the database to be ready
until python manage.py migrate; do
    echo "Waiting for the database..."
    sleep 2
done

# Start the application
exec "$@"
