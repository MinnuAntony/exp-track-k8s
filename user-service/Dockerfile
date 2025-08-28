# Use a minimal Python image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install dependencies in a single layer & clean cache
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt \
    && python -m compileall .  # optional: precompile python files

# Copy application code
COPY . .

# Use a non-root user for security
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser \
    && chown -R appuser:appgroup /app
USER appuser

# Expose the port your app runs on
EXPOSE 5000

# Run the app using exec form for proper signal handling
CMD ["python", "-m", "app.main"]

