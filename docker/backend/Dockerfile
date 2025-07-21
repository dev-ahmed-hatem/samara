# Use an official Python image as the base
FROM python:3.10-slim

RUN useradd -d /app -m -s /bin/bash -u 0 -o -g root django
USER django

ENV DockerHOME=/app

# Set working directory
WORKDIR /app

# Copy requirement file
COPY ./backend/admission/requirements.txt /app

# Install dependencies
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy application files
ADD --chown=django:django ./backend/admission /app

# Collect static files
RUN python manage.py collectstatic --noinput

# Install Gunicorn with other dependencies
RUN pip install gunicorn

# Expose application port
EXPOSE 8000

# Copy the entrypoint script
COPY ./docker/backend/entrypoint.sh /app/entrypoint.sh

RUN chmod +x /app/entrypoint.sh

# Set the entrypoint
ENTRYPOINT ["/app/entrypoint.sh"]

# Run the application
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "gym_system.wsgi:application"]
