# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies
# ffmpeg is required for yt-dlp to merge video and audio
RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy requirements file
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements_deploy.txt

# Copy the backend code
COPY kwiksave_backend.py .

# Expose the port
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "kwiksave_backend:app", "--host", "0.0.0.0", "--port", "8000"]
